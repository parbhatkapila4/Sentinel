import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";

import {
  getAllDeals,
  getFounderRiskOverview,
  getFounderActionQueue,
} from "@/app/actions/deals";
import { getAllIntegrationStatuses } from "@/app/actions/integrations";
import { formatRiskLevel } from "@/lib/dealRisk";
import {
  HIGH_VALUE_THRESHOLD,
  INACTIVITY_DAYS,
  RISK_REASONS,
  STAGE_UI_CONFIG,
} from "@/lib/config";
import { formatValueInMillions } from "@/lib/utils";
import { UnauthorizedError } from "@/lib/errors";

import { SentinelShell } from "@/components/sentinel/shell/SentinelShell";
import { SectionRule } from "@/components/sentinel/sections/SectionRule";
import { Colophon } from "@/components/sentinel/Colophon";

import { DealsMasthead } from "@/components/sentinel/deals/DealsMasthead";
import { DealsKPIs } from "@/components/sentinel/deals/DealsKPIs";
import { Panel } from "@/components/sentinel/analytics/Panel";
import { RiskDonut } from "@/components/sentinel/analytics/RiskDonut";

import { RiskRules } from "@/components/sentinel/risk/RiskRules";
import {
  StageRiskGrid,
  type StageRiskCell,
} from "@/components/sentinel/risk/StageRiskGrid";
import {
  ActionQueueBoard,
  type ActionQueueColumn,
  type ActionQueueDeal,
} from "@/components/sentinel/risk/ActionQueueBoard";

import {
  buildSentinelShellContext,
  mapRawDealsToSentinel,
} from "@/components/sentinel/shell-context";
import { formatShortMoney } from "@/lib/format-money";

export const dynamic = "force-dynamic";

type RawDeal = Awaited<ReturnType<typeof getAllDeals>>[number];

function formatTightMoney(n: number) {
  const f = formatValueInMillions(n);
  return `$${f.value}${f.suffix}`;
}

const STAGE_DISPLAY: Record<string, string> = {
  lead: "Lead",
  discover: "Discover",
  discovery: "Discover",
  qualify: "Qualify",
  qualified: "Qualified",
  qualification: "Qualify",
  proposal: "Proposal",
  negotiation: "Negotiation",
  negotiate: "Negotiation",
  closed_won: "Won",
  closed_lost: "Lost",
};

