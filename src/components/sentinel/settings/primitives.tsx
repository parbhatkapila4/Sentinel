"use client";

import { forwardRef, useEffect, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export function Toggle({ checked, onChange, disabled, ariaLabel }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        width: 44,
        height: 22,
        background: checked ? "rgba(200, 71, 46, 0.18)" : "var(--ink-03)",
        border: `1px solid ${checked ? "var(--signal)" : "var(--rule-strong)"}`,
        borderRadius: 11,
        position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
        transition:
          "background-color 180ms ease, border-color 180ms ease",
        flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
        padding: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 24 : 2,
          width: 16,
          height: 16,
          background: checked ? "var(--signal)" : "var(--cream-3)",
          borderRadius: "50%",
          transition: "left 180ms ease, background-color 180ms ease",
          display: "block",
        }}
      />
    </button>
  );
}

interface PillProps {
  children: ReactNode;
  tone?: "ivy" | "warn" | "muted";
}

export function Pill({ children, tone = "ivy" }: PillProps) {
  const borderColor =
    tone === "warn"
      ? "var(--copper)"
      : tone === "muted"
        ? "var(--rule-strong)"
        : "var(--ivy)";
  const color =
    tone === "warn"
      ? "var(--copper)"
      : tone === "muted"
        ? "var(--cream-2)"
        : "var(--ivy)";
  return (
    <span
      style={{
        fontFamily: "var(--font-mono-jb)",
        fontSize: 9,
        letterSpacing: "0.14em",
        padding: "2px 6px",
        border: `1px solid ${borderColor}`,
        color,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

interface SettingRowProps {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  last?: boolean;
  titleStyle?: CSSProperties;
}

export function SettingRow({
  title,
  subtitle,
  children,
  last,
  titleStyle,
}: SettingRowProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        gap: 20,
        padding: "20px 0",
        borderBottom: last ? "none" : "1px solid var(--rule)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: 14.5,
            color: "var(--cream)",
            fontWeight: 500,
            letterSpacing: "-0.005em",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            ...titleStyle,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: 12.5,
              color: "var(--cream-2)",
              lineHeight: 1.5,
              maxWidth: 560,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      <div style={{ justifySelf: "end" }}>{children}</div>
    </div>
  );
}

export function SerifEm({ children }: { children: ReactNode }) {
  return (
    <em
      style={{
        fontFamily: "var(--font-serif)",
        fontStyle: "italic",
        fontSize: 13,
        color: "var(--cream)",
      }}
    >
      {children}
    </em>
  );
}

interface SectionHeaderProps {
  eyebrow: string;
  headline: ReactNode;
  deck?: ReactNode;
  rightLabel?: string;
  rightValue?: ReactNode;
  rightColor?: string;
  rightSlot?: ReactNode;
}

export function SectionHeader({
  eyebrow,
  headline,
  deck,
  rightLabel,
  rightValue,
  rightColor,
  rightSlot,
}: SectionHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 28,
        paddingBottom: 20,
        borderBottom: "1px solid var(--rule)",
        gap: 24,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--cream-3)",
            marginBottom: 10,
          }}
        >
          {eyebrow}
        </div>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 34,
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            color: "var(--cream)",
            marginBottom: 8,
          }}
        >
          {headline}
        </h2>
        {deck && (
          <p
            style={{
              fontSize: 13.5,
              color: "var(--cream-2)",
              maxWidth: 560,
              lineHeight: 1.55,
            }}
          >
            {deck}
          </p>
        )}
      </div>
      {rightSlot ? (
        <div style={{ paddingTop: 6 }}>{rightSlot}</div>
      ) : rightLabel ? (
        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--cream-3)",
            textAlign: "right",
            paddingTop: 26,
            whiteSpace: "nowrap",
          }}
        >
          {rightLabel}
          <br />
          <b style={{ color: rightColor ?? "var(--cream)", fontWeight: 500 }}>
            {rightValue}
          </b>
        </div>
      ) : null}
    </div>
  );
}

