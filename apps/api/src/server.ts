import Fastify from "fastify";
import { Config } from "@hookrelay/config";
import { logger } from "@hookrelay/lib";
import { errorHandler } from "./middleware/error-handler";
import { tenantRoutes } from "./routes/tenant.routes";
import { eventsRoutes } from "./routes/event.routes";
import { endpointRoutes } from "./routes/endpoint.routes";
import { deliveriesRoutes } from "./routes/deliveries.routes";
import { adminRoutes } from "./routes/admin.routes";

export const buildServer = async () => {
  const app = Fastify({
    logger: false,
    trustProxy: true,
    bodyLimit: 1_048_576,
    routerOptions: {
      caseSensitive: true,
    },
  });

  app.setErrorHandler(errorHandler);

  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toString,
  }));

  await app.register(tenantRoutes);
  await app.register(eventsRoutes);
  await app.register(endpointRoutes);
  await app.register(deliveriesRoutes);
  await app.register(adminRoutes);

  return app;
};
