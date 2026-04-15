import axios, { Axios, AxiosError, AxiosInstance } from "axios";
import { config } from "@hookrelay/config";

/**
 * Unified error types for all HTTP failures
 */

export class HttpClientError extends Error {
  public readonly statusCode?: number | undefined;
  public readonly responseBody?: string | undefined;
  public readonly isTimeout?: boolean | undefined;

  constructor(params: {
    message: string;
    statusCode?: number;
    responseBody?: string;
    isTimeout?: boolean;
  }) {
    super(params.message);
    this.name = "HttpClientError";
    this.statusCode = params.statusCode;
    this.responseBody = params.responseBody;
    this.isTimeout = params.isTimeout ?? false;
  }
}

/**
 * Axios instance with safe defaults
 */
const client: AxiosInstance = axios.create({
  ...(config.deliveryTimeoutMs ? { timeout: Number(config.deliveryTimeoutMs) } : {}),
  maxRedirects: 0,
  validateStatus: () => true,
});

/**
 * HTTP POST wrapper (for webhook delivery)
 */
export const postJson = async (
  url: string,
  body: unknown,
  headers: Record<string, string> = {},
): Promise<{
    statusCode: number;
    responseBody: string;
    latencyMs: number;
}> => {
    const start = Date.now();

    try {
        const res = await client.post(url, body, {
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
        });

        const latencyMs = Date.now() - start;

        return {
            statusCode: res.status,
            responseBody: 
                typeof res.data === "string"
                ? res.data.slice(0, 100)
                : JSON.stringify(res.data).slice(0, 100),
            latencyMs,
        };
    } catch (error) {
        const latencyMs = Date.now() - start;

        if(error instanceof AxiosError) {
            if(error.code === 'ECONNABORTED') {
                throw new HttpClientError({
                    message: "Request Timed out",
                    isTimeout: true,
                })
            }

            if(error.response) {
                throw new HttpClientError({
                    message: "HTTP error response",
                    statusCode: error.response.status,
                    responseBody: JSON.stringify(error.response.data).slice(0, 100),
                });
            }
            throw new HttpClientError({
                message: error.message || "Network Error"
            });
        };

        throw new HttpClientError({
            message: "Unknown HTTP client error"
        })
    }
}
