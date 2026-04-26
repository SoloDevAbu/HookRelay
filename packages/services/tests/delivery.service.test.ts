import { describe, it, expect, vi, beforeEach } from "vitest";
import { deliverEvent } from "../src/delivery.service";

vi.mock("@hookrelay/lib", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn().mockReturnValue({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
  },
  postJson: vi.fn(),
  HttpClientError: class HttpClientError extends Error {
    latencyMs: number;
    isTimeout: boolean;
    constructor(params: any) {
      super(params.message);
      this.latencyMs = params.latencyMs;
      this.isTimeout = params.isTimeout;
    }
  },
}));

vi.mock("@hookrelay/db", () => ({
  findEndpointById: vi.fn(),
  findEventById: vi.fn(),
  updateDeliveryStatus: vi.fn(),
  incrementDeliveryAttempt: vi.fn(),
  insertDeliveryAttempt: vi.fn(),
}));

vi.mock("@hookrelay/queue", () => ({
  getDeliveryQueue: vi.fn().mockReturnValue({
    add: vi.fn().mockResolvedValue({}),
  }),
}));

vi.mock("@hookrelay/config", () => ({
  config: {
    deliveryTimeoutMs: 30000,
    circuitBreakerThreshold: 5,
    circuitBreakerCooldownMs: 60000,
    maxDeliveryAttempts: 10,
    signatureSecret: "test-secret",
  },
}));

vi.mock("../src/curcuit-breaker.service", () => ({
  shouldAllowRequest: vi.fn(),
  recordSuccess: vi.fn(),
  recordFailure: vi.fn(),
}));

vi.mock("../src/signature.service", () => ({
  signPayload: vi.fn(),
}));

vi.mock("../src/retry.service", () => ({
  shouldDeadLetter: vi.fn(),
  getBackoffDelayMs: vi.fn(),
  getNextRetryAt: vi.fn(),
}));

import { postJson } from "@hookrelay/lib";
import {
  findEndpointById,
  findEventById,
  updateDeliveryStatus,
  incrementDeliveryAttempt,
  insertDeliveryAttempt,
} from "@hookrelay/db";
import {
  shouldAllowRequest,
  recordSuccess,
  recordFailure,
} from "../src/curcuit-breaker.service";
import { shouldDeadLetter } from "../src/retry.service";

const mockPostJson = vi.mocked(postJson);
const mockFindEndpoint = vi.mocked(findEndpointById);
const mockFindEvent = vi.mocked(findEventById);
const mockUpdateDelivery = vi.mocked(updateDeliveryStatus);
const mockIncrementAttempt = vi.mocked(incrementDeliveryAttempt);
const mockInsertAttempt = vi.mocked(insertDeliveryAttempt);
const mockShouldAllow = vi.mocked(shouldAllowRequest);
const mockRecordSuccess = vi.mocked(recordSuccess);
const mockRecordFailure = vi.mocked(recordFailure);
const mockShouldDeadLetter = vi.mocked(shouldDeadLetter);

const baseInput = {
  deliveryId: "delivery-1",
  endpointId: "endpoint-1",
  eventId: "event-1",
  tenantId: "tenant-1",
};

const mockEndpoint = {
  id: "endpoint-1",
  url: "https://example.com/hook",
  secret: "secret",
  customHeaders: {},
};

const mockEvent = {
  id: "event-1",
  payload: { orderId: "123" },
};

import { redis } from "@hookrelay/lib";
const mockRedis = vi.mocked(redis);

beforeEach(() => {
  vi.clearAllMocks();

  mockRedis.get.mockResolvedValue(null);
  mockRedis.set.mockResolvedValue("OK");
  mockFindEndpoint.mockResolvedValue(mockEndpoint as any);
  mockFindEvent.mockResolvedValue(mockEvent as any);
  mockShouldAllow.mockResolvedValue({ allowed: true, state: "CLOSED" });
  mockIncrementAttempt.mockResolvedValue({ attemptCount: 1 });
  mockInsertAttempt.mockResolvedValue({
    id: "attempt-1",
    deliveryId: "delivery-1",
    attemptStatus: "success",
    statusCode: 200,
    responseBody: "ok",
    latencyMs: 50,
    errorMessage: null,
    attemptedAt: new Date(),
  } as any);
  mockUpdateDelivery.mockResolvedValue({
    id: "delivery-1",
    eventId: "event-1",
    endpointId: "endpoint-1",
    tenantId: "tenant-1",
    attemptCount: 1,
  } as any);
  mockRecordSuccess.mockResolvedValue(undefined);
  mockRecordFailure.mockResolvedValue(undefined);
  mockShouldDeadLetter.mockReturnValue(false);
});

