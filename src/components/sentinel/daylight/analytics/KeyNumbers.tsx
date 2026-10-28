import type { CSSProperties, ReactNode } from "react";
import { formatShortMoney } from "@/lib/format-money";
import { Money, SegmentMeter, SplitBar } from "../ui";
import {
  RANGE_DAYS,
  formatDelta,
  needsActionCaption,
  riskIndexTone,
  spreadCaption,
  spreadTicks,
  type AnalyticsRange,
  type AnalyticsTotals,
  type Delta,
  type RiskIndexTone,
} from "./model";

interface KeyNumbersProps {
  range: AnalyticsRange;
  totals: AnalyticsTotals;
}

const METER_WIDTH = 124;

const labelStyle: CSSProperties = { fontSize: 13, color: "var(--dl-muted)" };

const valueStyle: CSSProperties = {
  marginTop: 4,
  lineHeight: 1.15,
  fontWeight: 600,
  letterSpacing: "-0.035em",
};

const captionStyle: CSSProperties = { fontSize: 12.5, color: "var(--dl-muted)" };

const unitStyle: CSSProperties = { fontWeight: 500, color: "var(--dl-unit)" };

const RISK_FILL: Record<RiskIndexTone, string> = {
  calm: "var(--dl-ink)",
  watch: "var(--dl-amber)",
  high: "var(--dl-signal)",
};

function Tile({
  label,
  value,
  empty = false,
  visual,
  caption,
  chip = false,
}: {
  label: string;
  value: ReactNode;
  empty?: boolean;
  visual: ReactNode;
  caption: string;
  chip?: boolean;
}) {
  return (
    <div className="dl-kpi dl-kpi-6">
      <div style={labelStyle}>{label}</div>
      <div
        className="dl-kpi-value"
        style={{ ...valueStyle, color: empty ? "var(--dl-unit)" : undefined }}
      >
        {value}
      </div>
      <div style={{ display: "flex", marginTop: chip ? 4 : 11 }}>{visual}</div>
      <div style={{ ...captionStyle, marginTop: chip ? 1 : 7 }}>{caption}</div>
    </div>
  );
}

function DeltaChip({ delta }: { delta: Delta }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 20,
        padding: "0 7px",
        borderRadius: 6,
        background: delta.positive
          ? "var(--dl-green-tint)"
          : "var(--dl-signal-tint)",
        fontSize: 12,
        fontWeight: 600,
        fontVariantNumeric: "tabular-nums",
        color: delta.positive ? "var(--dl-green-text)" : "var(--dl-signal-d)",
      }}
    >
      {formatDelta(delta)}
    </span>
  );
}

function EmptyTrack() {
  return (
    <div
      aria-hidden
      style={{
        width: METER_WIDTH,
        maxWidth: "100%",
        height: 7,
        borderRadius: 2,
        background: "var(--dl-seg)",
      }}
    />
  );
}

function SpreadStrip({
  values,
  average,
  max,
}: {
  values: number[];
  average: number;
  max: number;
}) {
  const ticks = spreadTicks(values);
  const mark = max > 0 ? Math.min(100, (average / max) * 100) : 0;
  return (
    <div
      role="img"
      aria-label="Each tick is one deal by value; the dark mark is the average"
      title="Each tick is one deal by value; the dark mark is the average"
      style={{
        position: "relative",
        width: METER_WIDTH,
        maxWidth: "100%",
        height: 7,
        borderRadius: 2,
        background: "var(--dl-track)",
      }}
    >
      {ticks.map((left, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: 0,
            left: `min(${left}%, calc(100% - 2px))`,
            width: 2,
            height: 7,
            background: "rgba(20, 23, 26, 0.34)",
          }}
        />
      ))}
      <span
        style={{
          position: "absolute",
          top: -3,
          left: `min(${mark}%, calc(100% - 3px))`,
          width: 3,
          height: 13,
          borderRadius: 1,
          background: "var(--dl-ink)",
        }}
      />
    </div>
  );
}

function LevelMeter({
  percent,
  color,
  label,
}: {
  percent: number;
  color: string;
  label: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      style={{
        width: METER_WIDTH,
        maxWidth: "100%",
        height: 7,
        borderRadius: 2,
        background: "var(--dl-track)",
      }}
    >
      <div
        style={{
          width: `${Math.max(0, Math.min(100, percent))}%`,
          height: "100%",
          borderRadius: 2,
          background: color,
        }}
      />
    </div>
  );
}

function plural(count: number, noun: string): string {
  return `${count.toLocaleString("en-US")} ${noun}${count === 1 ? "" : "s"}`;
}

