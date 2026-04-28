import { describe, it, expect, vi, beforeEach } from "vitest";
import { fanoutEvent, buildDeliveryJobs } from "../src/fanout.service";

vi.mock("@hookrelay/lib", () => ({
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
}));

vi.mock("@hookrelay/db", () => ({
  findEventById: vi.fn(),
  findEndpointsByTenantIdAndEventType: vi.fn(),
  batchInsertDeliveries: vi.fn(),
}));

vi.mock("@hookrelay/queue", () => ({
  getDeliveryQueue: vi.fn().mockReturnValue({
    addBulk: vi.fn().mockResolvedValue([]),
  }),
}));

import {
  findEventById,
  findEndpointsByTenantIdAndEventType,
  batchInsertDeliveries,
} from "@hookrelay/db";
import { getDeliveryQueue } from "@hookrelay/queue";

const mockFindEventById = vi.mocked(findEventById);
const mockFindEndpoints = vi.mocked(findEndpointsByTenantIdAndEventType);
const mockBatchInsert = vi.mocked(batchInsertDeliveries);
const mockGetDeliveryQueue = vi.mocked(getDeliveryQueue);

const mockEvent = {
  id: "event-1",
  tenantId: "tenant-1",
  eventType: "order.place",
  payload: { orderId: "123" },
};

const mockEndpoints = [
  { id: "endpoint-1", url: "https://a.com/hook" },
  { id: "endpoint-2", url: "https://b.com/hook" },
];

const mockDeliveries = [{ id: "delivery-1" }, { id: "delivery-2" }];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("buildDeliveryJobs", () => {
  it("should map endpoints and deliveryIds to BullMQ job payload", () => {
    const jobs = buildDeliveryJobs(
      "event-1",
      "tenant-1",
      ["delivery-1", "delivery-2"],
      mockEndpoints as any,
    );

    expect(jobs).toHaveLength(2);
    expect(jobs[0].data.deliveryId).toBe("delivery-1");
    expect(jobs[1].data.deliveryId).toBe("delivery-2");
    expect(jobs[0].data.endpointId).toBe("endpoint-1");
    expect(jobs[1].data.endpointId).toBe("endpoint-2");
  });

  it("should set deterministic jobId per event-endpoint pair", () => {
    const jobs = buildDeliveryJobs("event-1", "tenant-1", ["delivery-1"], [
      mockEndpoints[0],
    ] as any);

    expect(jobs[0].opts.jobId).toBe("event-1_endpoint-1");
  });

  it("should return empty array for empty endpoints", () => {
    const jobs = buildDeliveryJobs("event-1", "tenant-1", [], []);
    expect(jobs).toHaveLength(0);
  });
});

describe("fanoutEvent", () => {
  it("should return skipped if event not found", async () => {
    mockFindEventById.mockResolvedValue(null);

    const result = await fanoutEvent({
      eventId: "event-1",
      tenantId: "tenant-1",
    });

    expect(result.skipped).toBe(true);
    expect(result.deliveriesCreated).toBe(0);
  });

  it("should return skipped if no matching endpoints", async () => {
    mockFindEventById.mockResolvedValue(mockEvent as any);
    mockFindEndpoints.mockResolvedValue([]);

    const result = await fanoutEvent({
      eventId: "event-1",
      tenantId: "tenant-1",
    });

    expect(result.skipped).toBe(true);
    expect(result.deliveriesCreated).toBe(0);
    expect(mockBatchInsert).not.toHaveBeenCalled();
  });

  it("should create deliveries and enqueue jobs for matching endpoints", async () => {
    mockFindEventById.mockResolvedValue(mockEvent as any);
    mockFindEndpoints.mockResolvedValue(mockEndpoints as any);
    mockBatchInsert.mockResolvedValue(mockDeliveries as any);

    const result = await fanoutEvent({
      eventId: "event-1",
      tenantId: "tenant-1",
    });

    expect(result.skipped).toBe(false);
    expect(result.deliveriesCreated).toBe(2);
    expect(mockBatchInsert).toHaveBeenCalled();
  });

  it("should call add bulk once regardless of endpoint count", async () => {
    mockFindEndpoints.mockResolvedValue(mockEndpoints as any);
    mockFindEventById.mockResolvedValue(mockEvent as any);
    mockBatchInsert.mockResolvedValue(mockDeliveries as any);

    await fanoutEvent({ eventId: "event-1", tenantId: "tenant-1" });

    const queue = mockGetDeliveryQueue("tenant-1");

    expect(queue.addBulk).toHaveBeenCalledOnce();
  });

  it("should use per-tenant delivery queue", async () => {
    mockFindEventById.mockResolvedValue(mockEvent as any);
    mockFindEndpoints.mockResolvedValue(mockEndpoints as any);
    mockBatchInsert.mockResolvedValue(mockDeliveries as any);

    await fanoutEvent({ eventId: "event-1", tenantId: "tenant-1" });

    expect(mockGetDeliveryQueue).toHaveBeenCalledWith("tenant-1");
  });
});
