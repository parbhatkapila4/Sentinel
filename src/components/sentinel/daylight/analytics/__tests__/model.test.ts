import { describe, expect, it } from "vitest";
import {
  MAX_SPREAD_TICKS,
  ageMeter,
  axisLabel,
  buildStageRows,
  formatDelta,
  needsActionCaption,
  parseRange,
  rangeClause,
  rangeSentence,
  riskIndexTone,
  spreadCaption,
  spreadTicks,
  stageKey,
  tierShare,
  valueAxis,
  widerRanges,
} from "../model";

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 9, 10, 9, 42);

describe("range", () => {
  it("accepts every range the tabs offer, including 30 days", () => {
    expect(parseRange("7d")).toBe("7d");
    expect(parseRange("30d")).toBe("30d");
    expect(parseRange("90d")).toBe("90d");
    expect(parseRange("all")).toBe("all");
  });

  it("falls back to all time for a missing or unknown value", () => {
    expect(parseRange(undefined)).toBe("all");
    expect(parseRange("yesterday")).toBe("all");
  });

  it("says what the range means", () => {
    expect(rangeSentence("all")).toBe(
      "Every deal on the book, whenever it was created"
    );
    expect(rangeSentence("30d")).toBe(
      "Deals created in the last 30 days, compared with the 30 days before"
    );
  });

  it("writes the line under the headline", () => {
    expect(rangeClause(8, 855_000, "all")).toBe(
      "eight deals worth $855K, all time."
    );
    expect(rangeClause(5, 390_000, "30d")).toBe(
      "five deals worth $390K in the last 30 days."
    );
    expect(rangeClause(1, 35_000, "7d")).toBe(
      "one deal worth $35K in the last 7 days."
    );
    expect(rangeClause(0, 0, "7d")).toBe("nothing created in the last 7 days.");
    expect(rangeClause(0, 0, "all")).toBe("nothing on the book yet.");
  });

  it("lists the ranges wider than the current one", () => {
    expect(widerRanges("7d")).toEqual(["30d", "90d", "all"]);
    expect(widerRanges("90d")).toEqual(["all"]);
    expect(widerRanges("all")).toEqual([]);
  });
});

describe("key numbers", () => {
  it("signs the change against the period before", () => {
    expect(formatDelta({ positive: true, pct: 36.84 })).toBe("+36.8%");
    expect(formatDelta({ positive: false, pct: 45.26 })).toBe("-45.3%");
  });

  it("grades the risk index at the same points as before", () => {
    expect(riskIndexTone(0.6)).toBe("high");
    expect(riskIndexTone(0.59)).toBe("watch");
    expect(riskIndexTone(0.35)).toBe("watch");
    expect(riskIndexTone(0.34)).toBe("calm");
  });

  it("names only the tiers that have urgent deals", () => {
    expect(needsActionCaption(0, 0, 0)).toBe("None pending");
    expect(needsActionCaption(2, 0, 0)).toBe("2 high risk");
    expect(needsActionCaption(0, 1, 0)).toBe("1 medium risk");
    expect(needsActionCaption(2, 1, 0)).toBe("2 high · 1 medium");
    expect(needsActionCaption(2, 1, 3)).toBe("2 high · 1 medium · 3 low");
  });

  it("describes the spread of deal sizes", () => {
    expect(spreadCaption(8, 35_000, 250_000)).toBe("from $35K to $250K");
    expect(spreadCaption(3, 50_000, 50_000)).toBe("Every deal is $50K");
    expect(spreadCaption(1, 35_000, 35_000)).toBe("Only one deal in range");
    expect(spreadCaption(0, 0, 0)).toBe("No deals to average");
  });

  it("places one tick per deal against the largest", () => {
    expect(spreadTicks([250_000, 125_000, 0])).toEqual([50, 100]);
    expect(spreadTicks([])).toEqual([]);
  });

  it("samples the ticks when the book is large", () => {
    const ticks = spreadTicks(Array.from({ length: 500 }, (_, i) => i + 1));
    expect(ticks).toHaveLength(MAX_SPREAD_TICKS);
    expect(ticks[ticks.length - 1]).toBe(100);
    expect(ticks[0]).toBeCloseTo(0.2);
  });
});

