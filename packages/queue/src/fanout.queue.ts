import { Queue } from "bullmq";
import { bullmqRedis } from "./client";
import { FANOUT_QUEUE_NAME } from "@hookrelay/config";

export interface FanoutJobData {
    eventId: string;
    tenantId: string;
};

/**
 * 
 * @returns Return the fanout queue
 */
export const fanoutQueue = new Queue<FanoutJobData>(FANOUT_QUEUE_NAME, {
    connection: bullmqRedis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: {
            count: 1000,
        },
        removeOnFail: {
            count: 5000,
        },
    },
});