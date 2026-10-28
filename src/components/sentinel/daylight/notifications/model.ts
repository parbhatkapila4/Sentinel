import { differenceInCalendarDays, format, isSameYear } from "date-fns";
import type { HeroChip } from "../blocks";

export interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string;
  dealId: string | null;
  teamId: string | null;
  read: boolean;
  emailSent: boolean;
  createdAt: string;
}

export type NotificationFilter = "all" | "unread";

export const NOTIFICATIONS_DECK =
  "Every deal slip, stage move and overdue step lands here, dated. Clear what you can, act on what you must.";

export type NotificationCategory =
  | "RISK"
  | "ACTION"
  | "STAGE"
  | "TEAM"
  | "MENTION"
  | "SYSTEM";

const CATEGORY_ORDER: NotificationCategory[] = [
  "RISK",
  "ACTION",
  "STAGE",
  "TEAM",
  "MENTION",
  "SYSTEM",
];

export const CATEGORY_LABEL: Record<NotificationCategory, string> = {
  RISK: "At risk",
  ACTION: "Action",
  STAGE: "Stage move",
  TEAM: "Team",
  MENTION: "Mention",
  SYSTEM: "Note",
};

const CATEGORY_NOUN: Record<NotificationCategory, { one: string; many: string }> = {
  RISK: { one: "a risk flag", many: "risk flags" },
  ACTION: { one: "an overdue action", many: "overdue actions" },
  STAGE: { one: "a stage move", many: "stage moves" },
  TEAM: { one: "a team update", many: "team updates" },
  MENTION: { one: "a mention", many: "mentions" },
  SYSTEM: { one: "a note", many: "notes" },
};

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

const STAGE_NAMES: Record<string, string> = {
  discover: "Discover",
  discovery: "Discovery",
  qualify: "Qualify",
  qualification: "Qualification",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed won",
  closed_lost: "Closed lost",
};

function stageName(raw: string): string {
  const key = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (STAGE_NAMES[key]) return STAGE_NAMES[key];
  const words = raw.trim().replace(/_/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const STAGE_MOVE = /^moved from (.+?) to (.+?)\.?$/i;

function stageMoveTarget(message: string): string | null {
  const match = STAGE_MOVE.exec(message.trim());
  return match ? match[2] : null;
}

export function categoryColor(n: Pick<NotificationRow, "type" | "message">): string {
  const category = categorize(n.type);
  if (category === "RISK") return "var(--dl-signal)";
  if (category === "ACTION") return "var(--dl-amber)";
  if (category === "STAGE") {
    const target = stageMoveTarget(n.message);
    const key = target?.trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (key === "closed_won") return "var(--dl-green)";
    if (key === "closed_lost") return "var(--dl-seg)";
    return "var(--dl-ink)";
  }
  if (category === "SYSTEM") return "var(--dl-seg)";
  return "var(--dl-ink)";
}

const TITLE_PREFIXES: Array<[RegExp, string]> = [
  [/^deal at risk:\s*/i, "Deal at risk: "],
  [/^action overdue:\s*/i, "Action overdue: "],
  [/^deal stage changed:\s*/i, "Stage changed: "],
  [/^stage changed:\s*/i, "Stage changed: "],
];

export function displayTitle(title: string): string {
  const clean = title.trim();
  for (const [pattern, replacement] of TITLE_PREFIXES) {
    if (pattern.test(clean)) return clean.replace(pattern, replacement);
  }
  return clean;
}

export function subjectOf(title: string): string | null {
  const at = title.indexOf(":");
  if (at < 0) return null;
  const subject = title.slice(at + 1).trim();
  return subject || null;
}

export function displayMessage(message: string): string {
  const clean = message.trim();
  if (!clean) return "";
  const move = STAGE_MOVE.exec(clean);
  const text = move
    ? `Moved from ${stageName(move[1])} to ${stageName(move[2])}`
    : clean;
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function dayDiff(iso: string, now: Date): number | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return differenceInCalendarDays(now, date);
}

export function timeLabel(iso: string, now: Date): string {
  const days = dayDiff(iso, now);
  if (days === null) return "";
  const date = new Date(iso);
  if (days <= 0) return format(date, "HH:mm");
  if (days === 1) return "Yesterday";
  if (days < 31) return `${days} days ago`;
  return isSameYear(date, now) ? format(date, "MMM d") : format(date, "MMM d, yyyy");
}

export function groupLabel(iso: string, now: Date): string {
  const days = dayDiff(iso, now);
  if (days === null) return "Undated";
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days <= 6) return `${days} days ago`;
  if (days <= 13) return "Last week";
  if (days <= 29) return `${Math.floor(days / 7)} weeks ago`;
  if (days <= 89) {
    const months = Math.max(1, Math.floor(days / 30));
    return months === 1 ? "Last month" : `${months} months ago`;
  }
  return "Older";
}

export interface NotificationGroup {
  label: string;
  items: NotificationRow[];
}

export function groupRows(items: NotificationRow[], now: Date): NotificationGroup[] {
  const groups: NotificationGroup[] = [];
  const byLabel = new Map<string, NotificationGroup>();
  for (const n of items) {
    const label = groupLabel(n.createdAt, now);
    let group = byLabel.get(label);
    if (!group) {
      group = { label, items: [] };
      byLabel.set(label, group);
      groups.push(group);
    }
    group.items.push(n);
  }
  return groups;
}

export function matchesSearch(n: NotificationRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    n.title.toLowerCase().includes(q) ||
    n.message.toLowerCase().includes(q) ||
    displayTitle(n.title).toLowerCase().includes(q) ||
    displayMessage(n.message).toLowerCase().includes(q)
  );
}

export function visibleRows(
  items: NotificationRow[],
  filter: NotificationFilter,
  query: string
): NotificationRow[] {
  return items.filter(
    (n) => (filter === "unread" ? !n.read : true) && matchesSearch(n, query)
  );
}

export function isCreatedToday(iso: string, now: Date): boolean {
  return dayDiff(iso, now) === 0;
}

function joinList(parts: string[]): string {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

export interface NotificationsHeroCopy {
  chip: HeroChip;
  headline: string;
  emphasis: string;
  clause: string;
}

export function heroCopy(unread: number, items: NotificationRow[]): NotificationsHeroCopy {
  if (unread <= 0) {
    return {
      chip: { label: "All caught up", tone: "good" },
      headline: "The book is",
      emphasis: "clean.",
      clause: "nothing is waiting on you.",
    };
  }

  const pending = items.filter((n) => !n.read);
  const kinds = CATEGORY_ORDER.filter((c) =>
    pending.some((n) => categorize(n.type) === c)
  );
  let clause: string;
  if (kinds.length === 0) {
    clause = "further down the list.";
  } else if (unread === 1) {
    clause = `${CATEGORY_NOUN[kinds[0]].one}.`;
  } else {
    clause = `${joinList(kinds.map((k) => CATEGORY_NOUN[k].many))}.`;
  }

  const count = unread.toLocaleString("en-US");
  return {
    chip: { label: `${count} unread`, tone: "alert" },
    headline: `${unread === 1 ? "One" : count} pending`,
    emphasis: unread === 1 ? "item." : "items.",
    clause,
  };
}
