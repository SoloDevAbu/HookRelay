import { Redis } from 'ioredis';
import { config } from '@hookrelay/config';

/**
 * Singleton instance of the Redis client
 */

export const redis = new Redis(config.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,

    retryStrategy(times: number) {
        const delay = Math.min(times * 50, 500);
        return delay;
    },

    reconnectOnError(err: Error) {
        const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT'];
        if (targetErrors.some((e) => err.message.includes(e))) {
            return true;
        }
        return false;
    }
});

/**
 * Event Listeners
 */

redis.on('connect', () => {
    console.log('Redis connected');
})

redis.on('ready', () => {
    console.log('Redis ready');
})

redis.on('error', (err: Error) => {
    console.error('Redis error:', err);
});

redis.on('reconnecting', () => {
    console.log('Redis reconnecting');
});

redis.on('end', () => {
    console.log('Redis end');
});

redis.on('close', () => {
    console.warn('Redis closed');
});

export const disconnectRedis = async () => {
    try {
        await redis.quit();
    } catch (error) {
        console.error('Error disconnecting Redis:', error);
        throw error;
    }
}