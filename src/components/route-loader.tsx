"use client";

import { useEffect, useMemo, useState } from "react";

export function RouteLoader() {
  const [visible, setVisible] = useState(true);
  const [allowInteraction, setAllowInteraction] = useState(false);

  const mountedAt = useMemo(() => Date.now(), []);

  useEffect(() => {
    const allowInteractionAfterMs = 2500;
    const hideAfterMs = 8000;

    const allowT = window.setTimeout(() => setAllowInteraction(true), allowInteractionAfterMs);
    const hideT = window.setTimeout(() => setVisible(false), hideAfterMs);

    const onPageShow = () => setVisible(false);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.clearTimeout(allowT);
      window.clearTimeout(hideT);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Loading"
      className="sentinel-shell sentinel-grain sentinel-vignette"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--ink)",
        color: "var(--cream)",
        opacity: allowInteraction ? 0 : 1,
        pointerEvents: allowInteraction ? "none" : "auto",
        transition: "opacity 320ms ease",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          padding: 32,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--cream-3)",
          }}
        >
          Sentinel<span style={{ color: "var(--signal)" }}> · </span>loading
        </span>

        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 54,
            fontWeight: 400,
            lineHeight: 0.95,
            letterSpacing: "-0.035em",
            color: "var(--cream)",
            margin: 0,
            textAlign: "center",
          }}
        >
          Opening the{" "}
          <em
            style={{
              fontStyle: "italic",
              color: "var(--signal)",
              fontFamily: "var(--font-serif)",
            }}
          >
            desk.
          </em>
        </h1>

        <div
          aria-hidden
          style={{
            position: "relative",
            height: 2,
            width: 220,
            background: "var(--rule)",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: 0,
              width: "35%",
              background: "var(--signal)",
              animation: "sentinel-route-slide 1.4s ease-in-out infinite",
            }}
          />
        </div>

        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--cream-3)",
          }}
        >
          Fetching the book…{" "}
          <span style={{ letterSpacing: "0.12em" }}>
            ({Math.max(0, Math.floor((Date.now() - mountedAt) / 1000))}s)
          </span>
        </div>
      </div>

      <style>{`
        @keyframes sentinel-route-slide {
          0%   { transform: translateX(-120%); }
          50%  { transform: translateX(220%); }
          100% { transform: translateX(-120%); }
        }
      `}</style>
    </div>
  );
}
