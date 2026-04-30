import { redis, logger } from "@hookrelay/lib";
import { batchCreateEvents } from "@hookrelay/db";
import { fanoutQueue } from "@hookrelay/queue";
import { INGEST_BUFFER_KEY } from "@hookrelay/services";

const BATCH_SIZE = 100;
const POLL_INTERVAL_MS = 50; // check buffer every 50ms
const IDEMPOTENCY_TTL_SECONDS = 86400;

interface BufferedEvent {
  id: string;
  tenantId: string;
  eventType: string;
  payload: Record<string, unknown>;
  idempotencyKey?: string;
}

let running = true;

const drainBatch = async (): Promise<void> => {
  // Atomically pop up to BATCH_SIZE items from the buffer
  const items: string[] = [];

  for (let i = 0; i < BATCH_SIZE; i++) {
    const item = await redis.rpop(INGEST_BUFFER_KEY);
    if (!item) break;
    items.push(item);
  }

  if (items.length === 0) return;

  const events: BufferedEvent[] = items.map((item) => JSON.parse(item));

  try {
    // Batch insert into Postgres — single query for all events
    const created = await batchCreateEvents(
      events.map((e) => ({
        id: e.id,
        tenantId: e.tenantId,
        eventType: e.eventType,
        payload: e.payload,
        idempotencyKey: e.idempotencyKey,
      })),
    );

    if (created.length === 0) return;

    // Batch enqueue fanout jobs for successfully created events
    const jobs = created.map((event) => ({
      name: "fanout",
      data: { eventId: event.id, tenantId: event.tenantId },
      opts: { jobId: event.id },
    }));

    await fanoutQueue.addBulk(jobs);

    // Set idempotency keys for events that have them
    const pipeline = redis.pipeline();
    for (const event of created) {
      const original = events.find((e) => e.id === event.id);
      if (original?.idempotencyKey) {
        const key = `idempotency:${event.tenantId}:${original.idempotencyKey}`;
        pipeline.set(key, event.id, "EX", IDEMPOTENCY_TTL_SECONDS);
      }
    }
    await pipeline.exec();

    logger.debug(
      { inserted: created.length, total: events.length },
      "Ingest buffer batch processed",
    );
  } catch (error) {
    // On failure, push events back to the buffer for retry
    logger.error({ error, count: events.length }, "Ingest buffer batch failed — re-queuing");
    const pipeline = redis.pipeline();
    for (const event of events) {
      pipeline.rpush(INGEST_BUFFER_KEY, JSON.stringify(event));
    }
    await pipeline.exec();
  }
};

const pollLoop = async (): Promise<void> => {
  logger.info("Ingest buffer worker started");

  while (running) {
    try {
      await drainBatch();
    } catch (error) {
      logger.error({ error }, "Ingest buffer poll error");
    }

    // Small delay to avoid tight-looping when buffer is empty
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  logger.info("Ingest buffer worker stopped");
};

export const startIngestWorker = (): void => {
  running = true;
  pollLoop();
};

export const stopIngestWorker = (): void => {
  running = false;
};
