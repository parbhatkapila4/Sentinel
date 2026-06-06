"use client";

import { useState } from "react";
import { Rail } from "./Rail";
import { Masthead } from "./Masthead";
import { Ticker } from "./Ticker";
import { OnboardingBar } from "./OnboardingBar";
import type { OnboardingState, TickerItem } from "../types";

interface SentinelShellProps {
  syncTime: string;
  coveragePercent: number;
  sourceLabels: string[];
  alertCount: number;
  tickerItems: TickerItem[];
  onboarding: OnboardingState;
  fullHeight?: boolean;
  children: React.ReactNode;
}

export function SentinelShell({
  syncTime,
  coveragePercent,
  sourceLabels,
  alertCount,
  tickerItems,
  onboarding,
  fullHeight = false,
  children,
}: SentinelShellProps) {
  const [, setCmdOpen] = useState(false);

  const rootHeightClass = fullHeight
    ? "flex h-screen overflow-hidden flex-col lg:flex-row"
    : "flex min-h-screen flex-col lg:flex-row";
  const mainClass = fullHeight
    ? "flex-1 min-w-0 min-h-0 overflow-hidden"
    : "flex-1 min-w-0";

  return (
    <div className="sentinel-shell">
      <div className="sentinel-grain" aria-hidden />
      <div className="sentinel-vignette" aria-hidden />

      <div className={rootHeightClass}>
        <Rail alertCount={alertCount} />

        <div className="flex-1 min-w-0 min-h-0 flex flex-col">
          <Masthead
            syncTime={syncTime}
            coveragePercent={coveragePercent}
            sourceLabels={sourceLabels}
            alertCount={alertCount}
            onOpenCommand={() => {
              setCmdOpen(true);
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("sentinel:open-command"));
              }
            }}
          />
          <Ticker items={tickerItems} />
          <OnboardingBar
            isOnboarding={onboarding.isOnboarding}
            isDemoMode={onboarding.isDemoMode}
            crmConnected={onboarding.crmConnected}
          />

          <main className={mainClass}>{children}</main>
        </div>
      </div>
    </div>
  );
}
