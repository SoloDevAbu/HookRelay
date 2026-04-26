import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getBackoffDelayMs,
  getNextRetryAt,
  shouldDeadLetter,
} from "../src/retry.service";

vi.mock("@hookrelay/config", () => ({
  config: {
    maxDeliveryAttempts: 10,
  },
}));

describe("shouldDeadLetter", () => {
  it("should return false when attempts are below max", () => {
    expect(shouldDeadLetter(9)).toBe(false);
  });

  it("should return true when attemps are equal to max", () => {
    expect(shouldDeadLetter(10)).toBe(true);
  });

  it("should return true when attempts exceed max", () => {
    expect(shouldDeadLetter(11)).toBe(true);
  });

  it("should return false for 0 attempts", () => {
    expect(shouldDeadLetter(0)).toBe(false);
  });
});

describe("getBackoffDelayMs", () => {
  it("should return 10s for attemps 1", () => {
    expect(getBackoffDelayMs(1)).toBe(10_000);
  });

  it("should return 30s for attempt 2", () => {
    expect(getBackoffDelayMs(2)).toBe(30_000);
  });

  it("should return 86400s for attempt 10", () => {
    expect(getBackoffDelayMs(10)).toBe(86_400_000);
  });

  it("should return max delay for attempts beyond schedule length", () => {
    expect(getBackoffDelayMs(999)).toBe(86_400_000);
  });

  it("should always return a positive number", () => {
    for (let i = 1; i <= 15; i++) {
      expect(getBackoffDelayMs(i)).toBeGreaterThan(0);
    }
  });

  it("should increase delay as attempts increase", () => {
    const delays = [1, 2, 3, 4, 5].map(getBackoffDelayMs);
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBeGreaterThan(delays[i - 1]);
    }
  });
});

describe("getNextRetryAt", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-04T00:00:00.000Z"));
  });

  it("shuld return a Date", () => {
    expect(getNextRetryAt(1)).toBeInstanceOf(Date);
  });

  it("should return a future date", () => {
    const now = Date.now();
    expect(getNextRetryAt(1).getTime()).toBeGreaterThan(now);
  });

  it("should be offset by the correct backoff delay", () => {
    const now = Date.now();
    const nextRetry = getNextRetryAt(1);

    expect(nextRetry.getTime() - now).toBe(getBackoffDelayMs(1));
  });
});
