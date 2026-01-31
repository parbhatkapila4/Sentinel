import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockGet = vi.fn();
const mockSet = vi.fn();
const mockDel = vi.fn();
const mockKeys = vi.fn();

vi.mock("@/lib/redis", () => ({
  redis: {
    get: (...args: unknown[]) => mockGet(...args),
    set: (...args: unknown[]) => mockSet(...args),
    del: (...args: unknown[]) => mockDel(...args),
    keys: (...args: unknown[]) => mockKeys(...args),
  },
}));

import {
  getCache,
  withCache,
  invalidateCache,
  invalidateCachePattern,
} from "@/lib/cache";

describe("cache", () => {
  const env = process.env as Record<string, string | undefined>;
  const origNodeEnv = env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    env.NODE_ENV = "development";
  });

  afterEach(() => {
    env.NODE_ENV = origNodeEnv;
  });

  describe("when NODE_ENV is test", () => {
    beforeEach(() => {
      env.NODE_ENV = "test";
    });

    it("withCache returns loader result (cache bypassed)", async () => {
      const loader = vi.fn().mockResolvedValue({ data: 42 });
      const result = await withCache("key", 60, loader);
      expect(result).toEqual({ data: 42 });
      expect(loader).toHaveBeenCalledTimes(1);
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("getCache returns null", async () => {
      const result = await getCache<number>("key");
      expect(result).toBeNull();
    });
  });

  describe("when NODE_ENV is development and redis is available", () => {
    it("getCache returns null when key missing", async () => {
      mockGet.mockResolvedValue(null);
      const result = await getCache<number>("missing");
      expect(result).toBeNull();
    });

    it("getCache returns parsed JSON when key exists", async () => {
      mockGet.mockResolvedValue(JSON.stringify({ foo: "bar" }));
      const result = await getCache<{ foo: string }>("key");
      expect(result).toEqual({ foo: "bar" });
    });

    it("withCache returns cached value when cache hit", async () => {
      const cached = { deals: [] };
      mockGet.mockResolvedValue(JSON.stringify(cached));
      const loader = vi.fn().mockResolvedValue({ deals: [1] });
      const result = await withCache("deals:key", 15, loader);
      expect(result).toEqual(cached);
      expect(loader).not.toHaveBeenCalled();
    });

    it("withCache calls loader and returns value when cache miss", async () => {
      mockGet.mockResolvedValue(null);
      const value = { id: 1 };
      const loader = vi.fn().mockResolvedValue(value);
      const result = await withCache("key", 60, loader);
      expect(result).toEqual(value);
      expect(loader).toHaveBeenCalledTimes(1);
      expect(mockSet).toHaveBeenCalled();
    });

    it("invalidateCache calls redis del", async () => {
      mockDel.mockResolvedValue(undefined);
      await invalidateCache("key");
      expect(mockDel).toHaveBeenCalledWith("key");
    });

    it("invalidateCachePattern calls redis keys and del", async () => {
      mockKeys.mockResolvedValue(["key1", "key2"]);
      mockDel.mockResolvedValue(undefined);
      await invalidateCachePattern("deals:*");
      expect(mockKeys).toHaveBeenCalledWith("deals:*");
      expect(mockDel).toHaveBeenCalledWith("key1", "key2");
    });
  });
});
