import {
  calculateWinProbability,
  forecastPipelineValue,
  type DealForPrediction,
} from "@/lib/predictions";
import type { Stage } from "@/lib/config";
import {
  BOOK_STAGE_LABEL,
  OPEN_STAGES,
  bookStage,
  daysSince,
  dealTier,
  isOpen,
  movesOnPct,
  sumValue,
  type BookDeal,
} from "../book";
import type { TierKey } from "../blocks";
import { closedKind, stageLabel } from "../deals/model";
import { niceCeil } from "../format";

export const BEST_CASE_POINTS = 20;
export const WORST_CASE_POINTS = 25;
export const SCALE_STEPS = 5;

export interface ForecastDeal {
  id: string;
  name: string;
  value: number;
  chance: number;
  weighted: number;
  tier: TierKey;
  idleDays: number;
  action: string | null;
  overdueDays: number | null;
}

export interface ForecastStage {
  key: string;
  label: string;
  stage: string;
  count: number;
  value: number;
  weighted: number;
  avgChance: number | null;
  avgAgeDays: number | null;
  avgIdleDays: number | null;
  movesOnPct: number | null;
  deals: ForecastDeal[];
}

export interface ForecastTotals {
  count: number;
  value: number;
  weighted: number;
  avgChance: number | null;
  avgAgeDays: number | null;
  avgIdleDays: number | null;
}

export interface ForecastData {
  dealCount: number;
  openCount: number;
  openValue: number;
  tierValue: Record<"high" | "medium" | "low", number>;
  expected: number;
  best: number;
  worst: number;
  baseRatePct: number;
  won: number;
  lost: number;
  stages: ForecastStage[];
  totals: ForecastTotals;
  scaleMax: number;
}

function toPrediction(d: BookDeal): DealForPrediction {
  return {
    id: d.id,
    name: d.name,
    stage: d.stage,
    value: d.value,
    createdAt: new Date(d.createdAt),
    lastActivityAt: new Date(d.lastActivityAt),
    riskScore: d.riskScore,
    status: d.status,
  };
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function deriveForecast(deals: BookDeal[], nowMs: number): ForecastData {
  const predictions = deals.map(toPrediction);
  const won = deals.filter((d) => closedKind(d.stage) === "won").length;
  const lost = deals.filter((d) => closedKind(d.stage) === "lost").length;
  const baseRatePct = won + lost > 0 ? (won / (won + lost)) * 100 : 50;

  const open = deals
    .map((d, i) => ({ d, i }))
    .filter(({ d }) => isOpen(d))
    .map(({ d, i }) => {
      const chance = calculateWinProbability(predictions[i], predictions).probability;
      return {
        deal: d,
        row: {
          id: d.id,
          name: d.name,
          value: d.value,
          chance,
          weighted: (d.value * chance) / 100,
          tier: dealTier(d),
          idleDays: daysSince(d.lastActivityAt, nowMs),
          action: d.action,
          overdueDays: d.overdueDays,
        } satisfies ForecastDeal,
      };
    });

  const forecast = forecastPipelineValue(predictions);

  const groups = new Map<string, { label: string; stage: string; items: typeof open }>();
  for (const stage of OPEN_STAGES) {
    groups.set(stage, { label: BOOK_STAGE_LABEL[stage], stage, items: [] });
  }
  for (const item of open) {
    const known = bookStage(item.deal.stage);
    const key = known ?? item.deal.stage.trim().toLowerCase();
    if (!groups.has(key)) {
      groups.set(key, { label: stageLabel(item.deal.stage), stage: item.deal.stage, items: [] });
    }
    groups.get(key)!.items.push(item);
  }

  const stages: ForecastStage[] = [...groups.entries()].map(([key, group]) => {
    const rows = group.items
      .map((item) => item.row)
      .sort((a, b) => b.value - a.value);
    const known = (OPEN_STAGES as readonly string[]).includes(key) ? (key as Stage) : null;
    return {
      key,
      label: group.label,
      stage: group.stage,
      count: rows.length,
      value: sumValue(rows),
      weighted: rows.reduce((sum, r) => sum + r.weighted, 0),
      avgChance: mean(rows.map((r) => r.chance)),
      avgAgeDays: mean(group.items.map((item) => daysSince(item.deal.createdAt, nowMs))),
      avgIdleDays: mean(rows.map((r) => r.idleDays)),
      movesOnPct: known ? movesOnPct(deals, known) : null,
      deals: rows,
    };
  });

  const rows = open.map((item) => item.row);
  const tierValue = { high: 0, medium: 0, low: 0 };
  for (const row of rows) {
    if (row.tier === "high" || row.tier === "medium" || row.tier === "low") {
      tierValue[row.tier] += row.value;
    }
  }
  const openValue = sumValue(rows);

  return {
    dealCount: deals.length,
    openCount: rows.length,
    openValue,
    tierValue,
    expected: forecast.expected,
    best: forecast.bestCase,
    worst: forecast.worstCase,
    baseRatePct,
    won,
    lost,
    stages,
    totals: {
      count: rows.length,
      value: openValue,
      weighted: rows.reduce((sum, r) => sum + r.weighted, 0),
      avgChance: mean(rows.map((r) => r.chance)),
      avgAgeDays: mean(open.map((item) => daysSince(item.deal.createdAt, nowMs))),
      avgIdleDays: mean(rows.map((r) => r.idleDays)),
    },
    scaleMax: niceCeil(Math.max(openValue, forecast.bestCase, 1)),
  };
}

export function scaleTicks(max: number): number[] {
  return Array.from({ length: SCALE_STEPS + 1 }, (_, i) => (max * i) / SCALE_STEPS);
}

export function idleText(days: number): string {
  if (days === 0) return "active today";
  return `idle ${days} day${days === 1 ? "" : "s"}`;
}

export function averageDays(days: number | null, digits = 0): string {
  if (days === null) return "-";
  const text = days.toFixed(digits);
  return `${text} day${text === "1" || text === "1.0" ? "" : "s"}`;
}
