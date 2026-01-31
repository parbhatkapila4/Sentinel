import { describe, it, expect, vi, beforeEach } from "vitest";
import { retryWithBackoff } from "@/lib/retry";
import { RetryableError } from "@/lib/errors";

vi.mock("@/lib/logger", () => ({
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

describe("retry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("succeeds on first try", async () => {
    const fn = vi.fn().mockResolvedValue(42);
    const result = await retryWithBackoff(fn);
    expect(result).toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on RetryableError and eventually succeeds", async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new RetryableError("Temporary"))
      .mockResolvedValueOnce("ok");
    const result = await retryWithBackoff(fn, { maxRetries: 2, initialDelay: 10, maxDelay: 100 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("throws after max retries when all attempts fail", async () => {
    const err = new RetryableError("Always fails");
    const fn = vi.fn().mockRejectedValue(err);
    await expect(retryWithBackoff(fn, { maxRetries: 2, initialDelay: 10, maxDelay: 100 }))
      .rejects.toThrow("Always fails");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("does not retry on non-retryable error", async () => {
    const err = new Error("Validation failed");
    const fn = vi.fn().mockRejectedValue(err);
    await expect(retryWithBackoff(fn, { maxRetries: 3, initialDelay: 10 }))
      .rejects.toThrow("Validation failed");
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