interface FieldProps {
  label: string;
  note?: ReactNode;
  children: ReactNode;
  foot?: ReactNode;
  full?: boolean;
}

export function Field({ label, note, children, foot, full }: FieldProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        gridColumn: full ? "1 / -1" : undefined,
      }}
    >
      <label
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--cream-3)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>{label}</span>
        {note && (
          <span
            style={{
              textTransform: "none",
              letterSpacing: 0,
              fontFamily: "var(--font-geist-sans)",
              fontSize: 11,
              color: "var(--cream-4)",
            }}
          >
            {note}
          </span>
        )}
      </label>
      {children}
      {foot && (
        <div
          style={{
            fontFamily: "var(--font-geist-sans)",
            fontSize: 11.5,
            color: "var(--cream-3)",
            lineHeight: 1.5,
          }}
        >
          {foot}
        </div>
      )}
    </div>
  );
}

const baseInputStyle: CSSProperties = {
  background: "var(--ink-02)",
  border: "1px solid var(--rule)",
  padding: "11px 14px",
  color: "var(--cream)",
  fontFamily: "var(--font-geist-sans)",
  fontSize: 14,
  letterSpacing: "-0.005em",
  outline: "none",
  transition: "border-color 140ms ease",
  width: "100%",
  borderRadius: 0,
};

export const EditorialInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function EditorialInput({ invalid, style, readOnly, ...rest }, ref) {
  return (
    <input
      ref={ref}
      className="sentinel-editorial-input"
      readOnly={readOnly}
      {...rest}
      style={{
        ...baseInputStyle,
        borderColor: invalid
          ? "var(--wine)"
          : baseInputStyle.border?.toString().split(" ").pop() ??
          "var(--rule)",
        color: readOnly ? "var(--cream-2)" : "var(--cream)",
        background: readOnly ? "var(--ink-03)" : "var(--ink-02)",
        cursor: readOnly ? "default" : "text",
        ...style,
      }}
    />
  );
});

export const EditorialSelect = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function EditorialSelect({ style, children, ...rest }, ref) {
  return (
    <select
      ref={ref}
      {...rest}
      style={{
        ...baseInputStyle,
        cursor: "pointer",
        appearance: "none",
        backgroundImage:
          'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%238A8271%22 stroke-width=%222%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22m19 9-7 7-7-7%22/%3E%3C/svg%3E")',
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        backgroundSize: "14px",
        paddingRight: 36,
        ...style,
      }}
    >
      {children}
    </select>
  );
});

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ghost" | "primary" | "danger";
  compact?: boolean;
}

export const EditorialButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function EditorialButton(
    { variant = "ghost", compact, children, style, disabled, ...rest },
    ref
  ) {
    const base: CSSProperties = {
      fontFamily: "var(--font-mono-jb)",
      fontSize: 10.5,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      padding: compact ? "7px 12px" : "9px 18px",
      cursor: disabled ? "not-allowed" : "pointer",
      border: "1px solid var(--rule-strong)",
      background: "transparent",
      color: "var(--cream-2)",
      transition: "all 140ms ease",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      whiteSpace: "nowrap",
      opacity: disabled ? 0.55 : 1,
      borderRadius: 0,
    };
    if (variant === "primary") {
      base.background = "var(--signal)";
      base.color = "var(--cream)";
      base.borderColor = "var(--signal)";
      base.fontWeight = 500;
    } else if (variant === "danger") {
      base.color = "var(--wine)";
      base.borderColor = "var(--wine)";
    }
    return (
      <button
        ref={ref}
        className={`sentinel-editorial-btn sentinel-editorial-btn--${variant}`}
        disabled={disabled}
        {...rest}
        style={{ ...base, ...style }}
      >
        {children}
      </button>
    );
  }
);

