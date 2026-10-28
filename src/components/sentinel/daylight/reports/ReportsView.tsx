import type { CSSProperties } from "react";
import { format } from "date-fns";
import { formatShortMoney } from "@/lib/format-money";
import {
  BookEmpty,
  CellHead,
  CellLink,
  DataErrorBanner,
  DealLink,
  DividerRow,
  HBar,
  HeroLink,
  KeyValue,
  KpiTile,
  Legend,
  PageHero,
  Pill,
  RISK_LEGEND,
  RiskMark,
  TIER_COLOR,
  TierLine,
  Track,
  WideOnly,
  cellBodyStyle,
  ellipsisStyle,
  listRowStyle,
  metaTextStyle,
  subStyle,
  tableRowStyle,
  valueTextStyle,
  type HeroChip,
} from "../blocks";
import { daysLabel } from "../book";
import { fullCurrency } from "../format";
import { countWord, relativeAge, stageLabel } from "../deals/model";
import { Monogram, Money, SplitBar, tableHeadStyle } from "../ui";
import { ExportPdfButton } from "./ExportPdfButton";
import {
  AGE_BUCKETS,
  WEEKDAYS,
  type RegistryRow,
  type ReportsData,
  type StageLine,
} from "./derive";

export interface ReportsViewProps extends ReportsData {
  dataError: boolean;
  nowMs: number;
}

const STAGE_COLUMNS = {
  "--cols": "minmax(0, 1.1fr) 56px 96px minmax(0, 1.2fr) 88px 84px",
  "--cols-n": "minmax(0, 1fr) auto auto",
  "--minw": "640px",
} as CSSProperties;

const REGISTRY_COLUMNS = {
  "--cols": "minmax(0, 1.3fr) 104px 96px minmax(0, 1.5fr) 144px",
  "--cols-n": "minmax(0, 1fr) auto",
  "--minw": "820px",
} as CSSProperties;

const rightStyle: CSSProperties = { justifySelf: "end", textAlign: "right" };

const AGE_COLORS = ["var(--dl-ink)", "var(--dl-ink)", "var(--dl-amber)", "var(--dl-signal)", "var(--dl-signal)"];

function heroChip(props: ReportsViewProps): HeroChip {
  if (props.dataError) return { label: "Data unavailable", tone: "start" };
  if (props.dealCount === 0) return { label: "Getting started", tone: "start" };
  if (props.wonThisWeek > 0) {
    return {
      label: `${props.wonThisWeek} ${props.wonThisWeek === 1 ? "deal" : "deals"} won this week`,
      tone: "good",
    };
  }
  if (props.newThisWeek > 0) {
    return { label: `${props.newThisWeek} new this week`, tone: "neutral" };
  }
  return { label: "A quiet week", tone: "neutral" };
}

function heroClause(props: ReportsViewProps): string {
  if (props.dataError) return "it could not be read just now.";
  if (props.dealCount === 0) return "nothing on the book yet.";
  const deals = props.dealCount === 1 ? "deal" : "deals";
  return `${countWord(props.dealCount)} ${deals} worth ${formatShortMoney(props.totalValue)}, as of today.`;
}

function DailyBars({ counts }: { counts: number[] }) {
  const max = Math.max(1, ...counts);
  return (
    <div
      role="img"
      aria-label={`Deals created each day over the last 7 days: ${counts.join(", ")}`}
      style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 18, marginTop: -4 }}
    >
      {counts.map((n, i) => (
        <span
          key={i}
          style={{
            width: 8,
            height: n > 0 ? Math.max(6, Math.round((n / max) * 18)) : 3,
            borderRadius: 2,
            background: n > 0 ? "var(--dl-ink)" : "var(--dl-seg)",
          }}
        />
      ))}
    </div>
  );
}

