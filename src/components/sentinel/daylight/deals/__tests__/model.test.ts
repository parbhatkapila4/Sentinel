import { describe, expect, it } from "vitest";
import {
  MAX_STAGE_SEGMENTS,
  attentionChip,
  bookClause,
  closedKind,
  countWord,
  describeSegments,
  dueHint,
  idleMeter,
  relativeAge,
  riskTone,
  stageLabel,
  stageSegments,
} from "../model";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const NOW = Date.UTC(2026, 9, 9, 9, 42);

describe("riskTone", () => {
  it("follows the risk thresholds used across the app", () => {
    expect(riskTone(0.82).label).toBe("High");
    expect(riskTone(0.6).label).toBe("High");
    expect(riskTone(0.59).label).toBe("Medium");
    expect(riskTone(0.4).label).toBe("Medium");
    expect(riskTone(0.39).label).toBe("Healthy");
    expect(riskTone(0).label).toBe("Healthy");
  });

  it("shows closed deals as closed whatever their score", () => {
    expect(riskTone(0.9, "closed")).toMatchObject({ key: "closed", label: "Closed" });
    expect(riskTone(0.9, "at_risk").key).toBe("high");
  });
});

describe("closedKind and stageLabel", () => {
  it("recognises the closed stages in either spelling", () => {
    expect(closedKind("closed_won")).toBe("won");
    expect(closedKind("Closed Won")).toBe("won");
    expect(closedKind("closed_lost")).toBe("lost");
    expect(closedKind("negotiation")).toBeNull();
  });

  it("turns stored stage keys into readable labels", () => {
    expect(stageLabel("closed_won")).toBe("Closed won");
    expect(stageLabel("discover")).toBe("Discover");
    expect(stageLabel("RFP Review")).toBe("RFP Review");
    expect(stageLabel("  ")).toBe("No stage");
  });
});

describe("relativeAge", () => {
  it("steps from minutes to years", () => {
    expect(relativeAge(NOW - 20_000, NOW)).toBe("Just now");
    expect(relativeAge(NOW - 5 * MIN, NOW)).toBe("5 min ago");
    expect(relativeAge(NOW - HOUR, NOW)).toBe("1 hour ago");
    expect(relativeAge(NOW - 4 * HOUR, NOW)).toBe("4 hours ago");
    expect(relativeAge(NOW - DAY, NOW)).toBe("1 day ago");
    expect(relativeAge(NOW - 15 * DAY, NOW)).toBe("15 days ago");
    expect(relativeAge(NOW - 45 * DAY, NOW)).toBe("1 month ago");
    expect(relativeAge(NOW - 364 * DAY, NOW)).toBe("11 months ago");
    expect(relativeAge(NOW - 365 * DAY, NOW)).toBe("1 year ago");
    expect(relativeAge(NOW - 800 * DAY, NOW)).toBe("2 years ago");
  });

  it("never reports a future time as negative", () => {
    expect(relativeAge(NOW + HOUR, NOW)).toBe("Just now");
  });
});

describe("dueHint", () => {
  it("has nothing to say without a due date", () => {
    expect(dueHint(null, null, NOW)).toBeNull();
  });

  it("uses the engine's overdue count when the action is late", () => {
    expect(dueHint(NOW - 3 * DAY, 2, NOW)).toEqual({
      text: "Overdue by 2 days",
      tone: "overdue",
    });
    expect(dueHint(NOW - 2 * DAY, 1, NOW)?.text).toBe("Overdue by 1 day");
  });

  it("calls anything due within a day due today", () => {
    expect(dueHint(NOW + 5 * HOUR, null, NOW)).toEqual({
      text: "Due today",
      tone: "today",
    });
    expect(dueHint(NOW - 3 * HOUR, null, NOW)?.text).toBe("Due today");
  });

  it("counts whole days for later dates", () => {
    expect(dueHint(NOW + DAY + HOUR, null, NOW)).toEqual({
      text: "Due tomorrow",
      tone: "upcoming",
    });
    expect(dueHint(NOW + 4 * DAY + HOUR, null, NOW)?.text).toBe("Due in 4 days");
  });
});

