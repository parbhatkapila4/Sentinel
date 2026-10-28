import type { ReactNode } from "react";
import { formatShortMoney } from "@/lib/format-money";
import {
  BigFigure,
  BookEmpty,
  CellHead,
  CellLink,
  DataErrorBanner,
  HeroLink,
  KeyValue,
  KpiTile,
  Legend,
  PageHero,
  Percent,
  Pill,
  TIER_COLOR,
  TierLine,
  Track,
  WideOnly,
  cellBodyStyle,
  ellipsisStyle,
  metaTextStyle,
  subStyle,
  valueTextStyle,
  type HeroChip,
  type PillTone,
} from "../blocks";
import { daysLabel } from "../book";
import { riskIndexTone } from "../analytics/model";
import { countWord } from "../deals/model";
import { NavIcon, SETTINGS_NAV } from "../nav";
import { Money, SegmentMeter, SplitBar } from "../ui";
import { dueText, type AlertsData, type QueueDeal, type StageRisk } from "./derive";

export interface AlertsViewProps extends AlertsData {
  dataError: boolean;
}

const RISK_FILL = {
  calm: "var(--dl-ink)",
  watch: "var(--dl-amber)",
  high: "var(--dl-signal)",
} as const;

function heroChip(props: AlertsViewProps): HeroChip {
  if (props.dataError) return { label: "Data unavailable", tone: "start" };
  if (props.dealCount === 0) return { label: "Getting started", tone: "start" };
  if (props.overdueCount > 0) {
    return {
      label: `${props.overdueCount} ${props.overdueCount === 1 ? "action" : "actions"} overdue`,
      tone: "alert",
    };
  }
  if (props.highCount > 0) {
    return {
      label: `${props.highCount} high-risk ${props.highCount === 1 ? "deal" : "deals"}`,
      tone: "alert",
    };
  }
  return { label: "Nothing urgent", tone: "good" };
}

function heroClause(props: AlertsViewProps): string {
  if (props.dataError) return "it could not be read just now.";
  if (props.dealCount === 0) return "nothing on the book yet.";
  if (props.highCount === 0) return "no deal is at high risk right now.";
  const deals = props.highCount === 1 ? "deal" : "deals";
  return `${countWord(props.highCount)} high-risk ${deals} worth ${formatShortMoney(props.highValue)}.`;
}

function TwoToneSegments({
  urgent,
  important,
  label,
}: {
  urgent: number;
  important: number;
  label: string;
}) {
  const filled = urgent + important;
  const count = Math.min(12, Math.max(8, filled));
  const scale = filled > count ? count / filled : 1;
  const red = Math.round(urgent * scale);
  const amber = Math.min(count - red, Math.round(important * scale));
  return (
    <div role="img" aria-label={label} style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          style={{
            width: 12,
            height: 7,
            borderRadius: 2,
            background:
              i < red ? "var(--dl-signal)" : i < red + amber ? "var(--dl-amber)" : "var(--dl-seg)",
          }}
        />
      ))}
    </div>
  );
}

function KeyNumbers(props: AlertsViewProps) {
  const empty = props.openCount === 0;
  const [high, medium, low] = props.tiers;
  const avg = props.avgRisk ?? 0;
  return (
    <section aria-label="Key numbers" className="dl-grid">
      <KpiTile
        label="High risk"
        empty={empty}
        value={props.highCount}
        visual={
          <SplitBar
            emptyLabel="Nothing open"
            parts={[
              { key: "high", value: high.count, color: TIER_COLOR.high, label: `${high.count} high` },
              { key: "medium", value: medium.count, color: TIER_COLOR.medium, label: `${medium.count} medium` },
              { key: "low", value: low.count, color: TIER_COLOR.low, label: `${low.count} low of ${props.openCount} open deals` },
            ]}
          />
        }
        caption={`${formatShortMoney(props.highValue)} · ${props.highCount} of ${props.openCount} open deals`}
      />
      <KpiTile
        label="Overdue"
        empty={empty}
        value={props.overdueCount}
        visual={
          <SegmentMeter
            filled={props.overdueCount}
            total={Math.max(props.openCount, 1)}
            color="var(--dl-signal)"
            segmentWidth={12}
            label={`${props.overdueCount} of ${props.openCount} actions overdue`}
          />
        }
        caption={
          props.overdueCount > 0 && props.avgOverdueDays !== null
            ? `${formatShortMoney(props.overdueValue)} · ${daysLabel(Math.round(props.avgOverdueDays))} late on average`
            : "Everything on schedule"
        }
      />
      <KpiTile
        label="Urgent actions"
        empty={empty}
        value={props.urgentCount}
        visual={
          <TwoToneSegments
            urgent={props.urgentCount}
            important={props.importantCount}
            label={`${props.urgentCount} urgent, ${props.importantCount} important`}
          />
        }
        caption="overdue or high urgency"
      />
      <KpiTile
        label="Average risk"
        empty={empty}
        value={<Percent value={avg * 100} />}
        visual={
          <Track
            percent={avg * 100}
            width={124}
            color={RISK_FILL[riskIndexTone(avg)]}
            label={`${(avg * 100).toFixed(0)}%`}
          />
        }
        caption={`across ${props.openCount} open ${props.openCount === 1 ? "deal" : "deals"}`}
      />
    </section>
  );
}

