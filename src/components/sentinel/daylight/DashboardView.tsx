import { format } from "date-fns";
import type { LeadHeadline } from "../derive";
import type { AIPanelContent, BriefingItem, ShortListItem } from "../types";
import { AttentionPanel } from "./AttentionPanel";
import { ChannelCell } from "./ChannelCell";
import { CustomersCell } from "./CustomersCell";
import { DealsPanel } from "./DealsPanel";
import { ForecastCell } from "./ForecastCell";
import { OverviewPanel } from "./OverviewPanel";
import { SignalsPanel } from "./SignalsPanel";
import { SummaryPanel } from "./SummaryPanel";

export interface DashboardViewProps {
  now: Date;
  dbUnavailable: boolean;
  headline: LeadHeadline;
  briefingItems: BriefingItem[];
  pipeline: {
    total: number;
    growthPercent: number;
    active: number;
    won: number;
    lost: number;
    totalDeals: number;
  };
  velocity: {
    current: number[];
    prior: number[];
    labels: string[];
    marker: { index: number; label: string; value: string } | null;
  };
  atRisk: { totalValue: number; flaggedCount: number };
  winRate: number;
  newThisWeek: number;
  forecast: {
    expected: number;
    bestCase: number;
    worstCase: number;
    confidence: number;
    avgDealAgeDays: number;
  };
  shortList: ShortListItem[];
  aiPanel: AIPanelContent;
  anomalies: Array<{
    severity: "high" | "medium" | "low";
    dealName: string;
    reason: string;
  }>;
  patterns: Array<{
    type: string;
    description: string;
    impact: "positive" | "negative" | "neutral";
  }>;
  recommendations: string[];
  revenueBars: Array<{ label: string; value: number; share: number }>;
  countryCounts: Array<{ country: string; count: number }>;
  topDeals: Array<{
    id: string;
    name: string;
    segment?: string;
    stage: string;
    value: number;
  }>;
  meetings: Array<{
    id: string;
    title: string;
    startTime: Date;
    endTime?: Date;
    location?: string | null;
    meetingLink?: string | null;
    attendees?: string[];
    associatedDealName?: string | null;
  }>;
  calendarConnected: boolean;
}

function currentMonthIndex(labels: string[], current: number[], now: Date) {
  const byLabel = labels.indexOf(format(now, "MMM"));
  if (byLabel !== -1) return byLabel;
  for (let i = current.length - 1; i >= 0; i--) {
    if (current[i] > 0) return i;
  }
  return Math.max(0, labels.length - 1);
}

export function DashboardView(props: DashboardViewProps) {
  const { pipeline, velocity, atRisk, forecast } = props;

  return (
    <>
      {props.dbUnavailable && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "11px var(--dl-gutter)",
            background: "var(--dl-signal-tint)",
            borderBottom: "1px solid var(--dl-divider)",
            color: "var(--dl-signal-d)",
            fontSize: 13.5,
            fontWeight: 500,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 7,
              height: 7,
              flexShrink: 0,
              borderRadius: "50%",
              background: "var(--dl-signal)",
            }}
          />
          Desk offline. The database is unreachable, retry shortly.
        </div>
      )}

      <SummaryPanel
        headline={props.headline}
        briefingItems={props.briefingItems}
      />

      <OverviewPanel
        pipeline={pipeline}
        velocity={{
          ...velocity,
          currentIndex: currentMonthIndex(
            velocity.labels,
            velocity.current,
            props.now
          ),
        }}
        atRisk={atRisk}
        winRate={props.winRate}
        newThisWeek={props.newThisWeek}
        forecast={forecast}
      />

      <AttentionPanel
        shortList={props.shortList}
        activeCount={pipeline.active}
        flaggedCount={atRisk.flaggedCount}
        flaggedValue={atRisk.totalValue}
        aiPanel={props.aiPanel}
      />

      <SignalsPanel
        anomalies={props.anomalies}
        patterns={props.patterns}
        recommendations={props.recommendations}
      />

      <div className="dl-grid">
        <ForecastCell
          expected={forecast.expected}
          bestCase={forecast.bestCase}
          worstCase={forecast.worstCase}
          confidence={forecast.confidence}
          openDeals={pipeline.active}
          avgDealAgeDays={forecast.avgDealAgeDays}
        />
        <ChannelCell bars={props.revenueBars} />
        <CustomersCell pins={props.countryCounts} />
      </div>

      <DealsPanel
        topDeals={props.topDeals}
        meetings={props.meetings}
        calendarConnected={props.calendarConnected}
        now={props.now}
      />
    </>
  );
}
