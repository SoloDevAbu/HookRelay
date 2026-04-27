import { Worker } from "bullmq";
import { bullmqRedis, FANOUT_QUEUE_NAME } from "@hookrelay/queue";
import { fanoutEvent } from "@hookrelay/services";
import { logger } from "@hookrelay/lib";

export const createFanoutWorker = (): Worker => {
  const worker = new Worker(
    FANOUT_QUEUE_NAME,
    async (job) => {
      const { eventId, tenantId } = job.data;

      logger.info(
        { jobId: job.id, eventId, tenantId },
        "Processing fanout job",
      );

      const result = await fanoutEvent({ eventId, tenantId });

      logger.info(
        { jobId: job.id, eventId, ...result },
        "Fanout job completed",
      );

      return result;
    },
    {
      connection: bullmqRedis,
      concurrency: 10,
    },
  );

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, err }, "Fanout job failed");
  });

  worker.on("error", (err) => {
    logger.error({ err }, "Fanout worker error");
  });

  logger.info("Fanout worker started");

  return worker;
};