function scoreColor(score: number): string {
  return RISK_FILL[riskIndexTone(score)];
}

function QueueItem({ deal, detailed }: { deal: QueueDeal; detailed: boolean }) {
  const due = dueText(deal);
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
        <b style={{ ...ellipsisStyle, minWidth: 0, fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>
          {deal.name}
        </b>
        <span style={valueTextStyle}>{formatShortMoney(deal.value)}</span>
      </div>
      {detailed && (
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
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontVariantNumeric: "tabular-nums" }}>
            <Track
              percent={deal.riskScore * 100}
              width={40}
              height={5}
              color={scoreColor(deal.riskScore)}
              label={`Risk score ${deal.riskScore.toFixed(2)}`}
            />
            {deal.riskScore.toFixed(2)}
          </span>
          <span>{deal.reason}</span>
        </div>
      )}
      {deal.action && (
        <p style={{ marginTop: 4, fontSize: 12.5, color: "var(--dl-muted)" }}>
          {deal.action}
          {deal.overdueDays !== null ? (
            <>
              {" "}
              · <span style={{ color: "var(--dl-signal-d)" }}>{daysLabel(deal.overdueDays)} overdue</span>
            </>
          ) : (
            due && <> · {due}</>
          )}
        </p>
      )}
    </li>
  );
}

function QueueColumn({
  title,
  count,
  tone,
  right,
  sub,
  deals,
  detailed,
  empty,
}: {
  title: string;
  count: number;
  tone: PillTone;
  right: ReactNode;
  sub: string;
  deals: QueueDeal[];
  detailed: boolean;
  empty: string;
}) {
  return (
    <div className="dl-third">
      <CellHead compact title={title} pill={<Pill tone={tone}>{count}</Pill>} right={right} />
      <p style={{ ...subStyle, padding: "0 var(--dl-gutter) 12px" }}>{sub}</p>
      {deals.length === 0 ? (
        <p
          style={{
            padding: "12px var(--dl-gutter) 16px",
            borderTop: "1px solid var(--dl-row)",
            fontSize: 13.5,
            color: "var(--dl-muted)",
          }}
        >
          {empty}
        </p>
      ) : (
        <ol aria-label={`${title} deals`}>
          {deals.map((deal) => (
            <QueueItem key={deal.id} deal={deal} detailed={detailed} />
          ))}
        </ol>
      )}
    </div>
  );
}

function ActionQueue(props: AlertsViewProps) {
  return (
    <section aria-label="Action queue" className="dl-grid">
      <QueueColumn
        title="Urgent"
        count={props.urgentCount}
        tone={props.urgentCount > 0 ? "alert" : "neutral"}
        right={<span style={subStyle}>move today</span>}
        sub="Overdue, or high urgency on a deal at risk"
        deals={props.urgent}
        detailed
        empty="Nothing urgent. No deal needs moving today."
      />
      <QueueColumn
        title="Important"
        count={props.importantCount}
        tone="neutral"
        right={<span style={subStyle}>this week</span>}
        sub="At risk, with time still on the clock"
        deals={props.important}
        detailed
        empty="Nothing on the watchlist right now."
      />
      <QueueColumn
        title="On track"
        count={props.safeCount}
        tone={props.safeCount > 0 ? "good" : "neutral"}
        right={<CellLink href="/deals?filter=active">Open all</CellLink>}
        sub="Healthy, keep the cadence"
        deals={props.safe}
        detailed={false}
        empty="No active deals yet."
      />
    </section>
  );
}

function StageBar({ row }: { row: StageRisk }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "96px minmax(0, 1fr) 40px",
        alignItems: "center",
        gap: 12,
        minHeight: 38,
        fontSize: 13.5,
      }}
    >
      <span style={ellipsisStyle}>{row.label}</span>
      <div style={{ display: "flex" }}>
        <SplitBar
          width="100%"
          emptyLabel={`No open deals in ${row.label}`}
          parts={[
            { key: "high", value: row.high, color: TIER_COLOR.high, label: `${row.high} high` },
            { key: "medium", value: row.medium, color: TIER_COLOR.medium, label: `${row.medium} medium` },
            { key: "low", value: row.low, color: TIER_COLOR.low, label: `${row.low} low` },
          ]}
        />
      </div>
      <span style={{ ...valueTextStyle, justifySelf: "end" }}>
        {row.total > 0 ? `${row.highPct.toFixed(0)}%` : "-"}
      </span>
    </div>
  );
}

