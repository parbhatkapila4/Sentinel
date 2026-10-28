import { describe, expect, it } from "vitest";
import { RISK_REASONS } from "@/lib/config";
import { NOW, bookDeal, sampleBook } from "../../__tests__/sample-book";
import { deriveAlerts, dueText, reasonText } from "../derive";

const QUEUE = {
  urgent: ["d02", "d01", "d03"],
  important: ["d04", "d05"],
  safe: ["d10", "d07", "d12", "d13", "d11"],
};

describe("deriveAlerts on the mockup book", () => {
  const data = deriveAlerts(sampleBook(), QUEUE, NOW);

  it("counts risk over open deals only", () => {
    expect(data.openCount).toBe(15);
    expect(data.highCount).toBe(4);
    expect(data.highValue).toBe(780_000);
    expect(data.tiers.map((t) => [t.key, t.count, t.value])).toEqual([
      ["high", 4, 780_000],
      ["medium", 4, 500_000],
      ["low", 7, 834_000],
    ]);
    expect(Math.round((data.avgRisk ?? 0) * 100)).toBe(46);
  });

  it("counts overdue and urgent actions", () => {
    expect(data.overdueCount).toBe(3);
    expect(data.overdueValue).toBe(595_000);
    expect(data.avgOverdueDays).toBeCloseTo(10 / 3);
    expect(data.urgentCount).toBe(3);
    expect(data.importantCount).toBe(2);
    expect(data.safeCount).toBe(10);
  });

  it("keeps the queue order it was given", () => {
    expect(data.urgent.map((d) => d.name)).toEqual([
      "Pinnacle Solutions",
      "Quantum Industries",
      "Meridian Health",
    ]);
    expect(data.urgent[0]).toMatchObject({
      reason: "No activity for 19 days",
      overdueDays: 6,
      dueInDays: null,
    });
    expect(data.important[0]).toMatchObject({ reason: "Competitive signals", dueInDays: 2 });
    expect(data.safe).toHaveLength(5);
  });

  it("measures value at risk", () => {
    expect(data.highIdleDays).toBe(11.5);
    expect(data.turnedHighThisWeek).toBe(0);
  });

  it("splits each open stage by tier", () => {
    expect(data.stages.map((s) => [s.label, s.high, s.medium, s.low, Math.round(s.highPct)])).toEqual([
      ["Discover", 1, 0, 2, 33],
      ["Qualify", 0, 1, 3, 0],
      ["Proposal", 1, 2, 1, 25],
      ["Negotiation", 2, 1, 1, 50],
    ]);
  });

  it("counts the signal behind each high-risk deal", () => {
    expect(data.signals.map((s) => [s.title, s.count])).toEqual([
      ["Activity decay past threshold", 2],
      ["Negotiation stalled", 1],
      ["High-value exposure", 0],
      ["Competitive signals", 1],
    ]);
    expect(data.signals[2].body).toContain("$5,000");
  });
});

describe("alerts helpers", () => {
  it("describes the risk reason", () => {
    expect(
      reasonText(
        bookDeal({
          id: "a",
          name: "A",
          riskReason: RISK_REASONS.NO_ACTIVITY,
          lastActivityAt: NOW - 86_400_000 - 1000,
        }),
        NOW
      )
    ).toBe("No activity for 1 day");
    expect(reasonText(bookDeal({ id: "b", name: "B", riskScore: 0.7 }), NOW)).toBe("High risk score");
  });

  it("describes when an action is due", () => {
    const base = { id: "x", name: "X", value: 1, riskScore: 0.5, reason: "", action: "Call" };
    expect(dueText({ ...base, overdueDays: 2, dueInDays: null })).toBeNull();
    expect(dueText({ ...base, overdueDays: null, dueInDays: 0 })).toBe("due today");
    expect(dueText({ ...base, overdueDays: null, dueInDays: 1 })).toBe("due tomorrow");
    expect(dueText({ ...base, overdueDays: null, dueInDays: 5 })).toBe("due in 5 days");
  });

  it("ignores queue ids it cannot find and handles an empty book", () => {
    const data = deriveAlerts([], { urgent: ["missing"], important: [], safe: [] }, NOW);
    expect(data.urgent).toEqual([]);
    expect(data.avgRisk).toBeNull();
    expect(data.highIdleDays).toBeNull();
    expect(data.stages.map((s) => s.total)).toEqual([0, 0, 0, 0]);
  });
});
