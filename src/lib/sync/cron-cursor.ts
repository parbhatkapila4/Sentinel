import { redis } from "@/lib/redis";
import { logWarn } from "@/lib/logger";

export const CRON_CURSOR_KEY = "cron:sync-integrations:cursor";
export const CRON_CURSOR_TTL_SECONDS = 14 * 24 * 60 * 60;

export const MAX_ITEM_ATTEMPTS = 2;

export const SYNC_PROVIDER_ORDER = [
  "salesforce",
  "hubspot",
  "google_calendar",
  "gmail",
] as const;

export type SyncProvider = (typeof SYNC_PROVIDER_ORDER)[number];

export interface SyncWorkItem {
  provider: SyncProvider;
  userId: string;
  key: string;
}

export interface SyncCursor {
  startedAt: string;
  lastKey: string | null;
  inProgress: { key: string; attempts: number } | null;
  exhausted: string[];
}

export function workKey(provider: SyncProvider, userId: string): string {
  return `${provider}:${userId}`;
}

export function parseWorkKey(
  key: string
): { provider: SyncProvider; userId: string } | null {
  const idx = key.indexOf(":");
  if (idx <= 0) return null;
  const provider = key.slice(0, idx) as SyncProvider;
  if (!SYNC_PROVIDER_ORDER.includes(provider)) return null;
  const userId = key.slice(idx + 1);
  if (!userId) return null;
  return { provider, userId };
}

export function compareWorkKeys(a: string, b: string): number {
  const pa = parseWorkKey(a);
  const pb = parseWorkKey(b);
  const ia = pa ? SYNC_PROVIDER_ORDER.indexOf(pa.provider) : -1;
  const ib = pb ? SYNC_PROVIDER_ORDER.indexOf(pb.provider) : -1;
  if (ia !== ib) return ia - ib;
  const ua = pa?.userId ?? "";
  const ub = pb?.userId ?? "";
  if (ua < ub) return -1;
  if (ua > ub) return 1;
  return 0;
}

export function sortWorkItems(items: SyncWorkItem[]): SyncWorkItem[] {
  return [...items].sort((x, y) => compareWorkKeys(x.key, y.key));
}

export function itemsAfter(
  sortedItems: SyncWorkItem[],
  lastKey: string | null
): SyncWorkItem[] {
  if (!lastKey) return sortedItems;
  return sortedItems.filter((item) => compareWorkKeys(item.key, lastKey) > 0);
}

export function newSyncCursor(nowIso: string): SyncCursor {
  return { startedAt: nowIso, lastKey: null, inProgress: null, exhausted: [] };
}

export function isCursorPersistenceAvailable(): boolean {
  return redis !== null;
}

function isSyncCursor(value: unknown): value is SyncCursor {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.startedAt === "string" &&
    (v.lastKey === null || typeof v.lastKey === "string") &&
    (v.inProgress === null ||
      (typeof v.inProgress === "object" &&
        v.inProgress !== null &&
        typeof (v.inProgress as { key?: unknown }).key === "string" &&
        typeof (v.inProgress as { attempts?: unknown }).attempts === "number")) &&
    Array.isArray(v.exhausted)
  );
}

export async function loadSyncCursor(): Promise<SyncCursor | null> {
  if (!redis) return null;
  try {
    const raw = await redis.get<unknown>(CRON_CURSOR_KEY);
    if (raw == null) return null;
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return isSyncCursor(parsed) ? parsed : null;
  } catch (error) {
    logWarn("cron_cursor_load_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function saveSyncCursor(cursor: SyncCursor): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(CRON_CURSOR_KEY, JSON.stringify(cursor), {
      ex: CRON_CURSOR_TTL_SECONDS,
    });
  } catch (error) {
    logWarn("cron_cursor_save_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function clearSyncCursor(): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(CRON_CURSOR_KEY);
  } catch (error) {
    logWarn("cron_cursor_clear_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
