import type { FastifyInstance } from "fastify";
import { tenantAuth } from "../middleware/auth";
import {
  createEndpoint,
  findEndpointsByTenantId,
  updateEndpoint,
  deleteEndpoint,
  findEndpointById,
} from "@hookrelay/db";
import { bustEndpointCache } from "@hookrelay/services";
import { sendSuccess, sendError } from "../lib/response";
import { randomBytes } from "crypto";

export const endpointRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get(
    "/endpoints",
    {
      preHandler: [tenantAuth],
    },
    async (request, reply) => {
      const endpoints = await findEndpointsByTenantId(request.tenant.id);

      return sendSuccess(reply, { endpoints }, 200);
    },
  );

  app.post(
    "./endpoints",
    {
      preHandler: [tenantAuth],
      schema: {
        body: {
          type: "object",
          required: ["url"],
          properties: {
            url: { type: "string", format: "uri" },
            eventTypeFilter: {
              type: "array",
              items: { type: "string" },
              nullable: true,
            },
            customHeaders: { type: "object" },
          },
        },
      },
    },
    async (request, reply) => {
      const { url, eventTypeFilter, customHeaders } = request.body as {
        url: string;
        eventTypeFilter?: string[];
        customHeaders?: Record<string, string>;
      };

      const secret = randomBytes(32).toString("hex");

      const endpoint = await createEndpoint({
        tenantId: request.tenant.id,
        url,
        secret,
        eventTypeFilter: eventTypeFilter ?? null,
        customHeaders: customHeaders ?? {},
      });

      return sendSuccess(
        reply,
        {
          endpoint: {
            ...endpoint,
            secret,
          },
          warning: "Store the secret safely. It will not be shown again.",
        },
        201,
      );
    },
  );

  app.patch(
    "/endpoints/:id",
    {
      preHandler: [tenantAuth],
      schema: {
        body: {
          type: "object",
          properties: {
            url: { type: "string", format: "uri" },
            eventTypeFilter: {
              type: "array",
              items: { type: "string" },
              nullable: true,
            },
            customHeaders: { type: "object" },
            status: { type: "string", enum: ["active", "paused"] },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as Record<string, unknown>;

      const existing = await findEndpointById(id);
      if (!existing || existing.tenantId !== request.tenant.id) {
        return sendError(reply, "NOT_FOUND", "Endpoint not found", 404);
      }

      const updated = await updateEndpoint(id, body);

      await bustEndpointCache(id);

      return sendSuccess(reply, { endpoint: updated }, 200);
    },
  );

  app.delete(
    "/endpoints/:id",
    {
      preHandler: [tenantAuth],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const existing = await findEndpointById(id);
      if (!existing || existing.tenantId !== request.tenant.id) {
        return sendError(reply, "NOT_FOUND", "Endpoint not found", 404);
      }

      await deleteEndpoint(id);
      await bustEndpointCache(id);

      return sendSuccess(reply, { deleted: true }, 200);
    },
  );
};
