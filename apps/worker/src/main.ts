import { createFanoutWorker } from "./workers/fanout.worker";
import {
  closeAllDeliveryWorkers,
  startDeliveryWorkerManager,
} from "./workers/delivery.worker";
import { createDlqWorker } from "./workers/dlq.worker";
import {
  bullmqRedis,
  pubsubSubscriber,
  pubsubPublisher,
} from "@hookrelay/queue";
import { disconnectRedis, logger } from "@hookrelay/lib";

const start = async (): Promise<void> => {
  logger.info("Starting worker process");

  const fanoutWorker = createFanoutWorker();
  const dlqWorker = createDlqWorker();
  await startDeliveryWorkerManager();

  logger.info("All workers started successfully");

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, "Shutdown signal received — draining workers");

    try {
      await Promise.all([
        fanoutWorker.close(),
        dlqWorker.close(),
        closeAllDeliveryWorkers(),
      ]);

      await Promise.all([
        pubsubPublisher.quit(),
        pubsubSubscriber.quit(),
        bullmqRedis.quit(),
        disconnectRedis(),
      ]);
      logger.info("Graceful shutdown complete");
      process.exit(0);
    } catch (error) {
      logger.error({ error }, "Error during shutdown");
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled rejection in worker process");
    process.exit(1);
  });
};

start().catch((err) => {
  logger.error({ err }, "Failed to start worker process");
  process.exit(1);
});
