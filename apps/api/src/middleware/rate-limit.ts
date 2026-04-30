import type { FastifyRequest, FastifyReply } from "fastify";
import { redis } from "@hookrelay/lib";
import { config } from "@hookrelay/config";
import { sendError } from "../lib/response";

const RATE_LIMIT_LUA = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local current = redis.call("INCR", key)
if current == 1 then
  redis.call("EXPIRE", key, window)
end
return current
`;

export const rateLimitMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const tenant = request.tenant;

  if (!tenant) return;

  const now = Date.now();
  const window = config.rateLimitWindowMs;
  const limit = tenant.rateLimitPerMin;
  const windowSeconds = Math.ceil(window / 1000);

  // Fixed-window key rotates each window period
  const windowKey = `ratelimit:${tenant.id}:${Math.floor(now / window)}`;

  const count = (await redis.eval(
    RATE_LIMIT_LUA,
    1,
    windowKey,
    limit,
    windowSeconds,
  )) as number;

  if (count > limit) {
    reply.header("retry-after", windowSeconds.toString());

    return sendError(
      reply,
      "RATE_LIMIT",
      `Rate limit exceeded. Try again in ${windowSeconds}s`,
      429,
    );
  }
};
