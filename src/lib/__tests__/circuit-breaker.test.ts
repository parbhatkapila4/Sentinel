import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/logger", () => ({
  logWarn: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

import {
  withCircuitBreaker,
  getCircuitBreakerState,
  resetCircuitBreaker,
} from "@/lib/circuit-breaker";
import { CircuitBreakerError } from "@/lib/errors";

describe("circuit-breaker", () => {
  const name = "test-service";

  beforeEach(() => {
    resetCircuitBreaker(name);
  });

  it("CLOSED allows calls and returns result", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const result = await withCircuitBreaker(name, fn, {
      failureThreshold: 3,
      timeout: 1000,
    });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(getCircuitBreakerState(name)).toBe("CLOSED");
  });

  it("after N failures OPEN rejects fast with CircuitBreakerError", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fail"));
    const config = { failureThreshold: 2, timeout: 10000 };

    await expect(withCircuitBreaker(name, fn, config)).rejects.toThrow("fail");
    await expect(withCircuitBreaker(name, fn, config)).rejects.toThrow("fail");
    expect(getCircuitBreakerState(name)).toBe("OPEN");

    await expect(withCircuitBreaker(name, vi.fn().mockResolvedValue("ok"), config))
      .rejects.toThrow(CircuitBreakerError);
    await expect(withCircuitBreaker(name, vi.fn().mockResolvedValue("ok"), config))
      .rejects.toThrow("Circuit breaker");
  });

  it("resetCircuitBreaker closes the circuit", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fail"));
    const config = { failureThreshold: 2, timeout: 10000 };
    await withCircuitBreaker(name, fn, config).catch(() => { });
    await withCircuitBreaker(name, fn, config).catch(() => { });
    expect(getCircuitBreakerState(name)).toBe("OPEN");

    resetCircuitBreaker(name);
    expect(getCircuitBreakerState(name)).toBe("CLOSED");

    const okFn = vi.fn().mockResolvedValue("ok");
    const result = await withCircuitBreaker(name, okFn, config);
    expect(result).toBe("ok");
  });
});
