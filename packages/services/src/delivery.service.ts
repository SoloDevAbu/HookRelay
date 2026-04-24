import {
  findEndpointById,
  updateDeliveryStatus,
  incrementDeliveryAttempt,
  insertDeliveryAttempt,
  findEventById,
} from "@hookrelay/db";
import { getDeliveryQueue } from "@hookrelay/queue";
import { postJson, redis, logger, HttpClientError } from "@hookrelay/lib";
import {
  shouldAllowRequest,
  recordSuccess,
  recordFailure,
} from "./curcuit-breaker.service";
import {
  shouldDeadLetter,
  getBackoffDelay,
  getNextRetryAt,
} from "./retry.service";
import { signPayload } from "./signature.service";

export interface DeliveryInput {
  deliveryId: string;
  endpointId: string;
  eventId: string;
  tenantId: string;
}

export interface DeliveryResult {
  success: boolean;
  statusCode?: number;
  latencyMs?: number;
  deadLettered: boolean;
  circuitOpen: boolean;
}

const ENDPOINT_CACHE_TTL_SECONDS = 300; //5 minutes
const endpointCacheKey = (endpointId: string) =>
  `endpoint:config:${endpointId}`;

const getEndpointConfig = async (endpointId: string) => {
  const cached = await redis.get(endpointCacheKey(endpointId));

  if (cached) {
    return JSON.parse(cached);
  }

  const endpoint = await findEndpointById(endpointId);

  if (!endpoint) {
    return null;
  }

  await redis.set(
    endpointCacheKey(endpointId),
    JSON.stringify(endpoint),
    "EX",
    ENDPOINT_CACHE_TTL_SECONDS,
  );

  return endpoint;
};

/**
 * Admin can bust the cache when a tenant updates their endpoint config
 */
export const bustEndpointCache = async (endpointId: string): Promise<void> => {
  await redis.del(endpointCacheKey(endpointId));
};

/**
 * Deliver event
 * - fetch endpoint config (from cache or DB)
 * - fetch event payload
 * - check circuit breaker
 * - sign payload
 * - HTTP POST to endpoint URL
 * - record attempt in DB
 * - on success -> update delivery + reset circuit breaker
 * - on failure -> update circuit breaker + schedule retry or DLQ
 */
export const deliverEvent = async (
  input: DeliveryInput,
): Promise<DeliveryResult> => {
  const { deliveryId, endpointId, eventId, tenantId } = input;

  const childLogger = logger.child({
    deliveryId,
    endpointId,
    eventId,
    tenantId,
  });

  const endpoint = await getEndpointConfig(endpointId);

  if (!endpoint) {
    childLogger.error("Endpoint not found, marking delivery dead");

    await updateDeliveryStatus(deliveryId, {
      status: "dead",
      exhaustedAt: new Date(),
    });
    return { success: false, deadLettered: true, circuitOpen: false };
  }

  const event = await findEventById(eventId);

  if (!event) {
    childLogger.error("Event not found, marking delivery dead");
    await updateDeliveryStatus(deliveryId, {
      status: "dead",
      exhaustedAt: new Date(),
    });
    return { success: false, deadLettered: true, circuitOpen: false };
  }

  const { allowed, state } = await shouldAllowRequest(endpointId);

  if (!allowed) {
    childLogger.warn(
      { circuitState: state },
      "Circuit breaker open, requeueing delivery with delay",
    );

    const deliveryQueue = getDeliveryQueue(tenantId);
    await deliveryQueue.add(
      "deliver",
      { deliveryId, endpointId, eventId, tenantId },
      {
        delay: 30_000, //check again in 30 seconds
        jobId: `${deliveryId}:cb:${Date.now()}`,
      },
    );

    return { success: false, deadLettered: false, circuitOpen: true };
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signPayload({
    secret: endpoint.secret,
    timestamp,
    body: typeof event.payload === 'string' ? event.payload : JSON.stringify(event.payload),
  });

  const headers: Record<string, string> = {
    "x-webhook-timestamp": timestamp.toString(),
    "x-webhook-signature": signature,
    "x-webhook-delivery-id": deliveryId,
    ...((endpoint.customHeaders as Record<string, string>) ?? {}),
  };

  let statusCode: number | undefined;
  let responseBody: string | undefined;
  let latencyMs: number | undefined;
  let isTimeout = false;
  let errorMessage: string | undefined;
  let success = false;

  try {
    const result = await postJson(endpoint.url, event.payload, headers);
    statusCode = result.statusCode;
    responseBody = result.responseBody;
    latencyMs = result.latencyMs;

    success = statusCode !== undefined ? (statusCode >= 200 && statusCode < 300) : false;
  } catch (error) {
    latencyMs = error instanceof HttpClientError ? error.latencyMs : 0;
    isTimeout = error instanceof HttpClientError ? (error.isTimeout ?? false) : false;
    errorMessage = error instanceof Error ? error.message : "Unknows Error";
    success = false;
  }

  await insertDeliveryAttempt({
    deliveryId,
    attemptStatus: isTimeout ? "timeout" : success ? "success" : "failed",
    statusCode,
    responseBody,
    latencyMs,
    errorMessage,
  });

  const attemptCountResult = await incrementDeliveryAttempt(deliveryId);
  const attemptCount = attemptCountResult?.attemptCount ?? 1;

  childLogger.info(
    { success, statusCode, latencyMs, attemptCount },
    "Delivery attempt recorded",
  );

  if (success) {
    await Promise.all([
      updateDeliveryStatus(deliveryId, { status: "success" }),
      recordSuccess(endpointId),
    ]);
    childLogger.info("Delivery succeeded");

    return {
      success: true,
      latencyMs,
      deadLettered: false,
      circuitOpen: false,
    };
  }

  await recordFailure(endpointId);

  if (shouldDeadLetter(attemptCount)) {
    await updateDeliveryStatus(deliveryId, {
      status: "dead",
      exhaustedAt: new Date(),
    });

    childLogger.warn(
      { attemptCount },
      "Delivery exhausted all attempts, moved to DLQ",
    );

    return {
      success: false,
      statusCode,
      latencyMs,
      deadLettered: true,
      circuitOpen: false,
    };
  }

  //Schedule retry
  const delayMs = getBackoffDelay(attemptCount);
  const nextRetryAt = getNextRetryAt(attemptCount);

  await updateDeliveryStatus(deliveryId, {
    status: "failed",
    nextRetryAt,
  });

  const deliveryQueue = getDeliveryQueue(tenantId);
  await deliveryQueue.add(
    "deliver",
    { deliveryId, endpointId, eventId, tenantId },
    {
      delay: delayMs,
      jobId: `${deliveryId}:attempt:${attemptCount}`,
    },
  );

  childLogger.warn(
    { attemptCount, delayMs, nextRetryAt },
    "Delivery failed, scheduled retyr",
  );

  return {
    success: false,
    statusCode,
    latencyMs,
    deadLettered: false,
    circuitOpen: false,
  };
};
