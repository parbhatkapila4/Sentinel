import { AnalyticsHero, type HeroChip } from "./AnalyticsHero";
import { KeyNumbers } from "./KeyNumbers";
import { RangeEmpty } from "./RangeEmpty";
import { RangeScope } from "./RangeScope";
import { Healthiest, SecondLook } from "./RankedDeals";
import { RiskMix } from "./RiskMix";
import { StageChart } from "./StageChart";
import {
  rangeClause,
  type AnalyticsRange,
  type AnalyticsTotals,
  type HealthyRow,
  type SecondLookRow,
  type StageRow,
  type TierRow,
} from "./model";

export interface AnalyticsViewProps {
  range: AnalyticsRange;
  rangeCounts: Record<AnalyticsRange, number>;
  dataError: boolean;
  hasAnyDeals: boolean;
  totals: AnalyticsTotals;
  stages: StageRow[];
  tiers: TierRow[];
  secondLook: SecondLookRow[];
  highRiskTotal: number;
  healthiest: HealthyRow[];
  lowRiskTotal: number;
}

function heroChip(props: AnalyticsViewProps): HeroChip {
  const { totals } = props;
  if (props.dataError) return { label: "Data unavailable", tone: "start" };
  if (!props.hasAnyDeals) return { label: "Getting started", tone: "start" };
  if (totals.deals === 0) return { label: "Nothing in this range", tone: "neutral" };
  if (totals.needsAction > 0) {
    return {
      label: `${totals.needsAction.toLocaleString("en-US")} need${totals.needsAction === 1 ? "s" : ""} action`,
      tone: "alert",
    };
  }
  return { label: "Nothing urgent", tone: "good" };
}

export function AnalyticsView(props: AnalyticsViewProps) {
  const { totals, range } = props;

  return (
    <>
      {props.dataError && (
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
          Data temporarily unavailable. The deals could not be loaded, retry
          shortly.
        </div>
      )}

      <AnalyticsHero
        chip={heroChip(props)}
        clause={
          props.dataError
            ? "it could not be read just now."
            : rangeClause(totals.deals, totals.value, range)
        }
      />

      <RangeScope range={range} counts={props.rangeCounts}>
        <KeyNumbers range={range} totals={totals} />
        {totals.deals === 0 ? (
          <RangeEmpty
            range={range}
            counts={props.rangeCounts}
            hasAnyDeals={props.hasAnyDeals}
            unavailable={props.dataError}
          />
        ) : (
          <>
            <div className="dl-grid">
              <StageChart rows={props.stages} />
              <RiskMix tiers={props.tiers} />
            </div>
            <div className="dl-grid dl-grow">
              <SecondLook rows={props.secondLook} total={props.highRiskTotal} />
              <Healthiest rows={props.healthiest} total={props.lowRiskTotal} />
            </div>
          </>
        )}
      </RangeScope>
    </>
  );
}
