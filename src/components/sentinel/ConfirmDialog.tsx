"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: string;
  tone?: "danger" | "primary";
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  body,
  tone = "danger",
  confirmLabel = tone === "danger" ? "Delete" : "Confirm",
  cancelLabel = "Cancel",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, busy, onCancel]);

  if (!open || !mounted || typeof document === "undefined") return null;

  const toneColor = tone === "danger" ? "var(--wine)" : "var(--signal)";
  const toneTint =
    tone === "danger" ? "rgba(119, 47, 47, 0.10)" : "rgba(200, 71, 46, 0.10)";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-body"
      onClick={() => {
        if (!busy) onCancel();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(6, 6, 6, 0.82)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 460,
          background: "var(--ink)",
          border: "1px solid var(--rule-strong)",
          padding: "26px 28px 22px",
          boxShadow: "0 32px 64px -16px rgba(0, 0, 0, 0.85)",
          borderTopColor: toneColor,
          borderTopWidth: 2,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: toneColor,
            marginBottom: 10,
          }}
        >
          {tone === "danger" ? "§ Confirm · Irreversible" : "§ Confirm"}
        </div>
        <h2
          id="confirm-dialog-title"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 24,
            fontWeight: 400,
            letterSpacing: "-0.02em",
            color: "var(--cream)",
            margin: 0,
          }}
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-body"
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 15,
            lineHeight: 1.55,
            color: "var(--cream-2)",
            margin: "10px 0 22px",
          }}
        >
          {body}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            paddingTop: 16,
            borderTop: "1px solid var(--rule)",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "9px 16px",
              border: "1px solid var(--rule-strong)",
              background: "transparent",
              color: "var(--cream-2)",
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.55 : 1,
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={busy}
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "9px 18px",
              border: `1px solid ${toneColor}`,
              background: busy ? toneTint : toneColor,
              color: busy ? toneColor : "var(--ink)",
              cursor: busy ? "wait" : "pointer",
              fontWeight: 600,
              transition: "background 120ms ease, color 120ms ease",
            }}
          >
            {busy ? `${confirmLabel}…` : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
