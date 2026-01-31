
const TRACK_ENDPOINT = "/api/analytics/track";

export const ANALYTICS_EVENTS = {
  PAGE_VIEW: "page_view",
  DEAL_CREATED: "deal_created",
  DEAL_EXPORTED: "deal_exported",
  INSIGHTS_OPENED: "insights_opened",
  INTEGRATION_CONNECTED: "integration_connected",
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export type AnalyticsPropertyValue = string | number | boolean;

function isAnalyticsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const v = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED;
  return v !== "false" && v !== "0";
}

function sanitizeProperties(
  properties?: Record<string, unknown>
): Record<string, AnalyticsPropertyValue> | undefined {
  if (!properties || typeof properties !== "object") return undefined;
  const out: Record<string, AnalyticsPropertyValue> = {};
  for (const [k, v] of Object.entries(properties)) {
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export function trackPageView(path: string): void {
  if (!isAnalyticsEnabled() || !path) return;
  try {
    const payload = {
      event: ANALYTICS_EVENTS.PAGE_VIEW,
      properties: { page: path.replace(/\?.*$/, "").replace(/#.*$/, "") },
    };
    void fetch(TRACK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => { });
  } catch {

  }
}

export function trackEvent(
  eventName: string,
  properties?: Record<string, AnalyticsPropertyValue>
): void {
  if (!isAnalyticsEnabled()) return;
  try {
    const sanitized = sanitizeProperties(properties as Record<string, unknown>);
    const payload = { event: eventName, properties: sanitized };
    void fetch(TRACK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => { });
  } catch {

  }
}
