import { config } from "@hookrelay/config";
import { logger } from "@hookrelay/lib";

const BACKOFF_SCHEDULE_SECONDS = [
  10, // attempt 1  - retry after 10s
  30, // attempt 2  - retry after 30s
  60, // attempt 3  - retry after 1m
  300, // attempt 4  - retry after 5m
  1800, // attempt 5  - retry after 30m
  3600, // attempt 6  - retry after 1h
  10800, // attempt 7  - retry after 3h
  21600, // attempt 8  - retry after 6h
  43200, // attempt 9  - retry after 12h
  86400, // attempt 10 - retry after 24h
] as const;

/**
 * Should DQL
 * @returns True if the delivery has exhausted all allowed attempts
 */

export const shouldDeadLetter = (attemptCount: number): boolean => {
  return attemptCount >= config.maxDeliveryAttempts;
};

/**
 * Get the next delay time to retry
 * @param attemptCount
 * @returns delay in milliseconds to wait before next retry
 */
export const getBackoffDelayMs = (attemptCount: number): number => {
  const index = Math.min(attemptCount - 1, BACKOFF_SCHEDULE_SECONDS.length - 1);
  const delaySeconds = BACKOFF_SCHEDULE_SECONDS[index] ?? 86400;
  const delayMs = delaySeconds * 1000;

  logger.debug({ attemptCount, delaySeconds }, "Calculate backoff delay");

  return delayMs;
};

/**
 * Get next retry at
 * @returns exact date when next retry should run
 */
export const getNextRetryAt = (attemptCount: number): Date => {
  const delayMs = getBackoffDelayMs(attemptCount);
  return new Date(Date.now() + delayMs);
};