function KeyNumbers(props: ReportsViewProps) {
  const empty = props.dealCount === 0;
  const [high, medium, low] = props.tiers;
  return (
    <section aria-label="Key numbers" className="dl-grid">
      <KpiTile
        label="Total pipeline"
        empty={empty}
        value={<Money value={props.totalValue} />}
        visual={
          <SplitBar
            emptyLabel="No deals yet"
            parts={[
              { key: "open", value: props.openValue, color: "var(--dl-ink)", label: `Open ${formatShortMoney(props.openValue)}` },
              { key: "won", value: props.wonValue, color: "var(--dl-green)", label: `won ${formatShortMoney(props.wonValue)}` },
              { key: "lost", value: props.lostValue, color: "var(--dl-guide)", label: `lost ${formatShortMoney(props.lostValue)}` },
            ]}
          />
        }
        caption={`${props.dealCount} ${props.dealCount === 1 ? "deal" : "deals"} · ${props.openCount} open`}
      />
      <KpiTile
        label="Average deal"
        empty={empty}
        value={<Money value={props.average} />}
        visual={
          <Track
            percent={props.largest > 0 ? (props.average / props.largest) * 100 : 0}
            width={124}
            label="Average against the largest deal"
          />
        }
        caption={
          empty
            ? "No deals yet"
            : `from ${formatShortMoney(props.smallest)} to ${formatShortMoney(props.largest)}`
        }
      />
      <KpiTile
        label="New this week"
        empty={empty}
        value={props.newThisWeek}
        visual={<DailyBars counts={props.dailyNew} />}
        caption={
          props.newThisWeek > 0
            ? `${formatShortMoney(props.newThisWeekValue)} added`
            : "Nothing new this week"
        }
      />
      <KpiTile
        label="At risk"
        empty={empty}
        value={high.count}
        visual={
          <SplitBar
            emptyLabel="Nothing open"
            parts={[
              { key: "high", value: high.count, color: TIER_COLOR.high, label: `High ${high.count}` },
              { key: "medium", value: medium.count, color: TIER_COLOR.medium, label: `medium ${medium.count}` },
              { key: "low", value: low.count, color: TIER_COLOR.low, label: `low ${low.count}` },
            ]}
          />
        }
        caption={
          high.count > 0
            ? `${formatShortMoney(high.value)} in high-risk deals`
            : "No high-risk deals"
        }
      />
    </section>
  );
}

