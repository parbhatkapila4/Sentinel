import { subDays } from "date-fns";
import { formatRiskLevel } from "@/lib/dealRisk";
import {
  ANALYTICS_RANGES,
  RANGE_DAYS,
  RANKED_LIMIT,
  buildStageRows,
  stageKey,
  type AnalyticsRange,
  type AnalyticsTotals,
  type Delta,
  type HealthyRow,
  type SecondLookRow,
  type StageRow,
  type TierRow,
} from "./model";

export interface AnalyticsDeal {
  id: string;
  name: string;
  stage: string;
  status: string;
  value: number;
  riskScore: number;
  createdAt: number;
  urgency: string | null;
  action: string | null;
  location: string | null;
}

export interface AnalyticsData {
  rangeCounts: Record<AnalyticsRange, number>;
  totals: AnalyticsTotals;
  stages: StageRow[];
  tiers: TierRow[];
  secondLook: SecondLookRow[];
  highRiskTotal: number;
  healthiest: HealthyRow[];
  lowRiskTotal: number;
}

function inRange(
  deals: AnalyticsDeal[],
  range: AnalyticsRange,
  now: Date
): AnalyticsDeal[] {
  const days = RANGE_DAYS[range];
  if (days === null) return deals;
  const cutoff = subDays(now, days).getTime();
  return deals.filter((d) => d.createdAt >= cutoff);
}

const sumValue = (deals: AnalyticsDeal[]) =>
  deals.reduce((sum, d) => sum + d.value, 0);

const urgent = (deals: AnalyticsDeal[]) =>
  deals.filter((d) => d.urgency === "high").length;

const exactStage = (deal: AnalyticsDeal, stage: string) =>
  deal.stage.toLowerCase().replace(/\s+/g, "_") === stage;

export function deriveAnalytics(
  allDeals: AnalyticsDeal[],
  range: AnalyticsRange,
  nowMs: number
): AnalyticsData {
  const now = new Date(nowMs);
  const deals = inRange(allDeals, range, now);

  const totalValue = sumValue(deals);
  const avgDeal = deals.length > 0 ? totalValue / deals.length : 0;

  const low = deals.filter((d) => formatRiskLevel(d.riskScore) === "Low");
  const medium = deals.filter((d) => formatRiskLevel(d.riskScore) === "Medium");
  const high = deals.filter((d) => formatRiskLevel(d.riskScore) === "High");

  const riskIndex =
    deals.length > 0
      ? deals.reduce((sum, d) => sum + d.riskScore, 0) / deals.length
      : 0;

  let pipelineDelta: Delta | null = null;
  let avgDealDelta: Delta | null = null;
  const periodDays = RANGE_DAYS[range];
  if (periodDays) {
    const priorStart = subDays(now, periodDays * 2).getTime();
    const priorEnd = subDays(now, periodDays).getTime();
    const prior = allDeals.filter(
      (d) => d.createdAt >= priorStart && d.createdAt < priorEnd
    );
    const priorTotal = sumValue(prior);
    const priorAvg = prior.length > 0 ? priorTotal / prior.length : 0;

    if (priorTotal > 0) {
      const change = ((totalValue - priorTotal) / priorTotal) * 100;
      pipelineDelta = { positive: change >= 0, pct: Math.abs(change) };
    }
    if (priorAvg > 0) {
      const change = ((avgDeal - priorAvg) / priorAvg) * 100;
      avgDealDelta = { positive: change >= 0, pct: Math.abs(change) };
    }
  }

  const dealValues = deals.map((d) => d.value);

  return {
    rangeCounts: Object.fromEntries(
      ANALYTICS_RANGES.map((r) => [r, inRange(allDeals, r, now).length])
    ) as Record<AnalyticsRange, number>,
    totals: {
      deals: deals.length,
      value: totalValue,
      avgDeal,
      minDeal: dealValues.length > 0 ? Math.min(...dealValues) : 0,
      maxDeal: dealValues.length > 0 ? Math.max(...dealValues) : 0,
      dealValues,
      wonValue: sumValue(deals.filter((d) => stageKey(d.stage) === "closed_won")),
      lostValue: sumValue(deals.filter((d) => stageKey(d.stage) === "closed_lost")),
      pipelineDelta,
      avgDealDelta,
      won: deals.filter((d) => exactStage(d, "closed_won")).length,
      lost: deals.filter((d) => exactStage(d, "closed_lost")).length,
      active: deals.filter((d) => d.status === "active").length,
      riskIndex,
      flaggedHigh: high.length,
      needsAction: urgent(deals),
      actionHigh: urgent(high),
      actionMedium: urgent(medium),
      actionLow: urgent(low),
    },
    stages: buildStageRows(deals, nowMs),
    tiers: [
      { key: "high", label: "High", count: high.length, value: sumValue(high), needAction: urgent(high) },
      { key: "medium", label: "Medium", count: medium.length, value: sumValue(medium), needAction: urgent(medium) },
      { key: "healthy", label: "Healthy", count: low.length, value: sumValue(low), needAction: urgent(low) },
    ],
    secondLook: [...high]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, RANKED_LIMIT)
      .map((d) => ({
        id: d.id,
        name: d.name,
        stage: d.stage,
        value: d.value,
        riskScore: d.riskScore,
        action: d.action,
      })),
    highRiskTotal: high.length,
    healthiest: [...low]
      .sort((a, b) => b.value - a.value)
      .slice(0, RANKED_LIMIT)
      .map((d) => ({
        id: d.id,
        name: d.name,
        stage: d.stage,
        value: d.value,
        location: d.location,
      })),
    lowRiskTotal: low.length,
  };
}
