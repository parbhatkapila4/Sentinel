import { STAGES, normalizeStage, type Stage } from "@/lib/config";
import { formatShortMoney } from "@/lib/format-money";
import { countWord } from "../deals/model";

export type AnalyticsRange = "7d" | "30d" | "90d" | "all";

export const ANALYTICS_RANGES: readonly AnalyticsRange[] = [
  "7d",
  "30d",
  "90d",
  "all",
];

export const RANGE_LABELS: Record<AnalyticsRange, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  all: "All time",
};

export const RANGE_DAYS: Record<AnalyticsRange, number | null> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  all: null,
};

export function parseRange(value: string | undefined): AnalyticsRange {
  return ANALYTICS_RANGES.find((r) => r === value) ?? "all";
}

export function rangeSentence(range: AnalyticsRange): string {
  const days = RANGE_DAYS[range];
  if (days === null) return "Every deal on the book, whenever it was created";
  return `Deals created in the last ${days} days, compared with the ${days} days before`;
}

export function rangeClause(
  deals: number,
  value: number,
  range: AnalyticsRange
): string {
  const days = RANGE_DAYS[range];
  if (deals <= 0) {
    return days === null
      ? "nothing on the book yet."
      : `nothing created in the last ${days} days.`;
  }
  const lead = `${countWord(deals)} ${deals === 1 ? "deal" : "deals"} worth ${formatShortMoney(value)}`;
  return days === null ? `${lead}, all time.` : `${lead} in the last ${days} days.`;
}

export function widerRanges(range: AnalyticsRange): AnalyticsRange[] {
  return ANALYTICS_RANGES.slice(ANALYTICS_RANGES.indexOf(range) + 1);
}

export interface Delta {
  positive: boolean;
  pct: number;
}

export function formatDelta(delta: Delta): string {
  return `${delta.positive ? "+" : "-"}${delta.pct.toFixed(1)}%`;
}

export type RiskIndexTone = "calm" | "watch" | "high";

export function riskIndexTone(score: number): RiskIndexTone {
  if (score >= 0.6) return "high";
  if (score >= 0.35) return "watch";
  return "calm";
}

export function needsActionCaption(
  high: number,
  medium: number,
  low: number
): string {
  const parts = [
    { count: high, label: "high" },
    { count: medium, label: "medium" },
    { count: low, label: "low" },
  ].filter((p) => p.count > 0);
  if (parts.length === 0) return "None pending";
  if (parts.length === 1) return `${parts[0].count} ${parts[0].label} risk`;
  return parts.map((p) => `${p.count} ${p.label}`).join(" · ");
}

export function spreadCaption(count: number, min: number, max: number): string {
  if (count <= 0) return "No deals to average";
  if (count === 1) return "Only one deal in range";
  if (min === max) return `Every deal is ${formatShortMoney(min)}`;
  return `from ${formatShortMoney(min)} to ${formatShortMoney(max)}`;
}

export const MAX_SPREAD_TICKS = 40;

export function spreadTicks(values: number[], maxTicks = MAX_SPREAD_TICKS): number[] {
  const sorted = values.filter((v) => v > 0).sort((a, b) => a - b);
  if (sorted.length === 0) return [];
  const top = sorted[sorted.length - 1];
  const picked =
    sorted.length <= maxTicks
      ? sorted
      : Array.from(
          { length: maxTicks },
          (_, i) => sorted[Math.round((i * (sorted.length - 1)) / (maxTicks - 1))]
        );
  return picked.map((v) => (v / top) * 100);
}

const STAGE_ALIASES: Record<string, Stage> = {
  lead: STAGES.DISCOVER,
  prospect: STAGES.DISCOVER,
  qualified: STAGES.QUALIFY,
};

export function stageKey(stage: string): Stage | null {
  const known = normalizeStage(stage);
  if (known) return known;
  const key = stage.trim().toLowerCase().replace(/\s+/g, "_");
  return STAGE_ALIASES[key] ?? null;
}

