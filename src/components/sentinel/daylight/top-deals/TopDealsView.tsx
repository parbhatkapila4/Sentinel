import type { CSSProperties } from "react";
import { formatShortMoney } from "@/lib/format-money";
import {
  BigFigure,
  BookEmpty,
  CellHead,
  CellLink,
  DataErrorBanner,
  DealLink,
  DividerRow,
  EmptyNote,
  HBar,
  HeroLink,
  KeyValue,
  KpiTile,
  Legend,
  PageHero,
  Percent,
  Pill,
  PlusIcon,
  RISK_LEGEND,
  RiskMark,
  Square,
  TIER_COLOR,
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
import { ageMeter } from "../analytics/model";
import { StageMark } from "../deals/cells";
import { countWord, relativeAge, stageLabel } from "../deals/model";
import { Monogram, Money, SegmentMeter, SplitBar, tableHeadStyle } from "../ui";
import {
  TOP_COUNT,
  headroomLabel,
  topThreeSub,
  type StandingRow,
  type TopDealsData,
} from "./derive";

export interface TopDealsViewProps extends TopDealsData {
  dataError: boolean;
  nowMs: number;
}

const STANDINGS_COLUMNS = {
  "--cols":
    "28px minmax(0, 1.45fr) 112px 96px 150px 88px 104px minmax(0, 1.55fr)",
  "--cols-n": "22px minmax(0, 1fr) auto",
  "--minw": "980px",
} as CSSProperties;

const TOP_THREE_COLORS = ["var(--dl-ink)", "#4A525C", "var(--dl-bar)"];

const AGE_COLOR = {
  quiet: "var(--dl-ink)",
  watch: "var(--dl-amber)",
  stale: "var(--dl-signal)",
} as const;

function heroChip(props: TopDealsViewProps): HeroChip {
  if (props.dataError) return { label: "Data unavailable", tone: "start" };
  if (props.dealCount === 0) return { label: "Getting started", tone: "start" };
  const risky = props.topHighRisk.length;
  if (risky > 0) {
    return {
      label: `${risky} of the top ${props.topCount} at risk`,
      tone: "alert",
    };
  }
  return { label: `Top ${props.topCount} clear of high risk`, tone: "good" };
}

function heroClause(props: TopDealsViewProps): string {
  if (props.dataError) return "it could not be read just now.";
  if (props.dealCount === 0) return "nothing on the book yet.";
  const deals = props.dealCount === 1 ? "deal" : "deals";
  return `${countWord(props.dealCount)} ${deals} worth ${formatShortMoney(props.totalValue)}, biggest first.`;
}

function KeyNumbers(props: TopDealsViewProps) {
  const empty = props.dealCount === 0;
  const highest = props.highest;
  const risky = props.topHighRisk.length;
  return (
    <section aria-label="Key numbers" className="dl-grid">
      <KpiTile
        label="Highest deal"
        empty={empty}
        value={<Money value={highest?.value ?? 0} />}
        visual={
          <Track
            percent={highest?.sharePct ?? 0}
            width={124}
            label={`${(highest?.sharePct ?? 0).toFixed(1)}% of the book`}
          />
        }
        caption={
          highest
            ? `${highest.name} · ${highest.sharePct.toFixed(1)}% of the book`
            : "No deals yet"
        }
      />
      <KpiTile
        label={`Top ${TOP_COUNT} value`}
        empty={empty}
        value={<Money value={props.topValue} />}
        visual={
          <SplitBar
            emptyLabel="No deals yet"
            parts={[
              {
                key: "top",
                value: props.topValue,
                color: "var(--dl-ink)",
                label: `Top ${TOP_COUNT} hold ${props.topSharePct.toFixed(1)}% of the book`,
              },
              {
                key: "rest",
                value: props.totalValue - props.topValue,
                color: "var(--dl-seg)",
                label: "the rest",
              },
            ]}
          />
        }
        caption={`${props.topSharePct.toFixed(1)}% of the book`}
      />
      <KpiTile
        label={`At risk in the top ${TOP_COUNT}`}
        empty={empty}
        value={risky}
        visual={
          <SegmentMeter
            filled={risky}
            total={Math.max(props.topCount, 1)}
            color="var(--dl-signal)"
            segmentWidth={12}
            label={`${risky} of ${props.topCount} high risk`}
          />
        }
        caption={
          risky > 0 ? `${formatShortMoney(props.topHighRiskValue)} exposed` : "None flagged"
        }
      />
      <KpiTile
        label="Total pipeline"
        empty={empty}
        value={<Money value={props.totalValue} />}
        visual={
          <SplitBar
            emptyLabel="No deals yet"
            parts={[
              {
                key: "open",
                value: props.openValue,
                color: "var(--dl-ink)",
                label: `Open ${formatShortMoney(props.openValue)}`,
              },
              {
                key: "won",
                value: props.wonValue,
                color: "var(--dl-green)",
                label: `won ${formatShortMoney(props.wonValue)}`,
              },
              {
                key: "lost",
                value: props.lostValue,
                color: "var(--dl-guide)",
                label: `lost ${formatShortMoney(props.lostValue)}`,
              },
            ]}
          />
        }
        caption={`${props.dealCount} ${props.dealCount === 1 ? "deal" : "deals"} · ${props.openCount} open`}
      />
    </section>
  );
}

function Concentration(props: TopDealsViewProps) {
  const restShare = Math.max(0, 100 - props.topThreeSharePct);
  return (
    <section aria-label="Concentration and risk" className="dl-grid">
      <div className="dl-third">
        <CellHead
          title="Top 3 concentration"
          sub={topThreeSub(props.topThree.length, props.topThreeSharePct)}
        />
        <div style={cellBodyStyle}>
          <BigFigure>
            <Percent value={props.topThreeSharePct} digits={1} />
          </BigFigure>
          <p style={{ ...subStyle, marginTop: 2 }}>
            of the book sits in{" "}
            {props.topThree.length === 1
              ? "one deal"
              : `${countWord(props.topThree.length)} deals`}
          </p>
          <div style={{ display: "flex", marginTop: 14 }}>
            <SplitBar
              width="100%"
              emptyLabel="No deals yet"
              parts={[
                ...props.topThree.map((d, i) => ({
                  key: d.id,
                  value: d.sharePct,
                  color: TOP_THREE_COLORS[i],
                  label: `${d.name} ${d.sharePct.toFixed(1)}%`,
                })),
                {
                  key: "rest",
                  value: restShare,
                  color: "var(--dl-track)",
                  label: `rest ${restShare.toFixed(0)}%`,
                },
              ]}
            />
          </div>
          <ol style={{ marginTop: 14 }}>
            {props.topThree.map((d, i) => (
              <li key={d.id} style={listRowStyle}>
                <Square color={TOP_THREE_COLORS[i]} />
                <span style={{ flex: "1 1 auto", minWidth: 0, ...ellipsisStyle }}>
                  {d.name}
                </span>
                <span style={valueTextStyle}>{formatShortMoney(d.value)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="dl-third">
        <CellHead title="The 80 / 20" sub="How value concentrates" />
        <div style={cellBodyStyle}>
          <BigFigure>
            <Percent value={props.fifthSharePct} digits={1} />
          </BigFigure>
          <p style={{ ...subStyle, marginTop: 2 }}>
            of the value is in the top {props.fifthCount}{" "}
            {props.fifthCount === 1 ? "deal" : "deals"}, a fifth of the book
          </p>
          <div style={{ marginTop: 14 }}>
            <KeyValue label={`Top ${TOP_COUNT} average`}>
              {formatShortMoney(props.topAverage)}
            </KeyValue>
            <KeyValue label="Everyone else">
              {props.restAverage === null ? "-" : formatShortMoney(props.restAverage)}
            </KeyValue>
            <KeyValue label={`Headroom, top ${TOP_COUNT} vs the rest`}>
              {headroomLabel(props.headroom)}
            </KeyValue>
          </div>
        </div>
      </div>

      <div className="dl-third">
        <CellHead
          title={`Top ${TOP_COUNT} risk profile`}
          sub="Where exposure sits"
          right={<CellLink href="/risk-overview">Open alerts</CellLink>}
        />
        <div style={cellBodyStyle}>
          {props.topHighRisk.length === 0 ? (
            <div style={{ ...listRowStyle, color: "var(--dl-muted)" }}>
              No high-risk deals in the top {props.topCount}.
            </div>
          ) : (
            <ol>
              {props.topHighRisk.map((d) => (
                <li key={d.id} style={listRowStyle}>
                  <span style={{ flex: "1 1 auto", minWidth: 0, ...ellipsisStyle }}>
                    <b style={{ fontWeight: 600 }}>{d.name}</b>
                    <span style={{ color: "var(--dl-muted)" }}>
                      {" "}
                      · {d.riskScore.toFixed(2)}
                    </span>
                  </span>
                  <Track
                    percent={d.riskScore * 100}
                    color="var(--dl-signal)"
                    width={64}
                    label={`Risk score ${d.riskScore.toFixed(2)}`}
                  />
                  <span style={{ ...valueTextStyle, width: 52, textAlign: "right" }}>
                    {formatShortMoney(d.value)}
                  </span>
                </li>
              ))}
            </ol>
          )}
          <KeyValue label="Needing action">
            {props.topNeedingAction} of {props.topCount}
          </KeyValue>
          <KeyValue label="Created in the last 30 days">
            {props.topRecent} of {props.topCount}
          </KeyValue>
        </div>
      </div>
    </section>
  );
}

function NextAction({ row }: { row: StandingRow }) {
  if (!row.action) {
    return <span style={{ ...metaTextStyle, color: "var(--dl-muted)" }}>None</span>;
  }
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ ...metaTextStyle, ...ellipsisStyle }} title={row.action}>
        {row.action}
      </div>
      {row.overdueDays !== null && (
        <div style={{ fontSize: 12, color: "var(--dl-signal-d)" }}>
          {daysLabel(row.overdueDays)} overdue
        </div>
      )}
    </div>
  );
}

function StandingsRow({ row, nowMs }: { row: StandingRow; nowMs: number }) {
  return (
    <div
      role="row"
      className="dl-row dl-table-grid"
      style={tableRowStyle}
    >
      <span
        role="cell"
        style={{ fontSize: 13, color: "var(--dl-muted)", fontVariantNumeric: "tabular-nums" }}
      >
        {row.rank}
      </span>
      <div role="cell" style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
        <Monogram name={row.name} />
        <div style={{ minWidth: 0 }}>
          <DealLink id={row.id} name={row.name} />
          <div style={{ ...ellipsisStyle, fontSize: 12.5, color: "var(--dl-muted)" }}>
            <span className="dl-wide-only">{row.location ?? "No location"}</span>
            <span className="dl-narrow-only">{row.stageText}</span>
          </div>
        </div>
      </div>
      <div role="cell" className="dl-c-wide" style={{ minWidth: 0 }}>
        <div style={{ ...metaTextStyle, ...ellipsisStyle }}>{stageLabel(row.stage)}</div>
        <StageMark stage={row.stage} />
      </div>
      <span role="cell" style={{ ...valueTextStyle, justifySelf: "end" }}>
        {fullCurrency(row.value)}
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
        <Track percent={row.barPct} style={{ flex: "1 1 auto", maxWidth: 96 }} />
        {row.sharePct.toFixed(1)}%
      </div>
      <span role="cell" className="dl-c-wide">
        <RiskMark tier={row.closed ? "closed" : row.tier} />
      </span>
      <span role="cell" className="dl-c-wide" style={metaTextStyle}>
        {relativeAge(row.lastActivityAt, nowMs)}
      </span>
      <div role="cell" className="dl-c-wide" style={{ minWidth: 0 }}>
        <NextAction row={row} />
      </div>
    </div>
  );
}

function Standings(props: TopDealsViewProps) {
  const top = props.standings.slice(0, TOP_COUNT);
  const rest = props.standings.slice(TOP_COUNT);
  return (
    <section aria-label="The standings" style={{ borderBottom: "1px solid var(--dl-divider)" }}>
      <CellHead
        title="The standings"
        pill={<Pill>{props.dealCount}</Pill>}
        sub="Every deal on the book, largest first"
        right={<Legend className="dl-wide-only" items={RISK_LEGEND} />}
      />
      <div style={{ overflowX: "auto" }}>
        <div role="table" aria-label="Deals ranked by value" className="dl-table" style={STANDINGS_COLUMNS}>
          <div role="row" className="dl-table-grid" style={tableHeadStyle}>
            <span role="columnheader">#</span>
            <span role="columnheader">Deal</span>
            <span role="columnheader" className="dl-c-wide">Stage</span>
            <span role="columnheader" style={{ justifySelf: "end" }}>Value</span>
            <span role="columnheader" className="dl-c-wide">Share of book</span>
            <span role="columnheader" className="dl-c-wide">Risk</span>
            <span role="columnheader" className="dl-c-wide">Last activity</span>
            <span role="columnheader" className="dl-c-wide">Next action</span>
          </div>
          <div role="rowgroup">
            {top.map((row) => (
              <StandingsRow key={row.id} row={row} nowMs={props.nowMs} />
            ))}
          </div>
          {rest.length > 0 && (
            <>
              <DividerRow>
                Top {TOP_COUNT} · {formatShortMoney(props.topValue)} ·{" "}
                {props.topSharePct.toFixed(1)}% of the book
              </DividerRow>
              <div role="rowgroup">
                {rest.map((row) => (
                  <StandingsRow key={row.id} row={row} nowMs={props.nowMs} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function DeskNotes(props: TopDealsViewProps) {
  const maxStage = Math.max(1, ...props.topByStage.map((s) => s.count));
  const maxAge = Math.max(1, ...props.oldestOpen.map((d) => d.ageDays));
  return (
    <section aria-label="Desk notes" className="dl-grid dl-grow">
      <div className="dl-half">
        <CellHead title={`Top ${TOP_COUNT} by stage`} sub="Where the biggest deals sit" />
        <div style={{ ...cellBodyStyle, paddingBottom: 20 }}>
          {props.topByStage.map((s) => (
            <HBar
              key={s.key}
              label={s.label}
              percent={(s.count / maxStage) * 100}
              color={
                s.closed === "won"
                  ? TIER_COLOR.won
                  : s.closed === "lost"
                    ? "var(--dl-guide)"
                    : undefined
              }
              value={s.count}
            />
          ))}
        </div>
      </div>
      <div className="dl-half">
        <CellHead
          title={`Oldest in the top ${TOP_COUNT}`}
          sub="Open deals, days since created"
          right={<CellLink href="/deals">Open pipeline</CellLink>}
        />
        <div style={{ ...cellBodyStyle, paddingBottom: 20 }}>
          {props.oldestOpen.length === 0 ? (
            <EmptyNote>No open deals in the top {props.topCount}.</EmptyNote>
          ) : (
            props.oldestOpen.map((d) => (
              <HBar
                key={d.id}
                label={d.name}
                columns="minmax(0, 1fr) 96px 64px"
                percent={(d.ageDays / maxAge) * 100}
                color={AGE_COLOR[ageMeter(d.ageDays).tone]}
                value={daysLabel(d.ageDays)}
                valueStyle={{ fontSize: 13, fontWeight: 400, color: "var(--dl-text-2)" }}
              />
            ))
          )}
          <p style={{ ...subStyle, marginTop: 10 }}>
            Past 30 days marks a deal as sitting; past 14 as worth a look.
          </p>
        </div>
      </div>
    </section>
  );
}

export function TopDealsView(props: TopDealsViewProps) {
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
        headline="The largest deals,"
        emphasis="ranked."
        clause={heroClause(props)}
        deck={
          <>
            A standings page for the book: the biggest opportunities, how
            concentrated the value is
            <WideOnly>, and where the exposure sits at the top</WideOnly>.
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
          title="No deals"
          emphasis="to rank."
          body="Connect a CRM or add a deal by hand. As soon as one lands, the standings and concentration figures fill in."
        />
      ) : (
        <>
          <Concentration {...props} />
          <Standings {...props} />
          <DeskNotes {...props} />
        </>
      )}
    </>
  );
}

