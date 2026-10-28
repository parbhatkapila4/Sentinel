"use client";

import { useState, type ReactNode } from "react";
import { LightDialog } from "./LightDialog";

interface ConfirmDialogProps {
  host: Element;
  kicker: string;
  title: ReactNode;
  body: string;
  confirmLabel: string;
  busyLabel: string;
  requireText?: string;
  busy: boolean;
  error?: string | null;
  returnFocus?: HTMLElement | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  host,
  kicker,
  title,
  body,
  confirmLabel,
  busyLabel,
  requireText,
  busy,
  error,
  returnFocus,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState("");
  const blocked = busy || (requireText !== undefined && typed !== requireText);

  return (
    <LightDialog
      host={host}
      kicker={kicker}
      title={title}
      busy={busy}
      returnFocus={returnFocus}
      onSubmit={() => {
        if (!blocked) onConfirm();
      }}
      onClose={onCancel}
    >
      <p
        style={{
          marginTop: 10,
          fontSize: 14,
          lineHeight: 1.6,
          color: "var(--dl-text-2)",
        }}
      >
        {body}
      </p>
      {requireText !== undefined && (
        <label style={{ display: "block", marginTop: 16 }}>
          <span style={{ fontSize: 13, color: "var(--dl-muted)" }}>
            Type{" "}
            <strong style={{ fontWeight: 600, color: "var(--dl-ink)" }}>
              {requireText}
            </strong>{" "}
            to confirm
          </span>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={busy}
            placeholder={requireText}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="dl-field"
            style={{
              display: "block",
              width: "100%",
              height: 40,
              marginTop: 6,
              padding: "0 12px",
              borderRadius: 9,
              background: "var(--dl-panel)",
              border: "1px solid var(--dl-border-strong)",
              outline: 0,
              fontFamily: "var(--dl-font-mono)",
              fontSize: 13.5,
              letterSpacing: "0.06em",
              color: "var(--dl-ink)",
            }}
          />
        </label>
      )}
      {error && (
        <p
          role="alert"
          style={{
            marginTop: 12,
            fontSize: 13.5,
            fontWeight: 500,
            color: "var(--dl-signal-d)",
          }}
        >
          {error}
        </p>
      )}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "flex-end",
          gap: 8,
          marginTop: 20,
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="dl-btn-secondary"
          style={{
            height: 36,
            padding: "0 14px",
            borderRadius: 9,
            background: "var(--dl-panel)",
            border: "1px solid var(--dl-border-strong)",
            boxShadow: "var(--dl-shadow)",
            fontSize: 13.5,
            fontWeight: 500,
            color: "var(--dl-ink)",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={blocked}
          className="dl-btn-danger"
          style={{
            height: 36,
            padding: "0 14px",
            border: 0,
            borderRadius: 9,
            background: "var(--dl-signal-d)",
            boxShadow:
              "inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 1px 2px rgba(16, 24, 40, 0.25)",
            fontSize: 13.5,
            fontWeight: 500,
            color: "var(--dl-panel)",
            cursor: "pointer",
          }}
        >
          {busy ? busyLabel : confirmLabel}
        </button>
      </div>
    </LightDialog>
  );
}
