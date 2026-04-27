import type { FastifyInstance } from "fastify";
import { tenantAuth } from "../middleware/auth";
import {
  findDeliveriesByTenant,
  findDeliveryById,
  findAttemptsByDeliveryId,
} from "@hookrelay/db";
import { sendSuccess, sendError } from "../lib/response";

export const deliveriesRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get(
    "/deliveries",
    {
      preHandler: [tenantAuth],
      schema: {
        querystring: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["pending", "success", "failed"] },
            limit: { type: "number", minimum: 1, maximum: 100, default: 20 },
            offset: { type: "number", minimum: 0, default: 0 },
          },
        },
      },
    },
    async (request, reply) => {
      const { status, limit, offset } = request.query as {
        status?: string;
        limit: number;
        offset: number;
      };

      const deliveries = await findDeliveriesByTenant(request.tenant.id, {
        status: status as "pending" | "success" | "failed" | undefined,
        limit,
      });

      return sendSuccess(reply, { deliveries }, 200);
    },
  );

  app.get(
    "/deliveries/:id",
    {
      preHandler: [tenantAuth],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const delivery = await findDeliveryById(id);

      if (!delivery || delivery.tenantId !== request.tenant.id) {
        return sendError(reply, "NOT_FOUND", "Delivery not found", 404);
      }

      return sendSuccess(reply, { delivery }, 200);
    },
  );

  app.get(
    "/deliveries/:id/attempts",
    {
      preHandler: [tenantAuth],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const delivery = await findDeliveryById(id);

      if (!delivery || delivery.tenantId !== request.tenant.id) {
        return sendError(reply, "NOT_FOUND", "Delivery not found", 404);
      }

      const attempts = await findAttemptsByDeliveryId(id);

      return sendSuccess(reply, { attempts }, 200);
    },
  );
};
