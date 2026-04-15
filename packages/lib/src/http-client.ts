import { fetch, RequestInit } from "undici";
import { config } from "@hookrelay/config";

/**
 * Unified error types for all outbound HTTP failures.
 */

export class HttpClientError extends Error {
    public readonly statusCode?: number;
    public readonly responseBody?: string;
    public readonly isTimeout?: boolean;
    public readonly latencyMs: number;

    constructor(params: {
        message: string;
        statusCode?: number;
        responseBody?: string;
        isTimeout?: boolean;
        latencyMs: number;
    }) {
        super(params.message);
        this.name = "HttpClientError";
        this.statusCode = params.statusCode;
        this.responseBody = params.responseBody;
        this.isTimeout = params.isTimeout ?? false;
        this.latencyMs = params.latencyMs;
    }
}

export interface HttpResponse {
    statusCode: number;
    responseBody: string;
    latencyMs: number;
}


/**
 * HTTP POST wrapper for webhook delivery
 */
export const postJson = async (
    url: string,
    body: unknown,
    headers: Record<string, string> = {},
): Promise<HttpResponse> => {
    const start = Date.now();

    const init: RequestInit = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: JSON.stringify(body),
        redirect: 'manual',
        signal: AbortSignal.timeout(config.deliveryTimeoutMs)
    }

    try {
        const res = await fetch(url, init);
        const latencyMs = Date.now() - start;

        const rawText = await res.text();
        const responseBody = rawText.slice(0, 1000);
        return {
            statusCode: res.status,
            responseBody,
            latencyMs,
        };
    } catch (error) {
        const latencyMs = Date.now() - start;

        if (error instanceof DOMException && error.name === 'TimeoutError') {
            throw new HttpClientError({
                message: "Request Timed out",
                isTimeout: true,
                latencyMs,
            })
        }

        throw new HttpClientError({
            message: "Unknown HTTP client error",
            latencyMs,
        })
    }
}
