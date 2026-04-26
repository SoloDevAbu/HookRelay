import { Redis } from "ioredis";
import { config } from "@hookrelay/config";

/**
 * Dedicated redis connection for subscriber
 */
export const pubsubSubscriber = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

/**
 * Dedicated redis connection for publisher
 */
export const pubsubPublisher = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const WORKER_CHANNEL = "worker:new-tenant-queue";
