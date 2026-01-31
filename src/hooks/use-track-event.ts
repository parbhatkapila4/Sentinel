"use client";

import { useCallback } from "react";
import {
  trackEvent,
  type AnalyticsEventName,
  type AnalyticsPropertyValue,
} from "@/lib/analytics-client";

export function useTrackEvent(): (
  eventName: AnalyticsEventName | string,
  properties?: Record<string, AnalyticsPropertyValue>
) => void {
  return useCallback((eventName: string, properties?: Record<string, AnalyticsPropertyValue>) => {
    trackEvent(eventName, properties);
  }, []);
}
