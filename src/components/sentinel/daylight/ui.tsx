import type { CSSProperties, ReactNode } from "react";
import {
  STAGE_STEP_COUNT,
  initials,
  segmentCounts,
  splitMoney,
  stageStep,
} from "./format";

export const cellTitleStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: "-0.01em",
};

export const cellSubStyle: CSSProperties = {
  fontSize: 13,
  color: "var(--dl-muted)",
};

export const tableHeadStyle: CSSProperties = {
  display: "grid",
  columnGap: 16,
  alignItems: "center",
  height: 34,
  padding: "0 var(--dl-gutter)",
  background: "var(--dl-tint)",
  borderTop: "1px solid var(--dl-divider)",
  borderBottom: "1px solid var(--dl-divider)",
  fontFamily: "var(--dl-font-mono)",
  fontSize: 10.5,
  fontWeight: 500,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: "var(--dl-muted)",
};

export const emptyStyle: CSSProperties = {
  padding: "28px var(--dl-gutter)",
  fontSize: 13.5,
  color: "var(--dl-muted)",
};

export function CountPill({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 20,
        padding: "0 7px",
        borderRadius: 6,
        background: "var(--dl-chip)",
        fontSize: 12,
        fontWeight: 600,
        color: "var(--dl-text-2)",
      }}
    >
      {children}
    </span>
  );
}

export function Chevron({
  size = 14,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ color }}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function Money({ value }: { value: number }) {
  const { sign, digits, unit } = splitMoney(value);
  const unitStyle: CSSProperties = { fontWeight: 500, color: "var(--dl-unit)" };
  return (
    <>
      {sign}
      <span style={unitStyle}>$</span>
      {digits}
      {unit && <span style={unitStyle}>{unit}</span>}
    </>
  );
}

export function Monogram({ name, label }: { name: string; label?: string }) {
  return (
    <span
      aria-hidden
      style={{
        display: "flex",
        flex: "0 0 32px",
        alignItems: "center",
        justifyContent: "center",
        height: 32,
        borderRadius: 9,
        background: "var(--dl-panel)",
        border: "1px solid var(--dl-border)",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.02em",
        color: "var(--dl-text-2)",
      }}
    >
      {label ?? initials(name)}
    </span>
  );
}

export function StageSteps({
  stage,
  marginTop = 6,
  segmentWidth = 18,
}: {
  stage: string;
  marginTop?: number;
  segmentWidth?: number;
}) {
  const step = stageStep(stage);
  if (step === null) return null;
  return (
    <div
      role="img"
      aria-label={`Stage ${step} of ${STAGE_STEP_COUNT}`}
      style={{ display: "flex", gap: 3, marginTop }}
    >
      {Array.from({ length: STAGE_STEP_COUNT }, (_, i) => (
        <span
          key={i}
          style={{
            width: segmentWidth,
            height: 3,
            borderRadius: 2,
            background: i < step ? "var(--dl-ink)" : "var(--dl-seg)",
          }}
        />
      ))}
    </div>
  );
}

interface SegmentMeterProps {
  filled: number;
  total: number;
  color: string;
  label: string;
  max?: number;
  segmentWidth?: number;
}

export function SegmentMeter({
  filled,
  total,
  color,
  label,
  max = 10,
  segmentWidth,
}: SegmentMeterProps) {
  const seg = segmentCounts(filled, total, max);
  const gap = 3;
  const width =
    segmentWidth ??
    Math.min(15, Math.floor((124 - (seg.count - 1) * gap) / seg.count));
  return (
    <div role="img" aria-label={label} style={{ display: "flex", gap }}>
      {Array.from({ length: seg.count }, (_, i) => (
        <span
          key={i}
          style={{
            width,
            height: 7,
            borderRadius: 2,
            background: i < seg.filled ? color : "var(--dl-seg)",
          }}
        />
      ))}
    </div>
  );
}

export interface SplitPart {
  key: string;
  value: number;
  color: string;
  label: string;
}

export function SplitBar({
  parts,
  emptyLabel,
  width = 124,
}: {
  parts: SplitPart[];
  emptyLabel: string;
  width?: number | string;
}) {
  const shown = parts.filter((p) => p.value > 0);
  const label =
    shown.length === 0 ? emptyLabel : shown.map((p) => p.label).join(", ");

  return (
    <div
      role="img"
      aria-label={label}
      title={label}
      style={{
        display: "flex",
        gap: 2,
        width,
        maxWidth: "100%",
        height: 7,
        borderRadius: 2,
        background: shown.length === 0 ? "var(--dl-seg)" : undefined,
      }}
    >
      {shown.map((p) => (
        <span
          key={p.key}
          style={{
            flex: `${p.value} 1 0px`,
            minWidth: 3,
            borderRadius: 2,
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}
