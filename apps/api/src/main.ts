import { buildServer } from "./server";
import { config } from "@hookrelay/config";
import { logger } from "@hookrelay/lib";
import { disconnectRedis } from "@hookrelay/lib";

const start = async (): Promise<void> => {
  const app = await buildServer();

  await app.listen({
    port: config.port,
    host: "0.0.0.0",
  });

  logger.info({ port: config.port }, "API seriver started");

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, "Shutdown signal received");

    try {
      await app.close();
      await disconnectRedis();

      logger.info("API server shutdown gracefully");
      process.exit(0);
    } catch (error) {
      logger.error({ error }, "Error during API shutdown");
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled rejection in API process");
    process.exit(1);
  });
};

start().catch((err) => {
  logger.error({ err }, "Failed to start API server");
  process.exit(1);
});
