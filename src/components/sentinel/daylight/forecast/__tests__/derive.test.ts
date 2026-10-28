import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { forecastPipelineValue } from "@/lib/predictions";
import { NOW, bookDeal, sampleBook } from "../../__tests__/sample-book";
import { movesOnPct } from "../../book";
import { averageDays, deriveForecast, idleText, scaleTicks } from "../derive";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("deriveForecast on the mockup book", () => {
  it("matches the dashboard forecast", () => {
    const book = sampleBook();
    const data = deriveForecast(book, NOW);
    const official = forecastPipelineValue(
      book.map((d) => ({
        id: d.id,
        name: d.name,
        stage: d.stage,
        value: d.value,
        createdAt: new Date(d.createdAt),
        lastActivityAt: new Date(d.lastActivityAt),
        riskScore: d.riskScore,
        status: d.status,
      }))
    );
    expect(data.expected).toBe(official.expected);
    expect(data.best).toBe(official.bestCase);
    expect(data.worst).toBe(official.worstCase);
    expect(Math.round(data.expected / 10_000)).toBe(138);
    expect(Math.round(data.best / 10_000)).toBe(181);
    expect(Math.round(data.worst / 1_000)).toBe(855);
  });

  it("splits the forecast into stages that add back up", () => {
    const data = deriveForecast(sampleBook(), NOW);
    const sum = data.stages.reduce((s, stage) => s + stage.weighted, 0);
    expect(Math.abs(sum - data.expected)).toBeLessThan(1);
    expect(Math.abs(data.totals.weighted - data.expected)).toBeLessThan(1);
  });

  it("starts every deal at the live win rate", () => {
    const data = deriveForecast(sampleBook(), NOW);
    expect(data.baseRatePct).toBe(60);
    expect(data.won).toBe(3);
    expect(data.lost).toBe(2);
  });

  it("gives each stage its count, value, chance, age, idle time and move-on rate", () => {
    const data = deriveForecast(sampleBook(), NOW);
    const rows = data.stages.map((s) => [
      s.label,
      s.count,
      s.value,
      Math.round(s.avgChance ?? 0),
      Math.round(s.avgAgeDays ?? 0),
      (s.avgIdleDays ?? 0).toFixed(1),
      Math.round(s.movesOnPct ?? 0),
    ]);
    expect(rows).toEqual([
      ["Discover", 3, 127_000, 61, 19, "8.7", 20],
      ["Qualify", 4, 805_000, 72, 9, "1.3", 24],
      ["Proposal", 4, 517_000, 66, 30, "6.8", 31],
      ["Negotiation", 4, 665_000, 67, 36, "4.8", 33],
    ]);
  });

  it("totals the open book", () => {
    const data = deriveForecast(sampleBook(), NOW);
    expect(data.openCount).toBe(15);
    expect(data.openValue).toBe(2_114_000);
    expect(data.tierValue).toEqual({ high: 780_000, medium: 500_000, low: 834_000 });
    expect(Math.round(data.totals.avgChance ?? 0)).toBe(67);
    expect(Math.round(data.totals.avgAgeDays ?? 0)).toBe(24);
    expect((data.totals.avgIdleDays ?? 0).toFixed(1)).toBe("5.1");
    expect(data.scaleMax).toBe(2_500_000);
  });

  it("sorts each column by value and keeps each deal's chance", () => {
    const data = deriveForecast(sampleBook(), NOW);
    const negotiation = data.stages.find((s) => s.key === "negotiation")!;
    expect(negotiation.deals.map((d) => [d.name, d.chance])).toEqual([
      ["Meridian Health", 57],
      ["Vertex Robotics", 57],
      ["Horizon Labs", 74],
      ["Acme Corporation", 80],
    ]);
    expect(negotiation.deals[0].overdueDays).toBe(1);
  });
});

describe("deriveForecast edge cases", () => {
  it("starts at 50% when nothing has closed", () => {
    const data = deriveForecast([bookDeal({ id: "a", name: "Alpha" })], NOW);
    expect(data.baseRatePct).toBe(50);
    expect(data.won + data.lost).toBe(0);
  });

  it("keeps the four open stages even when they are empty", () => {
    const data = deriveForecast([], NOW);
    expect(data.stages.map((s) => s.count)).toEqual([0, 0, 0, 0]);
    expect(data.expected).toBe(0);
    expect(data.totals.avgChance).toBeNull();
  });

  it("adds a column for a stage outside the usual four", () => {
    const data = deriveForecast(
      [bookDeal({ id: "a", name: "Alpha", stage: "Pilot", value: 40_000 })],
      NOW
    );
    expect(data.stages.at(-1)).toMatchObject({ label: "Pilot", count: 1, value: 40_000 });
    expect(data.stages.at(-1)?.movesOnPct).toBeNull();
  });

  it("measures moves on against the next stage in order", () => {
    const deals = [
      bookDeal({ id: "a", name: "A", stage: "discover" }),
      bookDeal({ id: "b", name: "B", stage: "proposal" }),
    ];
    expect(movesOnPct(deals, "discover")).toBe(0);
    expect(movesOnPct(deals, "qualify")).toBe(100);
    expect(movesOnPct(deals, "negotiation")).toBeNull();
  });
});

describe("forecast labels", () => {
  it("formats ticks and day counts", () => {
    expect(scaleTicks(2_500_000)).toEqual([0, 500_000, 1_000_000, 1_500_000, 2_000_000, 2_500_000]);
    expect(idleText(0)).toBe("active today");
    expect(idleText(1)).toBe("idle 1 day");
    expect(idleText(9)).toBe("idle 9 days");
    expect(averageDays(null)).toBe("-");
    expect(averageDays(1)).toBe("1 day");
    expect(averageDays(8.666, 1)).toBe("8.7 days");
  });
});
