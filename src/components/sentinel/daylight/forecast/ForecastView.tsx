import type { CSSProperties } from "react";
import { formatShortMoney } from "@/lib/format-money";
import {
  BookEmpty,
  CellHead,
  DataErrorBanner,
  HeroLink,
  KeyValue,
  KpiTile,
  Legend,
  PageHero,
  Percent,
  Pill,
  PlusIcon,
  RiskMark,
  Track,
  WideOnly,
  captionStyle,
  cellBodyStyle,
  ellipsisStyle,
  kpiLabelStyle,
  kpiValueStyle,
  metaTextStyle,
  subStyle,
  tableRowStyle,
  valueTextStyle,
  type HeroChip,
} from "../blocks";
import { daysLabel } from "../book";
import { Money, SplitBar, StageSteps, tableHeadStyle } from "../ui";
import {
  BEST_CASE_POINTS,
  WORST_CASE_POINTS,
  averageDays,
  idleText,
  scaleTicks,
  type ForecastData,
  type ForecastDeal,
  type ForecastStage,
} from "./derive";

export interface ForecastViewProps extends ForecastData {
  dataError: boolean;
}

const STAGE_COLUMNS = {
  "--cols":
    "minmax(0, 1.2fr) 64px minmax(0, 1.5fr) 96px 104px 84px 84px 96px",
  "--cols-n": "minmax(0, 1fr) auto auto",
  "--minw": "900px",
} as CSSProperties;

const SOURCE_COLORS = ["var(--dl-guide)", "var(--dl-ink)", "var(--dl-bar)", "#4A525C"];
const RANGE_BAND = "rgba(30, 41, 59, 0.26)";

const rightStyle: CSSProperties = { justifySelf: "end", textAlign: "right" };

function heroChip(props: ForecastViewProps): HeroChip {
  if (props.dataError) return { label: "Data unavailable", tone: "start" };
  if (props.dealCount === 0) return { label: "Getting started", tone: "start" };
  if (props.tierValue.high > 0) {
    return {
      label: `${formatShortMoney(props.tierValue.high)} sits in high-risk deals`,
      tone: "alert",
    };
  }
  if (props.openCount === 0) return { label: "Nothing open", tone: "neutral" };
  return { label: "No high-risk deals open", tone: "good" };
}

function heroClause(props: ForecastViewProps): string {
  if (props.dataError) return "it could not be read just now.";
  if (props.dealCount === 0) return "nothing on the book yet.";
  if (props.openCount === 0) return "nothing open to forecast.";
  return `${formatShortMoney(props.expected)} most likely, from ${formatShortMoney(props.openValue)} open.`;
}

function KeyNumbers(props: ForecastViewProps) {
  const empty = props.openCount === 0;
  const likelyShare = props.openValue > 0 ? (props.expected / props.openValue) * 100 : 0;
  const avgChance = props.totals.avgChance ?? 0;
  const closed = props.won + props.lost;
  return (
    <section aria-label="Key numbers" className="dl-grid">
      <KpiTile
        label="Open pipeline"
        empty={empty}
        value={<Money value={props.openValue} />}
        visual={
          <SplitBar
            emptyLabel="Nothing open"
            parts={[
              {
                key: "high",
                value: props.tierValue.high,
                color: "var(--dl-signal)",
                label: `High risk ${formatShortMoney(props.tierValue.high)}`,
              },
              {
                key: "medium",
                value: props.tierValue.medium,
                color: "var(--dl-amber)",
                label: `medium ${formatShortMoney(props.tierValue.medium)}`,
              },
              {
                key: "low",
                value: props.tierValue.low,
                color: "var(--dl-ink)",
                label: `low ${formatShortMoney(props.tierValue.low)}`,
              },
            ]}
          />
        }
        caption={`${props.openCount} open ${props.openCount === 1 ? "deal" : "deals"}`}
      />
      <KpiTile
        label="Most likely"
        empty={empty}
        value={<Money value={props.expected} />}
        visual={
          <Track
            percent={likelyShare}
            width={124}
            label={`${likelyShare.toFixed(1)}% of open value`}
          />
        }
        caption={`${likelyShare.toFixed(1)}% of open value`}
      />
      <KpiTile
        label="Average win chance"
        empty={empty}
        value={<Percent value={avgChance} />}
        visual={<Track percent={avgChance} width={124} label={`${avgChance.toFixed(0)}%`} />}
        caption={`across ${props.openCount} open ${props.openCount === 1 ? "deal" : "deals"}`}
      />
      <KpiTile
        label="Historical win rate"
        empty={props.dealCount === 0}
        value={<Percent value={props.baseRatePct} />}
        visual={
          <SplitBar
            emptyLabel="No closed deals yet"
            parts={[
              {
                key: "won",
                value: props.won,
                color: "var(--dl-green)",
                label: `${props.won} won`,
              },
              {
                key: "lost",
                value: props.lost,
                color: "var(--dl-bar)",
                label: `${props.lost} lost`,
              },
            ]}
          />
        }
        caption={
          closed > 0
            ? `${props.won} won · ${props.lost} lost, where every deal starts`
            : "No closed deals yet, so every deal starts at 50%"
        }
      />
    </section>
  );
}