function prettyStage(s: string) {
  const k = s.toLowerCase().replace(/\s+/g, "_");
  return (
    STAGE_DISPLAY[k] ??
    s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function buildDealMeta(d: RawDeal): string {
  const stage = prettyStage(d.stage).toUpperCase();
  const last = d.lastActivityAt
    ? formatDistanceToNow(new Date(d.lastActivityAt), {
        addSuffix: true,
      }).toUpperCase()
    : "NO ACTIVITY";
  return `${stage} · ${last}`;
}

export default async function RiskOverviewPage() {
  noStore();
  const now = new Date();

  let dealsRaw: RawDeal[] = [];
  let riskOverview: Awaited<ReturnType<typeof getFounderRiskOverview>> = {
    totalDeals: 0,
    atRiskDealsCount: 0,
    overdueDealsCount: 0,
    highUrgencyDealsCount: 0,
    dealsOverdueMoreThan3Days: 0,
    top3MostCriticalDeals: [],
  };
  let actionQueue: Awaited<ReturnType<typeof getFounderActionQueue>> = {
    urgent: [],
    important: [],
    safe: [],
  };
  let dataError = false;

  try {
    [dealsRaw, riskOverview, actionQueue] = await Promise.all([
      getAllDeals(),
      getFounderRiskOverview(),
      getFounderActionQueue(),
    ]);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect("/sign-in?redirect=/risk-overview");
    }
    dataError = true;
  }

  let integrationStatuses: Awaited<
    ReturnType<typeof getAllIntegrationStatuses>
  > | null = null;
  try {
    integrationStatuses = await getAllIntegrationStatuses();
  } catch {
    integrationStatuses = null;
  }

  const highRiskDeals = dealsRaw.filter(
    (d) => formatRiskLevel(d.riskScore) === "High"
  );
  const mediumRiskDeals = dealsRaw.filter(
    (d) => formatRiskLevel(d.riskScore) === "Medium"
  );
  const lowRiskDeals = dealsRaw.filter(
    (d) => formatRiskLevel(d.riskScore) === "Low"
  );

  const highRiskValue = highRiskDeals.reduce((s, d) => s + d.value, 0);
  const mediumRiskValue = mediumRiskDeals.reduce((s, d) => s + d.value, 0);
  const lowRiskValue = lowRiskDeals.reduce((s, d) => s + d.value, 0);
  const totalValue = dealsRaw.reduce((s, d) => s + d.value, 0);
  const valueAtRiskPct = totalValue > 0 ? (highRiskValue / totalValue) * 100 : 0;

  const avgRiskScore =
    dealsRaw.length > 0
      ? dealsRaw.reduce((s, d) => s + d.riskScore, 0) / dealsRaw.length
      : 0;

  const highRiskWithAge = highRiskDeals.map((d) => d.riskAgeInDays || 0);
  const avgRiskAge =
    highRiskWithAge.length > 0
      ? highRiskWithAge.reduce((s, n) => s + n, 0) / highRiskWithAge.length
      : 0;

  const overdueDeals = dealsRaw.filter((d) => d.isActionOverdue);
  const overdueValue = overdueDeals.reduce((s, d) => s + d.value, 0);
  const avgOverdueDays =
    overdueDeals.length > 0
      ? overdueDeals.reduce(
          (s, d) => s + (d.actionOverdueByDays || 0),
          0
        ) / overdueDeals.length
      : 0;

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentEscalations = highRiskDeals.filter((d) => {
    if (!d.riskStartedAt) return false;
    return new Date(d.riskStartedAt) >= sevenDaysAgo;
  }).length;

  const lowAction = lowRiskDeals.filter(
    (d) => d.recommendedAction?.urgency === "high"
  ).length;
  const mediumAction = mediumRiskDeals.filter(
    (d) => d.recommendedAction?.urgency === "high"
  ).length;
  const highAction = highRiskDeals.filter(
    (d) => d.recommendedAction?.urgency === "high" || d.isActionOverdue
  ).length;

  type StageBucket = { high: number; medium: number; low: number; total: number };
  const stageRiskMap: Record<string, StageBucket> = {};
  dealsRaw.forEach((d) => {
    const k = d.stage;
    stageRiskMap[k] ||= { high: 0, medium: 0, low: 0, total: 0 };
    const lvl = formatRiskLevel(d.riskScore);
    stageRiskMap[k][lvl.toLowerCase() as "high" | "medium" | "low"]++;
    stageRiskMap[k].total++;
  });

  type StageUi = (typeof STAGE_UI_CONFIG)[keyof typeof STAGE_UI_CONFIG];
  const stageConfig = STAGE_UI_CONFIG as Record<string, StageUi>;
  const stageOrder = (s: string) => stageConfig[s.toLowerCase()]?.order ?? 99;

  const stageCells: StageRiskCell[] = Object.entries(stageRiskMap)
    .sort(([a], [b]) => stageOrder(a) - stageOrder(b))
    .map(([stage, b]) => ({
      stage,
      label: prettyStage(stage),
      high: b.high,
      medium: b.medium,
      low: b.low,
      total: b.total,
    }));

  const riskReasonsCount: Record<string, number> = {};
  highRiskDeals.forEach((d) => {
    if (d.primaryRiskReason) {
      riskReasonsCount[d.primaryRiskReason] =
        (riskReasonsCount[d.primaryRiskReason] || 0) + 1;
    }
  });

  const riskRules = [
    {
      title: "Activity decay past threshold",
      description: `No human activity for more than ${INACTIVITY_DAYS} days raises the score sharply.`,
      count: riskReasonsCount[RISK_REASONS.NO_ACTIVITY] || 0,
      tone: "copper" as const,
    },
    {
      title: "Negotiation stalled without response",
      description:
        "Late-stage deals lose health quickly when outreach goes unanswered or replies stop.",
      count: riskReasonsCount[RISK_REASONS.NEGOTIATION_STALLED] || 0,
      tone: "wine" as const,
    },
    {
      title: "High-value exposure",
      description: `Deals above $${HIGH_VALUE_THRESHOLD.toLocaleString("en-US")} carry extra weight - the downside reads larger on the book.`,
      count: riskReasonsCount[RISK_REASONS.HIGH_VALUE] || 0,
      tone: "wine" as const,
    },
    {
      title: "Competitive signals detected",
      description:
        "Timing or interaction patterns suggest the buyer may be evaluating alternatives in parallel.",
      count: riskReasonsCount[RISK_REASONS.COMPETITIVE_PRESSURE] || 0,
      tone: "signal" as const,
    },
  ];

  const toQueueDeals = (
    list: typeof actionQueue.urgent
  ): ActionQueueDeal[] =>
    list.map((deal) => {
      const raw = dealsRaw.find((d) => d.id === deal.id);
      return {
        id: deal.id,
        name: deal.name,
        valueDisplay: raw ? formatTightMoney(raw.value) : "-",
        meta: raw ? buildDealMeta(raw) : prettyStage(deal.stage).toUpperCase(),
        recommendedAction: deal.recommendedAction?.label ?? null,
        overdueDays: deal.actionOverdueByDays ?? null,
      };
    });

  const queueColumns: ActionQueueColumn[] = [
    {
      key: "urgent",
      label: "Urgent",
      caption: "Move on these today - overdue or high-urgency.",
      pulse: actionQueue.urgent.length > 0,
      deals: toQueueDeals(actionQueue.urgent),
      emptyHeadline: "Nothing on fire",
      emptyBody: "No deals require immediate intervention right now.",
    },
    {
      key: "important",
      label: "Important",
      caption: "At-risk, but the runway hasn't closed yet.",
      deals: toQueueDeals(actionQueue.important),
      emptyHeadline: "Nothing watching",
      emptyBody: "Risk levels are stable across the watchlist.",
    },
    {
      key: "safe",
      label: "On Track",
      caption: "Active deals progressing without concerning signals.",
      deals: toQueueDeals(actionQueue.safe),
      emptyHeadline: "No active deals",
      emptyBody: "Once new deals come in, you'll see them here.",
    },
  ];

  const isDemoMode =
    dealsRaw.length > 0 && dealsRaw.every((d) => d.isDemo);
  const hasAnyDeals = dealsRaw.length > 0;
  const closedWonAll = dealsRaw.filter((d) => {
    const s = d.stage.toLowerCase().replace(/\s+/g, "_");
    return s === "closed_won";
  }).length;
  const coveragePercent =
    dealsRaw.length > 0 ? (closedWonAll / dealsRaw.length) * 100 : 0;

  const deals = mapRawDealsToSentinel(dealsRaw);
  const shellContext = buildSentinelShellContext({
    deals,
    integrationStatuses,
    coveragePercent,
    hasAnyDeals,
    isDemoMode,
    now,
  });

  const healthLabel =
    avgRiskScore < 0.4
      ? "HEALTHY"
      : avgRiskScore < 0.6
        ? "MODERATE"
        : "CRITICAL";
  const healthTone: "up" | "down" | "neutral" =
    avgRiskScore < 0.4 ? "up" : avgRiskScore < 0.6 ? "neutral" : "down";

  const kpiItems = [
    {
      index: "01",
      label: "High Risk",
      value: String(riskOverview.atRiskDealsCount),
      support: highRiskValue > 0
        ? `${formatShortMoney(highRiskValue)} EXPOSED`
        : "DESK CLEAR",
      trendTone:
        riskOverview.atRiskDealsCount > 0 ? ("down" as const) : ("up" as const),
    },
    {
      index: "02",
      label: "Overdue",
      value: String(riskOverview.overdueDealsCount),
      support:
        riskOverview.overdueDealsCount > 0
          ? `AVG ${avgOverdueDays.toFixed(0)}D LATE`
          : "ON SCHEDULE",
      trendTone:
        riskOverview.overdueDealsCount > 0
          ? ("down" as const)
          : ("up" as const),
    },
    {
      index: "03",
      label: "Urgent Actions",
      value: String(riskOverview.highUrgencyDealsCount),
      support:
        recentEscalations > 0
          ? `${recentEscalations} ESCALATED THIS WEEK`
          : "NO NEW ESCALATIONS",
      trendTone:
        recentEscalations > 0 ? ("down" as const) : ("neutral" as const),
    },
    {
      index: "04",
      label: "Avg Risk Score",
      value: `${(avgRiskScore * 100).toFixed(0)}%`,
      support: healthLabel,
      trendTone: healthTone,
    },
  ];

  const dateLine = format(now, "EEEE - MMMM d, yyyy").toUpperCase();
  const masthHeadMeta = [
    { label: "Edition", value: format(now, "HH:mm") },
    { label: "On Wire", value: String(dealsRaw.length) },
    { label: "At Risk", value: String(highRiskDeals.length) },
    { label: "Overdue", value: String(overdueDeals.length) },
  ];

  return (
    <SentinelShell
      syncTime={shellContext.syncTime}
      coveragePercent={shellContext.coveragePercent}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      tickerItems={shellContext.tickerItems}
      onboarding={shellContext.onboarding}
    >
      {dataError && (
        <div
          role="alert"
          style={{
            margin: "16px 56px 0",
            padding: "12px 16px",
            border: "1px solid var(--copper)",
            borderLeft: "3px solid var(--copper)",
            background: "rgba(217,153,90,0.06)",
            color: "var(--cream-2)",
            fontFamily: "var(--font-mono-jb)",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          DATA TEMPORARILY UNAVAILABLE - DESK RUNNING ON CACHE
        </div>
      )}

      <DealsMasthead
        kicker={`Risk Desk · ${dateLine}`}
        headline="The deals demanding"
        italicWord="attention."
        deck="A read on which deals are slipping, what's overdue, and where pressure is concentrating across the book - composed from activity decay, stage context, value exposure, and competitive signals."
        meta={masthHeadMeta}
      />

      <SectionRule
        number="01"
        label="HEADLINE METRICS"
        meta={`${dealsRaw.length} ON WIRE · ${formatShortMoney(totalValue)}`}
      />
      <DealsKPIs items={kpiItems} />

      <SectionRule
        number="02"
        label="RISK DISTRIBUTION"
        meta={`${highRiskDeals.length} HIGH · ${mediumRiskDeals.length} MED · ${lowRiskDeals.length} LOW`}
      />
      <section
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
        style={{ gap: 0, paddingBottom: 4 }}
      >
        <div
          style={{
            padding: "32px 32px 36px",
            borderRight: "1px solid var(--rule)",
          }}
        >
          <Panel
            kicker="Risk allocation"
            title="Where the book is"
            italicWord="exposed."
            accent="wine"
            meta={`${dealsRaw.length} TOTAL DEALS`}
          >
            <RiskDonut
              low={lowRiskDeals.length}
              medium={mediumRiskDeals.length}
              high={highRiskDeals.length}
              lowAction={lowAction}
              mediumAction={mediumAction}
              highAction={highAction}
            />
          </Panel>
        </div>

        <div style={{ padding: "32px 32px 36px" }}>
          <Panel
            kicker="Value at risk"
            title="The dollars on the"
            italicWord="line."
            accent="copper"
            meta={`${valueAtRiskPct.toFixed(1)}% OF PIPELINE`}
          >
            <ValueAtRiskBlock
              high={highRiskValue}
              medium={mediumRiskValue}
              low={lowRiskValue}
              total={totalValue}
              avgRiskAge={avgRiskAge}
              overdueValue={overdueValue}
              recentEscalations={recentEscalations}
            />
          </Panel>
        </div>
      </section>

      <SectionRule
        number="03"
        label="MOST CRITICAL DEALS"
        meta={`TOP ${riskOverview.top3MostCriticalDeals.length} · BY URGENCY × OVERDUE × RISK`}
      />
      <CriticalDealsBlock
        deals={riskOverview.top3MostCriticalDeals}
        rawDeals={dealsRaw}
      />

      <SectionRule
        number="04"
        label="WHAT MAKES A DEAL RISKY"
        meta={`${highRiskDeals.length} HIGH-RISK SAMPLE`}
      />
      <section style={{ padding: "32px 32px 40px" }}>
        <Panel
          kicker="Risk rules"
          title="The four signals Sentinel"
          italicWord="watches."
          accent="signal"
          meta="SCORED 0 → 1"
        >
          <RiskRules
            rules={riskRules}
            denominator={highRiskDeals.length}
            preamble="Sentinel composes each deal's risk score by combining activity decay, stage context, deal value, and competitive pressure into a single 0–1 reading. These are the four primary triggers behind today's high-risk set."
            postamble="Recent emails sent, replies received, and meetings held reduce the score - so active conversations stay healthier."
          />
        </Panel>
      </section>

      {stageCells.length > 0 && (
        <>
          <SectionRule
            number="05"
            label="RISK BY STAGE"
            meta={`${stageCells.length} STAGES · COMPOSITION × HIGH-RISK %`}
          />
          <section style={{ padding: "0 32px 40px" }}>
            <StageRiskGrid cells={stageCells} />
          </section>
        </>
      )}

      <SectionRule
        number="06"
        label="ACTION QUEUE"
        meta={`${actionQueue.urgent.length} URGENT · ${actionQueue.important.length} WATCH · ${actionQueue.safe.length} CLEAR`}
      />
      <ActionQueueBoard columns={queueColumns} />

      <Colophon systemStatus={dataError ? "degraded" : "operational"} />
    </SentinelShell>
  );
}

interface ValueAtRiskBlockProps {
  high: number;
  medium: number;
  low: number;
  total: number;
  avgRiskAge: number;
  overdueValue: number;
  recentEscalations: number;
}

function ValueAtRiskBlock({
  high,
  medium,
  low,
  total,
  avgRiskAge,
  overdueValue,
  recentEscalations,
}: ValueAtRiskBlockProps) {
  const highPct = total > 0 ? (high / total) * 100 : 0;
  const medPct = total > 0 ? (medium / total) * 100 : 0;
  const lowPct = total > 0 ? (low / total) * 100 : 0;

  const rows = [
    { label: "High risk", value: high, pct: highPct, color: "var(--wine)" },
    { label: "Medium risk", value: medium, pct: medPct, color: "var(--copper)" },
    { label: "Low risk", value: low, pct: lowPct, color: "var(--ivy)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {rows.map((r, i) => (
          <li
            key={r.label}
            className="anim-rise"
            style={{ animationDelay: `${100 + i * 60}ms` }}
          >
            <div
              className="flex items-baseline justify-between"
              style={{ gap: 12, marginBottom: 6 }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  color: "var(--cream-3)",
                  textTransform: "uppercase",
                }}
              >
                {r.label}
              </span>
              <span
                className="tabular"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 22,
                  color: r.color,
                  letterSpacing: "-0.02em",
                }}
              >
                {formatShortMoney(r.value)}
              </span>
            </div>
            <div
              style={{
                height: 2,
                background: "var(--ink-03)",
                overflow: "hidden",
              }}
              aria-hidden
            >
              <span
                className="anim-bar-fill"
                style={{
                  display: "block",
                  height: "100%",
                  width: `${Math.max(r.pct, r.value > 0 ? 4 : 0)}%`,
                  background: r.color,
                }}
              />
            </div>
            <div
              className="tabular"
              style={{
                marginTop: 6,
                fontFamily: "var(--font-mono-jb)",
                fontSize: 9.5,
                letterSpacing: "0.14em",
                color: "var(--cream-4)",
                textTransform: "uppercase",
              }}
            >
              {r.pct.toFixed(1)}% OF PIPELINE
            </div>
          </li>
        ))}
      </ul>

      <dl
        className="grid grid-cols-3"
        style={{
          margin: 0,
          gap: 0,
          paddingTop: 18,
          borderTop: "1px solid var(--rule)",
        }}
      >
        <SmallStat
          label="Avg Risk Age"
          value={`${avgRiskAge.toFixed(0)}D`}
          tint="var(--cream)"
        />
        <SmallStat
          label="Overdue Value"
          value={formatShortMoney(overdueValue)}
          tint={overdueValue > 0 ? "var(--copper)" : "var(--cream)"}
          divider
        />
        <SmallStat
          label="New This Week"
          value={String(recentEscalations)}
          tint={recentEscalations > 0 ? "var(--wine)" : "var(--cream)"}
          divider
        />
      </dl>

      <p
        style={{
          paddingTop: 14,
          borderTop: "1px solid var(--rule)",
          margin: 0,
          fontSize: 13,
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          color: "var(--cream-3)",
          lineHeight: 1.55,
        }}
      >
        Total pipeline reads {formatShortMoney(total)} -{" "}
        {highPct.toFixed(1)}% of it sits in the high-risk band.
      </p>
    </div>
  );
}

