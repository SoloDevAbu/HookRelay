import { createEvent, findEventsWithNoDeliveries } from "@hookrelay/db";
import { fanoutQueue } from "@hookrelay/queue";
import { redis, logger } from "@hookrelay/lib";

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

  const childLogger = logger.child({ tenantId, eventType, idempotencyKey });

  if (idempotencyKey) {
    const existingEventId = await checkIdempotency(tenantId, idempotencyKey);

    if (existingEventId) {
      childLogger.info(
        { existingEventId },
        "Duplicate event detected via Redis idempotency check",
      );
      return { eventId: existingEventId, duplicate: true };
    }
  }

  const { event, wasCreated } = await createEvent({
    tenantId,
    eventType,
    payload,
    idempotencyKey,
  });

  if (!wasCreated) {
    childLogger.info(
      { eventId: event.id },
      "Suplicate event detected in Postgres constraint",
    );

    if (idempotencyKey) {
      await setIdempotencyKey(tenantId, idempotencyKey, event.id);
    }

    return { eventId: event.id, duplicate: true };
  }
  childLogger.info({ eventId: event.id }, "Event created");

  if (idempotencyKey) {
    await setIdempotencyKey(tenantId, idempotencyKey, event.id);
  }

  try {
    await enqueueFanoutJob(event.id, tenantId);
    childLogger.info({ eventId: event.id }, "Fanout job enqueued");
  } catch (error) {
    childLogger.error(
      { eventId: event.id, error },
      "Failed to enqueue fanout job, recovery worker will try",
    );
  }

  childLogger.info({ eventId: event.id }, "Fanout job enqueued");

  return { eventId: event.id, duplicate: false };
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
