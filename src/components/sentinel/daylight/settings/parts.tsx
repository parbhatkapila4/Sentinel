"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  dangerButtonStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  smallButtonStyle,
} from "../blocks";

export const rowLabelStyle: CSSProperties = {
  display: "block",
  fontSize: 14,
  fontWeight: 500,
};

export const rowSubStyle: CSSProperties = {
  display: "block",
  marginTop: 2,
  fontSize: 12.5,
  lineHeight: 1.45,
  color: "var(--dl-muted)",
};

export function SettingsSection({
  id,
  title,
  sub,
  danger = false,
  children,
}: {
  id: string;
  title: string;
  sub: ReactNode;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="dl-st-sec">
      <div style={{ padding: "22px var(--dl-gutter) 12px" }}>
        <h2
          id={`${id}-title`}
          style={{
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: danger ? "var(--dl-signal-d)" : undefined,
          }}
        >
          {title}
        </h2>
        <p style={{ marginTop: 2, fontSize: 13, color: "var(--dl-muted)" }}>{sub}</p>
      </div>
      {children}
    </section>
  );
}

export function Row({
  label,
  htmlFor,
  sub,
  inline = false,
  end = false,
  children,
}: {
  label: ReactNode;
  htmlFor?: string;
  sub?: ReactNode;
  inline?: boolean;
  end?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={inline ? "dl-st-row dl-st-inline" : "dl-st-row"}>
      <div style={{ minWidth: 0 }}>
        {htmlFor ? (
          <label htmlFor={htmlFor} style={rowLabelStyle}>
            {label}
          </label>
        ) : (
          <span style={rowLabelStyle}>{label}</span>
        )}
        {sub && <small style={rowSubStyle}>{sub}</small>}
      </div>
      <div className={inline || end ? "dl-st-ctl dl-st-end" : "dl-st-ctl"}>{children}</div>
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="dl-switch"
    />
  );
}

type ButtonTone = "primary" | "secondary" | "danger";

export function ActionButton({
  tone = "secondary",
  onClick,
  disabled,
  busy,
  children,
  label,
}: {
  tone?: ButtonTone;
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  children: ReactNode;
  label?: string;
}) {
  const base =
    tone === "primary" ? primaryButtonStyle : tone === "danger" ? dangerButtonStyle : secondaryButtonStyle;
  const off = disabled || busy;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={off}
      aria-busy={busy || undefined}
      aria-label={label}
      className={tone === "primary" ? "dl-btn-primary" : "dl-btn-secondary"}
      style={{
        ...base,
        ...smallButtonStyle,
        opacity: off ? 0.55 : 1,
        cursor: off ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

export function SaveRow({
  dirty,
  saving,
  saveDisabled,
  onSave,
  onDiscard,
}: {
  dirty: boolean;
  saving: boolean;
  saveDisabled?: boolean;
  onSave: () => void;
  onDiscard: () => void;
}) {
  if (!dirty && !saving) return null;
  return (
    <div
      className="dl-st-row dl-st-inline"
      style={{ background: "var(--dl-tint)" }}
      role="status"
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          fontWeight: 500,
          color: "var(--dl-amber-text)",
        }}
      >
        <span
          aria-hidden
          style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--dl-amber)" }}
        />
        {saving ? "Saving changes" : "Unsaved changes"}
      </span>
      <div className="dl-st-ctl dl-st-end">
        <ActionButton onClick={onDiscard} disabled={saving}>
          Discard
        </ActionButton>
        <ActionButton tone="primary" onClick={onSave} busy={saving} disabled={saveDisabled}>
          {saving ? "Saving" : "Save changes"}
        </ActionButton>
      </div>
    </div>
  );
}

export function StatusPill({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "good" | "warn";
  children: ReactNode;
}) {
  const colors: Record<string, CSSProperties> = {
    neutral: { background: "var(--dl-chip)", color: "var(--dl-text-2)" },
    good: { background: "var(--dl-green-tint)", color: "var(--dl-green-text)" },
    warn: { background: "var(--dl-amber-tint)", color: "var(--dl-amber-text)" },
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 20,
        padding: "0 7px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
        ...colors[tone],
      }}
    >
      {children}
    </span>
  );
}