function SmallStat({
  label,
  value,
  tint,
  divider,
}: {
  label: string;
  value: string;
  tint: string;
  divider?: boolean;
}) {
  return (
    <div
      style={{
        padding: "0 14px",
        borderLeft: divider ? "1px solid var(--rule)" : "none",
      }}
    >
      <dt
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 9.5,
          letterSpacing: "0.16em",
          color: "var(--cream-4)",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </dt>
      <dd
        className="tabular"
        style={{
          margin: 0,
          fontFamily: "var(--font-serif)",
          fontSize: 22,
          color: tint,
          letterSpacing: "-0.01em",
        }}
      >
        {value}
      </dd>
    </div>
  );
}

interface CriticalDealsBlockProps {
  deals: Awaited<
    ReturnType<typeof getFounderRiskOverview>
  >["top3MostCriticalDeals"];
  rawDeals: RawDeal[];
}

function CriticalDealsBlock({ deals, rawDeals }: CriticalDealsBlockProps) {
  if (deals.length === 0) {
    return (
      <section
        style={{
          padding: "60px 56px",
          textAlign: "center",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10.5,
            letterSpacing: "0.22em",
            color: "var(--ivy)",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Desk Clear
        </p>
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 32,
            lineHeight: 1.05,
            color: "var(--cream)",
            letterSpacing: "-0.02em",
            maxWidth: 520,
            margin: "0 auto 10px",
          }}
        >
          Nothing on the{" "}
          <em
            style={{
              fontStyle: "italic",
              color: "var(--ivy)",
              fontFamily: "var(--font-serif)",
            }}
          >
            critical list.
          </em>
        </h3>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.55,
            color: "var(--cream-3)",
            maxWidth: 460,
            margin: "0 auto",
          }}
        >
          The pipeline is reading healthy. Sentinel will surface deals here as
          soon as risk concentration warrants attention.
        </p>
      </section>
    );
  }

  return (
    <section
      style={{
        padding: "0 32px 32px",
      }}
    >
      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          borderTop: "1px solid var(--rule)",
        }}
      >
        {deals.map((deal, i) => {
          const raw = rawDeals.find((d) => d.id === deal.id);
          return (
            <li
              key={deal.id}
              className="anim-rise"
              style={{ animationDelay: `${100 + i * 70}ms` }}
            >
              <Link
                href={`/deals/${deal.id}`}
                className="grid grid-cols-1 md:grid-cols-[64px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,160px)]"
                style={{
                  gap: 24,
                  padding: "26px 24px",
                  borderBottom: "1px solid var(--rule)",
                  textDecoration: "none",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: "0 auto 0 0",
                    width: 2,
                    background: "var(--wine)",
                  }}
                />
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 36,
                    color: "var(--wine)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                  className="tabular"
                >
                  #{String(i + 1).padStart(2, "0")}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 9.5,
                      letterSpacing: "0.18em",
                      color: "var(--wine)",
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  >
                    {deal.riskLevel} Risk · {raw ? prettyStage(raw.stage) : "-"}
                  </div>
                  <h4
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 24,
                      lineHeight: 1.15,
                      color: "var(--cream)",
                      letterSpacing: "-0.01em",
                      marginBottom: 4,
                    }}
                  >
                    {deal.name}
                  </h4>
                  {raw && (
                    <div
                      className="tabular"
                      style={{
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        color: "var(--cream-3)",
                        textTransform: "uppercase",
                      }}
                    >
                      {formatTightMoney(raw.value)} ON BOOK
                    </div>
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 14,
                      fontStyle: "italic",
                      color: "var(--cream-2)",
                      lineHeight: 1.5,
                      marginBottom: 8,
                    }}
                  >
                    {deal.primaryRiskReason ?? "Risk signal detected."}
                  </p>
                  {deal.recommendedAction && (
                    <div
                      style={{
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 10,
                        letterSpacing: "0.16em",
                        color: "var(--signal)",
                        textTransform: "uppercase",
                      }}
                    >
                      → {deal.recommendedAction.label}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    textAlign: "right",
                    minWidth: 0,
                  }}
                >
                  {deal.actionOverdueByDays !== null &&
                  deal.actionOverdueByDays > 0 ? (
                    <>
                      <div
                        className="tabular"
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: 26,
                          color: "var(--copper)",
                          letterSpacing: "-0.02em",
                          lineHeight: 1,
                        }}
                      >
                        {deal.actionOverdueByDays}D
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          fontFamily: "var(--font-mono-jb)",
                          fontSize: 9.5,
                          letterSpacing: "0.16em",
                          color: "var(--copper)",
                          textTransform: "uppercase",
                        }}
                      >
                        Overdue
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 10,
                        letterSpacing: "0.16em",
                        color: "var(--cream-4)",
                        textTransform: "uppercase",
                      }}
                    >
                      In window
                    </div>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