describe("stages", () => {
  it("reads the stage names the rest of the app uses", () => {
    expect(stageKey("discover")).toBe("discover");
    expect(stageKey("Negotiation")).toBe("negotiation");
    expect(stageKey("closed won")).toBe("closed_won");
    expect(stageKey("something else")).toBeNull();
  });

  it("still counts deals saved under the old first-stage names", () => {
    expect(stageKey("lead")).toBe("discover");
    expect(stageKey("Prospect")).toBe("discover");
    expect(stageKey("qualified")).toBe("qualify");
  });

  it("totals each stage and averages the age of its open deals", () => {
    const rows = buildStageRows(
      [
        { stage: "discover", value: 35_000, createdAt: NOW - 40 * DAY },
        { stage: "lead", value: 5_000, createdAt: NOW - 10 * DAY },
        { stage: "proposal", value: 250_000, createdAt: NOW - 34 * DAY - 1 },
        { stage: "proposal", value: 45_000, createdAt: NOW - 25 * DAY - 1 },
        { stage: "closed_won", value: 180_000, createdAt: NOW - 75 * DAY },
        { stage: "closed_lost", value: 60_000, createdAt: NOW - 5 * DAY },
      ],
      NOW
    );
    expect(rows.map((r) => r.label)).toEqual([
      "Discover",
      "Qualify",
      "Proposal",
      "Negotiate",
      "Won",
    ]);
    expect(rows[0]).toMatchObject({ count: 2, value: 40_000, avgAgeDays: 25 });
    expect(rows[1]).toMatchObject({ count: 0, value: 0, avgAgeDays: null });
    expect(rows[2]).toMatchObject({ count: 2, value: 295_000, avgAgeDays: 30 });
    expect(rows[4]).toMatchObject({
      bucket: "won",
      count: 1,
      value: 180_000,
      avgAgeDays: null,
    });
  });

  it("warns on age at two weeks and thirty days", () => {
    expect(ageMeter(0)).toEqual({ percent: 0, tone: "quiet" });
    expect(ageMeter(4)).toEqual({ percent: 9, tone: "quiet" });
    expect(ageMeter(14).tone).toBe("watch");
    expect(ageMeter(20)).toEqual({ percent: 44, tone: "watch" });
    expect(ageMeter(30).tone).toBe("stale");
    expect(ageMeter(400)).toEqual({ percent: 100, tone: "stale" });
  });
});

describe("valueAxis", () => {
  it("picks round steps and at most four intervals", () => {
    expect(valueAxis(295_000)).toEqual({
      max: 300_000,
      ticks: [0, 100_000, 200_000, 300_000],
    });
    expect(valueAxis(855_000)).toEqual({
      max: 1_000_000,
      ticks: [0, 250_000, 500_000, 750_000, 1_000_000],
    });
    expect(valueAxis(175_000).ticks).toEqual([0, 50_000, 100_000, 150_000, 200_000]);
    expect(valueAxis(100_000).max).toBe(100_000);
  });

  it("always reaches the largest value", () => {
    for (const value of [1, 7, 35_000, 99_999, 5_484_000, 123_456_789]) {
      const axis = valueAxis(value);
      expect(axis.max).toBeGreaterThanOrEqual(value);
      expect(axis.ticks.length).toBeGreaterThanOrEqual(2);
      expect(axis.ticks.length).toBeLessThanOrEqual(5);
      expect(axis.ticks[axis.ticks.length - 1]).toBeCloseTo(axis.max);
    }
  });

  it("copes with an empty chart", () => {
    expect(valueAxis(0)).toEqual({ max: 1, ticks: [0] });
  });

  it("labels the ticks", () => {
    expect(axisLabel(0)).toBe("0");
    expect(axisLabel(100_000)).toBe("$100K");
    expect(axisLabel(2_000_000)).toBe("$2M");
  });
});

describe("tierShare", () => {
  it("rounds to a whole percent and survives an empty book", () => {
    expect(tierShare(2, 8)).toBe(25);
    expect(tierShare(1, 3)).toBe(33);
    expect(tierShare(0, 0)).toBe(0);
  });
});
