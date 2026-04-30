import { createEvent, findEventsWithNoDeliveries } from "@hookrelay/db";
import { fanoutQueue } from "@hookrelay/queue";
import { redis, logger } from "@hookrelay/lib";
import { randomUUID } from "crypto";

export interface IngestEvnetInput {
  tenantId: string;
  eventType: string;
  payload: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface IngestEventResult {
  eventId: string;
  duplicate: boolean;
}

const IDEMPOTENCY_TTL_SECONDS = 86400;

const idempotencyRedisKey = (tenantId: string, key: string): string => {
  return `idempotency:${tenantId}:${key}`;
};

const checkIdempotency = async (
  tenantId: string,
  idempotencyKey: string,
): Promise<string | null> => {
  const redisKey = idempotencyRedisKey(tenantId, idempotencyKey);
  const existingEventId = await redis.get(redisKey);
  return existingEventId;
};

const setIdempotencyKey = async (
  tenantId: string,
  idempotencyKey: string,
  eventId: string,
): Promise<void> => {
  const redisKey = idempotencyRedisKey(tenantId, idempotencyKey);
  await redis.set(redisKey, eventId, "EX", IDEMPOTENCY_TTL_SECONDS);
};

export const enqueueFanoutJob = async (
  eventId: string,
  tenantId: string,
): Promise<void> => {
  await fanoutQueue.add(
    "fanout",
    { eventId, tenantId },
    {
      jobId: eventId,
    },
  );
};

export const ingestEvent = async (
  input: IngestEvnetInput,
): Promise<IngestEventResult> => {
  const { tenantId, eventType, payload, idempotencyKey } = input;

  // Idempotency check stays in hot path (Redis only — fast)
  if (idempotencyKey) {
    const existingEventId = await checkIdempotency(tenantId, idempotencyKey);

    if (existingEventId) {
      logger.debug(
        { existingEventId, tenantId },
        "Duplicate event detected via idempotency check",
      );
      return { eventId: existingEventId, duplicate: true };
    }
  }

  // Pre-generate event ID so we can return it immediately
  const eventId = randomUUID();

  // Fire-and-forget: DB insert + enqueue happen after response
  // I need to change this with Write the event to a Redis stream/list first, respond 202, then have a background process flush to Postgres in batches
  setImmediate(async () => {
    try {
      const { wasCreated } = await createEvent({
        id: eventId,
        tenantId,
        eventType,
        payload,
        idempotencyKey,
      });

      if (!wasCreated) {
        // Duplicate detected at DB level — idempotency key was set but
        // Redis cache was missed. Not critical since response already sent.
        logger.debug(
          { eventId, tenantId },
          "DB-level duplicate detected in background",
        );
        return;
      }

      await enqueueFanoutJob(eventId, tenantId);

      if (idempotencyKey) {
        await setIdempotencyKey(tenantId, idempotencyKey, eventId);
      }

      logger.debug({ eventId, tenantId }, "Background ingestion completed");
    } catch (error) {
      logger.error(
        { eventId, tenantId, error },
        "Background ingestion failed — recovery worker will retry",
      );
    }
  });

  return { eventId, duplicate: false };
};

export const recoverUnfanoutEvents = async (): Promise<void> => {
  const events = await findEventsWithNoDeliveries({
    olderThenMinutes: 5,
    limit: 100,
  });

  if (events.length === 0) return;

  logger.info({ count: events.length }, "Recovering unfanoutted events");

  for (const event of events) {
    try {
      await enqueueFanoutJob(event.id, event.tenantId);
      logger.info(
        { eventId: event.id },
        "Re-enqueue fanout job for orphaned events",
      );
    } catch (error) {
      logger.error(
        { eventId: event.id, error },
        "Failed to re-enqueue orphaned event",
      );
    }
  }
};
