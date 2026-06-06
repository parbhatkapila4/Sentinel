import { formatShortMoney as formatM } from "@/lib/format-money";
import { MetricExplainer } from "@/components/sentinel/MetricExplainer";

interface ForecastBlockProps {
  expected: number;
  bestCase: number;
  worstCase: number;
  weightedConfidence: number;
  notes: string[];
}

export function ForecastBlock({
  expected,
  bestCase,
  worstCase,
  weightedConfidence,
  notes,
}: ForecastBlockProps) {
  const max = Math.max(expected, bestCase, worstCase, 1);
  const bars = [
    { label: "BEST", value: bestCase, color: "var(--signal)" },
    { label: "EXPECTED", value: expected, color: "var(--copper)" },
    { label: "WORST", value: worstCase, color: "var(--cream-4)" },
  ];

  return (
    <div
      className="border-t"
      style={{
        borderColor: "var(--rule)",
        paddingTop: 32,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "var(--cream-3)",
          textTransform: "uppercase",
          marginBottom: 16,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        Forecast · Weighted
        <MetricExplainer
          side="left"
          title="Weighted forecast"
          subtitle="What your pipeline is likely to bring in, plus the best and worst it could be."
          steps={[
            {
              label: "Most likely",
              body: "For each open deal, we ask how likely it is to close based on its stage. Early-stage deals count for less, near-close deals count for more. We add them all up. That's the number in italics.",
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
          ]}
        />
      </div>
      <div
        className="tabular"
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: "clamp(44px, 16vw, 84px)",
          lineHeight: 1,
          color: "var(--signal)",
          letterSpacing: "-0.03em",
          marginBottom: 28,
        }}
      >
        {formatM(expected)}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {bars.map((b, i) => {
          const widthPct = Math.max(4, (b.value / max) * 100);
          return (
            <div key={b.label} className="grid items-center" style={{ gridTemplateColumns: "80px 1fr 90px", gap: 14 }}>
              <span
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  color: "var(--cream-3)",
                  textTransform: "uppercase",
                }}
              >
                {b.label}
              </span>
              <div
                style={{
                  height: 8,
                  background: "var(--ink-03)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <span
                  className="anim-bar-fill"
                  style={{
                    display: "block",
                    height: "100%",
                    width: `${widthPct}%`,
                    background: b.color,
                    animationDelay: `${300 + i * 120}ms`,
                  }}
                />
              </div>
              <span
                className="tabular"
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  color: "var(--cream-2)",
                  textAlign: "right",
                }}
              >
                {formatM(b.value)}
              </span>
            </div>
          );
        })}
      </div>

      <div
        className="flex flex-wrap"
        style={{
          gap: 18,
          marginTop: 18,
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.14em",
          color: "var(--cream-4)",
          textTransform: "uppercase",
        }}
      >
        <span style={{ color: "var(--signal)" }}>
          CONFIDENCE {weightedConfidence}%
        </span>
        {notes.map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
    </div>
  );
}
