import type { FastifyRequest, FastifyReply } from "fastify";
import { redis } from "@hookrelay/lib";
import { config } from "@hookrelay/config";
import { sendError } from "../lib/response";

export const rateLimitMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const tenant = request.tenant;

  if (!tenant) return;

  const key = `ratelimit:${tenant.id}`;
  const now = Date.now();
  const window = config.rateLimitWindowMs;
  const limit = tenant.rateLimitPerMin;

  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, now - window);
  pipeline.zcard(key);
  pipeline.zadd(key, now, now.toString());
  pipeline.expire(key, Math.ceil(window / 1000));

  const results = await pipeline.exec();
  const count = results?.[1]?.[1] as number;

  if (count >= limit) {
    const retryAfter = Math.ceil(window / 1000);
    reply.header("retry-after", retryAfter.toString());

    return sendError(
      reply,
      "RATE_LIMIT",
      `Rate limit exceeded. Try again in ${retryAfter}s`,
      429,
    );
  }
};
