import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DATABASE_URL = process.env.DATABASE_URL!;
const REDIS_URL = process.env.REDIS_URL!;
const PORT = process.env.PORT!;
const NODE_ENV = process.env.NODE_ENV!;
const MAX_DELIVERY_ATTEMPTS = process.env.MAX_DELIVERY_ATTEMPTS!;
const DELIVERY_TIMEOUT_MS = process.env.DELIVERY_TIMEOUT_MS;
const CIRCUIT_BREAKER_THRESHOLD = process.env.CIRCUIT_BREAKER_THRESHOLD!;
const CIRCUIT_BREAKER_COOLDOWN_MS = process.env.CIRCUIT_BREAKER_COOLDOWN_MS!;
const RATE_LIMIT_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS!;

export const config = {
    databaseUrl: DATABASE_URL,
    redisUrl: REDIS_URL,
    port: PORT,
    nodeEnv: NODE_ENV,
    maxDeliveryAttempts: Number(MAX_DELIVERY_ATTEMPTS),
    deliveryTimeoutMs: Number(DELIVERY_TIMEOUT_MS),
    circuitBreakerThreshold: Number(CIRCUIT_BREAKER_THRESHOLD),
    circuitBreakerCooldownMs: Number(CIRCUIT_BREAKER_COOLDOWN_MS),
    rateLimitWindowMs: Number(RATE_LIMIT_WINDOW_MS),
};