function RangeFigure({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note: string;
}) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={kpiLabelStyle}>{label}</div>
      <div style={{ ...kpiValueStyle, fontSize: 26 }}>
        <Money value={value} />
      </div>
      <div style={{ ...captionStyle, marginTop: 2 }}>{note}</div>
    </div>
  );
}

const tickStyle: CSSProperties = {
  position: "absolute",
  top: 46,
  fontFamily: "var(--dl-font-mono)",
  fontSize: 11,
  color: "var(--dl-muted)",
  whiteSpace: "nowrap",
};

function RangeBand(props: ForecastViewProps) {
  const pos = (v: number) => Math.max(0, Math.min(100, (v / props.scaleMax) * 100));
  const ticks = scaleTicks(props.scaleMax);
  const worst = pos(props.worst);
  const best = pos(props.best);
  const likely = pos(props.expected);
  const all = pos(props.openValue);
  return (
    <div
      role="img"
      aria-label={`On a scale to ${formatShortMoney(props.scaleMax)}: worst ${formatShortMoney(props.worst)}, most likely ${formatShortMoney(props.expected)}, best ${formatShortMoney(props.best)}, all open deals ${formatShortMoney(props.openValue)}`}
      style={{ position: "relative", height: 64, marginTop: 22 }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 22,
          height: 10,
          borderRadius: 3,
          background: "var(--dl-track)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${worst}%`,
          width: `${Math.max(0, best - worst)}%`,
          top: 22,
          height: 10,
          borderRadius: 3,
          background: RANGE_BAND,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${likely}%`,
          top: 14,
          width: 3,
          height: 26,
          marginLeft: -1,
          borderRadius: 2,
          background: "var(--dl-ink)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${all}%`,
          top: 16,
          height: 22,
          borderLeft: "2px dashed var(--dl-guide)",
        }}
      />
      <span
        style={{
          ...metaTextStyle,
          position: "absolute",
          left: `${Math.min(all, 88)}%`,
          top: -4,
          transform: "translateX(-50%)",
          fontSize: 12,
          whiteSpace: "nowrap",
        }}
      >
        All open {formatShortMoney(props.openValue)}
      </span>
      {ticks.map((tick, i) => {
        const first = i === 0;
        const last = i === ticks.length - 1;
        return (
          <span
            key={tick}
            className={i % 2 === 1 && !last ? "dl-c-wide" : undefined}
            style={{
              ...tickStyle,
              left: last ? undefined : `${(i / (ticks.length - 1)) * 100}%`,
              right: last ? 0 : undefined,
              transform: first || last ? undefined : "translateX(-50%)",
            }}
          >
            {first ? "0" : formatShortMoney(tick)}
          </span>
        );
      })}
    </div>
  );
}

function ForecastRange(props: ForecastViewProps) {
  const sources = props.stages.filter((s) => s.weighted > 0);
  return (
    <section aria-label="Forecast range" className="dl-grid">
      <div className="dl-two-thirds">
        <CellHead
          title="Forecast range"
          sub="What open deals are likely to bring in"
          right={
            <Legend
              items={[
                { label: "Most likely", color: "var(--dl-ink)" },
                { label: "Worst to best", color: RANGE_BAND },
              ]}
            />
          }
        />
        <div style={{ padding: "2px var(--dl-gutter) 22px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 16,
            }}
          >
            <RangeFigure
              label="Worst case"
              value={props.worst}
              note={`each deal ${WORST_CASE_POINTS} points less likely`}
            />
            <RangeFigure
              label="Most likely"
              value={props.expected}
              note="every deal at its own chance"
            />
            <RangeFigure
              label="Best case"
              value={props.best}
              note={`each deal ${BEST_CASE_POINTS} points likelier`}
            />
          </div>
          <RangeBand {...props} />
          <div
            style={{
              marginTop: 22,
              paddingTop: 16,
              borderTop: "1px solid var(--dl-row)",
            }}
          >
            <div style={kpiLabelStyle}>
              Where the {formatShortMoney(props.expected)} comes from
            </div>
            <div style={{ display: "flex", marginTop: 10 }}>
              <SplitBar
                width="100%"
                emptyLabel="Nothing open"
                parts={sources.map((s, i) => ({
                  key: s.key,
                  value: s.weighted,
                  color: SOURCE_COLORS[i % SOURCE_COLORS.length],
                  label: `${s.label} ${formatShortMoney(s.weighted)}`,
                }))}
              />
            </div>
            <Legend
              style={{ marginTop: 10 }}
              items={sources.map((s, i) => ({
                label: `${s.label} ${formatShortMoney(s.weighted)}`,
                color: SOURCE_COLORS[i % SOURCE_COLORS.length],
              }))}
            />
          </div>
        </div>
      </div>
      <div className="dl-third">
        <CellHead title="How it is counted" sub="Points on each deal's chance" />
        <div style={cellBodyStyle}>
          <KeyValue label="Starts at your win rate">
            {props.baseRatePct.toFixed(0)}%
          </KeyValue>
          <KeyValue label="Later stage">up to +15</KeyValue>
          <KeyValue label="High risk, or medium">-18 / -6</KeyValue>
          <KeyValue label="Active in the last 5 days">+5</KeyValue>
          <KeyValue label="Idle more than 21 days">-12</KeyValue>
          <KeyValue label="Older than 90% of closed deals">-10</KeyValue>
        </div>
      </div>
    </section>
  );
}

