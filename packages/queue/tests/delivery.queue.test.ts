import { expect, it, describe, vi, beforeEach } from "vitest";
import { getDeliveryQueueName, getDeliveryQueue, closeAllDeliveryQueues } from '../src/delivery.queue';

vi.mock('../src/client', () => ({
    bullmqRedis: {},
}))

describe('delivery queue name', () => {
    it('should return correct delivery queue name', () => {
        const queueName = getDeliveryQueueName('tenant_1')
        expect(queueName).toBe('deliveries-tenant_1')
    });

    it('should return the name queue name for same tenant', () => {
        const queueName1 = getDeliveryQueueName('tenant_1');
        const queueName2 = getDeliveryQueueName('tenant_1');

        expect(queueName1).toBe(queueName2);
    });

    it('should return different queue name for different tenant', () => {
        const queueName1 = getDeliveryQueueName('tenant_1');
        const queueName2 = getDeliveryQueueName('tenant_2');

        expect(queueName1).not.toBe(queueName2);
    });
});

describe('Delivery queue', () => {
    beforeEach(async () => {
        await closeAllDeliveryQueues();
    });

    it('should return same queue instance for same tenant', () => {
        const q1 = getDeliveryQueue('tenant_1');
        const q2 = getDeliveryQueue('tenant_1');

        expect(q1).toBe(q2);
    })

    it('should return different queues for different tenants', () => {
        const q1 = getDeliveryQueue('tenant_1');
        const q2 = getDeliveryQueue('tenant_2');

        expect(q1).not.toBe(q2);
        expect(q1.name).not.toBe(q2.name);
    })

    it('should have correct default job options', () => {
        const queue = getDeliveryQueue('tenant_1');
        const opts = queue.opts.defaultJobOptions;

        expect(opts?.attempts).toBe(1);
        expect(opts?.removeOnComplete).toEqual({
            count: 1000,
        })
        expect(opts?.removeOnFail).toEqual({
            count: 5000,
        })
    })

    it('should close and clear all queues', async () => {
        const q1 = getDeliveryQueue('tenant_1');
        const q2 = getDeliveryQueue('tenant_2');

        const closeSpy1 = vi.spyOn(q1, 'close');
        const closeSpy2 = vi.spyOn(q2, 'close');

        await closeAllDeliveryQueues();

        expect(closeSpy1).toHaveBeenCalled();
        expect(closeSpy2).toHaveBeenCalled();

        //after clearing, new instance should be created
        const newQ1 = getDeliveryQueue('tenant_1');
        expect(newQ1).not.toBe(q1);
    })
})