function ThisWeek(props: ReportsViewProps) {
  const wonText =
    props.wonThisWeek > 0
      ? `${props.wonThisWeek} · ${formatShortMoney(props.wonThisWeekValue)}`
      : "0";
  const lostText =
    props.lostThisWeek > 0
      ? `${props.lostThisWeek} · ${formatShortMoney(props.lostThisWeekValue)}`
      : "0";
  return (
    <section aria-label="This week" className="dl-grid">
      <div className="dl-third">
        <CellHead
          title="This week"
          sub={`${format(props.weekStart, "MMMM d")} to ${format(props.nowMs, "MMMM d")}`}
        />
        <div style={cellBodyStyle}>
          <KeyValue label="Deals created">{props.newThisWeek}</KeyValue>
          <KeyValue label="Value added">{formatShortMoney(props.newThisWeekValue)}</KeyValue>
          <KeyValue label="Closed won">{wonText}</KeyValue>
          <KeyValue label="Closed lost">{lostText}</KeyValue>
        </div>
      </div>
      <div className="dl-third">
        <CellHead title="New on the desk" sub={`${props.newLastMonth} in the last 30 days`} />
        <div style={cellBodyStyle}>
          <ol>
            {props.newest.map((d) => (
              <li key={d.id} style={listRowStyle}>
                <Monogram name={d.name} />
                <span style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <DealLink id={d.id} name={d.name} style={{ fontSize: 13.5, letterSpacing: undefined }} />
                  <span style={{ ...subStyle, ...ellipsisStyle, display: "block" }}>
                    {stageLabel(d.stage)} · {relativeAge(d.createdAt, props.nowMs).toLowerCase()}
                  </span>
                </span>
                <span style={valueTextStyle}>{formatShortMoney(d.value)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="dl-third">
        <CellHead
          title="Needs picking up"
          sub={`${props.withNextStep} with a next step, ${props.overdueCount} overdue`}
          right={<CellLink href="/risk-overview">Open alerts</CellLink>}
        />
        <div style={cellBodyStyle}>
          {props.pickUp.length === 0 ? (
            <div style={{ ...listRowStyle, color: "var(--dl-muted)" }}>No next steps waiting.</div>
          ) : (
            <ol>
              {props.pickUp.map((d) => (
                <li key={d.id} style={listRowStyle}>
                  <span style={{ flex: "1 1 auto", minWidth: 0 }}>
                    <b style={{ ...ellipsisStyle, display: "block", fontWeight: 600 }}>{d.name}</b>
                    <span style={{ ...subStyle, ...ellipsisStyle, display: "block" }}>{d.action}</span>
                  </span>
                  {d.overdueDays !== null ? (
                    <span style={{ fontSize: 13, whiteSpace: "nowrap", color: "var(--dl-signal-d)" }}>
                      {daysLabel(d.overdueDays)} late
                    </span>
                  ) : (
                    <span style={{ fontSize: 13, whiteSpace: "nowrap", color: "var(--dl-muted)" }}>
                      {d.dueInDays === null
                        ? "No due date"
                        : d.dueInDays === 0
                          ? "Due today"
                          : `Due in ${daysLabel(d.dueInDays)}`}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}

function StageRow({ line, maxValue }: { line: StageLine; maxValue: number }) {
  const color =
    line.closed === "won"
      ? "var(--dl-green)"
      : line.closed === "lost"
        ? "var(--dl-guide)"
        : undefined;
  return (
    <div role="row" className="dl-table-grid" style={{ ...tableRowStyle, minHeight: 48 }}>
      <span role="cell" style={{ fontWeight: 600 }}>
        {line.label}
      </span>
      <span role="cell" className="dl-c-wide" style={{ ...metaTextStyle, ...rightStyle }}>
        {line.count}
      </span>
      <span role="cell" style={{ ...valueTextStyle, ...rightStyle }}>
        {formatShortMoney(line.value)}
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
        <Track percent={(line.value / maxValue) * 100} color={color} style={{ flex: "1 1 auto" }} />
        <span style={{ width: 40, textAlign: "right" }}>{line.sharePct.toFixed(1)}%</span>
      </div>
      <span role="cell" style={{ ...metaTextStyle, ...rightStyle }}>
        {line.average === null ? "-" : formatShortMoney(line.average)}
      </span>
      <span
        role="cell"
        className="dl-c-wide"
        style={{
          ...metaTextStyle,
          ...rightStyle,
          color: line.closed ? "var(--dl-muted)" : undefined,
        }}
      >
        {line.closed
          ? "Closed"
          : line.movesOnPct === null
            ? "-"
            : `${line.movesOnPct.toFixed(0)}%`}
      </span>
    </div>
  );
}

function PipelineAndRisk(props: ReportsViewProps) {
  const maxValue = Math.max(1, ...props.stages.map((s) => s.value));
  return (
    <section aria-label="Pipeline by stage and risk" className="dl-grid">
      <div className="dl-two-thirds">
        <CellHead title="Pipeline by stage" sub="Every stage, open and closed" />
        <div style={{ overflowX: "auto" }}>
          <div role="table" aria-label="Pipeline by stage" className="dl-table" style={STAGE_COLUMNS}>
            <div role="row" className="dl-table-grid" style={tableHeadStyle}>
              <span role="columnheader">Stage</span>
              <span role="columnheader" className="dl-c-wide" style={rightStyle}>Deals</span>
              <span role="columnheader" style={rightStyle}>Value</span>
              <span role="columnheader" className="dl-c-wide">Share of book</span>
              <span role="columnheader" style={rightStyle}>Average</span>
              <span role="columnheader" className="dl-c-wide" style={rightStyle}>Moves on</span>
            </div>
            {props.stages.map((line) => (
              <StageRow key={line.key} line={line} maxValue={maxValue} />
            ))}
            <div
              role="row"
              className="dl-table-grid"
              style={{ ...tableRowStyle, minHeight: 48, borderBottom: 0, background: "var(--dl-tint)" }}
            >
              <span role="cell" style={{ fontWeight: 600 }}>All stages</span>
              <span role="cell" className="dl-c-wide" style={{ ...metaTextStyle, ...rightStyle }}>
                {props.dealCount}
              </span>
              <span role="cell" style={{ ...valueTextStyle, ...rightStyle }}>
                {formatShortMoney(props.totalValue)}
              </span>
              <span role="cell" className="dl-c-wide" style={{ fontSize: 13, color: "var(--dl-muted)" }}>
                100%
              </span>
              <span role="cell" style={{ ...metaTextStyle, ...rightStyle }}>
                {formatShortMoney(props.average)}
              </span>
              <span role="cell" className="dl-c-wide" />
            </div>
          </div>
        </div>
      </div>
      <div className="dl-third">
        <CellHead title="Risk across the book" sub="Open deals by tier" />
        <div style={cellBodyStyle}>
          <div style={{ display: "flex" }}>
            <SplitBar
              width="100%"
              emptyLabel="Nothing open"
              parts={props.tiers.map((t) => ({
                key: t.key,
                value: t.count,
                color: TIER_COLOR[t.key],
                label: `${t.key} ${t.count}`,
              }))}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            {props.tiers.map((t) => (
              <TierLine
                key={t.key}
                tier={t.key}
                detail={`${t.count} ${t.count === 1 ? "deal" : "deals"}`}
                value={t.value}
              />
            ))}
            <KeyValue label="Average risk score">
              {props.avgRisk === null ? "-" : `${(props.avgRisk * 100).toFixed(0)}%`}
            </KeyValue>
          </div>
        </div>
      </div>
    </section>
  );
}

function Rhythm(props: ReportsViewProps) {
  const maxDay = Math.max(1, ...props.weekdays);
  const maxAge = Math.max(1, ...props.ages);
  const peak = props.weekdays.indexOf(Math.max(...props.weekdays));
  return (
    <section aria-label="Rhythm" className="dl-grid">
      <div className="dl-half">
        <CellHead title="Deals created by weekday" sub="Where the week lands" />
        <div style={{ padding: "4px var(--dl-gutter) 20px" }}>
          <div
            role="img"
            aria-label={`Deals created: ${WEEKDAYS.map((d, i) => `${d} ${props.weekdays[i]}`).join(", ")}`}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: 10,
              alignItems: "end",
              height: 150,
            }}
          >
            {props.weekdays.map((n, i) => {
              const isPeak = i === peak && n > 0;
              return (
                <div
                  key={WEEKDAYS[i]}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 6,
                    height: "100%",
                  }}
                >
                  <span
                    style={{
                      ...metaTextStyle,
                      fontWeight: isPeak ? 600 : undefined,
                      color: isPeak ? "var(--dl-ink)" : undefined,
                    }}
                  >
                    {n}
                  </span>
                  <span
                    style={{
                      width: "100%",
                      maxWidth: 44,
                      height: n > 0 ? Math.max(4, Math.round((n / maxDay) * 112)) : 3,
                      borderRadius: "3px 3px 0 0",
                      background: isPeak
                        ? "var(--dl-ink)"
                        : n > 0
                          ? "var(--dl-bar)"
                          : "var(--dl-seg)",
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: 10,
              paddingTop: 8,
              borderTop: "1px solid var(--dl-divider)",
              textAlign: "center",
              fontFamily: "var(--dl-font-mono)",
              fontSize: 11,
              color: "var(--dl-muted)",
            }}
          >
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="dl-half">
        <CellHead title="Deal age" sub="Days since each deal was created" />
        <div style={{ padding: "4px var(--dl-gutter) 20px" }}>
          {AGE_BUCKETS.map((bucket, i) => (
            <HBar
              key={bucket.label}
              label={bucket.label}
              columns="96px minmax(0, 1fr) 32px"
              percent={(props.ages[i] / maxAge) * 100}
              color={AGE_COLORS[i]}
              value={props.ages[i]}
            />
          ))}
          <p style={{ ...subStyle, marginTop: 10 }}>
            Amber from two weeks, red from thirty days, the same marks as Analytics.
          </p>
        </div>
      </div>
    </section>
  );
}

function RegistryLine({ row, nowMs }: { row: RegistryRow; nowMs: number }) {
  const age = relativeAge(row.lastActivityAt, nowMs);
  return (
    <div role="row" className="dl-row dl-table-grid" style={tableRowStyle}>
      <div role="cell" style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
        <Monogram name={row.name} />
        <div style={{ minWidth: 0 }}>
          <DealLink id={row.id} name={row.name} />
          <div style={{ ...ellipsisStyle, fontSize: 12.5, color: "var(--dl-muted)" }}>
            {row.location ?? "No location"}
          </div>
        </div>
      </div>
      <span role="cell" style={{ ...valueTextStyle, ...rightStyle }}>
        {fullCurrency(row.value)}
      </span>
      <span role="cell" className="dl-c-wide">
        <RiskMark tier={row.tier} />
      </span>
      <div role="cell" className="dl-c-wide" style={{ minWidth: 0 }}>
        {row.action ? (
          <>
            <div style={{ ...metaTextStyle, ...ellipsisStyle }} title={row.action}>
              {row.action}
            </div>
            {row.overdueDays !== null && (
              <div style={{ fontSize: 12, color: "var(--dl-signal-d)" }}>
                {daysLabel(row.overdueDays)} overdue
              </div>
            )}
          </>
        ) : (
          <span style={{ ...metaTextStyle, color: "var(--dl-muted)" }}>None</span>
        )}
      </div>
      <span role="cell" className="dl-c-wide" style={metaTextStyle}>
        {row.closed ? `Closed ${age.toLowerCase()}` : age}
      </span>
    </div>
  );
}

function Registry(props: ReportsViewProps) {
  return (
    <section aria-label="Deal registry" className="dl-grow">
      <CellHead
        title="Deal registry"
        pill={<Pill>{props.dealCount}</Pill>}
        sub="Every deal, grouped by stage"
        right={<Legend className="dl-wide-only" items={RISK_LEGEND} />}
      />
      <div style={{ overflowX: "auto" }}>
        <div role="table" aria-label="Deal registry" className="dl-table" style={REGISTRY_COLUMNS}>
          <div role="row" className="dl-table-grid" style={tableHeadStyle}>
            <span role="columnheader">Deal</span>
            <span role="columnheader" style={rightStyle}>Value</span>
            <span role="columnheader" className="dl-c-wide">Risk</span>
            <span role="columnheader" className="dl-c-wide">Next action</span>
            <span role="columnheader" className="dl-c-wide">Last activity</span>
          </div>
          {props.registry.map((group) => (
            <div key={group.key} role="rowgroup" aria-label={group.label}>
              <DividerRow>
                {group.label} · {group.count} {group.count === 1 ? "deal" : "deals"} ·{" "}
                {formatShortMoney(group.value)}
              </DividerRow>
              {group.rows.map((row) => (
                <RegistryLine key={row.id} row={row} nowMs={props.nowMs} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ReportsView(props: ReportsViewProps) {
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
        headline="The book, on the"
        emphasis="record."
        clause={heroClause(props)}
        deck={
          <>
            A composed read of the pipeline to share
            <WideOnly>: value, risk, conversion and every deal on the desk</WideOnly>.
          </>
        }
        actions={
          <>
            <ExportPdfButton />
            <HeroLink href="/deals" tone="secondary">
              Open pipeline
            </HeroLink>
          </>
        }
      />
      <KeyNumbers {...props} />
      {props.dealCount === 0 ? (
        <BookEmpty
          unavailable={props.dataError}
          title="Nothing"
          emphasis="to report."
          body="Connect a CRM or add a deal by hand. Once deals land, this page writes itself: value, risk, conversion and every deal on the desk."
        />
      ) : (
        <>
          <ThisWeek {...props} />
          <PipelineAndRisk {...props} />
          <Rhythm {...props} />
          <Registry {...props} />
        </>
      )}
    </>
  );
}