describe("idleMeter", () => {
  it("leaves the bar empty when there was activity today", () => {
    expect(idleMeter(NOW - 4 * HOUR, NOW)).toEqual({
      days: 0,
      percent: 0,
      tone: "quiet",
    });
  });

  it("scales against thirty days and warns at one and two weeks", () => {
    expect(idleMeter(NOW - DAY, NOW)).toEqual({ days: 1, percent: 4, tone: "quiet" });
    expect(idleMeter(NOW - 5 * DAY, NOW)).toMatchObject({ percent: 17, tone: "quiet" });
    expect(idleMeter(NOW - 8 * DAY, NOW)).toMatchObject({ percent: 27, tone: "watch" });
    expect(idleMeter(NOW - 15 * DAY, NOW)).toMatchObject({ percent: 50, tone: "stale" });
    expect(idleMeter(NOW - 90 * DAY, NOW)).toMatchObject({ percent: 100, tone: "stale" });
  });
});

describe("headline copy", () => {
  it("spells small counts and falls back to digits", () => {
    expect(countWord(0)).toBe("none");
    expect(countWord(8)).toBe("eight");
    expect(countWord(12)).toBe("twelve");
    expect(countWord(13)).toBe("13");
    expect(countWord(1280)).toBe("1,280");
  });

  it("writes the clause under the headline", () => {
    expect(bookClause(8, 2)).toBe("eight on it, two slipping.");
    expect(bookClause(8, 0)).toBe("eight on it, none slipping.");
    expect(bookClause(140, 31)).toBe("140 on it, 31 slipping.");
    expect(bookClause(0, 0)).toBe("nothing on it yet.");
  });

  it("picks the chip from the counts", () => {
    expect(attentionChip(8, 2)).toEqual({ label: "2 need attention", tone: "alert" });
    expect(attentionChip(8, 1)).toEqual({ label: "1 needs attention", tone: "alert" });
    expect(attentionChip(8, 0)).toEqual({ label: "All steady", tone: "steady" });
    expect(attentionChip(0, 0)).toEqual({ label: "Getting started", tone: "start" });
  });
});

describe("stageSegments", () => {
  const deal = (name: string, value: number, riskScore: number, status = "active") => ({
    name,
    value,
    riskScore,
    status,
  });

  it("draws one segment per deal, riskiest first, then by value", () => {
    const segments = stageSegments([
      deal("Small healthy", 20_000, 0.1),
      deal("Medium one", 45_000, 0.5),
      deal("Big healthy", 90_000, 0.2),
      deal("High one", 250_000, 0.7, "at_risk"),
    ]);
    expect(segments.map((s) => s.key)).toEqual(["high", "medium", "healthy", "healthy"]);
    expect(segments.map((s) => s.value)).toEqual([250_000, 45_000, 90_000, 20_000]);
    expect(segments[0].title).toBe("High one · $250K · high risk");
  });

  it("colours a closed stage by its outcome, not by risk", () => {
    expect(stageSegments([deal("Apex", 180_000, 0, "closed")], "won")[0].key).toBe("won");
    expect(stageSegments([deal("Gone", 60_000, 0, "closed")], "lost")[0].key).toBe("lost");
  });

  it("skips deals with no value", () => {
    expect(stageSegments([deal("Free pilot", 0, 0.2)])).toEqual([]);
    expect(describeSegments([])).toBe("No deals");
  });

  it("groups by risk once a stage holds more deals than fit", () => {
    const crowded = Array.from({ length: MAX_STAGE_SEGMENTS + 3 }, (_, i) =>
      deal(`Deal ${i}`, 10_000, i % 3 === 0 ? 0.8 : i % 3 === 1 ? 0.5 : 0.1)
    );
    const segments = stageSegments(crowded);
    expect(segments.map((s) => s.key)).toEqual(["high", "medium", "healthy"]);
    expect(segments.reduce((sum, s) => sum + s.value, 0)).toBe(150_000);
    expect(segments[0].title).toBe("5 high risk deals · $50K");
    expect(describeSegments(segments)).toContain("5 medium risk deals");
  });
});
