"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const STALE_ACTION_MARKERS = [
  "An unexpected response was received from the server",
  "Connection closed",
  "fetchServerAction",
] as const;

const TOAST_ID = "sentinel-stale-action";

function matchesStaleAction(value: unknown): boolean {
  if (!value) return false;
  const str =
    typeof value === "string"
      ? value
      : value instanceof Error
        ? `${value.message}\n${value.stack ?? ""}`
        : String(value);
  return (
    str.includes(STALE_ACTION_MARKERS[0]) &&
    (str.includes(STALE_ACTION_MARKERS[1]) ||
      str.includes(STALE_ACTION_MARKERS[2]))
  );
}

function showRecoveryToast() {
  toast.error("Page is out of sync with the server.", {
    id: TOAST_ID,
    description:
      "This usually means the app was just rebuilt or redeployed. Refresh to pick up the latest version.",
    duration: 10_000,
    action: {
      label: "Refresh",
      onClick: () => window.location.reload(),
    },
    actionButtonStyle: {
      backgroundColor: "var(--signal)",
      color: "var(--ink)",
      border: "1px solid var(--signal)",
      fontFamily: "var(--font-mono-jb)",
      fontSize: "10.5px",
      fontWeight: 600,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      padding: "6px 12px",
      borderRadius: 0,
      cursor: "pointer",
    },
  });
}

export function ServerActionErrorBoundary() {
  useEffect(() => {
    const onUnhandled = (event: PromiseRejectionEvent) => {
      if (matchesStaleAction(event.reason)) {
        event.preventDefault();
        showRecoveryToast();
      }
    };
    window.addEventListener("unhandledrejection", onUnhandled);

    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      if (args.some(matchesStaleAction)) {
        showRecoveryToast();
        return;
      }
      originalError.apply(console, args as Parameters<typeof console.error>);
    };

    return () => {
      window.removeEventListener("unhandledrejection", onUnhandled);
      console.error = originalError;
    };
  }, []);

  return null;
}
