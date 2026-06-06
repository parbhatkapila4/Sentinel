import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import type { NotificationCategory, NotificationRow } from "./types";

export function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  if (isToday(d)) return format(d, "HH:mm").toUpperCase();
  if (isYesterday(d)) return "YESTERDAY";
  return formatDistanceToNow(d, { addSuffix: true }).toUpperCase();
}

export function groupByRelativeDate(items: NotificationRow[], now: Date) {
  const groups: { label: string; items: NotificationRow[] }[] = [];
  const byLabel = new Map<string, NotificationRow[]>();
  for (const n of items) {
    const label = relativeDateLabel(new Date(n.createdAt), now);
    if (!byLabel.has(label)) byLabel.set(label, []);
    byLabel.get(label)!.push(n);
  }
  for (const [label, items] of byLabel) {
    groups.push({ label, items });
  }
  return groups;
}

function relativeDateLabel(d: Date, now: Date): string {
  if (Number.isNaN(d.getTime())) return "UNDATED";
  if (isToday(d)) return "TODAY";
  if (isYesterday(d)) return "YESTERDAY";
  const days = Math.round(
    (startOfDay(now).getTime() - startOfDay(d).getTime()) / 86_400_000
  );
  if (days <= 6) return `${days} DAYS AGO`;
  if (days <= 13) return "LAST WEEK";
  if (days <= 30) return "EARLIER THIS MONTH";
  if (days <= 90) return "A FEW MONTHS AGO";
  return "ARCHIVED";
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function categorize(type: string): NotificationCategory {
  const t = (type || "").toLowerCase();
  if (t === "deal_at_risk" || t.includes("risk")) return "RISK";
  if (t === "action_overdue" || t.includes("action") || t.includes("overdue"))
    return "ACTION";
  if (t === "stage_changed" || t.includes("stage")) return "STAGE";
  if (t === "team_invite" || t.includes("team") || t.includes("invite"))
    return "TEAM";
  if (t === "mention" || t.includes("mention")) return "MENTION";
  return "SYSTEM";
}
