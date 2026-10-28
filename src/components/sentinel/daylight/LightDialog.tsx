"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { getFocusableElements, trapFocus } from "@/lib/a11y";

interface LightDialogProps {
  host: Element;
  kicker: string;
  title: ReactNode;
  sub?: ReactNode;
  maxWidth?: number;
  busy?: boolean;
  closeButton?: boolean;
  returnFocus?: HTMLElement | null;
  onSubmit?: () => void;
  onClose: () => void;
  children: ReactNode;
}

export function LightDialog({
  host,
  kicker,
  title,
  sub,
  maxWidth = 440,
  busy = false,
  closeButton = false,
  returnFocus,
  onSubmit,
  onClose,
  children,
}: LightDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (dialogRef.current) {
      const focusable = getFocusableElements(dialogRef.current);
      (focusable.find((el) => el.dataset.dialogClose === undefined) ?? focusable[0])?.focus();
    }
    return () => {
      if (returnFocus?.isConnected) returnFocus.focus();
    };
  }, [returnFocus]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!busy) onClose();
        return;
      }
      if (dialogRef.current && trapFocus(e, dialogRef.current)) {
        e.stopPropagation();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const head = (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div style={{ minWidth: 0 }}>
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
          {kicker}
        </div>
        <h2
          id={titleId}
          style={{
            marginTop: 8,
            fontFamily: "var(--dl-font-serif)",
            fontSize: 28,
            fontWeight: 400,
            lineHeight: 1.12,
            letterSpacing: "-0.015em",
            overflowWrap: "anywhere",
          }}
        >
          {title}
        </h2>
        {sub && (
          <p style={{ marginTop: 4, fontSize: 13, color: "var(--dl-muted)" }}>{sub}</p>
        )}
      </div>
      {closeButton && (
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          aria-label="Close"
          data-dialog-close=""
          className="dl-quiet-btn"
        >
          <svg
            viewBox="0 0 24 24"
            width={16}
            height={16}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
    </div>
  );

  return createPortal(
    <div
      className="dl-scrim"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(20, 23, 26, 0.34)",
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="dl-dialog"
        style={{
          width: "100%",
          maxWidth,
          maxHeight: "calc(100vh - 32px)",
          overflowY: "auto",
          padding: "22px 24px 20px",
          borderRadius: 14,
          background: "var(--dl-panel)",
          border: "1px solid var(--dl-border)",
          boxShadow:
            "0 24px 60px -20px rgba(16, 24, 40, 0.45), 0 2px 6px rgba(16, 24, 40, 0.08)",
          color: "var(--dl-ink)",
        }}
      >
        {onSubmit ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            {head}
            {children}
          </form>
        ) : (
          <>
            {head}
            {children}
          </>
        )}
      </div>
    </div>,
    host
  );
}