function chanceText(value: number | null): string {
  return value === null ? "-" : `${value.toFixed(0)}%`;
}

function StageTable(props: ForecastViewProps) {
  const maxValue = Math.max(1, ...props.stages.map((s) => s.value));
  return (
    <section aria-label="By stage" style={{ borderBottom: "1px solid var(--dl-divider)" }}>
      <CellHead title="By stage" sub="Value, chance and tempo in each column" />
      <div style={{ overflowX: "auto" }}>
        <div role="table" aria-label="Forecast by stage" className="dl-table" style={STAGE_COLUMNS}>
          <div role="row" className="dl-table-grid" style={tableHeadStyle}>
            <span role="columnheader">Stage</span>
            <span role="columnheader" className="dl-c-wide" style={rightStyle}>Deals</span>
            <span role="columnheader" className="dl-c-wide">Open value</span>
            <span role="columnheader" style={rightStyle}>Win chance</span>
            <span role="columnheader" style={rightStyle}>Weighted</span>
            <span role="columnheader" className="dl-c-wide" style={rightStyle}>Avg age</span>
            <span role="columnheader" className="dl-c-wide" style={rightStyle}>Idle</span>
            <span role="columnheader" className="dl-c-wide" style={rightStyle}>Moves on</span>
          </div>
          {props.stages.map((s) => (
            <div key={s.key} role="row" className="dl-table-grid" style={tableRowStyle}>
              <div role="cell" style={{ minWidth: 0 }}>
                <b style={{ fontWeight: 600 }}>{s.label}</b>
                <StageSteps stage={s.stage} />
                <small className="dl-narrow-only" style={{ ...subStyle, display: "block", marginTop: 4 }}>
                  {s.count} {s.count === 1 ? "deal" : "deals"} · {formatShortMoney(s.value)} open
                </small>
              </div>
              <span role="cell" className="dl-c-wide" style={{ ...valueTextStyle, ...rightStyle }}>
                {s.count}
              </span>
              <div
                role="cell"
                className="dl-c-wide"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                  color: "var(--dl-text-2)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <Track percent={(s.value / maxValue) * 100} style={{ flex: "1 1 auto" }} />
                <span style={{ width: 52, textAlign: "right" }}>{formatShortMoney(s.value)}</span>
              </div>
              <span role="cell" style={{ ...valueTextStyle, ...rightStyle }}>
                {chanceText(s.avgChance)}
              </span>
              <span role="cell" style={{ ...valueTextStyle, ...rightStyle }}>
                {formatShortMoney(s.weighted)}
              </span>
              <span role="cell" className="dl-c-wide" style={{ ...metaTextStyle, ...rightStyle }}>
                {averageDays(s.avgAgeDays === null ? null : Math.round(s.avgAgeDays))}
              </span>
              <span role="cell" className="dl-c-wide" style={{ ...metaTextStyle, ...rightStyle }}>
                {averageDays(s.avgIdleDays, 1)}
              </span>
              <span role="cell" className="dl-c-wide" style={{ ...metaTextStyle, ...rightStyle }}>
                {s.movesOnPct === null ? "-" : `${s.movesOnPct.toFixed(0)}%`}
              </span>
            </div>
          ))}
          <div
            role="row"
            className="dl-table-grid"
            style={{ ...tableRowStyle, borderBottom: 0, background: "var(--dl-tint)" }}
          >
            <div role="cell" style={{ minWidth: 0 }}>
              <b style={{ fontWeight: 600 }}>All open</b>
              <small className="dl-narrow-only" style={{ ...subStyle, display: "block", marginTop: 4 }}>
                {props.totals.count} {props.totals.count === 1 ? "deal" : "deals"} ·{" "}
                {formatShortMoney(props.totals.value)} open
              </small>
            </div>
            <span role="cell" className="dl-c-wide" style={{ ...valueTextStyle, ...rightStyle }}>
              {props.totals.count}
            </span>
            <span role="cell" className="dl-c-wide" style={{ fontSize: 13, color: "var(--dl-muted)" }}>
              {formatShortMoney(props.totals.value)} open
            </span>
            <span role="cell" style={{ ...valueTextStyle, ...rightStyle }}>
              {chanceText(props.totals.avgChance)}
            </span>
            <span role="cell" style={{ ...valueTextStyle, ...rightStyle }}>
              {formatShortMoney(props.expected)}
            </span>
            <span role="cell" className="dl-c-wide" style={{ ...metaTextStyle, ...rightStyle }}>
              {averageDays(props.totals.avgAgeDays === null ? null : Math.round(props.totals.avgAgeDays))}
            </span>
            <span role="cell" className="dl-c-wide" style={{ ...metaTextStyle, ...rightStyle }}>
              {averageDays(props.totals.avgIdleDays, 1)}
            </span>
            <span role="cell" className="dl-c-wide" />
          </div>
        </div>
      </div>
    </section>
  );
}

