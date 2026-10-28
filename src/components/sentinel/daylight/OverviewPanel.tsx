import { formatShortMoney } from "@/lib/format-money";
import { PipelineChart } from "./PipelineChart";
import { Money, SegmentMeter, cellSubStyle, cellTitleStyle } from "./ui";

interface OverviewPanelProps {
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
    currentIndex: number;
    marker: { index: number; label: string; value: string } | null;
  };
  atRisk: { totalValue: number; flaggedCount: number };
  winRate: number;
  newThisWeek: number;
  forecast: { expected: number; bestCase: number; worstCase: number };
}

const statRowStyle: React.CSSProperties = {
  display: "flex",
  flex: 1,
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  minHeight: 82,
  padding: "13px var(--dl-gutter)",
};

const statValueStyle: React.CSSProperties = {
  marginTop: 1,
  fontSize: 28,
  lineHeight: 1.2,
  fontWeight: 600,
  letterSpacing: "-0.03em",
};

const statSideStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
};

const statCaptionStyle: React.CSSProperties = {
  fontSize: 12.5,
  color: "var(--dl-muted)",
  textAlign: "right",
};

function GrowthChip({ percent }: { percent: number }) {
  const flat = Math.abs(percent) < 0.05;
  const up = percent > 0;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        height: 24,
        padding: "0 8px",
        borderRadius: 7,
        background: flat
          ? "var(--dl-chip)"
          : up
            ? "var(--dl-green-tint)"
            : "var(--dl-signal-tint)",
        color: flat
          ? "var(--dl-text-2)"
          : up
            ? "var(--dl-green-text)"
            : "var(--dl-signal-d)",
        fontSize: 12.5,
        fontWeight: 600,
      }}
    >
      {!flat && (
        <svg viewBox="0 0 10 10" width={8} height={8} fill="currentColor" aria-hidden>
          <path d={up ? "M5 1.5l4 6.5H1z" : "M5 8.5l4-6.5H1z"} />
        </svg>
      )}
      <span className="sr-only">{flat ? "" : up ? "Up " : "Down "}</span>
      {Math.abs(percent).toFixed(1)}%
    </span>
  );
}

