import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRedis = vi.hoisted(() => ({
  zremrangebyscore: vi.fn().mockResolvedValue(undefined),
  zcard: vi.fn(),
  zadd: vi.fn().mockResolvedValue(undefined),
  expire: vi.fn().mockResolvedValue(undefined),
  del: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/redis", () => ({ redis: mockRedis }));

import { rateLimiter, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedis.zcard.mockResolvedValue(0);
  });

  describe("checkLimit", () => {
    it("allows request when under limit", async () => {
      mockRedis.zcard.mockResolvedValue(0);
      const result = await rateLimiter.checkLimit("user:test", 10, 60);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
      expect(result.resetAt).toBeGreaterThanOrEqual(Date.now());
    });

    it("blocks request when at or over limit", async () => {
      mockRedis.zcard.mockResolvedValue(10);
      const result = await rateLimiter.checkLimit("user:test", 10, 60);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.resetAt).toBeGreaterThanOrEqual(Date.now());
    });

    it("returns remaining count and resetAt", async () => {
      mockRedis.zcard.mockResolvedValue(3);
      const result = await rateLimiter.checkLimit("ip:1.2.3.4", 10, 60);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(6);
      expect(typeof result.resetAt).toBe("number");
    });
  });

  describe("calculateBackoff", () => {
    it("returns exponential delay capped by maxDelay", () => {
      const delay1 = rateLimiter.calculateBackoff(1, 1, 60);
      const delay2 = rateLimiter.calculateBackoff(2, 1, 60);
      const delay3 = rateLimiter.calculateBackoff(3, 1, 60);
      expect(delay1).toBe(1);
      expect(delay2).toBe(2);
      expect(delay3).toBe(4);
    });

    it("caps at maxDelay", () => {
      const delay = rateLimiter.calculateBackoff(10, 1, 60);
      expect(delay).toBe(60);
    });
  });

  describe("reset", () => {
    it("calls redis del and does not throw", async () => {
      await expect(rateLimiter.reset("user:test")).resolves.toBeUndefined();
      expect(mockRedis.del).toHaveBeenCalledWith("rate_limit:user:test");
    });
  });

  describe("RATE_LIMIT_CONFIGS", () => {
    it("has expected configs with limit and window", () => {
      expect(RATE_LIMIT_CONFIGS.USER_DEFAULT).toEqual({ limit: expect.any(Number), window: 60 });
      expect(RATE_LIMIT_CONFIGS.USER_AI.window).toBe(60);
      expect(RATE_LIMIT_CONFIGS.USER_EXPORT.window).toBe(60);
      expect(RATE_LIMIT_CONFIGS.IP_PUBLIC.window).toBe(60);
    });
  });
});
