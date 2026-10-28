import { DealsHero } from "./DealsHero";
import { DealsList } from "./DealsList";
import { DealsTotals, type DealsTotalsProps } from "./DealsTotals";
import { StageFlow } from "./StageFlow";
import type { DealRow, DealsFilter, DealsScope, StageCell } from "./model";

export interface DealsViewProps {
  scope: DealsScope;
  filter: DealsFilter;
  search: string;
  teamId: string | null;
  dataError: boolean;
  totals: DealsTotalsProps;
  stages: StageCell[];
  inMotionValue: number;
  counts: Record<DealsFilter, number>;
  deals: DealRow[];
  nowMs: number;
}

export function DealsView(props: DealsViewProps) {
  const { totals } = props;

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

      <DealsHero
        scope={props.scope}
        teamId={props.teamId}
        total={totals.dealCount}
        atRisk={totals.atRiskCount}
        unavailable={props.dataError}
      />
      <DealsTotals {...totals} />
      <StageFlow stages={props.stages} inMotionValue={props.inMotionValue} />
      <DealsList
        deals={props.deals}
        filter={props.filter}
        scope={props.scope}
        search={props.search}
        counts={props.counts}
        totalInScope={totals.dealCount}
        unavailable={props.dataError}
        nowMs={props.nowMs}
      />
    </>
  );
}
