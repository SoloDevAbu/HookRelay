import { describe, it, expect } from 'vitest';
import { fanoutQueue } from '../src/fanout.queue';
import { FANOUT_QUEUE_NAME } from '@hookrelay/config';

describe('fanoutQueue', () => {
    it('should be defined', () => {
        expect(fanoutQueue).toBeDefined();
    });

    it('should have correct queue name', () => {
        expect(fanoutQueue.name).toBe(FANOUT_QUEUE_NAME);
    });

    it('should have correct default job options', () => {
        const options = fanoutQueue.opts.defaultJobOptions;

        expect(options).toBeDefined();
        expect(options?.attempts).toBe(3);
        expect(options?.backoff).toEqual({
            type: 'exponential',
            delay: 1000,
        });
        expect(options?.removeOnComplete).toEqual({
            count: 1000,
        })
        expect(options?.removeOnFail).toEqual({
            count: 5000,
        })
    });

    it('should have a Redis connection attached', () => {
        expect(fanoutQueue.opts.connection).toBeDefined();
    })
})