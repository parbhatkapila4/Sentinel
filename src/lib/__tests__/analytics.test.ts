import { describe, it, expect } from "vitest";
import { subDays } from "date-fns";
import {
  calculatePipelineMetrics,
  calculateRevenueGrowth,
  calculateMonthlyRevenue,
  calculateChartData,
  calculateRevenueBySource,
  getStageDistribution,
  getValueByStage,
  calculateRiskDistribution,
  calculateDealActivity,
} from "@/lib/analytics";
import type { DealForAnalytics } from "@/types";

function createDeal(
  overrides: Partial<DealForAnalytics> & { value: number; createdAt: Date }
): DealForAnalytics {
  return {
    id: "deal-1",
    stage: "discover",
    riskScore: 0.2,
    ...overrides,
  };
}

describe("calculatePipelineMetrics", () => {
  it("returns zeros for empty array", () => {
    const r = calculatePipelineMetrics([]);
    expect(r.totalValue).toBe(0);
    expect(r.totalDeals).toBe(0);
    expect(r.avgDealValue).toBe(0);
  });

  it("single deal", () => {
    const deals = [createDeal({ value: 5000, createdAt: new Date() })];
    const r = calculatePipelineMetrics(deals);
    expect(r.totalValue).toBe(5000);
    expect(r.totalDeals).toBe(1);
    expect(r.avgDealValue).toBe(5000);
  });

  it("multiple deals", () => {
    const deals = [
      createDeal({ id: "a", value: 1000, createdAt: new Date() }),
      createDeal({ id: "b", value: 2000, createdAt: new Date() }),
      createDeal({ id: "c", value: 3000, createdAt: new Date() }),
    ];
    const r = calculatePipelineMetrics(deals);
    expect(r.totalValue).toBe(6000);
    expect(r.totalDeals).toBe(3);
    expect(r.avgDealValue).toBe(2000);
  });
});

describe("calculateRevenueGrowth", () => {
  it("empty array", () => {
    const r = calculateRevenueGrowth([]);
    expect(r.currentMonthRevenue).toBe(0);
    expect(r.lastMonthRevenue).toBe(0);
    expect(r.growthPercent).toBe(0);
  });

  it("deals only in current month", () => {
    const now = new Date();
    const deals = [
      createDeal({ value: 1000, createdAt: now }),
      createDeal({ value: 2000, createdAt: now }),
    ];
    const r = calculateRevenueGrowth(deals);
    expect(r.currentMonthRevenue).toBe(3000);
    expect(r.lastMonthRevenue).toBe(0);
    expect(r.growthPercent).toBe(0);
  });

  it("deals in current and last month", () => {
    const now = new Date();
    const lastMonth = subDays(now, 35);
    const deals = [
      createDeal({ value: 3000, createdAt: now }),
      createDeal({ value: 1000, createdAt: lastMonth }),
      createDeal({ value: 1000, createdAt: lastMonth }),
    ];
    const r = calculateRevenueGrowth(deals);
    expect(r.currentMonthRevenue).toBe(3000);
    expect(r.lastMonthRevenue).toBe(2000);
    expect(r.growthPercent).toBe(50);
  });
});

describe("calculateMonthlyRevenue", () => {
  it("empty array", () => {
    expect(calculateMonthlyRevenue([])).toEqual({});
  });

  it("groups by YYYY-MM", () => {
    const d = new Date();
    const deals = [
      createDeal({ value: 100, createdAt: d }),
      createDeal({ value: 200, createdAt: d }),
      createDeal({ value: 300, createdAt: subDays(d, 40) }),
    ];
    const r = calculateMonthlyRevenue(deals);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    expect(r[key]).toBe(300);
    expect(Object.keys(r).length).toBe(2);
  });

  it("single deal", () => {
    const d = new Date();
    const r = calculateMonthlyRevenue([
      createDeal({ value: 500, createdAt: d }),
    ]);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    expect(r[key]).toBe(500);
  });
});

describe("calculateChartData", () => {
  it("returns 6 data points", () => {
    const { data } = calculateChartData([]);
    expect(data).toHaveLength(6);
    expect(data.every((p) => "month" in p && "actual" in p && "prediction" in p)).toBe(true);
  });

  it("includes avgGrowthRate", () => {
    const { avgGrowthRate } = calculateChartData([]);
    expect(typeof avgGrowthRate).toBe("number");
  });

  it("actual and prediction when deals exist", () => {
    const d = new Date();
    const deals = [createDeal({ value: 1000, createdAt: d })];
    const { data } = calculateChartData(deals);
    expect(data.length).toBe(6);
    expect(data.every((p) => typeof p.actual === "number")).toBe(true);
    expect(data.every((p) => typeof p.prediction === "number")).toBe(true);
  });
});

describe("calculateRevenueBySource", () => {
  it("returns all ordered sources", () => {
    const r = calculateRevenueBySource([]);
    expect(r).toHaveLength(5);
    expect(r.map((s) => s.source)).toEqual([
      "Direct",
      "Organic",
      "Paid Ads",
      "Referrals",
      "Partnerships",
    ]);
  });

  it("maps stage to source and sums value", () => {
    const d = new Date();
    const deals = [
      createDeal({ stage: "discover", value: 1000, createdAt: d }),
      createDeal({ stage: "discover", value: 500, createdAt: d }),
      createDeal({ stage: "qualify", value: 2000, createdAt: d }),
    ];
    const r = calculateRevenueBySource(deals);
    const direct = r.find((s) => s.source === "Direct");
    const organic = r.find((s) => s.source === "Organic");
    expect(direct?.value).toBe(1500);
    expect(organic?.value).toBe(2000);
  });
});

