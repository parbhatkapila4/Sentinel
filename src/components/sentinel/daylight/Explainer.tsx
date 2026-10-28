"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface ExplainerStep {
  label: string;
  body: string;
}

interface ExplainerProps {
  title: string;
  subtitle?: string;
  steps: ExplainerStep[];
}

const POPOVER_WIDTH = 340;

interface Anchor {
  top: number;
  right: number;
  host: Element;
}

export function Explainer({ title, subtitle, steps }: ExplainerProps) {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const open = anchor !== null;

  const toggle = () => {
    if (open) {
      setAnchor(null);
      return;
    }
    const button = buttonRef.current;
    const host = button?.closest(".sentinel-daylight");
    if (!button || !host) return;
    const rect = button.getBoundingClientRect();
    setAnchor({
      top: rect.bottom + 10,
      right: Math.max(16, window.innerWidth - rect.right),
      host,
    });
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setAnchor(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`How ${title.toLowerCase()} is calculated`}
        aria-expanded={open}
        onClick={toggle}
        className="dl-icon-btn dl-tap"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          flexShrink: 0,
          padding: 0,
          borderRadius: "50%",
          background: "var(--dl-panel)",
          border: `1px solid ${open ? "var(--dl-context)" : "var(--dl-border-strong)"}`,
          fontFamily: "var(--dl-font-serif)",
          fontStyle: "italic",
          fontSize: 14,
          lineHeight: 1,
          color: "var(--dl-muted)",
          cursor: "pointer",
        }}
      >
        i
      </button>
      {anchor &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label={`${title}: how this is calculated`}
            style={{
              position: "fixed",
              top: anchor.top,
              right: anchor.right,
              zIndex: 60,
              width: POPOVER_WIDTH,
              maxWidth: "calc(100vw - 32px)",
              maxHeight: `calc(100vh - ${Math.round(anchor.top) + 16}px)`,
              overflowY: "auto",
              padding: "16px 18px 18px",
              borderRadius: 12,
              background: "var(--dl-panel)",
              border: "1px solid var(--dl-border)",
              boxShadow: "var(--dl-shadow-pop)",
              color: "var(--dl-ink)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--dl-font-mono)",
                fontSize: 10.5,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--dl-signal-d)",
              }}
            >
              How this is calculated
            </div>
            <h3
              style={{
                marginTop: 6,
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </h3>
            {subtitle && (
              <p
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "var(--dl-muted)",
                }}
              >
                {subtitle}
              </p>
            )}
            <ol style={{ marginTop: 12 }}>
              {steps.map((step, i) => (
                <li
                  key={`${step.label}-${i}`}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "10px 0",
                    borderTop: "1px solid var(--dl-row)",
                  }}
                >
                  <span
                    style={{
                      paddingTop: 2,
                      fontFamily: "var(--dl-font-mono)",
                      fontSize: 11,
                      color: "var(--dl-muted)",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {step.label}
                    </div>
                    <div
                      style={{
                        marginTop: 2,
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: "var(--dl-text-2)",
                      }}
                    >
                      {step.body}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>,
          anchor.host
        )}
    </>
  );
}
