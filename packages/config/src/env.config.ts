import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Only load .env in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
}

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),

  PORT: z.coerce.number().default(3000),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  ADMIN_SECRET: z.string().min(32),

  MAX_DELIVERY_ATTEMPTS: z.coerce.number().int().positive().default(10),

  DELIVERY_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),

  CIRCUIT_BREAKER_THRESHOLD: z.coerce.number().int().positive().default(5),

  CIRCUIT_BREAKER_COOLDOWN_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(60000),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
});

const parsed = envSchema.safeParse(process.env);

// if (!parsed.success) {
//   console.error("Invalid environment variables:");
//   console.error(parsed.error.flatten().fieldErrors);
//   process.exit(1);
// }

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);

  if (process.env.NODE_ENV !== "test") {
    process.exit(1);
  }

  throw new Error("Invalid environment variables");
}

export const config = Object.freeze({
  databaseUrl: parsed.data.DATABASE_URL,
  redisUrl: parsed.data.REDIS_URL,
  port: parsed.data.PORT,
  nodeEnv: parsed.data.NODE_ENV,
  adminSecret: parsed.data.ADMIN_SECRET,
  maxDeliveryAttempts: parsed.data.MAX_DELIVERY_ATTEMPTS,
  deliveryTimeoutMs: parsed.data.DELIVERY_TIMEOUT_MS,
  circuitBreakerThreshold: parsed.data.CIRCUIT_BREAKER_THRESHOLD,
  circuitBreakerCooldownMs: parsed.data.CIRCUIT_BREAKER_COOLDOWN_MS,
  rateLimitWindowMs: parsed.data.RATE_LIMIT_WINDOW_MS,
});

export type Config = typeof config;
