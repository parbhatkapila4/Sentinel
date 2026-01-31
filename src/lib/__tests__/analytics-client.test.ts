import { describe, it, expect } from "vitest";
import {
  trackPageView,
  trackEvent,
  ANALYTICS_EVENTS,
  type AnalyticsPropertyValue,
} from "@/lib/analytics-client";

describe("analytics-client", () => {
  it("trackPageView does not throw", () => {
    expect(() => trackPageView("/dashboard")).not.toThrow();
  });

  it("trackEvent does not throw", () => {
    expect(() => trackEvent(ANALYTICS_EVENTS.DEAL_CREATED)).not.toThrow();
    expect(() =>
      trackEvent(ANALYTICS_EVENTS.DEAL_EXPORTED, { format: "csv" as AnalyticsPropertyValue })
    ).not.toThrow();
  });

  it("ANALYTICS_EVENTS has expected keys", () => {
    expect(ANALYTICS_EVENTS.PAGE_VIEW).toBe("page_view");
    expect(ANALYTICS_EVENTS.DEAL_CREATED).toBe("deal_created");
    expect(ANALYTICS_EVENTS.DEAL_EXPORTED).toBe("deal_exported");
    expect(ANALYTICS_EVENTS.INSIGHTS_OPENED).toBe("insights_opened");
  });
});
