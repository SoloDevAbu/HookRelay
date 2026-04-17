import { describe, it, expect } from 'vitest';
import { signPayload, verifySignature } from '../src/signature.service';

describe('signature service', () => {
    const secret = 'super_secret_key';
    const timestamp = Number('1234567890');
    const body = JSON.stringify({
        eventId: 'event_1',
        tenantId: 'tenant_1',
    });

    it('should generate a valid signature', () => {
        const signature = signPayload(secret, timestamp, body);

        expect(signature).toBeDefined();
        expect(typeof signature).toBe('string');
        expect(signature.startsWith('sha256=')).toBe(true);
    })
})