export function OverviewPanel({
  pipeline,
  velocity,
  atRisk,
  winRate,
  newThisWeek,
  forecast,
}: OverviewPanelProps) {
  const hasPrior = velocity.prior.some((v) => v > 0);
  const spread = forecast.bestCase - forecast.worstCase;
  const expectedAt =
    spread > 0
      ? Math.max(0, Math.min(1, (forecast.expected - forecast.worstCase) / spread))
      : 0.5;

  return (
    <section aria-label="Pipeline overview" className="dl-grid">
      <div
        className="dl-two-thirds"
        style={{ padding: "20px var(--dl-gutter) 16px" }}
      >
        <div
          className="flex flex-wrap items-center justify-between"
          style={{ gap: "6px 16px" }}
        >
          <div
            className="flex flex-wrap items-baseline"
            style={{ gap: "2px 9px" }}
          >
            <h2 style={cellTitleStyle}>Total pipeline</h2>
            <span style={cellSubStyle}>Deal value created per month</span>
          </div>
          <div
            className="flex items-center"
            style={{ gap: 16, fontSize: 12.5, color: "var(--dl-text-2)" }}
          >
            <span className="inline-flex items-center" style={{ gap: 7 }}>
              <span
                aria-hidden
                style={{
                  width: 16,
                  height: 2.5,
                  borderRadius: 2,
                  background: "var(--dl-ink)",
                }}
              />
              This year
            </span>
            {hasPrior && (
              <span className="inline-flex items-center" style={{ gap: 7 }}>
                <span
                  aria-hidden
                  style={{
                    width: 16,
                    height: 2.5,
                    borderRadius: 2,
                    background: "var(--dl-context)",
                  }}
                />
                Last year
              </span>
            )}
          </div>
        </div>
        <div
          className="flex flex-wrap items-center"
          style={{ gap: "8px 12px", marginTop: 14 }}
        >
          <span
            style={{
              fontSize: 48,
              lineHeight: 1,
              fontWeight: 600,
              letterSpacing: "-0.04em",
            }}
          >
            <Money value={pipeline.total} />
          </span>
          <GrowthChip percent={pipeline.growthPercent} />
          <span style={cellSubStyle}>vs last month</span>
          <span style={{ ...cellSubStyle, marginLeft: "auto" }}>
            {pipeline.active} active · {pipeline.won} won · {pipeline.lost} lost
          </span>
        </div>
        <PipelineChart
          current={velocity.current}
          prior={velocity.prior}
          labels={velocity.labels}
          currentIndex={velocity.currentIndex}
          marker={velocity.marker}
        />
      </div>

      <div className="dl-third dl-stack">
        <div style={statRowStyle}>
          <div>
            <div style={cellSubStyle}>At risk</div>
            <div style={statValueStyle}>
              <Money value={atRisk.totalValue} />
            </div>
          </div>
          <div style={{ ...statSideStyle, gap: 8 }}>
            <SegmentMeter
              filled={atRisk.flaggedCount}
              total={pipeline.active}
              color="var(--dl-signal)"
              label={`${atRisk.flaggedCount} of ${pipeline.active} active deals flagged`}
            />
            <span style={statCaptionStyle}>
              {atRisk.flaggedCount} of {pipeline.active}{" "}
              {pipeline.active === 1 ? "deal" : "deals"} flagged
            </span>
          </div>
        </div>
        <div style={statRowStyle}>
          <div>
            <div style={cellSubStyle}>Win rate</div>
            <div style={statValueStyle}>
              {winRate.toFixed(1)}
              <span style={{ fontWeight: 500, color: "var(--dl-unit)" }}>%</span>
            </div>
          </div>
          <div style={{ ...statSideStyle, gap: 8 }}>
            <SegmentMeter
              filled={pipeline.won}
              total={pipeline.totalDeals}
              color="var(--dl-green)"
              label={`${pipeline.won} won of ${pipeline.totalDeals} deals`}
            />
            <span style={statCaptionStyle}>
              {pipeline.won} won of {pipeline.totalDeals}{" "}
              {pipeline.totalDeals === 1 ? "deal" : "deals"}
            </span>
          </div>
        </div>
        <div style={statRowStyle}>
          <div>
            <div style={cellSubStyle}>New this week</div>
            <div style={statValueStyle}>{newThisWeek}</div>
          </div>
          <div style={{ ...statSideStyle, gap: 6 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 22,
                padding: "0 8px",
                borderRadius: 6,
                background: "var(--dl-chip)",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--dl-text-2)",
              }}
            >
              Last 7 days
            </span>
            <span style={statCaptionStyle}>{pipeline.active} active in total</span>
          </div>
        </div>
        <div style={statRowStyle}>
          <div>
            <div style={cellSubStyle}>Forecast</div>
            <div style={statValueStyle}>
              <Money value={forecast.expected} />
            </div>
          </div>
          <div style={{ ...statSideStyle, gap: 6 }}>
            <svg
              viewBox="0 0 124 14"
              width={124}
              height={14}
              role="img"
              aria-label="Where the expected value sits between the worst and best case"
            >
              <line
                x1={2}
                y1={7}
                x2={122}
                y2={7}
                stroke="var(--dl-border-strong)"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <line
                x1={2}
                y1={2}
                x2={2}
                y2={12}
                stroke="var(--dl-context)"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
              <line
                x1={122}
                y1={2}
                x2={122}
                y2={12}
                stroke="var(--dl-context)"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
              <circle
                cx={Math.round((2 + expectedAt * 120) * 10) / 10}
                cy={7}
                r={5}
                fill="var(--dl-ink)"
                stroke="var(--dl-panel)"
                strokeWidth={2}
              />
            </svg>
            <span style={statCaptionStyle}>
              {formatShortMoney(forecast.worstCase)} to{" "}
              {formatShortMoney(forecast.bestCase)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
