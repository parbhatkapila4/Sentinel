import { describe, it, expect } from "vitest";
import {
  predictDaysToClose,
  calculateWinProbability,
  identifyDealPatterns,
  findSimilarDeals,
  forecastPipelineValue,
  detectAnomalies,
  type DealForPrediction,
} from "../predictions";

function deal(overrides: Partial<DealForPrediction> = {}): DealForPrediction {
  const now = new Date();
  return {
    id: "d1",
    name: "Acme",
    stage: "negotiation",
    value: 50_000,
    createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
    lastActivityAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    riskScore: 0.25,
    riskLevel: "Low",
    status: "active",
    ...overrides,
  };
}

describe("predictDaysToClose", () => {
  it("returns low confidence and fallback when no closed-won history", () => {
    const d = deal();
    const all = [d, deal({ id: "d2", stage: "discover" })];
    const r = predictDaysToClose(d, all);
    expect(r.estimatedDays).toBeGreaterThanOrEqual(0);
    expect(r.confidence).toBe("low");
    expect(r.factors.some((f) => f.toLowerCase().includes("no closed"))).toBe(true);
  });

  it("uses historical cycle length when closed-won exist", () => {
    const now = new Date();
    const closed = deal({
      id: "c1",
      stage: "closed_won",
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      lastActivityAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    });
    const open = deal({ id: "o1", stage: "proposal" });
    const r = predictDaysToClose(open, [open, closed]);
    expect(r.estimatedDays).toBeGreaterThanOrEqual(0);
    expect(r.confidence).toBe("low");
    expect(r.factors.length).toBeGreaterThan(0);
  });

  it("handles single deal (no history)", () => {
    const d = deal();
    const r = predictDaysToClose(d, [d]);
    expect(r.estimatedDays).toBeGreaterThanOrEqual(0);
    expect(r.confidence).toBe("low");
  });
});

describe("calculateWinProbability", () => {
  it("returns 0–100 probability", () => {
    const d = deal();
    const r = calculateWinProbability(d, [d]);
    expect(r.probability).toBeGreaterThanOrEqual(0);
    expect(r.probability).toBeLessThanOrEqual(100);
    expect(["up", "down", "stable"]).toContain(r.trend);
    expect(Array.isArray(r.factors)).toBe(true);
  });

  it("reduces probability for high-risk deals", () => {
    const low = deal({ riskScore: 0.2, riskLevel: "Low" });
    const high = deal({ riskScore: 0.85, riskLevel: "High" });
    const all = [low, high];
    const pl = calculateWinProbability(low, all);
    const ph = calculateWinProbability(high, all);
    expect(ph.probability).toBeLessThan(pl.probability);
  });

  it("handles empty allDeals", () => {
    const d = deal();
    const r = calculateWinProbability(d, []);
    expect(r.probability).toBeGreaterThanOrEqual(0);
    expect(r.probability).toBeLessThanOrEqual(100);
  });
});

describe("identifyDealPatterns", () => {
  it("returns insights and recommendations", () => {
    const all = [
      deal({ id: "1", stage: "closed_won" }),
      deal({ id: "2", stage: "closed_lost" }),
    ];
    const r = identifyDealPatterns(all);
    expect(Array.isArray(r.insights)).toBe(true);
    expect(Array.isArray(r.recommendations)).toBe(true);
  });

  it("handles no closed deals", () => {
    const all = [deal({ stage: "discover" })];
    const r = identifyDealPatterns(all);
    expect(r.insights.some((i) => i.description.toLowerCase().includes("no closed"))).toBe(true);
  });
});

describe("findSimilarDeals", () => {
  it("returns similar closed deals with win rate and avg days", () => {
    const now = new Date();
    const open = deal({ id: "o1" });
    const won = deal({
      id: "w1",
      stage: "closed_won",
      value: 45_000,
      createdAt: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000),
      lastActivityAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    });
    const lost = deal({
      id: "l1",
      stage: "closed_lost",
      value: 55_000,
      createdAt: new Date(now.getTime() - 70 * 24 * 60 * 60 * 1000),
      lastActivityAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    });
    const r = findSimilarDeals(open, [open, won, lost]);
    expect(r.similar.length).toBeLessThanOrEqual(5);
    expect(r.winRate).toBeGreaterThanOrEqual(0);
    expect(r.winRate).toBeLessThanOrEqual(1);
    expect(r.avgDaysToClose).toBeGreaterThanOrEqual(0);
  });

  it("handles no closed deals", () => {
    const d = deal();
    const r = findSimilarDeals(d, [d]);
    expect(r.similar).toEqual([]);
    expect(r.winRate).toBe(0);
    expect(r.avgDaysToClose).toBe(0);
  });
});

describe("forecastPipelineValue", () => {
  it("returns expected, best, worst, and monthly", () => {
    const all = [
      deal({ id: "1", stage: "negotiation", value: 30_000 }),
      deal({ id: "2", stage: "discover", value: 10_000 }),
    ];
    const r = forecastPipelineValue(all);
    expect(r.expected).toBeGreaterThanOrEqual(0);
    expect(r.bestCase).toBeGreaterThanOrEqual(r.expected);
    expect(r.worstCase).toBeLessThanOrEqual(r.expected);
    expect(r.monthly.length).toBe(3);
    expect(r.monthly.every((m) => typeof m.month === "string" && typeof m.value === "number")).toBe(
      true
    );
  });

  it("handles empty deals", () => {
    const r = forecastPipelineValue([]);
    expect(r.expected).toBe(0);
    expect(r.bestCase).toBe(0);
    expect(r.worstCase).toBe(0);
    expect(r.monthly.length).toBe(3);
  });
});

describe("detectAnomalies", () => {
  it("returns anomalies array", () => {
    const now = new Date();
    const all = [
      deal({
        id: "1",
        stage: "negotiation",
        createdAt: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000),
        lastActivityAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      }),
    ];
    const r = detectAnomalies(all);
    expect(Array.isArray(r.anomalies)).toBe(true);
  });

  it("handles empty deals", () => {
    const r = detectAnomalies([]);
    expect(r.anomalies).toEqual([]);
  });
});
