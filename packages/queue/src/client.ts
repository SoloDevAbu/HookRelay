import { Redis } from "ioredis";
import { config } from "@hookrelay/config";

export const bullmqRedis = new Redis(config.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,

    retryStrategy: (times: number) => {
        return Math.min(times * 50, 500);
    }
})