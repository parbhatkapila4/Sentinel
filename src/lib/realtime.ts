
import { redis } from "./redis";
import { logWarn } from "./logger";

const REDIS_KEY_PREFIX = "user:";
const REDIS_KEY_SUFFIX = ":events";
const REDIS_LIST_TTL_SEC = 86400;


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

  const event: RealtimeEvent = {
    type: payload.type,
    payload,
    timestamp: new Date().toISOString(),
  };

  try {
    const key = eventKey(userId);
    await redis.lpush(key, JSON.stringify(event));
    await redis.expire(key, REDIS_LIST_TTL_SEC);
  } catch (err) {
    logWarn("Realtime: failed to publish event", {
      userId,
      type: payload.type,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function consumeUserEvents(userId: string): Promise<RealtimeEvent[]> {
  if (!redis) return [];

  const key = eventKey(userId);
  try {
    const raw = await redis.lrange(key, 0, -1);
    if (raw.length === 0) return [];
    await redis.del(key);
    const events: RealtimeEvent[] = [];
    for (let i = raw.length - 1; i >= 0; i--) {
      try {
        const parsed = JSON.parse(raw[i] as string) as RealtimeEvent;
        if (parsed.type && parsed.payload) events.push(parsed);
      } catch {
      }
    }
    return events;
  } catch {
    return [];
  }
}
