import { describe, expect, it } from "vitest";
import {
  buildTimelineByDealId,
  computeDealRiskSnapshot,
} from "@/lib/deal-risk-enrichment";

describe("deal-risk-enrichment", () => {
  it("groups timeline events by deal id", () => {
    const grouped = buildTimelineByDealId([
      { dealId: "d1", eventType: "activity", createdAt: new Date(), metadata: null },
      { dealId: "d2", eventType: "activity", createdAt: new Date(), metadata: null },
      { dealId: "d1", eventType: "stage_changed", createdAt: new Date(), metadata: null },
    ]);

    expect(grouped.get("d1")?.length).toBe(2);
    expect(grouped.get("d2")?.length).toBe(1);
  });

  it("computes stable risk snapshot shape for a deal", () => {
    const snapshot = computeDealRiskSnapshot(
      {
        id: "d1",
        userId: "u1",
        stage: "Discovery",
        value: 5000,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      [
        {
          dealId: "d1",
          eventType: "activity",
          createdAt: new Date("2026-01-02T00:00:00.000Z"),
          metadata: { kind: "call" },
        },
      ]
    );

    expect(snapshot).toHaveProperty("riskScore");
    expect(snapshot).toHaveProperty("riskLevel");
    expect(snapshot).toHaveProperty("status");
    expect(snapshot).toHaveProperty("lastActivityAt");
    expect(snapshot).toHaveProperty("recommendedAction");
  });
});
