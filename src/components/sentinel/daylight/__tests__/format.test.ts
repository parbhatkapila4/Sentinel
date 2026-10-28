import { describe, expect, it } from "vitest";
import {
  compactNumber,
  fullCurrency,
  initials,
  niceCeil,
  parseIdleDays,
  percentOf,
  segmentCounts,
  sentenceCase,
  splitMoney,
  spreadLabels,
  stageStep,
  STAGE_STEP_COUNT,
} from "../format";

describe("splitMoney", () => {
  it("separates the currency symbol, digits and unit", () => {
    expect(splitMoney(855000)).toEqual({ sign: "", digits: "855", unit: "K" });
    expect(splitMoney(1250000)).toEqual({ sign: "", digits: "1.25", unit: "M" });
    expect(splitMoney(0)).toEqual({ sign: "", digits: "0", unit: "" });
  });

  it("keeps the sign for negative values", () => {
    expect(splitMoney(-35000)).toEqual({ sign: "-", digits: "35", unit: "K" });
  });
});

describe("fullCurrency and compactNumber", () => {
  it("formats whole dollars with separators", () => {
    expect(fullCurrency(250000)).toBe("$250,000");
  });

  it("drops the currency symbol for axis labels", () => {
    expect(compactNumber(250000)).toBe("250K");
    expect(compactNumber(0)).toBe("0");
  });
});

describe("niceCeil", () => {
  it("rounds up to a clean axis maximum", () => {
    expect(niceCeil(400000)).toBe(500000);
    expect(niceCeil(459000)).toBe(500000);
    expect(niceCeil(120000)).toBe(200000);
    expect(niceCeil(230000)).toBe(250000);
    expect(niceCeil(1000000)).toBe(1000000);
  });

  it("falls back to 1 for empty or invalid input", () => {
    expect(niceCeil(0)).toBe(1);
    expect(niceCeil(-5)).toBe(1);
    expect(niceCeil(Number.NaN)).toBe(1);
  });
});

describe("initials", () => {
  it("uses the first letters of the first two words", () => {
    expect(initials("Quantum Industries")).toBe("QI");
    expect(initials("Global Systems Ltd")).toBe("GS");
  });

  it("handles single words and empty names", () => {
    expect(initials("Initech")).toBe("IN");
    expect(initials("   ")).toBe("?");
  });
});

describe("stageStep", () => {
  it("maps open stages to their position", () => {
    expect(STAGE_STEP_COUNT).toBe(4);
    expect(stageStep("Discover")).toBe(1);
    expect(stageStep("qualify")).toBe(2);
    expect(stageStep("Proposal")).toBe(3);
    expect(stageStep("Negotiation")).toBe(4);
  });

  it("returns null for closed or unknown stages", () => {
    expect(stageStep("Closed Won")).toBeNull();
    expect(stageStep("Something Else")).toBeNull();
  });
});

describe("parseIdleDays", () => {
  it("reads the day count out of the age note", () => {
    expect(parseIdleDays("IDLE 15D")).toBe(15);
    expect(parseIdleDays("ADVANCED 2D AGO")).toBe(2);
    expect(parseIdleDays("ACTIVE TODAY")).toBe(0);
  });

  it("returns null when there is no day count", () => {
    expect(parseIdleDays("UNKNOWN")).toBeNull();
  });
});

describe("sentenceCase", () => {
  it("lowercases all but the first letter and keeps CRM upper", () => {
    expect(sentenceCase("RISK MODEL")).toBe("Risk model");
    expect(sentenceCase("CRM LOG")).toBe("CRM log");
    expect(sentenceCase("OUTBOUND")).toBe("Outbound");
    expect(sentenceCase("")).toBe("");
  });
});

describe("segmentCounts", () => {
  it("uses one segment per item when the total is small", () => {
    expect(segmentCounts(3, 7)).toEqual({ count: 7, filled: 3 });
    expect(segmentCounts(0, 0)).toEqual({ count: 1, filled: 0 });
  });

  it("scales down to the maximum and never hides a non-zero share", () => {
    expect(segmentCounts(20, 40)).toEqual({ count: 10, filled: 5 });
    expect(segmentCounts(1, 400)).toEqual({ count: 10, filled: 1 });
    expect(segmentCounts(0, 400)).toEqual({ count: 10, filled: 0 });
  });

  it("clamps a filled count above the total", () => {
    expect(segmentCounts(9, 4)).toEqual({ count: 4, filled: 4 });
  });
});

describe("spreadLabels", () => {
  it("leaves well separated labels where they are", () => {
    expect(spreadLabels([31.8, 64.8, 91.8], 17, 6, 94)).toEqual([
      31.8, 64.8, 91.8,
    ]);
  });

  it("pushes crowded labels apart and keeps them in range", () => {
    expect(spreadLabels([0, 0, 0], 17, 6, 94)).toEqual([6, 23, 40]);
    expect(spreadLabels([90, 95, 100], 17, 6, 94)).toEqual([60, 77, 94]);
  });
});

describe("percentOf", () => {
  it("returns a clamped percentage", () => {
    expect(percentOf(159000, 500000)).toBeCloseTo(31.8);
    expect(percentOf(900, 500)).toBe(100);
    expect(percentOf(5, 0)).toBe(0);
  });
});
