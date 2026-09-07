import crypto from "crypto";
import { redis } from "@/lib/redis";
import { incrementMetric } from "@/lib/metrics";
import { logWarn } from "@/lib/logger";

export const SYNC_LOCK_TTL_SECONDS = 5 * 60;

export const SYNC_IN_PROGRESS = "sync_in_progress" as const;

export const SYNC_IN_PROGRESS_MESSAGE =
  "A sync for this integration is already running. Try again in a few minutes.";

export type SyncLockKey =
  | "hubspot_deals"
  | "hubspot_contacts"
  | "salesforce_deals"
  | "salesforce_contacts"
  | "gmail"
  | "calendar_oauth"
  | "google_calendar_legacy";

export type SyncLockHandle =
  | { acquired: true; degraded: boolean; release: () => Promise<void> }
  | { acquired: false; reason: typeof SYNC_IN_PROGRESS };

export type SyncLockOutcome<T> =
  | { skipped: true; reason: typeof SYNC_IN_PROGRESS }
  | { skipped: false; result: T };

const RELEASE_SCRIPT =
  "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";

let warnedDegraded = false;

export function syncLockRedisKey(userId: string, key: SyncLockKey): string {
  return `sync-lock:${key}:${userId}`;
}

async function noopRelease(): Promise<void> { }

export async function acquireSyncLock(
  userId: string,
  key: SyncLockKey,
  ttlSeconds: number = SYNC_LOCK_TTL_SECONDS
): Promise<SyncLockHandle> {
  if (!redis) {
    void incrementMetric("sync.lock.degraded", 1);
    if (!warnedDegraded && process.env.NODE_ENV !== "test") {
      warnedDegraded = true;
      logWarn("sync_lock_degraded_no_redis", { key });
    }
    return { acquired: true, degraded: true, release: noopRelease };
  }

  const redisKey = syncLockRedisKey(userId, key);
  const token = crypto.randomUUID();

  let setResult: unknown;
  try {
    setResult = await redis.set(redisKey, token, { nx: true, ex: ttlSeconds });
  } catch (error) {
    void incrementMetric("sync.lock.error", 1);
    logWarn("sync_lock_redis_error", {
      key,
      error: error instanceof Error ? error.message : String(error),
    });
    return { acquired: true, degraded: true, release: noopRelease };
  }

  if (setResult !== "OK") {
    void incrementMetric("sync.lock.contended", 1);
    return { acquired: false, reason: SYNC_IN_PROGRESS };
  }

  const client = redis;
  return {
    acquired: true,
    degraded: false,
    release: async () => {
      try {
        await client.eval<[string], number>(RELEASE_SCRIPT, [redisKey], [token]);
      } catch (error) {
        logWarn("sync_lock_release_failed", {
          key,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  };
}

export async function withSyncLock<T>(
  userId: string,
  key: SyncLockKey,
  fn: () => Promise<T>
): Promise<SyncLockOutcome<T>> {
  const handle = await acquireSyncLock(userId, key);
  if (!handle.acquired) {
    return { skipped: true, reason: handle.reason };
  }
  try {
    const result = await fn();
    return { skipped: false, result };
  } finally {
    await handle.release();
  }
}