function BoardDeal({ deal }: { deal: ForecastDeal }) {
  return (
    <li style={{ padding: "12px var(--dl-gutter) 13px", borderTop: "1px solid var(--dl-row)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <b
          style={{
            ...ellipsisStyle,
            minWidth: 0,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "-0.01em",
          }}
        >
          {deal.name}
        </b>
        <span style={valueTextStyle}>{formatShortMoney(deal.value)}</span>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "4px 12px",
          marginTop: 5,
          fontSize: 12.5,
          color: "var(--dl-text-2)",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <Track
            percent={deal.chance}
            width={40}
            height={5}
            label={`${deal.chance}% chance of winning`}
          />
          {deal.chance}%
        </span>
        <RiskMark tier={deal.tier} fontSize={12.5} />
        <span style={{ color: "var(--dl-muted)" }}>{idleText(deal.idleDays)}</span>
      </div>
      {deal.action && (
        <p style={{ marginTop: 4, fontSize: 12.5, color: "var(--dl-muted)" }}>
          {deal.action}
          {deal.overdueDays !== null && (
            <>
              {" "}
              · <span style={{ color: "var(--dl-signal-d)" }}>{daysLabel(deal.overdueDays)} overdue</span>
            </>
          )}
        </p>
      )}
    </li>
  );
}

function BoardColumn({ stage }: { stage: ForecastStage }) {
  return (
    <div className="dl-quarter">
      <CellHead
        compact
        title={stage.label}
        pill={<Pill>{stage.count}</Pill>}
        right={<span style={valueTextStyle}>{formatShortMoney(stage.value)}</span>}
      />
      <p style={{ ...subStyle, padding: "0 var(--dl-gutter) 12px" }}>
        {stage.count > 0
          ? `${formatShortMoney(stage.weighted)} weighted · ${chanceText(stage.avgChance)} average`
          : "No open deals here"}
      </p>
      {stage.deals.length > 0 && (
        <ol aria-label={`${stage.label} deals`}>
          {stage.deals.map((deal) => (
            <BoardDeal key={deal.id} deal={deal} />
          ))}
        </ol>
      )}
    </div>
  );
}

export function ForecastView(props: ForecastViewProps) {
  return (
    <>
      {props.dataError && (
        <DataErrorBanner>
          Data temporarily unavailable. The deals could not be loaded, retry
          shortly.
        </DataErrorBanner>
      )}
      <PageHero
        chip={heroChip(props)}
        headline="Where the book"
        emphasis="lands."
        clause={heroClause(props)}
        deck={
          <>
            Every open deal counts at its chance of closing, from its stage,
            risk and recent activity.
            <WideOnly> The board shows where each one sits.</WideOnly>
          </>
        }
        actions={
          <>
            <HeroLink href="/deals" tone="primary">
              Open pipeline
            </HeroLink>
            <HeroLink href="/deals/new" tone="secondary" icon={<PlusIcon />}>
              New deal
            </HeroLink>
          </>
        }
      />
      <KeyNumbers {...props} />
      {props.dealCount === 0 ? (
        <BookEmpty
          unavailable={props.dataError}
          title="Nothing"
          emphasis="to forecast."
          body="Connect a CRM or add a deal by hand. Each open deal then counts toward the forecast at its own chance of closing."
        />
      ) : (
        <>
          <ForecastRange {...props} />
          <StageTable {...props} />
          <section aria-label="The board" className="dl-grid dl-grow">
            {props.stages.map((stage) => (
              <BoardColumn key={stage.key} stage={stage} />
            ))}
          </section>
        </>
      )}
    </>
  );
}

