"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

interface DaylightSetupBarProps {
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

export function DaylightSetupBar({
  isOnboarding,
  isDemoMode,
  crmConnected,
}: DaylightSetupBarProps) {
  const persisted = useSyncExternalStore(subscribe, readDismissed, () => false);
  const [localDismissed, setLocalDismissed] = useState(false);

  if (persisted || localDismissed) return null;
  if (!isOnboarding && !isDemoMode) return null;

  const message = isDemoMode
    ? !crmConnected
      ? "Demo mode. Showing sample data."
      : "Sample data. Connect a real source to replace it."
    : "Finish setup to activate live signals.";

  return (
    <div
      role="status"
      className="flex items-center"
      style={{
        gap: 10,
        minHeight: 40,
        padding: "6px var(--dl-gutter)",
        background: "var(--dl-tint)",
        borderBottom: "1px solid var(--dl-divider)",
        fontSize: 13,
        color: "var(--dl-text-2)",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 7,
          height: 7,
          flexShrink: 0,
          borderRadius: "50%",
          background: "var(--dl-amber)",
        }}
      />
      <span
        style={{
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
        href="/settings?tab=integrations"
        className="dl-link"
        style={{
          flexShrink: 0,
          fontWeight: 600,
          color: "var(--dl-signal-d)",
          whiteSpace: "nowrap",
        }}
      >
        {!crmConnected ? "Connect CRM" : "Finish setup"}
      </Link>
      <button
        type="button"
        aria-label="Dismiss onboarding bar"
        className="dl-tap"
        onClick={() => {
          setLocalDismissed(true);
          try {
            window.sessionStorage.setItem(STORAGE_KEY, "1");
            window.dispatchEvent(
              new StorageEvent("storage", { key: STORAGE_KEY })
            );
          } catch {
          }
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 26,
          height: 26,
          flexShrink: 0,
          marginLeft: 4,
          border: 0,
          borderRadius: 7,
          background: "transparent",
          color: "var(--dl-muted)",
          cursor: "pointer",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width={14}
          height={14}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}
