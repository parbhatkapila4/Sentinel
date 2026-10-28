import type { CSSProperties, ReactNode } from "react";
import { formatShortMoney } from "@/lib/format-money";
import { Money, SegmentMeter, SplitBar } from "../ui";

export interface DealsTotalsProps {
  dealCount: number;
  totalValue: number;
  wonValue: number;
  lostValue: number;
  activeValue: number;
  activeCount: number;
  atRiskValue: number;
  atRiskCount: number;
  newThisWeek: number;
  wonCount: number;
}

const labelStyle: CSSProperties = { fontSize: 13, color: "var(--dl-muted)" };

const valueStyle: CSSProperties = {
  marginTop: 4,
  lineHeight: 1.15,
  fontWeight: 600,
  letterSpacing: "-0.035em",
  fontVariantNumeric: "tabular-nums",
};

const captionStyle: CSSProperties = { fontSize: 12.5, color: "var(--dl-muted)" };

function Cell({
  label,
  value,
  children,
  noteGap = 11,
}: {
  label: string;
  value: ReactNode;
  children: ReactNode;
  noteGap?: number;
}) {
  return (
    <div className="dl-kpi">
      <div style={labelStyle}>{label}</div>
      <div className="dl-kpi-value" style={valueStyle}>
        {value}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "6px 10px",
          marginTop: noteGap,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function PipelineSplit({
  open,
  won,
  lost,
}: {
  open: number;
  won: number;
  lost: number;
}) {
  return (
    <SplitBar
      emptyLabel="Nothing on the book"
      parts={[
        { key: "open", value: open, color: "var(--dl-ink)", label: `${formatShortMoney(open)} open` },
        { key: "won", value: won, color: "var(--dl-green)", label: `${formatShortMoney(won)} won` },
        { key: "lost", value: lost, color: "var(--dl-context)", label: `${formatShortMoney(lost)} lost` },
      ]}
    />
  );
}

function plural(count: number, noun: string): string {
  return `${count.toLocaleString("en-US")} ${noun}${count === 1 ? "" : "s"}`;
}

export function DealsTotals(props: DealsTotalsProps) {
  const openValue = Math.max(
    0,
    props.totalValue - props.wonValue - props.lostValue
  );
  const atRiskShare =
    props.dealCount > 0
      ? Math.round((props.atRiskCount / props.dealCount) * 100)
      : 0;

  return (
    <section aria-label="Totals" className="dl-grid">
      <Cell label="Pipeline" value={<Money value={props.totalValue} />}>
        <PipelineSplit
          open={openValue}
          won={props.wonValue}
          lost={props.lostValue}
        />
        <span style={captionStyle}>
          {plural(props.dealCount, "deal")} on the book
        </span>
      </Cell>
      <Cell label="Active" value={<Money value={props.activeValue} />}>
        <SegmentMeter
          filled={props.activeCount}
          total={props.dealCount}
          color="var(--dl-ink)"
          label={`${props.activeCount} of ${plural(props.dealCount, "deal")} in motion`}
        />
        <span style={captionStyle}>
          {props.activeCount.toLocaleString("en-US")} in motion
        </span>
      </Cell>
      <Cell label="At risk" value={<Money value={props.atRiskValue} />}>
        <SegmentMeter
          filled={props.atRiskCount}
          total={props.dealCount}
          color="var(--dl-signal)"
          label={`${props.atRiskCount} of ${plural(props.dealCount, "deal")} flagged`}
        />
        <span style={captionStyle}>
          {props.atRiskCount > 0
            ? `${props.atRiskCount.toLocaleString("en-US")} flagged · ${atRiskShare}%`
            : "No flags"}
        </span>
      </Cell>
      <Cell
        label="New this week"
        value={props.newThisWeek.toLocaleString("en-US")}
        noteGap={7}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: 22,
            padding: "0 8px",
            borderRadius: 6,
            background: "var(--dl-chip)",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--dl-text-2)",
          }}
        >
          Last 7 days
        </span>
        <span style={captionStyle}>
          {props.wonCount.toLocaleString("en-US")} won this book
        </span>
      </Cell>
    </section>
  );
}
