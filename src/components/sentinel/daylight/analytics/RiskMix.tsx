import { formatShortMoney } from "@/lib/format-money";
import { TIER_COLUMN_GAP, TIER_COLUMNS } from "../table-columns";
import { tableHeadStyle } from "../ui";
import { SectionHead } from "./SectionHead";
import { tierShare, type TierKey, type TierRow } from "./model";

const TIER_COLOR: Record<TierKey, string> = {
  high: "var(--dl-signal)",
  medium: "var(--dl-amber)",
  healthy: "var(--dl-ink)",
};

function plural(count: number): string {
  return `${count.toLocaleString("en-US")} deal${count === 1 ? "" : "s"}`;
}

export function RiskMix({ tiers }: { tiers: TierRow[] }) {
  const total = tiers.reduce((sum, t) => sum + t.count, 0);
  const summary =
    total === 0
      ? "No deals in range"
      : tiers.map((t) => `${t.count} ${t.label.toLowerCase()}`).join(", ");
  const split = `How the ${plural(total)} split`;

  return (
    <section aria-label="Risk mix" className="dl-third">
      <SectionHead
        title="Risk mix"
        sub={split}
        kicker="Risk mix"
        shortSub={split}
      />
      <div className="dl-mix-bar">
        <div
          role="img"
          aria-label={summary}
          style={{
            display: "flex",
            gap: 2,
            height: 12,
            borderRadius: 3,
            background: total === 0 ? "var(--dl-seg)" : undefined,
          }}
        >
          {tiers
            .filter((t) => t.count > 0)
            .map((t) => (
              <span
                key={t.key}
                title={`${t.label} · ${plural(t.count)} · ${tierShare(t.count, total)}%`}
                style={{
                  flex: `${t.count} 1 0px`,
                  minWidth: 4,
                  borderRadius: 3,
                  background: TIER_COLOR[t.key],
                }}
              />
            ))}
        </div>
      </div>
      <div role="table" aria-label="Risk tiers">
        <div
          role="row"
          className="dl-wide-only"
          style={{
            ...tableHeadStyle,
            gridTemplateColumns: TIER_COLUMNS,
            columnGap: TIER_COLUMN_GAP,
          }}
        >
          <span role="columnheader">Tier</span>
          <span role="columnheader" style={{ textAlign: "right" }}>
            Deals
          </span>
          <span role="columnheader" style={{ textAlign: "right" }}>
            Share
          </span>
          <span role="columnheader" style={{ textAlign: "right" }}>
            Value
          </span>
        </div>
        {tiers.map((tier, i) => (
          <div
            key={tier.key}
            role="row"
            style={{
              display: "grid",
              gridTemplateColumns: TIER_COLUMNS,
              columnGap: TIER_COLUMN_GAP,
              alignItems: "center",
              minHeight: 62,
              padding: "0 var(--dl-gutter)",
              borderBottom:
                i === tiers.length - 1 ? undefined : "1px solid var(--dl-row)",
            }}
          >
            <div role="cell" style={{ minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13.5,
                  fontWeight: 600,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 8,
                    height: 8,
                    flexShrink: 0,
                    borderRadius: 2,
                    background: TIER_COLOR[tier.key],
                  }}
                />
                {tier.label}
              </div>
              <div
                style={{
                  marginTop: 1,
                  paddingLeft: 16,
                  fontSize: 12.5,
                  fontWeight: tier.needAction > 0 ? 500 : 400,
                  color:
                    tier.needAction > 0
                      ? "var(--dl-signal-d)"
                      : "var(--dl-muted)",
                }}
              >
                {tier.needAction > 0
                  ? `${tier.needAction.toLocaleString("en-US")} need${tier.needAction === 1 ? "s" : ""} action`
                  : "None need action"}
              </div>
            </div>
            <div
              role="cell"
              style={{
                textAlign: "right",
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: tier.count > 0 ? undefined : "var(--dl-unit)",
              }}
            >
              {tier.count.toLocaleString("en-US")}
            </div>
            <div
              role="cell"
              style={{
                textAlign: "right",
                fontSize: 13,
                color: "var(--dl-muted)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {tierShare(tier.count, total)}%
            </div>
            <div
              role="cell"
              style={{
                textAlign: "right",
                fontSize: 14,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                color: tier.value > 0 ? undefined : "var(--dl-muted)",
              }}
            >
              {formatShortMoney(tier.value)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