describe("getStageDistribution", () => {
  it("empty array", () => {
    expect(getStageDistribution([])).toEqual({});
  });

  it("counts per stage", () => {
    const d = new Date();
    const deals = [
      createDeal({ id: "a", stage: "discover", value: 1, createdAt: d }),
      createDeal({ id: "b", stage: "discover", value: 1, createdAt: d }),
      createDeal({ id: "c", stage: "qualify", value: 1, createdAt: d }),
    ];
    const r = getStageDistribution(deals);
    expect(r.discover).toBe(2);
    expect(r.qualify).toBe(1);
  });
});

describe("getValueByStage", () => {
  it("empty array", () => {
    expect(getValueByStage([])).toEqual({});
  });

  it("sums value per stage", () => {
    const d = new Date();
    const deals = [
      createDeal({ id: "a", stage: "discover", value: 100, createdAt: d }),
      createDeal({ id: "b", stage: "discover", value: 200, createdAt: d }),
      createDeal({ id: "c", stage: "qualify", value: 500, createdAt: d }),
    ];
    const r = getValueByStage(deals);
    expect(r.discover).toBe(300);
    expect(r.qualify).toBe(500);
  });
});

describe("calculateRiskDistribution", () => {
  it("empty array", () => {
    const r = calculateRiskDistribution([]);
    expect(r.low).toEqual({ count: 0, value: 0 });
    expect(r.medium).toEqual({ count: 0, value: 0 });
    expect(r.high).toEqual({ count: 0, value: 0 });
  });

  it("Low < 0.4, Medium < 0.6, High >= 0.6", () => {
    const d = new Date();
    const deals = [
      createDeal({ id: "a", riskScore: 0.2, value: 100, createdAt: d }),
      createDeal({ id: "b", riskScore: 0.5, value: 200, createdAt: d }),
      createDeal({ id: "c", riskScore: 0.8, value: 300, createdAt: d }),
    ];
    const r = calculateRiskDistribution(deals);
    expect(r.low).toEqual({ count: 1, value: 100 });
    expect(r.medium).toEqual({ count: 1, value: 200 });
    expect(r.high).toEqual({ count: 1, value: 300 });
  });

  it("single deal", () => {
    const deals = [createDeal({ riskScore: 0.1, value: 999, createdAt: new Date() })];
    const r = calculateRiskDistribution(deals);
    expect(r.low.count).toBe(1);
    expect(r.low.value).toBe(999);
    expect(r.medium.count).toBe(0);
    expect(r.high.count).toBe(0);
  });
});

describe("calculateDealActivity", () => {
  it("empty array", () => {
    const r = calculateDealActivity([]);
    expect(r.recentDeals).toHaveLength(0);
    expect(r.thirtyDayDeals).toHaveLength(0);
    expect(r.recentDealsValue).toBe(0);
    expect(r.thirtyDayValue).toBe(0);
    expect(r.avgDealAge).toBe(0);
    expect(r.avgDaysSinceActivity).toBe(0);
  });

  it("single deal created today", () => {
    const now = new Date();
    const deals = [
      createDeal({
        id: "a",
        value: 1000,
        createdAt: now,
        lastActivityAt: now,
        riskScore: 0.2,
      }),
    ];
    const r = calculateDealActivity(deals);
    expect(r.recentDeals).toHaveLength(1);
    expect(r.thirtyDayDeals).toHaveLength(1);
    expect(r.recentDealsValue).toBe(1000);
    expect(r.thirtyDayValue).toBe(1000);
    expect(r.avgDealAge).toBe(0);
    expect(r.avgDaysSinceActivity).toBe(0);
  });

  it("excludes deals older than 7 and 30 days", () => {
    const now = new Date();
    const deals = [
      createDeal({
        id: "a",
        value: 100,
        createdAt: subDays(now, 3),
        lastActivityAt: subDays(now, 3),
        riskScore: 0.2,
      }),
      createDeal({
        id: "b",
        value: 200,
        createdAt: subDays(now, 14),
        lastActivityAt: subDays(now, 14),
        riskScore: 0.2,
      }),
      createDeal({
        id: "c",
        value: 300,
        createdAt: subDays(now, 45),
        lastActivityAt: subDays(now, 45),
        riskScore: 0.2,
      }),
    ];
    const r = calculateDealActivity(deals);
    expect(r.recentDeals).toHaveLength(1);
    expect(r.thirtyDayDeals).toHaveLength(2);
    expect(r.recentDealsValue).toBe(100);
    expect(r.thirtyDayValue).toBe(300);
  });

  it("avgDealAge and avgDaysSinceActivity", () => {
    const now = new Date();
    const deals = [
      createDeal({
        id: "a",
        value: 100,
        createdAt: subDays(now, 10),
        lastActivityAt: subDays(now, 2),
        riskScore: 0.2,
      }),
      createDeal({
        id: "b",
        value: 100,
        createdAt: subDays(now, 20),
        lastActivityAt: subDays(now, 20),
        riskScore: 0.2,
      }),
    ];
    const r = calculateDealActivity(deals);
    expect(r.avgDealAge).toBe(15);
    expect(r.avgDaysSinceActivity).toBe(11);
  });
});