export interface StageRow {
  stage: Stage;
  label: string;
  bucket: "open" | "won";
  count: number;
  value: number;
  avgAgeDays: number | null;
}

const STAGE_ROWS: Array<Pick<StageRow, "stage" | "label" | "bucket">> = [
  { stage: STAGES.DISCOVER, label: "Discover", bucket: "open" },
  { stage: STAGES.QUALIFY, label: "Qualify", bucket: "open" },
  { stage: STAGES.PROPOSAL, label: "Proposal", bucket: "open" },
  { stage: STAGES.NEGOTIATION, label: "Negotiate", bucket: "open" },
  { stage: STAGES.CLOSED_WON, label: "Won", bucket: "won" },
];

const DAY_MS = 86_400_000;

export function buildStageRows(
  deals: Array<{ stage: string; value: number; createdAt: number }>,
  nowMs: number
): StageRow[] {
  return STAGE_ROWS.map((def) => {
    const matched = deals.filter((d) => stageKey(d.stage) === def.stage);
    const ages = matched.map((d) =>
      Math.max(0, Math.floor((nowMs - d.createdAt) / DAY_MS))
    );
    return {
      ...def,
      count: matched.length,
      value: matched.reduce((sum, d) => sum + d.value, 0),
      avgAgeDays:
        def.bucket === "open" && ages.length > 0
          ? Math.round(ages.reduce((sum, a) => sum + a, 0) / ages.length)
          : null,
    };
  });
}

export const AGE_WATCH_DAYS = 14;
export const AGE_STALE_DAYS = 30;
export const AGE_SCALE_DAYS = 45;

export interface AgeMeter {
  percent: number;
  tone: "quiet" | "watch" | "stale";
}

export function ageMeter(days: number): AgeMeter {
  const percent =
    days <= 0
      ? 0
      : Math.max(4, Math.min(100, Math.round((days / AGE_SCALE_DAYS) * 100)));
  const tone =
    days >= AGE_STALE_DAYS ? "stale" : days >= AGE_WATCH_DAYS ? "watch" : "quiet";
  return { percent, tone };
}

export interface Axis {
  max: number;
  ticks: number[];
}

const MAX_AXIS_INTERVALS = 4;

export function valueAxis(maxValue: number): Axis {
  if (!Number.isFinite(maxValue) || maxValue <= 0) return { max: 1, ticks: [0] };
  let exponent = Math.floor(Math.log10(maxValue)) - 1;
  for (;;) {
    for (const multiplier of [1, 2, 2.5, 5]) {
      const step = multiplier * 10 ** exponent;
      const intervals = Math.ceil(maxValue / step - 1e-9);
      if (intervals <= MAX_AXIS_INTERVALS) {
        return {
          max: step * intervals,
          ticks: Array.from({ length: intervals + 1 }, (_, i) => i * step),
        };
      }
    }
    exponent += 1;
  }
}

export function axisLabel(value: number): string {
  return value === 0 ? "0" : formatShortMoney(value);
}

export type TierKey = "high" | "medium" | "healthy";

export interface TierRow {
  key: TierKey;
  label: string;
  count: number;
  value: number;
  needAction: number;
}

export function tierShare(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

export interface SecondLookRow {
  id: string;
  name: string;
  stage: string;
  value: number;
  riskScore: number;
  action: string | null;
}

export interface HealthyRow {
  id: string;
  name: string;
  stage: string;
  value: number;
  location: string | null;
}

export const RANKED_LIMIT = 5;

export interface AnalyticsTotals {
  deals: number;
  value: number;
  avgDeal: number;
  minDeal: number;
  maxDeal: number;
  dealValues: number[];
  wonValue: number;
  lostValue: number;
  pipelineDelta: Delta | null;
  avgDealDelta: Delta | null;
  won: number;
  lost: number;
  active: number;
  riskIndex: number;
  flaggedHigh: number;
  needsAction: number;
  actionHigh: number;
  actionMedium: number;
  actionLow: number;
}
