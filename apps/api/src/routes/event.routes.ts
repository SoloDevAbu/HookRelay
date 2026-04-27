import type { FastifyInstance } from "fastify";
import { tenantAuth } from "../middleware/auth";
import { rateLimitMiddleware } from "../middleware/rate-limit";
import { ingestEvent } from "@hookrelay/services";
import { sendSuccess } from "../lib/response";

export const eventsRoutes = async (app: FastifyInstance): Promise<void> => {
  app.post(
    "/events",
    {
      preHandler: [tenantAuth, rateLimitMiddleware],
      schema: {
        body: {
          type: "object",
          required: ["eventId", "payload"],
          properties: {
            eventType: { type: "string", minLength: 1, maxLength: 100 },
            payload: { type: "object" },
            idempotencyKey: { type: "string", maxLength: 255 },
          },
        },
      },
    },
    async (request, reply) => {
      const { eventType, payload, idempotencyKey } = request.body as {
        eventType: string;
        payload: Record<string, unknown>;
        idempotencyKey: string;
      };

      const result = await ingestEvent({
        tenantId: request.tenant.id,
        eventType,
        payload,
        idempotencyKey,
      });

      return sendSuccess(
        reply,
        {
          eventid: result.eventId,
          duplicate: result.duplicate,
          status: "accepted",
        },
        result.duplicate ? 200 : 202,
      );
    },
  );
};
