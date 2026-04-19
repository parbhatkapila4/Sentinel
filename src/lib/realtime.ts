
import { redis } from "./redis";
import { logWarn } from "./logger";

const REDIS_KEY_PREFIX = "user:";
const REDIS_KEY_SUFFIX = ":events";
const REDIS_SEQ_SUFFIX = ":events:seq";
const REDIS_LIST_TTL_SEC = 86400;
const MAX_EVENTS_PER_USER = 2000;


export type RealtimeEventType =
  | "notification.new"
  | "deal.updated"
  | "deal.created"
  | "deal.deleted"
  | "deal.at_risk"
  | "team.updated";

export type RealtimeEventPayload =
  | { type: "notification.new"; notificationId: string }
  | { type: "deal.updated"; dealId: string; stage?: string }
  | { type: "deal.created"; dealId: string }
  | { type: "deal.deleted"; dealId: string }
  | { type: "deal.at_risk"; dealId: string }
  | { type: "team.updated"; teamId: string };

export interface RealtimeEvent {
  id: number;
  type: RealtimeEventType;
  payload: RealtimeEventPayload;
  timestamp: string;
}

function eventKey(userId: string): string {
  return `${REDIS_KEY_PREFIX}${userId}${REDIS_KEY_SUFFIX}`;
}

export async function notifyRealtimeEvent(
  userId: string,
  payload: RealtimeEventPayload
): Promise<void> {
  if (!redis) return;

  try {
    const key = eventKey(userId);
    const seqKey = `${REDIS_KEY_PREFIX}${userId}${REDIS_SEQ_SUFFIX}`;
    const id = await redis.incr(seqKey);
    const event: RealtimeEvent = {
      id: Number(id),
      type: payload.type,
      payload,
      timestamp: new Date().toISOString(),
    };
    await redis.lpush(key, JSON.stringify(event));
    await redis.ltrim(key, 0, MAX_EVENTS_PER_USER - 1);
    await redis.expire(key, REDIS_LIST_TTL_SEC);
    await redis.expire(seqKey, REDIS_LIST_TTL_SEC);
  } catch (err) {
    logWarn("Realtime: failed to publish event", {
      userId,
      type: payload.type,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function consumeUserEvents(userId: string): Promise<RealtimeEvent[]> {
  return consumeUserEventsSince(userId, 0);
}

export async function consumeUserEventsSince(
  userId: string,
  afterEventId: number
): Promise<RealtimeEvent[]> {
  if (!redis) return [];

  const key = eventKey(userId);
  try {
    const raw = await redis.lrange(key, 0, -1);
    if (raw.length === 0) return [];
    const dedupedById = new Map<number, RealtimeEvent>();
    for (let i = raw.length - 1; i >= 0; i--) {
      try {
        const parsed = JSON.parse(raw[i] as string) as RealtimeEvent;
        if (
          typeof parsed.id === "number" &&
          parsed.id > afterEventId &&
          parsed.type &&
          parsed.payload
        ) {
          dedupedById.set(parsed.id, parsed);
        }
      } catch {
      }
    }
    return [...dedupedById.values()].sort((a, b) => a.id - b.id);
  } catch {
    return [];
  }
}
