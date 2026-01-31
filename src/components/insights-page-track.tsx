"use client";

import { useEffect } from "react";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics-client";

export function InsightsPageTrack() {
  useEffect(() => {
    trackEvent(ANALYTICS_EVENTS.INSIGHTS_OPENED);
  }, []);
  return null;
}
