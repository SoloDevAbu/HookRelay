import { HookRelayOptions, IngestEventParams, IngestEventResponse } from './types';

export class HookRelayClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: HookRelayOptions) {
    if (!options.apiKey) {
      throw new Error("HookRelay SDK: apiKey is required.");
    }
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl?.replace(/\/$/, '') || 'http://localhost:3000';
  }

  async postEvent(params: IngestEventParams): Promise<IngestEventResponse> {
    const response = await fetch(`${this.baseUrl}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HookRelay SDK Error: ${response.status} ${response.statusText}`, { cause: errorData });
    }

    return response.json() as Promise<IngestEventResponse>;
  }
}
