import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  PORT: z.string().default("3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  MAX_DELIVERY_ATTEMPTS: z.string().transform(Number),
  DELIVERY_TIMEOUT_MS: z.string().transform(Number).default(30000),
  CIRCUIT_BREAKER_THRESHOLD: z.string().transform(Number).default(5),
  CIRCUIT_BREAKER_COOLDOWN_MS: z.string().transform(Number).default(60000),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(60000),
  SIGNATURE_SECRET: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = {
  databaseUrl: parsed.data.DATABASE_URL,
  redisUrl: parsed.data.REDIS_URL,
  port: Number(parsed.data.PORT),
  nodeEnv: parsed.data.NODE_ENV,
  maxDeliveryAttempts: parsed.data.MAX_DELIVERY_ATTEMPTS,
  deliveryTimeoutMs: parsed.data.DELIVERY_TIMEOUT_MS,
  circuitBreakerThreshold: parsed.data.CIRCUIT_BREAKER_THRESHOLD,
  circuitBreakerCooldownMs: parsed.data.CIRCUIT_BREAKER_COOLDOWN_MS,
  rateLimitWindowMs: parsed.data.RATE_LIMIT_WINDOW_MS,
  signatureSecret: parsed.data.SIGNATURE_SECRET,
} as const;

export type Config = typeof config;
