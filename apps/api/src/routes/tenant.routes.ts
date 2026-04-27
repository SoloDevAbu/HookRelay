import type { FastifyInstance } from "fastify";
import { createTenant } from "@hookrelay/db";
import { hashApiKey, generateApiKey } from "../lib/crypto";
import { sendSuccess, sendError } from "../lib/response";

export const tenantRoutes = async (app: FastifyInstance): Promise<void> => {
  app.post(
    "/tenants",
    {
      schema: {
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", minLength: 1, maxLength: 100 },
            rateLimitPerMin: { type: "number", minimum: 1, maximum: 10000 },
          },
        },
      },
    },
    async (request, reply) => {
      const { name, rateLimitPerMin } = request.body as {
        name: string;
        rateLimitPerMin?: number;
      };

      const rawApiKey = generateApiKey();
      const apiKeyHash = hashApiKey(rawApiKey);

      const tenant = await createTenant({
        name,
        apiKeyHash,
        rateLimitPerMin: rateLimitPerMin ?? 1000,
      });

      return sendSuccess(
        reply,
        {
          tenant: {
            id: tenant.id,
            name: tenant.name,
            rateLimitPerMin: rateLimitPerMin,
            createdAt: tenant.createdAt,
          },
          apiKeyHash: rawApiKey,
          warning: "Store this API safely. It will never be showing again.",
        },
        201,
      );
    },
  );
};
