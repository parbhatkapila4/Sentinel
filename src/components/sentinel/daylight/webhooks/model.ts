import type { getMyWebhooks, getWebhookById } from "@/app/actions/webhooks";
import { eventLabel } from "./events";

export type WebhookListItem = Awaited<ReturnType<typeof getMyWebhooks>>[number];
export type WebhookDetail = NonNullable<Awaited<ReturnType<typeof getWebhookById>>>;
export type WebhookDelivery = WebhookDetail["deliveries"][number];

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function countLabel(n: number, one: string, many: string): string {
  return `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;
}

export function webhookHost(url: string): string {
  try {
    return new URL(url).hostname || url;
  } catch {
    return url;
  }
}

export function listChip(count: number): string {
  return count === 0 ? "No webhooks yet" : countLabel(count, "webhook", "webhooks");
}

export function detailClause(webhook: Pick<WebhookDetail, "events" | "_count">): string {
  return `${countLabel(webhook.events.length, "event", "events")}, ${countLabel(
    webhook._count.deliveries,
    "delivery",
    "deliveries"
  )}.`;
}

export function deliveryLabel(d: Pick<WebhookDelivery, "event" | "isTest">): string {
  return d.isTest ? "Test delivery" : eventLabel(d.event);
}

export function deliveryResponse(
  d: Pick<WebhookDelivery, "response" | "success" | "statusCode">
): string {
  const text = (d.response ?? "").replace(/\s+/g, " ").trim();
  if (text) return text;
  if (d.success) return "OK";
  return d.statusCode === null ? "No response" : "Empty response";
}

export function deliveryWhen(at: Date | string, nowMs: number): string {
  const elapsed = Math.max(0, nowMs - new Date(at).getTime());
  if (elapsed < MINUTE) return "Just now";
  if (elapsed < HOUR) {
    const m = Math.floor(elapsed / MINUTE);
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }
  if (elapsed < DAY) {
    const h = Math.floor(elapsed / HOUR);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  const days = Math.floor(elapsed / DAY);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