function WhereRiskSits(props: AlertsViewProps) {
  const highShare = props.openValue > 0 ? (props.highValue / props.openValue) * 100 : 0;
  return (
    <section aria-label="Where the risk sits" className="dl-grid">
      <div className="dl-third">
        <CellHead
          title="Risk mix"
          sub={`The ${props.openCount} open ${props.openCount === 1 ? "deal" : "deals"} by tier`}
        />
        <div style={cellBodyStyle}>
          <div style={{ display: "flex" }}>
            <SplitBar
              width="100%"
              emptyLabel="Nothing open"
              parts={props.tiers.map((t) => ({
                key: t.key,
                value: t.count,
                color: TIER_COLOR[t.key],
                label: `${t.key === "high" ? "High" : t.key === "medium" ? "medium" : "low"} ${t.count}`,
              }))}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            {props.tiers.map((t) => (
              <TierLine
                key={t.key}
                tier={t.key}
                detail={`${t.count} · ${t.pct.toFixed(0)}%`}
                value={t.value}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="dl-third">
        <CellHead title="Value at risk" sub="The dollars on the line" />
        <div style={cellBodyStyle}>
          <BigFigure>
            <Money value={props.highValue} />
          </BigFigure>
          <p style={{ ...subStyle, marginTop: 2 }}>
            {props.highCount > 0
              ? `in ${countWord(props.highCount)} high-risk ${props.highCount === 1 ? "deal" : "deals"}, ${highShare.toFixed(0)}% of open value`
              : "no open deal is at high risk"}
          </p>
          <div style={{ marginTop: 12 }}>
            <KeyValue label="Behind an overdue action">
              {formatShortMoney(props.overdueValue)}
            </KeyValue>
            <KeyValue label="High-risk deals idle, on average">
              {props.highIdleDays === null ? "-" : `${props.highIdleDays.toFixed(1)} days`}
            </KeyValue>
            <KeyValue label="Turned high risk this week">{props.turnedHighThisWeek}</KeyValue>
          </div>
        </div>
      </div>
      <div className="dl-third">
        <CellHead title="Risk by stage" sub="Share of each stage at high risk" />
        <div style={cellBodyStyle}>
          {props.stages.map((row) => (
            <StageBar key={row.key} row={row} />
          ))}
          <Legend
            style={{ marginTop: 12 }}
            items={[
              { label: "High", color: TIER_COLOR.high },
              { label: "Medium", color: TIER_COLOR.medium },
              { label: "Low", color: TIER_COLOR.low },
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function Signals(props: AlertsViewProps) {
  return (
    <section
      aria-label="What makes a deal risky"
      className="dl-grow"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <CellHead
        title="What makes a deal risky"
        sub="The four signals Sentinel watches, scored 0 to 1"
        right={
          <span className="dl-wide-only" style={subStyle}>
            Recent emails, replies and meetings lower the score
          </span>
        }
      />
      <div className="dl-grid" style={{ flexGrow: 1, borderTop: "1px solid var(--dl-divider)" }}>
        {props.signals.map((signal) => (
          <div
            key={signal.key}
            className="dl-quarter"
            style={{ padding: "18px var(--dl-gutter) 20px" }}
          >
            <p style={{ fontSize: 14, fontWeight: 600 }}>{signal.title}</p>
            <p style={{ ...subStyle, marginTop: 4, lineHeight: 1.5 }}>{signal.body}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
              <SegmentMeter
                filled={signal.count}
                total={Math.max(props.highCount, 1)}
                color="var(--dl-signal)"
                segmentWidth={12}
                label={`${signal.count} of ${props.highCount} high-risk deals`}
              />
              <span style={metaTextStyle}>
                {signal.count} of {props.highCount} high-risk {props.highCount === 1 ? "deal" : "deals"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AlertsView(props: AlertsViewProps) {
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
        headline="The deals demanding"
        emphasis="attention."
        clause={heroClause(props)}
        deck={
          <>
            What is slipping, what is overdue and where pressure sits
            <WideOnly>, scored from activity, stage, value and competitive signals</WideOnly>.
          </>
        }
        actions={
          <>
            <HeroLink href="/deals?filter=at-risk" tone="primary">
              Open at-risk deals
            </HeroLink>
            <HeroLink
              href="/settings#settings-risk"
              tone="secondary"
              icon={
                <NavIcon size={15} strokeWidth={1.75}>
                  {SETTINGS_NAV.icon}
                </NavIcon>
              }
            >
              Risk settings
            </HeroLink>
          </>
        }
      />
      <KeyNumbers {...props} />
      {props.dealCount === 0 ? (
        <BookEmpty
          unavailable={props.dataError}
          title="Nothing"
          emphasis="to watch."
          body="Connect a CRM or add a deal by hand. Sentinel scores every open deal for risk and lines up what needs doing."
        />
      ) : (
        <>
          <ActionQueue {...props} />
          <WhereRiskSits {...props} />
          <Signals {...props} />
        </>
      )}
    </>
  );
}
