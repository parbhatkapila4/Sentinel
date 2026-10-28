import { describe, expect, it } from "vitest";
import { deriveAnalytics, type AnalyticsDeal } from "../derive";

const DAY = 86_400_000;
const NOW = new Date(2026, 9, 10, 9, 42).getTime();

function deal(
  id: string,
  name: string,
  value: number,
  stage: string,
  status: string,
  riskScore: number,
  urgency: string | null,
  createdDaysAgo: number
): AnalyticsDeal {
  return {
    id,
    name,
    value,
    stage,
    status,
    riskScore,
    urgency,
    action: urgency ? `Act on ${name}` : null,
    location: "Canada",
    createdAt: NOW - createdDaysAgo * DAY - 3_600_000,
  };
}

const BOOK: AnalyticsDeal[] = [
  deal("1", "Pinnacle", 35_000, "discover", "at_risk", 0.82, "high", 40),
  deal("2", "Quantum", 250_000, "proposal", "at_risk", 0.71, "high", 34),
  deal("3", "TechStart", 45_000, "proposal", "active", 0.52, "medium", 25),
  deal("4", "Horizon", 95_000, "negotiation", "active", 0.44, "medium", 22),
  deal("5", "Nexus", 55_000, "qualify", "active", 0.28, null, 5),
  deal("6", "Acme", 75_000, "negotiation", "active", 0.22, null, 18),
  deal("7", "Global", 120_000, "qualify", "active", 0.18, null, 3),
  deal("8", "Apex", 180_000, "closed_won", "closed", 0, null, 75),
];

describe("deriveAnalytics, all time", () => {
  const data = deriveAnalytics(BOOK, "all", NOW);

  it("counts the deals each range would hold", () => {
    expect(data.rangeCounts).toEqual({ "7d": 2, "30d": 5, "90d": 8, all: 8 });
  });

  it("totals the book", () => {
    expect(data.totals).toMatchObject({
      deals: 8,
      value: 855_000,
      avgDeal: 106_875,
      minDeal: 35_000,
      maxDeal: 250_000,
      wonValue: 180_000,
      lostValue: 0,
      won: 1,
      lost: 0,
      active: 5,
      flaggedHigh: 2,
      needsAction: 2,
      actionHigh: 2,
      actionMedium: 0,
      actionLow: 0,
    });
    expect(data.totals.riskIndex).toBeCloseTo(0.39625);
  });

  it("has nothing to compare all time against", () => {
    expect(data.totals.pipelineDelta).toBeNull();
    expect(data.totals.avgDealDelta).toBeNull();
  });

  it("splits the book into risk tiers with their value", () => {
    expect(data.tiers).toEqual([
      { key: "high", label: "High", count: 2, value: 285_000, needAction: 2 },
      { key: "medium", label: "Medium", count: 2, value: 140_000, needAction: 0 },
      { key: "healthy", label: "Healthy", count: 4, value: 430_000, needAction: 0 },
    ]);
  });

  it("puts every open stage and the won stage in the chart", () => {
    expect(data.stages.map((s) => [s.label, s.count, s.value])).toEqual([
      ["Discover", 1, 35_000],
      ["Qualify", 2, 175_000],
      ["Proposal", 2, 295_000],
      ["Negotiate", 2, 170_000],
      ["Won", 1, 180_000],
    ]);
  });

  it("ranks the fragile deals by risk and the healthy ones by value", () => {
    expect(data.secondLook.map((d) => d.name)).toEqual(["Pinnacle", "Quantum"]);
    expect(data.secondLook[0]).toMatchObject({
      riskScore: 0.82,
      action: "Act on Pinnacle",
    });
    expect(data.healthiest.map((d) => d.name)).toEqual([
      "Apex",
      "Global",
      "Acme",
      "Nexus",
    ]);
    expect(data.highRiskTotal).toBe(2);
    expect(data.lowRiskTotal).toBe(4);
  });
});

describe("deriveAnalytics, a dated range", () => {
  it("keeps only deals created in the last 30 days", () => {
    const data = deriveAnalytics(BOOK, "30d", NOW);
    expect(data.totals).toMatchObject({
      deals: 5,
      value: 390_000,
      avgDeal: 78_000,
      active: 5,
      flaggedHigh: 0,
      needsAction: 0,
      won: 0,
    });
    expect(data.secondLook).toEqual([]);
  });

  it("compares with the same stretch before", () => {
    const { pipelineDelta, avgDealDelta } = deriveAnalytics(BOOK, "30d", NOW).totals;
    expect(pipelineDelta?.positive).toBe(true);
    expect(pipelineDelta?.pct).toBeCloseTo(36.84, 1);
    expect(avgDealDelta?.positive).toBe(false);
    expect(avgDealDelta?.pct).toBeCloseTo(45.26, 1);
  });

  it("offers no comparison when the stretch before was empty", () => {
    const data = deriveAnalytics(BOOK, "90d", NOW);
    expect(data.totals.deals).toBe(8);
    expect(data.totals.pipelineDelta).toBeNull();
  });

  it("returns zeros, not errors, for a range with no deals", () => {
    const older = BOOK.map((d) => ({ ...d, createdAt: d.createdAt - 10 * DAY }));
    const data = deriveAnalytics(older, "7d", NOW);
    expect(data.totals).toMatchObject({
      deals: 0,
      value: 0,
      avgDeal: 0,
      minDeal: 0,
      maxDeal: 0,
      riskIndex: 0,
    });
    expect(data.stages.every((s) => s.count === 0)).toBe(true);
    expect(data.totals.pipelineDelta).toEqual({ positive: false, pct: 100 });
  });

  it("limits each list to five", () => {
    const crowd = Array.from({ length: 12 }, (_, i) =>
      deal(`h${i}`, `High ${i}`, 10_000 + i, "proposal", "at_risk", 0.7 + i / 100, "high", 2)
    );
    const data = deriveAnalytics(crowd, "all", NOW);
    expect(data.secondLook).toHaveLength(5);
    expect(data.secondLook[0].name).toBe("High 11");
    expect(data.highRiskTotal).toBe(12);
  });
});
