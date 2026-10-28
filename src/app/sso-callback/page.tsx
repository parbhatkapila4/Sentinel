"use client";

import { AuthenticateWithRedirectCallback, useUser } from "@clerk/nextjs";
import { useEffect, useState, type ComponentType } from "react";
import { findRouteSkeleton } from "@/components/route-skeletons";

export default function SSOCallbackPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [showFallback, setShowFallback] = useState(false);
  const [Skeleton, setSkeleton] = useState<ComponentType | null>(null);

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

  useEffect(() => {
    let cancelled = false;
    let pathname = "/dashboard";
    try {
      pathname = new URL(destination, window.location.origin).pathname;
    } catch {
    }
    findRouteSkeleton(pathname)
      ?.load()
      .then((mod) => {
        if (!cancelled) setSkeleton(() => mod.default);
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, [destination]);

  return (
    <div style={{ minHeight: "100vh", background: "#000" }}>
      <span className="sr-only" role="status">
        Signing you in
      </span>
      {Skeleton ? <Skeleton /> : null}

      {showFallback ? (
        <a
          href={destination}
          style={{
            position: "fixed",
            left: "50%",
            bottom: 32,
            zIndex: 60,
            transform: "translateX(-50%)",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#fff",
            background: "#000",
            border: "1px solid rgba(255,255,255,0.25)",
            padding: "8px 16px",
            textDecoration: "none",
            transition: "border-color 0.15s, background 0.15s",
          }}
        >
          Continue manually
        </a>
      ) : null}

      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl={destination}
        signUpFallbackRedirectUrl={destination}
      />
    </div>
  );
}
