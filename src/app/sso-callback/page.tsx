"use client";

import { AuthenticateWithRedirectCallback, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function SSOCallbackPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [showFallback, setShowFallback] = useState(false);

  const destination =
    typeof window !== "undefined"
      ? new URL(window.location.href).searchParams.get("redirect_url") ||
      "/dashboard"
      : "/dashboard";

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.location.href = destination;
    }
  }, [isLoaded, isSignedIn, destination]);

  useEffect(() => {
    const t = window.setTimeout(() => setShowFallback(true), 6000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#000",
        color: "#888",
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontSize: 11,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <span>Signing you in…</span>

        {showFallback ? (
          <a
            href={destination}
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.25)",
              padding: "8px 16px",
              textDecoration: "none",
              transition: "border-color 0.15s, background 0.15s",
            }}
          >
            Continue manually →
          </a>
        ) : null}
      </div>

      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl={destination}
        signUpFallbackRedirectUrl={destination}
      />
    </div>
  );
}
