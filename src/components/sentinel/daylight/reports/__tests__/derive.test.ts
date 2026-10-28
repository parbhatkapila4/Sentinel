import { describe, expect, it } from "vitest";
import { NOW, bookDeal, sampleBook } from "../../__tests__/sample-book";
import { deriveReports } from "../derive";

const DAY = 86_400_000;

describe("deriveReports on the mockup book", () => {
  const data = deriveReports(sampleBook(), NOW);

  it("totals the book", () => {
    expect(data.dealCount).toBe(20);
    expect(data.openCount).toBe(15);
    expect(data.totalValue).toBe(2_620_000);
    expect(data.average).toBe(131_000);
    expect(data.smallest).toBe(28_000);
    expect(data.largest).toBe(410_000);
  });

  it("reads the week", () => {
    expect(data.newThisWeek).toBe(3);
    expect(data.newThisWeekValue).toBe(203_000);
    expect(data.dailyNew).toEqual([1, 1, 0, 1, 0, 0, 0]);
    expect(data.wonThisWeek).toBe(1);
    expect(data.wonThisWeekValue).toBe(42_000);
    expect(data.lostThisWeek).toBe(0);
    expect(data.newLastMonth).toBe(10);
    expect(data.newest.map((d) => d.name)).toEqual([
      "Global Systems Ltd",
      "Nexus Partners",
      "Lumen Analytics",
    ]);
  });

  it("lists the overdue next steps, latest first", () => {
    expect(data.withNextStep).toBe(15);
    expect(data.overdueCount).toBe(3);
    expect(data.pickUp.map((d) => [d.name, d.overdueDays])).toEqual([
      ["Pinnacle Solutions", 6],
      ["Quantum Industries", 3],
      ["Meridian Health", 1],
    ]);
  });

  it("covers every stage with the canonical names, not lead or qualified", () => {
    expect(
      data.stages.map((s) => [s.label, s.count, s.value, s.movesOnPct === null ? null : Math.round(s.movesOnPct)])
    ).toEqual([
      ["Discover", 3, 127_000, 20],
      ["Qualify", 4, 805_000, 24],
      ["Proposal", 4, 517_000, 31],
      ["Negotiation", 4, 665_000, 33],
      ["Closed won", 3, 318_000, null],
      ["Closed lost", 2, 188_000, null],
    ]);
    expect(data.stages[1].sharePct.toFixed(1)).toBe("30.7");
  });

  it("splits open deals by risk tier", () => {
    expect(data.tiers.map((t) => [t.key, t.count, t.value])).toEqual([
      ["high", 4, 780_000],
      ["medium", 4, 500_000],
      ["low", 7, 834_000],
    ]);
    expect(Math.round((data.avgRisk ?? 0) * 100)).toBe(46);
  });

  it("counts deals by weekday and by age", () => {
    expect(data.weekdays).toEqual([2, 1, 3, 5, 3, 3, 3]);
    expect(data.ages).toEqual([3, 2, 5, 7, 3]);
  });

  it("groups the registry by stage, latest stage first", () => {
    expect(data.registry.map((g) => [g.label, g.count])).toEqual([
      ["Negotiation", 4],
      ["Proposal", 4],
      ["Qualify", 4],
      ["Discover", 3],
      ["Closed won", 3],
      ["Closed lost", 2],
    ]);
    expect(data.registry[0].rows[0]).toMatchObject({ name: "Meridian Health", overdueDays: 1 });
    expect(data.registry[4].rows[0]).toMatchObject({ name: "Apex Ventures", tier: "won", action: null });
  });
});

describe("deriveReports edge cases", () => {
  it("handles an empty book", () => {
    const data = deriveReports([], NOW);
    expect(data.average).toBe(0);
    expect(data.registry).toEqual([]);
    expect(data.avgRisk).toBeNull();
    expect(data.stages.every((s) => s.count === 0)).toBe(true);
  });

  it("shows upcoming steps when nothing is overdue", () => {
    const data = deriveReports(
      [
        bookDeal({ id: "a", name: "Later", action: "Call", actionDueAt: NOW + 5 * DAY + 1000 }),
        bookDeal({ id: "b", name: "Sooner", action: "Email", actionDueAt: NOW + 2 * DAY + 1000 }),
      ],
      NOW
    );
    expect(data.pickUp.map((d) => [d.name, d.dueInDays])).toEqual([
      ["Sooner", 2],
      ["Later", 5],
    ]);
  });

  it("keeps a stage outside the canonical six", () => {
    const data = deriveReports([bookDeal({ id: "a", name: "A", stage: "Pilot" })], NOW);
    expect(data.registry.map((g) => g.label)).toEqual(["Pilot"]);
    expect(data.stages.at(-1)).toMatchObject({ label: "Pilot", count: 1, movesOnPct: null });
  });
});
