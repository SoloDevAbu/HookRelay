import { createEvent } from "@hookrelay/db";
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

  const event = await createEvent({
    tenantId,
    eventType,
    payload,
    idempotencyKey,
  });

  childLogger.info({ eventId: event.id }, "Event created");

  if (idempotencyKey) {
    await setIdempotencyKey(tenantId, idempotencyKey, event.id);
  }

  await fanoutQueue.add(
    `fanout:${event.id}`,
    { eventId: event.id, tenantId },
    {
      jobId: event.id,
    },
  );

  childLogger.info({ eventId: event.id }, "Fanout job enqueued");

  return { eventId: event.id, duplicate: false };
};
