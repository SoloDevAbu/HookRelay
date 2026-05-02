export interface HookRelayOptions {
  apiKey: string;
  baseUrl?: string;
}

export interface IngestEventParams {
  eventType: string;
  payload: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface IngestEventResponse {
  success: boolean;
  data?: {
    eventId: string;
    duplicate: boolean;
    status: string;
  };
}
