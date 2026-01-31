import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/redis", () => ({ redis: null }));

import { rateLimiter } from "@/lib/rate-limit";

describe("rate-limit when Redis is null", () => {
  it("checkLimit allows request and returns remaining and resetAt", async () => {
    const result = await rateLimiter.checkLimit("user:test", 10, 60);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(10);
    expect(result.resetAt).toBeGreaterThanOrEqual(Date.now());
  });

  it("reset does not throw", async () => {
    await expect(rateLimiter.reset("user:test")).resolves.toBeUndefined();
  });
});
