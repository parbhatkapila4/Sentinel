import { Explainer } from "./Explainer";
import { compactNumber, niceCeil, percentOf, spreadLabels } from "./format";
import { formatShortMoney } from "@/lib/format-money";
import { Money, SegmentMeter, cellSubStyle, cellTitleStyle } from "./ui";

interface ForecastCellProps {
  expected: number;
  bestCase: number;
  worstCase: number;
  confidence: number;
  openDeals: number;
  avgDealAgeDays: number;
}

const FORECAST_STEPS = [
  {
    label: "Most likely",
    body: "For each open deal, we ask how likely it is to close based on its stage. Early-stage deals count for less, near-close deals count for more. We add them all up. That is the big number.",
  },
  {
    label: "Best case",
    body: "If everything goes well: every open deal lands, momentum holds, nothing slips.",
  },
  {
    label: "Worst case",
    body: "If things slow down: softer wins, longer cycles, deals you'd usually expect to close don't.",
  },
  {
    label: "How sure",
    body: "If best and worst are close together, you can trust the most-likely number. If they're far apart, the outcome is still wide open.",
  },
];

const tagStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  height: 22,
  padding: "0 8px",
  borderRadius: 6,
  background: "var(--dl-chip)",
};

export function ForecastCell({
  expected,
  bestCase,
  worstCase,
  confidence,
  openDeals,
  avgDealAgeDays,
}: ForecastCellProps) {
  const hasRange = Math.max(expected, bestCase, worstCase) > 0;
  const scaleMax = niceCeil(Math.max(expected, bestCase, worstCase, 1));
  const worstAt = percentOf(worstCase, scaleMax);
  const expectedAt = percentOf(expected, scaleMax);
  const bestAt = percentOf(bestCase, scaleMax);
  const [worstLabel, expectedLabel, bestLabel] = spreadLabels(
    [worstAt, expectedAt, bestAt],
    17,
    6,
    94
  );
  const points = [
    { name: "Worst", value: worstCase, at: worstLabel },
    { name: "Expected", value: expected, at: expectedLabel },
    { name: "Best", value: bestCase, at: bestLabel },
  ];
  const ticks = Array.from({ length: 6 }, (_, i) => (scaleMax * i) / 5);
  const safeConfidence = Math.max(0, Math.min(100, Math.round(confidence)));
  const age = Math.round(avgDealAgeDays);

  return (
    <section
      aria-label="Forecast"
      className="dl-third"
      style={{ padding: "18px var(--dl-gutter) 20px" }}
    >
      <div className="flex items-start justify-between" style={{ gap: 12 }}>
        <div>
          <h2 style={cellTitleStyle}>Forecast</h2>
          <p style={{ ...cellSubStyle, marginTop: 1 }}>
            Weighted by stage, next six months
          </p>
        </div>
        <Explainer
          title="Weighted forecast"
          subtitle="What your pipeline is likely to bring in, plus the best and worst it could be."
          steps={FORECAST_STEPS}
        />
      </div>
      <div
        className="flex flex-wrap items-baseline"
        style={{ gap: "4px 9px", marginTop: 16 }}
      >
        <span
          style={{
            fontSize: 38,
            lineHeight: 1,
            fontWeight: 600,
            letterSpacing: "-0.035em",
          }}
        >
          <Money value={expected} />
        </span>
        <span style={cellSubStyle}>expected to close</span>
      </div>
      <div
        role="img"
        aria-label={`Forecast range on a scale from 0 to ${formatShortMoney(scaleMax)}: worst case ${formatShortMoney(worstCase)}, expected ${formatShortMoney(expected)}, best case ${formatShortMoney(bestCase)}`}
        style={{ position: "relative", height: 92, marginTop: 18 }}
      >
        {points.map((p) => (
          <div
            key={p.name}
            style={{
              position: "absolute",
              left: `${p.at}%`,
              top: 0,
              transform: "translateX(-50%)",
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ fontSize: 11.5, color: "var(--dl-muted)" }}>
              {p.name}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatShortMoney(p.value)}
            </div>
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 45,
            height: 22,
            borderRadius: 6,
            background: "var(--dl-track)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `${worstAt}%`,
            top: 45,
            width: `${Math.max(0, bestAt - worstAt)}%`,
            height: 22,
            borderRadius: 6,
            backgroundColor: "var(--dl-seg)",
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(20, 23, 26, 0.22) 0, rgba(20, 23, 26, 0.22) 1px, transparent 1px, transparent 6px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `${expectedAt}%`,
            top: 40,
            width: 3,
            height: 32,
            marginLeft: -1.5,
            borderRadius: 2,
            background: "var(--dl-ink)",
            boxShadow: "0 0 0 2px var(--dl-panel)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 76,
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--dl-font-mono)",
            fontSize: 10.5,
            color: "var(--dl-muted)",
          }}
        >
          {hasRange ? (
            ticks.map((t, i) => <span key={i}>{compactNumber(t)}</span>)
          ) : (
            <span>0</span>
          )}
        </div>
      </div>
      <div
        className="flex flex-wrap items-center justify-between"
        style={{
          gap: "8px 16px",
          marginTop: 18,
          paddingTop: 16,
          borderTop: "1px solid var(--dl-row)",
        }}
      >
        <span style={cellSubStyle}>Confidence</span>
        <div className="flex items-center" style={{ gap: 10 }}>
          <SegmentMeter
            filled={Math.round(safeConfidence / 10)}
            total={10}
            color="var(--dl-ink)"
            label={`Confidence ${safeConfidence} percent`}
            segmentWidth={13}
          />
          <span
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {safeConfidence}%
          </span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginTop: 12,
          fontSize: 12,
          color: "var(--dl-text-2)",
        }}
      >
        <span style={tagStyle}>
          {openDeals} open {openDeals === 1 ? "deal" : "deals"}
        </span>
        <span style={tagStyle}>{age} day average age</span>
      </div>
    </section>
  );
}