interface FormActionsProps {
  dirty: boolean;
  cleanLabel?: string;
  saving?: boolean;
  saveDisabled?: boolean;
  onSave: () => void;
  onDiscard?: () => void;
  saveLabel?: string;
}

export function FormActions({
  dirty,
  cleanLabel = "ALL SAVED",
  saving,
  saveDisabled,
  onSave,
  onDiscard,
  saveLabel = "Save changes",
}: FormActionsProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 20,
        borderTop: "1px solid var(--rule)",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10.5,
          letterSpacing: "0.1em",
          color: dirty ? "var(--copper)" : "var(--cream-3)",
          textTransform: "uppercase",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {dirty && (
          <span
            aria-hidden
            className="sentinel-dirty-dot"
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              background: "var(--copper)",
              borderRadius: "50%",
            }}
          />
        )}
        {dirty ? "UNSAVED CHANGES" : cleanLabel}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {onDiscard && (
          <EditorialButton
            type="button"
            onClick={onDiscard}
            disabled={!dirty || saving}
          >
            Discard
          </EditorialButton>
        )}
        <EditorialButton
          type="button"
          variant="primary"
          onClick={onSave}
          disabled={!dirty || saving || saveDisabled}
        >
          {saving ? "Saving…" : `${saveLabel} ⏎`}
        </EditorialButton>
      </div>
    </div>
  );
}

interface AvatarProps {
  initials: string;
  size?: number;
  variant?: "signal" | "a1" | "a2" | "a3" | "a4";
  imageUrl?: string | null;
}

const avatarGradients: Record<NonNullable<AvatarProps["variant"]>, string> = {
  signal: "linear-gradient(135deg, var(--signal) 0%, var(--copper) 100%)",
  a1: "linear-gradient(135deg, var(--signal), var(--copper))",
  a2: "linear-gradient(135deg, var(--ivy), var(--parchment))",
  a3: "linear-gradient(135deg, var(--copper), var(--wine))",
  a4: "linear-gradient(135deg, var(--parchment), var(--ivy))",
};

export function EditorialAvatar({
  initials,
  size = 44,
  variant = "signal",
  imageUrl,
}: AvatarProps) {
  const inkText = variant === "a2" || variant === "a4";
  if (imageUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          background: avatarGradients[variant],
          border: "1px solid var(--rule-strong)",
          overflow: "hidden",
          position: "relative",
          borderRadius: size >= 80 ? 0 : "50%",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>
    );
  }
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        background: avatarGradients[variant],
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--font-serif)",
        fontStyle: "italic",
        fontSize: Math.round(size * 0.42),
        color: inkText ? "var(--ink)" : "var(--cream)",
        border: "1px solid var(--rule-strong)",
        borderRadius: size >= 80 ? 0 : "50%",
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}
    >
      {initials}
    </div>
  );
}

interface EditorialModalProps {
  children: ReactNode;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  tone?: "wine";
}

export function EditorialModal({
  children,
  onClose,
  title,
  subtitle,
  tone,
}: EditorialModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20, 18, 16, 0.72)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 9999,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--ink-02)",
          border: `1px solid ${tone === "wine" ? "var(--wine)" : "var(--rule-strong)"}`,
          padding: 28,
          maxWidth: 520,
          width: "100%",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: -1,
            left: 24,
            width: 42,
            height: 2,
            background: tone === "wine" ? "var(--wine)" : "var(--signal)",
          }}
        />
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 30,
            fontStyle: "italic",
            color: "var(--cream)",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            marginBottom: 6,
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            style={{
              fontSize: 13,
              color: "var(--cream-2)",
              lineHeight: 1.5,
              marginBottom: 20,
              letterSpacing: "-0.005em",
            }}
          >
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}

export function ModalActions({ children }: { children: ReactNode }) {
  const style: CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
    paddingTop: 16,
    borderTop: "1px solid var(--rule)",
  };
  return <div style={style}>{children}</div>;
}
