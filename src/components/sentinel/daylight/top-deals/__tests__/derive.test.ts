import { describe, expect, it } from "vitest";
import { NOW, bookDeal, sampleBook } from "../../__tests__/sample-book";
import {
  deriveTopDeals,
  fractionWords,
  headroomLabel,
  topThreeSub,
} from "../derive";

describe("deriveTopDeals on the mockup book", () => {
  const data = deriveTopDeals(sampleBook(), NOW);

  it("ranks every deal by value, closed ones included", () => {
    expect(data.standings.map((r) => r.name).slice(0, 4)).toEqual([
      "Keystone Energy",
      "Meridian Health",
      "Quantum Industries",
      "Harbor Bank",
    ]);
    expect(data.standings).toHaveLength(20);
    expect(data.standings[7]).toMatchObject({ name: "Atlas Biotech", closed: "lost" });
  });

  it("totals the book and the top ten", () => {
    expect(data.totalValue).toBe(2_620_000);
    expect(data.openValue).toBe(2_114_000);
    expect(data.wonValue).toBe(318_000);
    expect(data.lostValue).toBe(188_000);
    expect(data.openCount).toBe(15);
    expect(data.topValue).toBe(2_041_000);
    expect(data.topSharePct.toFixed(1)).toBe("77.9");
    expect(data.highest).toMatchObject({ name: "Keystone Energy", value: 410_000 });
    expect(data.highest?.sharePct.toFixed(1)).toBe("15.6");
  });

  it("finds the high-risk deals in the top ten in rank order", () => {
    expect(data.topHighRisk.map((d) => d.name)).toEqual([
      "Meridian Health",
      "Quantum Industries",
      "Vertex Robotics",
    ]);
    expect(data.topHighRiskValue).toBe(745_000);
  });

  it("measures concentration", () => {
    expect(data.topThreeSharePct.toFixed(1)).toBe("37.0");
    expect(data.fifthCount).toBe(4);
    expect(data.fifthSharePct.toFixed(1)).toBe("45.4");
    expect(Math.round(data.topAverage)).toBe(204_100);
    expect(Math.round(data.restAverage ?? 0)).toBe(57_900);
    expect(headroomLabel(data.headroom)).toBe("3.5×");
  });

  it("counts actions and recent deals within the top ten only", () => {
    expect(data.topNeedingAction).toBe(7);
    expect(data.topRecent).toBe(3);
  });

  it("orders the top ten by stage along the pipeline", () => {
    expect(data.topByStage.map((s) => [s.label, s.count])).toEqual([
      ["Qualify", 3],
      ["Proposal", 2],
      ["Negotiation", 2],
      ["Closed won", 2],
      ["Closed lost", 1],
    ]);
  });

  it("lists the oldest open deals in the top ten", () => {
    expect(data.oldestOpen.map((d) => [d.name, d.ageDays])).toEqual([
      ["Meridian Health", 58],
      ["Vertex Robotics", 47],
      ["Quantum Industries", 34],
      ["Northwind Trading", 31],
    ]);
  });

  it("drops the next action from closed deals", () => {
    const apex = data.standings.find((r) => r.name === "Apex Ventures");
    expect(apex).toMatchObject({ action: null, overdueDays: null, tier: "won" });
    const meridian = data.standings.find((r) => r.name === "Meridian Health");
    expect(meridian).toMatchObject({ overdueDays: 1, tier: "high" });
  });
});

describe("deriveTopDeals edge cases", () => {
  it("handles an empty book", () => {
    const data = deriveTopDeals([], NOW);
    expect(data.highest).toBeNull();
    expect(data.topCount).toBe(0);
    expect(data.topSharePct).toBe(0);
    expect(data.restAverage).toBeNull();
    expect(data.headroom).toBeNull();
    expect(data.standings).toEqual([]);
  });

  it("has no rest when the book has ten deals or fewer", () => {
    const deals = [
      bookDeal({ id: "a", name: "Alpha", value: 50_000 }),
      bookDeal({ id: "b", name: "Beta", value: 20_000 }),
    ];
    const data = deriveTopDeals(deals, NOW);
    expect(data.topCount).toBe(2);
    expect(data.restAverage).toBeNull();
    expect(headroomLabel(data.headroom)).toBe("-");
    expect(data.fifthCount).toBe(1);
  });

  it("keeps unknown stages under their own label", () => {
    const data = deriveTopDeals(
      [bookDeal({ id: "a", name: "Alpha", stage: "Pilot" })],
      NOW
    );
    expect(data.topByStage).toEqual([
      { key: "pilot", label: "Pilot", count: 1, closed: null },
    ]);
  });
});

describe("concentration wording", () => {
  it("names the share in words", () => {
    expect(fractionWords(37)).toBe("a third");
    expect(fractionWords(50)).toBe("half");
    expect(fractionWords(95)).toBe("nearly all");
    expect(topThreeSub(3, 37)).toBe("Three deals, a third of the book");
    expect(topThreeSub(1, 100)).toBe("One deal, nearly all of the book");
    expect(topThreeSub(0, 0)).toBe("Nothing on the book yet");
  });
});
