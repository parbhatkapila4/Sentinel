"use client";

import { useEffect, useRef, useState } from "react";

export interface MetricExplainerStep {
  label: string;
  body: string;
  formula?: string;
}

interface MetricExplainerProps {
  title: string;
  subtitle?: string;
  steps: MetricExplainerStep[];
  footnote?: string;
  side?: "left" | "right";
}

export function MetricExplainer({
  title,
  subtitle,
  steps,
  footnote,
  side = "right",
}: MetricExplainerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClickOutside = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  return (
    <span ref={rootRef} className="sentinel-metric-explainer" style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        aria-label={`How is ${title} calculated`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: `1px solid ${open ? "var(--signal)" : "var(--rule-strong)"}`,
          background: "transparent",
          color: open ? "var(--signal)" : "var(--cream-3)",
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 11,
          lineHeight: 1,
          padding: 0,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: 6,
          marginBottom: -1,
          verticalAlign: "middle",
          transition: "color 120ms ease, border-color 120ms ease",
        }}
      >
        i
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={`${title} — how this is calculated`}
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            [side]: 0,
            zIndex: 60,
            width: 360,
            maxWidth: "calc(100vw - 32px)",
            background: "var(--ink)",
            border: "1px solid var(--rule-strong)",
            padding: "18px 18px 16px",
            boxShadow: "0 16px 32px -12px rgba(0, 0, 0, 0.65)",
            borderTopColor: "var(--signal)",
            borderTopWidth: 2,
            cursor: "default",
            textTransform: "none",
            letterSpacing: "normal",
            fontFamily: "var(--font-geist-sans)",
            fontSize: 14,
            fontStyle: "normal",
            color: "var(--cream-2)",
            textAlign: "left",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--signal)",
              marginBottom: 6,
            }}
          >
            How this is calculated
          </div>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 18,
              fontWeight: 400,
              color: "var(--cream)",
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 13,
                color: "var(--cream-3)",
                margin: "6px 0 14px",
                lineHeight: 1.5,
              }}
            >
              {subtitle}
            </p>
          )}
          <ol
            style={{
              listStyle: "none",
              padding: 0,
              margin: subtitle ? "0" : "14px 0 0",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {steps.map((step, idx) => (
              <li
                key={`${step.label}-${idx}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: 12,
                  alignItems: "baseline",
                }}
              >
                <span
                  className="tabular"
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 9.5,
                    letterSpacing: "0.14em",
                    color: "var(--cream-4)",
                    width: 16,
                  }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 9.5,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "var(--cream-3)",
                      marginBottom: 3,
                    }}
                  >
                    {step.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 13.5,
                      lineHeight: 1.55,
                      color: "var(--cream-2)",
                    }}
                  >
                    {step.body}
                  </div>
                  {step.formula && (
                    <div
                      style={{
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 11,
                        color: "var(--signal)",
                        marginTop: 6,
                        padding: "5px 8px",
                        background: "var(--ink-02)",
                        border: "1px solid var(--rule)",
                        display: "inline-block",
                      }}
                    >
                      {step.formula}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
          {footnote && (
            <div
              style={{
                marginTop: 16,
                paddingTop: 12,
                borderTop: "1px solid var(--rule)",
                fontFamily: "var(--font-mono-jb)",
                fontSize: 9.5,
                letterSpacing: "0.1em",
                color: "var(--cream-4)",
                lineHeight: 1.5,
              }}
            >
              {footnote}
            </div>
          )}
        </div>
      )}
    </span>
  );
}
