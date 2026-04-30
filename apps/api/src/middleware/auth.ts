import type { FastifyRequest, FastifyReply } from "fastify";
import { findTenantByApiKeyHash } from "@hookrelay/db";
import { config } from "@hookrelay/config";
import { redis } from "@hookrelay/lib";
import { hashApiKey } from "../lib/crypto";
import { sendError } from "../lib/response";

const TENANT_CACHE_TTL = 60; // seconds
const tenantCacheKey = (hash: string) => `tenant:auth:${hash}`;

export const tenantAuth = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const apiKey = request.headers["x-api-key"];

  if (!apiKey || typeof apiKey !== "string") {
    return sendError(reply, "UNAUTHORIZED", "Missing api key", 401);
  }

  const hash = hashApiKey(apiKey);

  const cached = await redis.get(tenantCacheKey(hash));
  let tenant;

  if (cached) {
    tenant = JSON.parse(cached);
  } else {
    tenant = await findTenantByApiKeyHash(hash);
    if (tenant) {
      // Cache for subsequent requests — fire-and-forget
      redis.set(
        tenantCacheKey(hash),
        JSON.stringify(tenant),
        "EX",
        TENANT_CACHE_TTL,
      );
    }
  }

  if (!tenant) {
    return sendError(reply, "UNAUTHORIZED", "Invalid API key", 401);
  }

  if (!tenant.isActive) {
    return sendError(reply, "FORBIDDEN", "Tenant is inactive", 403);
  }

  request.tenant = tenant;
};

export const adminAuth = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const adminKey = request.headers["x-admin-key"];

  if (!adminKey || typeof adminKey !== "string") {
    return sendError(reply, "UNAUTHORIZED", "Missing X-Admin-Key header", 401);
  }

  if (adminKey !== config.adminSecret) {
    return sendError(reply, "UNAUTHORIZED", "Invalid admin key", 401);
  }
};