export function KeyNumbers({ range, totals }: KeyNumbersProps) {
  const days = RANGE_DAYS[range];
  const versus = days === null ? "" : `vs the ${days} days before`;
  const none = totals.deals === 0;
  const closed = totals.won + totals.lost;
  const winRate = closed > 0 ? Math.round((totals.won / closed) * 100) : null;
  const riskPercent = Math.round(totals.riskIndex * 100);
  const riskTone = riskIndexTone(totals.riskIndex);
  const openValue = Math.max(
    0,
    totals.value - totals.wonValue - totals.lostValue
  );

  return (
    <section aria-label="Key numbers" className="dl-grid">
      {totals.pipelineDelta ? (
        <Tile
          label="Pipeline"
          value={<Money value={totals.value} />}
          empty={none}
          chip
          visual={<DeltaChip delta={totals.pipelineDelta} />}
          caption={versus}
        />
      ) : (
        <Tile
          label="Pipeline"
          value={<Money value={totals.value} />}
          empty={none}
          visual={
            <SplitBar
              emptyLabel="Nothing in range"
              width={METER_WIDTH}
              parts={[
                { key: "open", value: openValue, color: "var(--dl-ink)", label: `${formatShortMoney(openValue)} open` },
                { key: "won", value: totals.wonValue, color: "var(--dl-green)", label: `${formatShortMoney(totals.wonValue)} won` },
                { key: "lost", value: totals.lostValue, color: "var(--dl-context)", label: `${formatShortMoney(totals.lostValue)} lost` },
              ]}
            />
          }
          caption={`${plural(totals.deals, "deal")} in range`}
        />
      )}

      {totals.avgDealDelta ? (
        <Tile
          label="Average deal"
          value={<Money value={totals.avgDeal} />}
          empty={none}
          chip
          visual={<DeltaChip delta={totals.avgDealDelta} />}
          caption={versus}
        />
      ) : (
        <Tile
          label="Average deal"
          value={<Money value={totals.avgDeal} />}
          empty={none}
          visual={
            none ? (
              <EmptyTrack />
            ) : (
              <SpreadStrip
                values={totals.dealValues}
                average={totals.avgDeal}
                max={totals.maxDeal}
              />
            )
          }
          caption={spreadCaption(totals.deals, totals.minDeal, totals.maxDeal)}
        />
      )}

      <Tile
        label="Win rate"
        value={
          winRate === null ? (
            "n/a"
          ) : (
            <>
              {winRate}
              <span style={unitStyle}>%</span>
            </>
          )
        }
        empty={winRate === null}
        visual={
          <SplitBar
            emptyLabel="No closed deals"
            width={METER_WIDTH}
            parts={[
              { key: "won", value: totals.won, color: "var(--dl-green)", label: `${totals.won} won` },
              { key: "lost", value: totals.lost, color: "var(--dl-context)", label: `${totals.lost} lost` },
            ]}
          />
        }
        caption={
          closed > 0
            ? `${totals.won} won · ${totals.lost} lost`
            : "No closed deals yet"
        }
      />

      <Tile
        label="Active deals"
        value={totals.active.toLocaleString("en-US")}
        empty={none}
        visual={
          none ? (
            <EmptyTrack />
          ) : (
            <SegmentMeter
              filled={totals.active}
              total={totals.deals}
              color="var(--dl-ink)"
              label={`${totals.active} of ${plural(totals.deals, "deal")} active`}
            />
          )
        }
        caption={`${(totals.deals - totals.active).toLocaleString("en-US")} at risk or closed`}
      />

      <Tile
        label="Risk index"
        value={
          <>
            {riskPercent}
            <span style={unitStyle}>%</span>
          </>
        }
        empty={none}
        visual={
          none ? (
            <EmptyTrack />
          ) : (
            <LevelMeter
              percent={riskPercent}
              color={RISK_FILL[riskTone]}
              label={`Average risk score ${riskPercent} percent`}
            />
          )
        }
        caption={
          totals.flaggedHigh > 0
            ? `${totals.flaggedHigh.toLocaleString("en-US")} flagged high`
            : "None flagged high"
        }
      />

      <Tile
        label="Needs action"
        value={totals.needsAction.toLocaleString("en-US")}
        empty={totals.needsAction === 0}
        visual={
          none ? (
            <EmptyTrack />
          ) : (
            <SegmentMeter
              filled={totals.needsAction}
              total={totals.deals}
              color="var(--dl-signal)"
              label={`${totals.needsAction} of ${plural(totals.deals, "deal")} need action`}
            />
          )
        }
        caption={needsActionCaption(
          totals.actionHigh,
          totals.actionMedium,
          totals.actionLow
        )}
      />
    </section>
  );
}
