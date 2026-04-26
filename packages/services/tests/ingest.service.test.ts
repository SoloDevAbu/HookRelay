import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@hookrelay/lib", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
  },
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    child: vi.fn().mockReturnValue({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    }),
  },
}));

vi.mock("@hookrelay/db", () => ({
  createEvent: vi.fn(),
  findEventsWithNoDeliveries: vi.fn(),
}));

vi.mock("@hookrelay/queue", () => ({
  fanoutQueue: {
    add: vi.fn(),
  },
}));

import { redis } from "@hookrelay/lib";
import { createEvent, findEventsWithNoDeliveries } from "@hookrelay/db";
import { ingestEvent, recoverUnfanoutEvents } from "../src/ingest.service";
import { fanoutQueue } from "@hookrelay/queue";

const mockRedis = vi.mocked(redis);
const mockCreateEvent = vi.mocked(createEvent);
const mockFanoutQueue = vi.mocked(fanoutQueue);
const mockFindEventWithNoDeliveries = vi.mocked(findEventsWithNoDeliveries);

const baseInput = {
  tenantId: "tenant-1",
  eventType: "order.placed",
  payload: { orderId: "123" },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ingestEvent", () => {
  describe("without idempotency key", () => {
    it("should persist event and enqueue fanout job", async () => {
      mockCreateEvent.mockResolvedValue({
        event: {
          id: "event-1",
          createdAt: new Date(),
          idempotencyKey: null,
          ...baseInput,
        },
        wasCreated: true,
      });
      mockFanoutQueue.add.mockResolvedValue({} as any);

      const result = await ingestEvent(baseInput);

      expect(result.eventId).toBe("event-1");
      expect(result.duplicate).toBe(false);
      expect(mockFanoutQueue.add).toHaveBeenCalledOnce();
    });
  });

  describe("with idempotency key", () => {
    const inputWithKey = { ...baseInput, idempotencyKey: "key-123" };

    it("should return duplicate from Redis cache", async () => {
      mockRedis.get.mockResolvedValue("event-cached");

      const result = await ingestEvent(inputWithKey);

      expect(result.eventId).toBe("event-cached");
      expect(result.duplicate).toBe(true);
      expect(mockCreateEvent).not.toHaveBeenCalled();
      expect(mockFanoutQueue.add).not.toHaveBeenCalled();
    });

    it("should return duplicate caught by postgres constraint", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockCreateEvent.mockResolvedValue({
        event: { id: "event-existing", createdAt: new Date(), ...inputWithKey },
        wasCreated: false,
      });

      const result = await ingestEvent(inputWithKey);

      expect(result.eventId).toBe("event-existing");
      expect(result.duplicate).toBe(true);
      expect(mockFanoutQueue.add).not.toHaveBeenCalled();
    });

    it("should backfill redis when postgres caches duplicate", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockCreateEvent.mockResolvedValue({
        event: { id: "event-existing", createdAt: new Date(), ...inputWithKey },
        wasCreated: false,
      });

      await ingestEvent(inputWithKey);

      expect(mockRedis.set).toHaveBeenCalledWith(
        "idempotency:tenant-1:key-123",
        "event-existing",
        "EX",
        86400,
      );
    });

    it("should set idempotency key in redis after successful insert", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockCreateEvent.mockResolvedValue({
        event: { id: "event-new", createdAt: new Date(), ...inputWithKey },
        wasCreated: true,
      });

      mockFanoutQueue.add.mockResolvedValue({} as any);

      await ingestEvent(inputWithKey);

      expect(mockRedis.set).toHaveBeenCalledWith(
        "idempotency:tenant-1:key-123",
        "event-new",
        "EX",
        86400,
      );
    });

    it("should not throw if queue enqueue fails", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockCreateEvent.mockResolvedValue({
        event: { id: "event-new", createdAt: new Date(), ...inputWithKey },
        wasCreated: true,
      });
      mockFanoutQueue.add.mockRejectedValue(new Error("Redis down"));

      await expect(ingestEvent(inputWithKey)).resolves.not.toThrow();
    });
  });
});

describe("recoverUnfanoutedEvents", () => {
  it("should do nothing if no orphaned events", async () => {
    mockFindEventWithNoDeliveries.mockResolvedValue([]);

    await recoverUnfanoutEvents();

    expect(mockFanoutQueue.add).not.toHaveBeenCalled();
  });

  it("should re-enqueue fanout jobs for orphaned events", async () => {
    mockFindEventWithNoDeliveries.mockResolvedValue([
      { id: "event-1", tenantId: "tenant-1" },
      { id: "event-2", tenantId: "tenant-1" },
    ] as any);
    mockFanoutQueue.add.mockResolvedValue({} as any);

    await recoverUnfanoutEvents();

    expect(mockFanoutQueue.add).toHaveBeenCalled();
  });

  it("should continue processing remaining events if no re-enqueue fails", async () => {
    mockFindEventWithNoDeliveries.mockResolvedValue([
      { id: "event-1", tenantId: "tenant-1" },
      { id: "event-2", tenantId: "tenant-1" },
    ] as any);
    mockFanoutQueue.add
      .mockRejectedValueOnce(new Error("Redis down"))
      .mockResolvedValueOnce({} as any);

    await recoverUnfanoutEvents();

    expect(mockFanoutQueue.add).toHaveBeenCalledTimes(2);
  });
});
