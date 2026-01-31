import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/api-rate-limit";
import { redis } from "@/lib/redis";
import { incrementMetric } from "@/lib/business-metrics";

const ANALYTICS_EVENT_TTL = 60 * 60 * 24 * 7; // 7 days
const RATE_LIMIT_ANALYTICS = { limit: 10, window: 60 };

const BUSINESS_METRIC_EVENTS = new Set(["deal_exported", "insights_opened"]);

function isValidEventName(s: unknown): s is string {
  return typeof s === "string" && s.length > 0 && s.length <= 128;
}

function sanitizeProperties(obj: unknown): Record<string, string | number | boolean> | undefined {
  if (obj == null || typeof obj !== "object" || Array.isArray(obj)) return undefined;
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof k !== "string" || k.length > 64) continue;
    if (typeof v === "string" && v.length <= 512) out[k] = v;
    else if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    else if (typeof v === "boolean") out[k] = v;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

async function trackHandler(request: NextRequest): Promise<NextResponse> {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new NextResponse(null, { status: 400 });
    }
    if (body == null || typeof body !== "object") {
      return new NextResponse(null, { status: 400 });
    }
    const { event, properties } = body as { event?: unknown; properties?: unknown };
    if (!isValidEventName(event)) {
      return new NextResponse(null, { status: 400 });
    }
    sanitizeProperties(properties);

    if (redis) {
      const key = `analytics:event:${event}`;
      await redis.incr(key);
      await redis.expire(key, ANALYTICS_EVENT_TTL);
    }
    if (BUSINESS_METRIC_EVENTS.has(event)) {
      void incrementMetric(event);
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}

export const POST = withRateLimit(trackHandler, {
  config: RATE_LIMIT_ANALYTICS,
  perUser: false,
  perIP: true,
});
