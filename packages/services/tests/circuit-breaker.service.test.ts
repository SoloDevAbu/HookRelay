import { describe, expect, it, test, vi, beforeEach } from "vitest";
import {
  shouldAllowRequest,
  recordFailure,
  recordSuccess,
  reset,
} from "../src/curcuit-breaker.service";

vi.mock("@hookrelay/lib", () => ({
  redis: {
    mget: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
    eval: vi.fn(),
  },
  logger: {
    info: vi.fn(),
    wanr: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    child: vi.fn(),
  },
}));

vi.mock("@hookrelay/config", () => ({
  config: {
    circuitBreakerThreshold: 5,
    circuitBreakerCooldownMs: 60_000,
  },
}));

import { redis } from "@hookrelay/lib";

const mockRedis = vi.mocked(redis);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ShouldAllowRequest", () => {
  it("should allow request when state is CLOSED", async () => {
    mockRedis.mget.mockResolvedValue([null, null]);

    const result = await shouldAllowRequest("endpoint-1");

    expect(result.allowed).toBe(true);
    expect(result.state).toBe("CLOSED");
  });

  it("should block request when state is OPEN and cooldown has not passed", async () => {
    const recentOpenedAt = (Date.now() - 10_000).toString(); // 10s ago, cooldown in 60s
    mockRedis.mget.mockResolvedValue(["OPEN", recentOpenedAt]);

    const result = await shouldAllowRequest("endpoint-1");

    expect(result.allowed).toBe(false);
    expect(result.state).toBe("OPEN");
  });

  it("should block when cooldown is passed but lock already is held by another worker", async () => {
    const oldOpenedAt = (Date.now() - 120_000).toString();
    mockRedis.mget.mockResolvedValue(["OPEN", oldOpenedAt]);
    mockRedis.set.mockResolvedValue(null); //lock not aquired

    const result = await shouldAllowRequest("endpoint-1");

    expect(result.allowed).toBe(false);
    expect(result.state).toBe("OPEN");
  });

  it("should allow when HALF-LOCK and lock exists", async () => {
    mockRedis.mget.mockResolvedValue(["HALF-OPEN", null]);
    mockRedis.exists.mockResolvedValue(1);

    const result = await shouldAllowRequest("endpoint-1");

    expect(result.allowed).toBe(true);
    expect(result.state).toBe("HALF-OPEN");
  });

  it("should block when HALF-OPEN and lcok does not exists", async () => {
    mockRedis.mget.mockResolvedValue(["HALF-OPEN", null]);
    mockRedis.exists.mockResolvedValue(0);

    const result = await shouldAllowRequest("endpoint-1");

    expect(result.allowed).toBe(false);
    expect(result.state).toBe("HALF-OPEN");
  });
});

describe("recordSuccess", () => {
  it("should delete all circuit breaker keys", async () => {
    mockRedis.del.mockResolvedValue(4);

    await recordSuccess("endpoint-1");

    expect(mockRedis.del).toHaveBeenCalledWith(
      "cb:endpoint-1:state",
      "cb:endpoint-1:failures",
      "cb:endpoint-1:opened_at",
      "cb:endpoint-1:half_open_lock",
    );
  });
});

describe("recordFailure", () => {
  it("should run the lua script with correct arguments", async () => {
    mockRedis.eval.mockResolvedValue([1, "CLOSED"]);

    await recordFailure("endpoint-1");

    expect(mockRedis.eval).toHaveBeenCalledWith(
      expect.any(String),
      3,
      "cb:endpoint-1:failures",
      "cb:endpoint-1:state",
      "cb:endpoint-1:opened_at",
      5, //threshold from config
      expect.any(String), //timestamp
      expect.any(Number), //tt;
    );
  });

  // it("should log warn when circuit opens", async () => {
  //   const { logger } = await import("@hookrelay/lib");
  //   mockRedis.eval.mockResolvedValue([5, "OPEN"]);

  //   await recordFailure("endpoint-1");

  //   expect(logger.warn).toHaveBeenCalled();
  // });

  it("should log debug when circuit stays closed", async () => {
    const { logger } = await import("@hookrelay/lib");
    mockRedis.eval.mockResolvedValue([2, "CLOSED"]);

    await recordFailure("endpoint-1");

    expect(logger.debug).toHaveBeenCalled();
  });
});

describe("reset", () => {
  it("should delete all circuit breaker keys", async () => {
    mockRedis.del.mockResolvedValue(4);

    await reset("endpoint-1");

    expect(mockRedis.del).toHaveBeenCalledWith(
      "cb:endpoint-1:state",
      "cb:endpoint-1:failures",
      "cb:endpoint-1:opened_at",
      "cb:endpoint-1:half_open_lock",
    );
  });
});
