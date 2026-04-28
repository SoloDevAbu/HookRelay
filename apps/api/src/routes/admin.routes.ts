import type { FastifyInstance } from "fastify";
import { adminAuth } from "../middleware/auth";
import {
  findDeliveryById,
  findEventById,
  findEndpointsByTenantId,
  updateTenant,
} from "@hookrelay/db";
import { enqueueFanoutJob, ingestEvent } from "@hookrelay/services";
import { getDeliveryQueue } from "@hookrelay/queue";
import { reset as resetCircuitBreaker } from "@hookrelay/services";
import { sendSuccess, sendError } from "../lib/response";
import { request } from "http";

export const adminRoutes = async (app: FastifyInstance): Promise<void> => {
  app.post(
    "/admin/deliveries/:id/retry",
    {
      preHandler: [adminAuth],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const delivery = await findDeliveryById(id);

      if (!delivery) {
        return sendError(reply, "NOT_FOUND", "Delivery not found", 404);
      }

      if (delivery.status !== "dead" && delivery.status !== "failed") {
        return sendError(
          reply,
          "INVALID_STATE",
          "Only failed or dead deliveris can be retried",
          400,
        );
      }

      const delvieryQueue = getDeliveryQueue(delivery.tenantId);
      await delvieryQueue.add(
        "deliver",
        {
          deliveryId: delivery.id,
          endpointId: delivery.endpointId,
          eventId: delivery.eventId,
          tenantId: delivery.tenantId,
        },
        {
          jobId: `${delivery.id}_manual-retry_${Date.now()}`,
        },
      );

      return sendSuccess(reply, { retrying: true, deliveryId: id }, 202);
    },
  );

  app.post(
    "/admin/events/:id/replay",
    {
      preHandler: [adminAuth],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const event = await findEventById(id);
      if (!event) {
        return sendError(reply, "NOT_FOUND", "Event not found", 404);
      }

      await enqueueFanoutJob(event.id, event.tenantId);
      return sendSuccess(reply, { replaying: true, eventId: id }, 200);
    },
  );

  app.post(
    "/admin/endpoints/:id/reset-circuit",
    {
      preHandler: [adminAuth],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      await resetCircuitBreaker(id);

      return sendSuccess(reply, { reset: true, endpointId: id }, 200);
    },
  );
};