describe("deliverEvent", () => {
  describe("missing data", () => {
    it("should dead letter if endpoint not found", async () => {
      mockFindEndpoint.mockResolvedValue(null);

      const result = await deliverEvent(baseInput);

      expect(result.deadLettered).toBe(true);
      expect(mockUpdateDelivery).toHaveBeenCalledWith(
        "delivery-1",
        expect.objectContaining({ status: "dead" }),
      );
    });

    it("should deal letter if event not found", async () => {
      mockFindEvent.mockResolvedValue(null);

      const result = await deliverEvent(baseInput);

      expect(result.deadLettered).toBe(true);
    });
  });

  describe("circuit breaker", () => {
    it("should requeue with delay and not attempt delivery if circuit is open", async () => {
      mockShouldAllow.mockResolvedValue({ allowed: false, state: "OPEN" });

      const result = await deliverEvent(baseInput);

      expect(result.circuitOpen).toBe(true);
      expect(result.success).toBe(false);
      expect(mockPostJson).not.toHaveBeenCalled();
      expect(mockInsertAttempt).not.toHaveBeenCalled();
    });
  });

  describe("successful delivery", () => {
    it("should return success and reset circuit breaker", async () => {
      mockPostJson.mockResolvedValue({
        statusCode: 200,
        responseBody: "OK",
        latencyMs: 50,
      });

      const result = await deliverEvent(baseInput);

      expect(result.success).toBe(true);
      //   expect(result.statusCode).toBe(200);
      expect(mockRecordSuccess).toHaveBeenCalledWith("endpoint-1");
      expect(mockUpdateDelivery).toHaveBeenCalledWith(
        "delivery-1",
        expect.objectContaining({ status: "success" }),
      );
    });

    it("should record on success", async () => {
      mockPostJson.mockResolvedValue({
        statusCode: 200,
        responseBody: "OK",
        latencyMs: 50,
      });

      await deliverEvent(baseInput);

      expect(mockInsertAttempt).toHaveBeenCalledWith(
        expect.objectContaining({ attemptStatus: "success" }),
      );
    });
  });

  describe("failed delivery", () => {
    beforeEach(() => {
      mockPostJson.mockResolvedValue({
        statusCode: 500,
        responseBody: "error",
        latencyMs: 50,
      });
    });

    it("should record failure and update circuit breaker", async () => {
      const result = await deliverEvent(baseInput);

      expect(result.success).toBe(false);
      expect(mockRecordFailure).toHaveBeenCalledWith("endpoint-1");
    });

    it("should schedule retry when attempts not exhausted", async () => {
      mockShouldDeadLetter.mockReturnValue(false);
      mockIncrementAttempt.mockResolvedValue({ attemptCount: 1 });

      const result = await deliverEvent(baseInput);

      expect(result.deadLettered).toBe(false);
      expect(mockUpdateDelivery).toHaveBeenCalledWith(
        "delivery-1",
        expect.objectContaining({ status: "failed" }),
      );
    });

    it("should dead letter when attempts exhausted", async () => {
      mockShouldDeadLetter.mockResolvedValue(true);
      mockIncrementAttempt.mockResolvedValue({ attemptCount: 10 });

      const result = await deliverEvent(baseInput);

      expect(result.deadLettered).toBe(true);
      expect(mockUpdateDelivery).toHaveBeenCalledWith(
        "delivery-1",
        expect.objectContaining({ status: "dead" }),
      );
    });

    it("should record attempt with failed status", async () => {
      await deliverEvent(baseInput);

      expect(mockInsertAttempt).toHaveBeenCalledWith(
        expect.objectContaining({ attemptStatus: "failed" }),
      );
    });
  });

  describe("timeout", () => {
    it("should record attempt as timeout on HttpClientError with isTimeout true", async () => {
      const { HttpClientError } = await import("@hookrelay/lib");
      mockPostJson.mockRejectedValue(
        new HttpClientError({
          message: "timeout",
          isTimeout: true,
          latencyMs: 30_000,
        }),
      );

      await deliverEvent(baseInput);

      expect(mockInsertAttempt).toHaveBeenCalledWith(
        expect.objectContaining({ attemptStatus: "timeout" }),
      );
    });
  });
});
