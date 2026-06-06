"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

interface OnboardingBarProps {
  isOnboarding: boolean;
  isDemoMode: boolean;
  crmConnected: boolean;
}

const STORAGE_KEY = "sentinel-onboarding-dismissed";

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => { };
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function readDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function OnboardingBar({
  isOnboarding,
  isDemoMode,
  crmConnected,
}: OnboardingBarProps) {
  const persisted = useSyncExternalStore(
    subscribe,
    readDismissed,
    () => false
  );
  const [localDismissed, setLocalDismissed] = useState(false);

  if (persisted || localDismissed) return null;
  if (!isOnboarding && !isDemoMode) return null;

  const message = isDemoMode
    ? !crmConnected
      ? "DEMO MODE · SHOWING SAMPLE DATA"
      : "SAMPLE DATA · CONNECT A REAL SOURCE TO REPLACE"
    : "FINISH SETUP TO ACTIVATE LIVE SIGNALS";

  const ctaHref = "/settings?tab=integrations";
  const ctaLabel = !crmConnected ? "→ Connect CRM" : "→ Finish setup";

  return (
    <div
      className="flex items-center px-4 sm:px-8"
      style={{
        height: 28,
        background: "var(--ink-02)",
        borderBottom: "1px solid var(--rule)",
        gap: 12,
      }}
      role="status"
    >
      <span
        aria-hidden
        style={{
          width: 5,
          height: 5,
          background: "var(--copper)",
          borderRadius: "50%",
        }}
      />
      <span
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "var(--cream-3)",
          textTransform: "uppercase",
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {message}
      </span>
      <div className="flex-1" />
      <Link
        href={ctaHref}
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "var(--signal)",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {ctaLabel}
      </Link>
      <button
        type="button"
        aria-label="Dismiss onboarding bar"
        onClick={() => {
          setLocalDismissed(true);
          try {
            window.sessionStorage.setItem(STORAGE_KEY, "1");
            window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
          } catch {
          }
        }}
        style={{
          marginLeft: 14,
          color: "var(--cream-3)",
          background: "transparent",
          border: "none",
          fontSize: 12,
          cursor: "pointer",
          fontFamily: "var(--font-mono-jb)",
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
