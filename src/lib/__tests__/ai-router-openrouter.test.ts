import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

process.env.RETRY_INITIAL_DELAY = "1";
process.env.RETRY_MAX_DELAY = "50";
process.env.RETRY_MAX_RETRIES = "2";

vi.mock("@/lib/logger", () => ({
  logWarn: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

import { callOpenRouterForGeneration, routeToAI } from "@/lib/ai-router";
import {
  resetCircuitBreaker,
  getCircuitBreakerState,
} from "@/lib/circuit-breaker";
import { CircuitBreakerError } from "@/lib/errors";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

describe("ai-router OpenRouter retry and circuit breaker", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
    process.env.OPENROUTER_API_KEY = "test-key";
    resetCircuitBreaker("openrouter");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe("retry", () => {
    it("retries on 429/503 then succeeds and returns content (3 fetch calls)", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          text: () => Promise.resolve("rate limited"),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          text: () => Promise.resolve("unavailable"),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              choices: [{ message: { content: "ok" } }],
            }),
        });

      const result = await callOpenRouterForGeneration("sys", "user");
      expect(result).toBe("ok");
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(mockFetch).toHaveBeenCalledWith(
        OPENROUTER_URL,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-key",
          }),
        })
      );
    });
  });

  describe("circuit breaker", () => {
    const failureThreshold = 5;

    it("opens after N failures then throws CircuitBreakerError without calling fetch", { timeout: 30000 }, async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        text: () => Promise.resolve("unavailable"),
      });

      for (let i = 0; i < failureThreshold; i++) {
        await expect(
          callOpenRouterForGeneration("sys", "user")
        ).rejects.toThrow();
      }
      expect(getCircuitBreakerState("openrouter")).toBe("OPEN");
      // Each call does retry (up to 3 fetches per call)
      expect(mockFetch).toHaveBeenCalledTimes(failureThreshold * 3);

      mockFetch.mockClear();
      await expect(
        callOpenRouterForGeneration("sys", "user")
      ).rejects.toThrow(CircuitBreakerError);
      await expect(
        callOpenRouterForGeneration("sys", "user")
      ).rejects.toThrow("Circuit breaker");
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("after resetCircuitBreaker, next call tries again", { timeout: 30000 }, async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        text: () => Promise.resolve("unavailable"),
      });

      for (let i = 0; i < failureThreshold; i++) {
        await expect(
          callOpenRouterForGeneration("sys", "user")
        ).rejects.toThrow();
      }
      expect(getCircuitBreakerState("openrouter")).toBe("OPEN");

      resetCircuitBreaker("openrouter");
      expect(getCircuitBreakerState("openrouter")).toBe("CLOSED");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: "recovered" } }],
          }),
      });
      const result = await callOpenRouterForGeneration("sys", "user");
      expect(result).toBe("recovered");
      // 5 failed calls × 3 fetches each + 1 successful fetch
      expect(mockFetch).toHaveBeenCalledTimes(failureThreshold * 3 + 1);
    });
  });
});
