import { describe, it, expect } from "vitest";
import { getMetricsSummary, incrementMetric } from "@/lib/business-metrics";

describe("business-metrics", () => {
  it("getMetricsSummary does not throw", async () => {
    const summary = await getMetricsSummary();
    expect(summary).toEqual({
      dealCreated: expect.any(Number),
      dealExported: expect.any(Number),
      apiCalls: expect.any(Number),
      insightsOpened: expect.any(Number),
    });
  });

  it("incrementMetric does not throw", async () => {
    await expect(incrementMetric("test_metric", 1)).resolves.toBeUndefined();
  });
});
