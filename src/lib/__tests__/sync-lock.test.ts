import { describe, it, expect, vi, beforeEach } from "vitest";

const { store, mockRedis } = vi.hoisted(() => {
  const store = new Map<string, string>();
  const mockRedis = {
    set: vi.fn(
      async (key: string, value: string, opts?: { nx?: boolean; ex?: number }) => {
        if (opts?.nx && store.has(key)) return null;
        store.set(key, value);
        return "OK";
      }
    ),
    eval: vi.fn(async (_script: string, keys: string[], args: string[]) => {
      if (store.get(keys[0]) === args[0]) {
        store.delete(keys[0]);
        return 1;
      }
      return 0;
    }),
  };
  return { store, mockRedis };
});

vi.mock("@/lib/redis", () => ({ redis: mockRedis }));
vi.mock("@/lib/metrics", () => ({ incrementMetric: vi.fn() }));
vi.mock("@/lib/logger", () => ({
  logWarn: vi.fn(),
  logInfo: vi.fn(),
  logError: vi.fn(),
  logDebug: vi.fn(),
}));

import {
  SYNC_LOCK_TTL_SECONDS,
  acquireSyncLock,
  syncLockRedisKey,
  withSyncLock,
} from "@/lib/sync/lock";

beforeEach(() => {
  store.clear();
  vi.clearAllMocks();
});

describe("sync lock (Redis SET NX EX)", () => {
  it("TTL outlives the 60s function ceiling and is shorter than the daily cron interval", () => {
    expect(SYNC_LOCK_TTL_SECONDS).toBeGreaterThan(60);
    expect(SYNC_LOCK_TTL_SECONDS).toBeLessThan(24 * 60 * 60);
  });

  it("acquires with NX and the TTL, and refuses a second acquire for the same user+integration", async () => {
    const first = await acquireSyncLock("user-1", "hubspot_deals");
    expect(first.acquired).toBe(true);
    expect(mockRedis.set).toHaveBeenCalledWith(
      syncLockRedisKey("user-1", "hubspot_deals"),
      expect.any(String),
      { nx: true, ex: SYNC_LOCK_TTL_SECONDS }
    );

    const second = await acquireSyncLock("user-1", "hubspot_deals");
    expect(second.acquired).toBe(false);
    if (!second.acquired) expect(second.reason).toBe("sync_in_progress");
  });

  it("does not contend across different users or different integrations", async () => {
    const a = await acquireSyncLock("user-1", "hubspot_deals");
    const b = await acquireSyncLock("user-2", "hubspot_deals");
    const c = await acquireSyncLock("user-1", "gmail");
    expect(a.acquired && b.acquired && c.acquired).toBe(true);
  });

  it("release is compare-and-delete: a stale handle cannot remove another run's lock", async () => {
    const first = await acquireSyncLock("user-1", "gmail");
    if (!first.acquired) throw new Error("expected lock");
    const key = syncLockRedisKey("user-1", "gmail");

    store.delete(key);
    const second = await acquireSyncLock("user-1", "gmail");
    expect(second.acquired).toBe(true);

    await first.release();
    expect(store.has(key)).toBe(true);

    if (second.acquired) await second.release();
    expect(store.has(key)).toBe(false);
  });

  it("withSyncLock runs the body once and reports skipped to a concurrent caller", async () => {
    let releaseInner: () => void = () => { };
    const gate = new Promise<void>((resolve) => {
      releaseInner = resolve;
    });
    const body = vi.fn(async () => {
      await gate;
      return "done";
    });

    const running = withSyncLock("user-1", "salesforce_deals", body);
    await Promise.resolve();
    const concurrent = await withSyncLock("user-1", "salesforce_deals", body);
    expect(concurrent).toEqual({ skipped: true, reason: "sync_in_progress" });

    releaseInner();
    const result = await running;
    expect(result).toEqual({ skipped: false, result: "done" });
    expect(body).toHaveBeenCalledTimes(1);
    expect(store.size).toBe(0);
  });

  it("releases the lock when the body throws", async () => {
    await expect(
      withSyncLock("user-1", "gmail", async () => {
        throw new Error("boom");
      })
    ).rejects.toThrow("boom");
    expect(store.size).toBe(0);
  });
});
