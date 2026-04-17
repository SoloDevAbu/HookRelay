import crypto from "node:crypto";

/**
 * Generate HMAC-SHA256 signature
 * signature format: sha256=<hash>
 * @param secret - The secret key
 * @param timestamp - The timestamp
 * @param body - The request body
 * @returns The signature
 */
export const signPayload = (
    secret: string,
    timestamp: number,
    body: string,
): string => {
    const signedContent = `${timestamp}.${body}`;

    const hash = crypto
        .createHmac("sha256", secret)
        .update(signedContent, "utf8")
        .digest("hex");

    return `sha256=${hash}`;
};

/**
 * Verify HMAC-SHA256 signature
 *
 * @param secret - The secret key
 * @param timestamp - The timestamp
 * @param body - The request body
 * @param signature - The signature to verify
 * @returns True if the signature is valid, false otherwise
 */
export const verifySignature = (
    secret: string,
    timestamp: number,
    body: string,
    signature: string,
): boolean => {
    if (!signature || !signature.startsWith("sha256=")) {
        return false;
    }

    const expectedSignature = signPayload(secret, timestamp, body);

    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedSignatureBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer);
};
