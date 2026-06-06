import { subDays, differenceInDays, isAfter } from "date-fns";
import { formatRiskLevel } from "@/lib/dealRisk";
import {
  DEAL_CHANNELS,
  DEAL_CHANNEL_LABELS,
  STAGE_TO_CHANNEL_FALLBACK,
  normalizeChannel,
  type DealChannel,
} from "@/lib/config";
import type {
  DealForAnalytics,
  PipelineMetrics,
  RevenueGrowth,
  ChartDataPoint,
  RevenueSource,
  RiskDistribution,
  DealActivityMetrics,
} from "@/types";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const REVENUE_SOURCES_ORDER: string[] = DEAL_CHANNELS.map(
  (c) => DEAL_CHANNEL_LABELS[c]
);

function resolveChannelLabel(deal: { stage: string; channel?: string | null }): string {
  const normalized = normalizeChannel(deal.channel);
  if (normalized) return DEAL_CHANNEL_LABELS[normalized];
  const fallback: DealChannel | undefined = STAGE_TO_CHANNEL_FALLBACK[deal.stage];
  if (fallback) return DEAL_CHANNEL_LABELS[fallback];
  return DEAL_CHANNEL_LABELS.direct;
}

export function calculatePipelineMetrics(
  deals: DealForAnalytics[]
): PipelineMetrics {
  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const avgDealValue = totalDeals > 0 ? totalValue / totalDeals : 0;
  return { totalValue, totalDeals, avgDealValue };
}

export function calculateRevenueGrowth(deals: DealForAnalytics[]): RevenueGrowth {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const currentMonthRevenue = deals
    .filter((d) => new Date(d.createdAt) >= currentMonthStart)
    .reduce((sum, d) => sum + d.value, 0);

  const lastMonthRevenue = deals
    .filter((d) => {
      const created = new Date(d.createdAt);
      return created >= lastMonthStart && created < currentMonthStart;
    })
    .reduce((sum, d) => sum + d.value, 0);

  const growthPercent =
    lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

  return {
    currentMonthRevenue,
    lastMonthRevenue,
    growthPercent,
  };
}

export function calculateMonthlyRevenue(
  deals: DealForAnalytics[]
): Record<string, number> {
  return deals.reduce((acc, d) => {
    const date = new Date(d.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = (acc[key] ?? 0) + d.value;
    return acc;
  }, {} as Record<string, number>);
}

export function calculateChartData(deals: DealForAnalytics[]): {
  data: ChartDataPoint[];
  avgGrowthRate: number;
} {
  const monthlyRevenue = calculateMonthlyRevenue(deals);

  const now = new Date();
  const PAST_MONTHS = 2;
  const FUTURE_MONTHS = 3;
  const data: ChartDataPoint[] = [];

  for (let offset = -PAST_MONTHS; offset <= FUTURE_MONTHS; offset++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const priorYearDate = new Date(
      monthDate.getFullYear() - 1,
      monthDate.getMonth(),
      1
    );
    const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
    const priorKey = `${priorYearDate.getFullYear()}-${String(priorYearDate.getMonth() + 1).padStart(2, "0")}`;
    const actual = monthlyRevenue[key] ?? 0;
    data.push({
      month: MONTH_NAMES[monthDate.getMonth()],
      actual,
      prediction: actual > 0 ? actual * 1.05 : 0,
      lastMonth: monthlyRevenue[priorKey] ?? 0,
    });
  }

  const pastAndCurrent = data.slice(0, PAST_MONTHS + 1);
  let avgGrowthRate = 0;
  if (pastAndCurrent.length >= 2) {
    const rates: number[] = [];
    for (let i = 1; i < pastAndCurrent.length; i++) {
      const prev = pastAndCurrent[i - 1].actual;
      const curr = pastAndCurrent[i].actual;
      if (prev > 0) rates.push((curr - prev) / prev);
    }
    if (rates.length > 0) {
      avgGrowthRate = rates.reduce((s, r) => s + r, 0) / rates.length;
    }
  }

  return { data, avgGrowthRate };
}

export function calculateRevenueBySource(
  deals: DealForAnalytics[]
): RevenueSource[] {
  const thirtyDaysAgo = subDays(new Date(), 30);

  const revenueBySource: Record<string, { value: number; previousValue: number }> = {};
  for (const d of deals) {
    const source = resolveChannelLabel(d);
    if (!revenueBySource[source]) {
      revenueBySource[source] = { value: 0, previousValue: 0 };
    }
    revenueBySource[source].value += d.value;
  }

  const previousBySource: Record<string, number> = {};
  for (const d of deals) {
    if (new Date(d.createdAt) < thirtyDaysAgo) {
      const source = resolveChannelLabel(d);
      previousBySource[source] = (previousBySource[source] ?? 0) + d.value;
    }
  }

  return REVENUE_SOURCES_ORDER.map((source) => {
    const current = revenueBySource[source]?.value ?? 0;
    const previous = previousBySource[source] ?? current * 0.8;
    const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    return { source, value: current, change };
  });
}

export function getStageDistribution(
  deals: DealForAnalytics[]
): Record<string, number> {
  return deals.reduce((acc, d) => {
    acc[d.stage] = (acc[d.stage] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export function getValueByStage(
  deals: DealForAnalytics[]
): Record<string, number> {
  return deals.reduce((acc, d) => {
    acc[d.stage] = (acc[d.stage] ?? 0) + d.value;
    return acc;
  }, {} as Record<string, number>);
}

export function calculateRiskDistribution(
  deals: DealForAnalytics[]
): RiskDistribution {
  const low: DealForAnalytics[] = [];
  const medium: DealForAnalytics[] = [];
  const high: DealForAnalytics[] = [];

  for (const d of deals) {
    const level = formatRiskLevel(d.riskScore);
    if (level === "Low") low.push(d);
    else if (level === "Medium") medium.push(d);
    else high.push(d);
  }

  return {
    low: {
      count: low.length,
      value: low.reduce((s, d) => s + d.value, 0),
    },
    medium: {
      count: medium.length,
      value: medium.reduce((s, d) => s + d.value, 0),
    },
    high: {
      count: high.length,
      value: high.reduce((s, d) => s + d.value, 0),
    },
  };
}

export function calculateDealActivity(
  deals: DealForAnalytics[]
): DealActivityMetrics {
  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const thirtyDaysAgo = subDays(now, 30);

  const recentDeals = deals.filter((d) =>
    isAfter(new Date(d.createdAt), sevenDaysAgo)
  );
  const thirtyDayDeals = deals.filter((d) =>
    isAfter(new Date(d.createdAt), thirtyDaysAgo)
  );

  const recentDealsValue = recentDeals.reduce((s, d) => s + d.value, 0);
  const thirtyDayValue = thirtyDayDeals.reduce((s, d) => s + d.value, 0);

  const totalDeals = deals.length;
  const avgDealAge =
    totalDeals > 0
      ? deals.reduce((sum, d) => sum + differenceInDays(now, new Date(d.createdAt)), 0) /
      totalDeals
      : 0;

  const avgDaysSinceActivity =
    totalDeals > 0
      ? deals.reduce(
        (sum, d) =>
          sum +
          differenceInDays(now, new Date(d.lastActivityAt ?? d.createdAt)),
        0
      ) / totalDeals
      : 0;

  return {
    recentDeals,
    thirtyDayDeals,
    recentDealsValue,
    thirtyDayValue,
    avgDealAge,
    avgDaysSinceActivity,
  };
}
