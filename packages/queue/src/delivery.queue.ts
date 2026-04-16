import { Queue } from "bullmq";
import { bullmqRedis } from "./client";

export interface DeliveryJobData {
    deliveryId: string;
    endpointId: string;
    eventId: string;
    tenantId: string;
}

/**
 * 
 * @param tenantId 
 * @returns Return the delivery queue name for the specific tenant
 */
export const getDeliveryQueueName = (tenantId: string): string => {
    return `deliveries:${tenantId}`;
}

const queueCache = new Map<string, Queue<DeliveryJobData>>();

/**
 * 
 * @param tenantId 
 * @returns Return the delivery queue for the specific tenant
 */
export const getDeliveryQueue = (tenantId: string): Queue<DeliveryJobData> => {
    const queueName = getDeliveryQueueName(tenantId);

    if (queueCache.has(queueName)) {
        return queueCache.get(queueName)!;
    }

    const queue = new Queue<DeliveryJobData>(queueName, {
        connection: bullmqRedis,
        defaultJobOptions: {
            attempts: 1,
            removeOnComplete: {
                count: 1000,
            },
            removeOnFail: {
                count: 5000,
            },
        },
    });
    queueCache.set(queueName, queue);
    return queue;
}

/**
 * Close all the delivery queues
 */
export const closeAllDeliveryQueues = async (): Promise<void> => {
    const closes = Array.from(queueCache.values()).map((q) => q.close());
    await Promise.all(closes);
    queueCache.clear();
}