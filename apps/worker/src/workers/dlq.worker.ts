import { Worker } from "bullmq";
import { bullmqRedis, FANOUT_QUEUE_NAME } from "@hookrelay/queue";
import { updateDeliveryStatus } from "@hookrelay/db";
import { logger } from "@hookrelay/lib";

export const createDlqWorker = (): Worker => {
  const worker = new Worker(
    "dlq",
    async (job) => {
      const { deliveryId, endpointId, tenantId } = job.data;

      logger.warn(
        { jobId: job.id, deliveryId, endpointId, tenantId },
        "Processing dead letter job",
      );

      await updateDeliveryStatus(deliveryId, {
        status: "dead",
        exhaustedAt: new Date(),
      });

      logger.warn(
        { deliveryId, endpointId, tenantId },
        "Delivery permanently failed — marked dead",
      );
    },
    {
      connection: bullmqRedis,
      concurrency: 20,
    },
  );

  worker.on("error", (err) => {
    logger.error({ err }, "DLQ worker error");
  });

  logger.info("DLQ worker started");

  return worker;
};
