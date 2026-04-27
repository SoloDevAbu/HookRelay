import { Worker } from "bullmq";
import {
  bullmqRedis,
  getDeliveryQueueName,
  WORKER_CHANNEL,
  pubsubSubscriber,
} from "@hookrelay/queue";
import { deliverEvent } from "@hookrelay/services";
import { logger } from "@hookrelay/lib";

const activeWorkers = new Map<string, Worker>();

const createTenantDeliveryWorker = (tenantId: string): void => {
  if (activeWorkers.has(tenantId)) {
    logger.debug({ tenantId }, "Delivery worker already exists for tenant");

    return;
  }

  const queueName = getDeliveryQueueName(tenantId);

  const worker = new Worker(
    queueName,
    async (job) => {
      const { deliveryId, endpointId, eventId } = job.data;

      logger.info(
        { jobId: job.id, deliveryId, endpointId, tenantId },
        "Processing delviery job",
      );

      const result = await deliverEvent({
        deliveryId,
        endpointId,
        eventId,
        tenantId,
      });

      logger.info(
        { jobId: job.id, deliveryId, ...result },
        "Delivery job completed",
      );

      return result;
    },
    {
      connection: bullmqRedis,
      concurrency: 50,
    },
  );

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, tenantId, err }, "Delivery job failed");
  });

  worker.on("error", (err) => {
    logger.error({ err, tenantId }, "Delivery worker error");
  });

  activeWorkers.set(tenantId, worker);
  logger.info({ tenantId, queueName }, "Delivery worker started for tenant");
};

/**
 * spin up wrokers for all tenants that already has queue in redis before this process started
 * prevent missing tenants on worker restart
 */
const bootstrapExistingTenants = async (): Promise<void> => {
  const keys = await pubsubSubscriber.keys("bull:deliveries:*:meta");

  const tenantIds = keys
    .map((key) => {
      const parts = key.split(":");
      return parts[2]; //tenantId is the third segment
    })
    .filter((id): id is string => Boolean(id));

  const uniqueTenantIds = [...new Set(tenantIds)];

  logger.info(
    { count: uniqueTenantIds.length },
    "Bootstrapping delivery workers for existing tenants",
  );

  for (const tenantId of uniqueTenantIds) {
    createTenantDeliveryWorker(tenantId);
  }
};

/**
 * Subscribe to new tenant notifications via redis pub/sub
 */
const subscribeToNewTenants = (): void => {
  pubsubSubscriber.subscribe(WORKER_CHANNEL, (err) => {
    if (err) {
      logger.error({ err }, "Failed to subscribe to worker channel");
      return;
    }
    logger.info(
      { channel: WORKER_CHANNEL },
      "Subscribed to new tenant channel",
    );
  });

  pubsubSubscriber.on("message", (channel, message) => {
    if (channel !== WORKER_CHANNEL) return;

    try {
      const { tenantId } = JSON.parse(message);
      logger.info({ tenantId }, "New tenant queue notification received");
      createTenantDeliveryWorker(tenantId);
    } catch (error) {
      logger.error(
        { error, message },
        "Failed to parse worker channel message",
      );
    }
  });
};

export const startDeliveryWorkerManager = async (): Promise<void> => {
  await bootstrapExistingTenants();
  subscribeToNewTenants();
  logger.info("Delivery worker manager started");
};

export const closeAllDeliveryWorkers = async (): Promise<void> => {
  const closes = Array.from(activeWorkers.values()).map((w) => w.close());
  await Promise.all(closes);
  activeWorkers.clear();
  logger.info("All delivery workers closed");
};
