import { INACTIVITY_DAYS } from "@/lib/config";
import { formatRiskLevel } from "@/lib/dealRisk";
import { formatShortMoney } from "@/lib/format-money";

export type DealsFilter = "all" | "active" | "at-risk" | "closed";
export type DealsScope = "my" | "all";

export const DEALS_FILTERS: readonly DealsFilter[] = [
  "all",
  "active",
  "at-risk",
  "closed",
];

export const FILTER_LABELS: Record<DealsFilter, string> = {
  all: "All",
  active: "Active",
  "at-risk": "At risk",
  closed: "Closed",
};

export interface DealRow {
  id: string;
  name: string;
  value: number;
  stage: string;
  status: string;
  riskScore: number;
  riskReason: string | null;
  location: string | null;
  owner: string | null;
  action: string | null;
  actionDueAt: number | null;
  overdueDays: number | null;
  lastActivityAt: number;
  isDemo: boolean;
}

export type RiskKey = "high" | "medium" | "healthy" | "closed";

export interface RiskTone {
  key: RiskKey;
  label: string;
  color: string;
}

const RISK_TONES: Record<RiskKey, RiskTone> = {
  high: { key: "high", label: "High", color: "var(--dl-signal)" },
  medium: { key: "medium", label: "Medium", color: "var(--dl-amber)" },
  healthy: { key: "healthy", label: "Healthy", color: "var(--dl-green)" },
  closed: { key: "closed", label: "Closed", color: "var(--dl-context)" },
};

export function riskTone(riskScore: number, status?: string): RiskTone {
  if (status === "closed") return RISK_TONES.closed;
  const level = formatRiskLevel(riskScore);
  if (level === "High") return RISK_TONES.high;
  if (level === "Medium") return RISK_TONES.medium;
  return RISK_TONES.healthy;
}

export function closedKind(stage: string): "won" | "lost" | null {
  const key = stage.toLowerCase().trim().replace(/\s+/g, "_");
  if (key === "closed_won" || key === "won") return "won";
  if (key === "closed_lost" || key === "lost") return "lost";
  return null;
}

export function stageLabel(stage: string): string {
  const text = stage.replace(/_+/g, " ").trim();
  if (!text) return "No stage";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const DAY_MS = 86_400_000;

export function relativeAge(thenMs: number, nowMs: number): string {
  const minutes = Math.floor(Math.max(0, nowMs - thenMs) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (days < 365) {
    const months = Math.min(11, Math.floor(days / 30));
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export interface DueHint {
  text: string;
  tone: "overdue" | "today" | "upcoming";
}

export function dueHint(
  actionDueAt: number | null,
  overdueDays: number | null,
  nowMs: number
): DueHint | null {
  if (overdueDays !== null && overdueDays > 0) {
    return {
      text: `Overdue by ${overdueDays} day${overdueDays === 1 ? "" : "s"}`,
      tone: "overdue",
    };
  }
  if (actionDueAt === null) return null;
  const left = actionDueAt - nowMs;
  if (left < DAY_MS) return { text: "Due today", tone: "today" };
  const days = Math.floor(left / DAY_MS);
  if (days === 1) return { text: "Due tomorrow", tone: "upcoming" };
  return { text: `Due in ${days} days`, tone: "upcoming" };
}

export const IDLE_SCALE_DAYS = 30;

export interface IdleMeter {
  days: number;
  percent: number;
  tone: "quiet" | "watch" | "stale";
}

export function idleMeter(lastActivityAt: number, nowMs: number): IdleMeter {
  const days = Math.max(0, Math.floor((nowMs - lastActivityAt) / DAY_MS));
  const percent =
    days === 0
      ? 0
      : Math.max(4, Math.min(100, Math.round((days / IDLE_SCALE_DAYS) * 100)));
  const tone =
    days >= INACTIVITY_DAYS * 2
      ? "stale"
      : days >= INACTIVITY_DAYS
        ? "watch"
        : "quiet";
  return { days, percent, tone };
}

const COUNT_WORDS = [
  "none",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];

export function countWord(n: number): string {
  if (Number.isInteger(n) && n >= 0 && n < COUNT_WORDS.length) {
    return COUNT_WORDS[n];
  }
  return n.toLocaleString("en-US");
}

export function bookClause(total: number, atRisk: number): string {
  if (total <= 0) return "nothing on it yet.";
  return `${countWord(total)} on it, ${countWord(atRisk)} slipping.`;
}

export interface AttentionChip {
  label: string;
  tone: "alert" | "steady" | "start";
}

export function attentionChip(total: number, atRisk: number): AttentionChip {
  if (total <= 0) return { label: "Getting started", tone: "start" };
  if (atRisk > 0) {
    return {
      label: `${atRisk.toLocaleString("en-US")} need${atRisk === 1 ? "s" : ""} attention`,
      tone: "alert",
    };
  }
  return { label: "All steady", tone: "steady" };
}

export type SegmentKey = "high" | "medium" | "healthy" | "won" | "lost";

export interface StageSegment {
  key: SegmentKey;
  value: number;
  title: string;
}

export interface StageCell {
  stage: string;
  label: string;
  bucket: StageBucket;
  count: number;
  value: number;
  segments: StageSegment[];
}

export const MAX_STAGE_SEGMENTS = 12;

const SEGMENT_ORDER: SegmentKey[] = ["high", "medium", "healthy", "won", "lost"];

const SEGMENT_NOUN: Record<SegmentKey, string> = {
  high: "high risk",
  medium: "medium risk",
  healthy: "healthy",
  won: "won",
  lost: "lost",
};

export type StageBucket = "open" | "won" | "lost";

function segmentKey(
  deal: { riskScore: number; status: string },
  bucket: StageBucket
): SegmentKey {
  if (bucket !== "open") return bucket;
  const tone = riskTone(deal.riskScore, deal.status).key;
  return tone === "closed" ? "healthy" : tone;
}

export function stageSegments(
  deals: Array<{
    name: string;
    value: number;
    riskScore: number;
    status: string;
  }>,
  bucket: StageBucket = "open"
): StageSegment[] {
  const sized = deals
    .filter((d) => d.value > 0)
    .map((d) => ({ deal: d, key: segmentKey(d, bucket) }))
    .sort(
      (a, b) =>
        SEGMENT_ORDER.indexOf(a.key) - SEGMENT_ORDER.indexOf(b.key) ||
        b.deal.value - a.deal.value
    );

  if (sized.length <= MAX_STAGE_SEGMENTS) {
    return sized.map(({ deal, key }) => ({
      key,
      value: deal.value,
      title: `${deal.name} · ${formatShortMoney(deal.value)} · ${SEGMENT_NOUN[key]}`,
    }));
  }

  return SEGMENT_ORDER.flatMap((key) => {
    const group = sized.filter((s) => s.key === key);
    if (group.length === 0) return [];
    const value = group.reduce((sum, s) => sum + s.deal.value, 0);
    return [
      {
        key,
        value,
        title: `${group.length} ${SEGMENT_NOUN[key]} deal${group.length === 1 ? "" : "s"} · ${formatShortMoney(value)}`,
      },
    ];
  });
}

export function describeSegments(segments: StageSegment[]): string {
  if (segments.length === 0) return "No deals";
  return segments.map((s) => s.title).join("; ");
}
