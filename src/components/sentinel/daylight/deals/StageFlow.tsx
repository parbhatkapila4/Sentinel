import type { CSSProperties } from "react";
import { formatShortMoney } from "@/lib/format-money";
import { StageSteps } from "../ui";
import {
  describeSegments,
  type SegmentKey,
  type StageCell,
} from "./model";

interface StageFlowProps {
  stages: StageCell[];
  inMotionValue: number;
}

const SEGMENT_COLOR: Record<SegmentKey, string> = {
  high: "var(--dl-signal)",
  medium: "var(--dl-amber)",
  healthy: "var(--dl-ink)",
  won: "var(--dl-green)",
  lost: "var(--dl-context)",
};

const LEGEND: Array<{ key: SegmentKey; label: string }> = [
  { key: "healthy", label: "Healthy" },
  { key: "medium", label: "Medium" },
  { key: "high", label: "High" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];

const monoNote: CSSProperties = {
  fontFamily: "var(--dl-font-mono)",
  fontSize: 11,
  color: "var(--dl-muted)",
  whiteSpace: "nowrap",
};

function ClosedMark({ bucket }: { bucket: "won" | "lost" }) {
  const won = bucket === "won";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        color: won ? "var(--dl-green-text)" : "var(--dl-muted)",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: won ? "var(--dl-green)" : "var(--dl-context)",
        }}
      />
      Closed
    </span>
  );
}

function sideNote(cell: StageCell, inMotionValue: number): string {
  if (cell.bucket === "open") {
    const share =
      inMotionValue > 0 ? Math.round((cell.value / inMotionValue) * 100) : 0;
    return `${share}%`;
  }
  if (cell.count > 0) return "this book";
  return cell.bucket === "won" ? "none yet" : "nothing lost";
}

function Cell({
  cell,
  inMotionValue,
  scale,
}: {
  cell: StageCell;
  inMotionValue: number;
  scale: number;
}) {
  const empty = cell.count === 0;
  const note = sideNote(cell, inMotionValue);
  const value = formatShortMoney(cell.value);

  return (
    <div className="dl-stage">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          height: 21,
        }}
      >
        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{cell.label}</span>
        {cell.bucket === "open" ? (
          <>
            <div className="dl-wide-only">
              <StageSteps stage={cell.stage} marginTop={0} segmentWidth={14} />
            </div>
            <span
              className="dl-narrow-only"
              style={{ fontSize: 12.5, color: "var(--dl-muted)" }}
            >
              {note}
            </span>
          </>
        ) : (
          <ClosedMark bucket={cell.bucket} />
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 7,
          marginTop: 6,
        }}
      >
        <span
          className="dl-stage-count"
          style={{
            lineHeight: 1.1,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            fontVariantNumeric: "tabular-nums",
            color: empty ? "var(--dl-unit)" : undefined,
          }}
        >
          {cell.count.toLocaleString("en-US")}
        </span>
        <span style={{ fontSize: 13, color: "var(--dl-muted)" }}>
          {cell.count === 1 ? "deal" : "deals"}
        </span>
        <span
          className="dl-narrow-only"
          style={{
            marginLeft: "auto",
            fontSize: 13,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
            color: empty ? "var(--dl-muted)" : undefined,
          }}
        >
          {value}
        </span>
      </div>
      <div
        className="dl-wide-only"
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 8,
          marginTop: 3,
          fontSize: 13,
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
            color: empty ? "var(--dl-muted)" : undefined,
          }}
        >
          {value}
        </span>
        <span style={{ color: "var(--dl-muted)" }}>{note}</span>
      </div>
      <div
        role="img"
        aria-label={describeSegments(cell.segments)}
        style={{
          display: "flex",
          gap: 2,
          height: 8,
          marginTop: 11,
          borderRadius: 2,
          background: "var(--dl-track)",
        }}
      >
        {cell.segments.map((segment, i) => (
          <span
            key={i}
            title={segment.title}
            style={{
              flex: `0 1 ${(segment.value / scale) * 100}%`,
              minWidth: 3,
              borderRadius: 2,
              background: SEGMENT_COLOR[segment.key],
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function StageFlow({ stages, inMotionValue }: StageFlowProps) {
  const scale = Math.max(1, ...stages.map((s) => s.value));
  const used = new Set(stages.flatMap((s) => s.segments.map((seg) => seg.key)));
  const legend = LEGEND.filter(
    (item) => item.key !== "lost" || used.has("lost")
  );

  return (
    <section aria-label="Stage flow">
      <div
        className="flex flex-wrap items-center"
        style={{
          gap: "4px 12px",
          minHeight: 38,
          padding: "8px var(--dl-gutter)",
          background: "var(--dl-tint)",
          borderBottom: "1px solid var(--dl-divider)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--dl-font-mono)",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--dl-signal-d)",
          }}
        >
          Stage flow
        </span>
        <span style={{ fontSize: 13.5, fontWeight: 500 }}>
          Where the book sits
          <span className="dl-wide-only">, deal by deal</span>
        </span>
        <div
          className="flex flex-wrap items-center"
          style={{
            gap: "4px 14px",
            marginLeft: "auto",
            fontSize: 12.5,
            color: "var(--dl-text-2)",
          }}
        >
          {legend.map((item) => (
            <span
              key={item.key}
              className="dl-wide-only"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: SEGMENT_COLOR[item.key],
                }}
              />
              {item.label}
            </span>
          ))}
          <span style={monoNote}>
            {formatShortMoney(inMotionValue)} in motion
          </span>
        </div>
      </div>
      <div className="dl-grid">
        {stages.map((cell) => (
          <Cell
            key={cell.stage}
            cell={cell}
            inMotionValue={inMotionValue}
            scale={scale}
          />
        ))}
      </div>
    </section>
  );
}
