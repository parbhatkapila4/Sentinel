import { formatShortMoney } from "@/lib/format-money";

export interface StageFlowItem {
  stage: string;
  label: string;
  count: number;
  value: number;
}

interface StageFlowBandProps {
  stages: StageFlowItem[];
  totalActiveValue: number;
}

function stageTone(stage: string): { swatch: string; label: string } {
  const s = stage.toLowerCase().replace(/\s+/g, "_");
  if (s === "closed_won" || s === "closed") {
    return { swatch: "var(--ivy)", label: "WIN" };
  }
  if (s === "closed_lost") {
    return { swatch: "var(--wine)", label: "LOSS" };
  }
  if (s === "negotiation") {
    return { swatch: "var(--signal)", label: "HOT" };
  }
  if (s === "proposal") {
    return { swatch: "var(--copper)", label: "OPEN" };
  }
  if (s === "qualify" || s === "qualification") {
    return { swatch: "var(--cream-2)", label: "QUAL" };
  }
  return { swatch: "var(--cream-3)", label: "NEW" };
}

export function StageFlowBand({ stages, totalActiveValue }: StageFlowBandProps) {
  if (stages.length === 0) {
    return (
      <section
        className="px-6 sm:px-10 lg:px-14 py-10"
        aria-label="Stage flow"
      >
        <p
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 11,
            letterSpacing: "0.14em",
            color: "var(--cream-4)",
            textTransform: "uppercase",
          }}
        >
          No stage signal yet. Add a deal to populate the flow.
        </p>
      </section>
    );
  }

  const maxCount = Math.max(...stages.map((s) => s.count), 1);
  const maxValue = Math.max(...stages.map((s) => s.value), 1);

  return (
    <section
      className="px-6 sm:px-10 lg:px-14 py-10"
      aria-label="Stage flow"
    >
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        style={{ gap: 0 }}
      >
        {stages.map((s, i) => {
          const tone = stageTone(s.stage);
          const countPct = (s.count / maxCount) * 100;
          const valuePct = (s.value / maxValue) * 100;
          const sharePct =
            totalActiveValue > 0 ? (s.value / totalActiveValue) * 100 : 0;
          return (
            <div
              key={s.stage}
              className="anim-rise"
              style={{
                animationDelay: `${100 + i * 60}ms`,
                padding: "20px 22px 22px",
                borderRight:
                  i === stages.length - 1 ? "none" : "1px solid var(--rule)",
                borderBottom: "1px solid var(--rule)",
              }}
            >
              <div
                className="flex items-center"
                style={{
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 8,
                    height: 8,
                    background: tone.swatch,
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    color: "var(--cream-3)",
                    textTransform: "uppercase",
                  }}
                >
                  {s.label}
                </span>
                <span className="flex-1" />
                <span
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 9.5,
                    letterSpacing: "0.14em",
                    color: tone.swatch,
                    textTransform: "uppercase",
                  }}
                >
                  {tone.label}
                </span>
              </div>

              <div
                className="tabular"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 44,
                  lineHeight: 1,
                  color: "var(--cream)",
                  letterSpacing: "-0.02em",
                  marginBottom: 12,
                }}
              >
                {s.count}
              </div>

              <div
                style={{
                  height: 2,
                  background: "var(--ink-03)",
                  position: "relative",
                  overflow: "hidden",
                  marginBottom: 12,
                }}
                aria-hidden
              >
                <span
                  className="anim-bar-fill"
                  style={{
                    display: "block",
                    height: "100%",
                    width: `${Math.max(countPct, 3)}%`,
                    background: tone.swatch,
                    animationDelay: `${200 + i * 70}ms`,
                  }}
                />
              </div>

              <div
                className="flex items-baseline"
                style={{
                  gap: 10,
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  color: "var(--cream-4)",
                  textTransform: "uppercase",
                }}
              >
                <span
                  className="tabular"
                  style={{
                    color: "var(--cream-2)",
                    fontSize: 12,
                  }}
                >
                  {formatShortMoney(s.value)}
                </span>
                {sharePct > 0 && (
                  <span className="tabular">
                    {sharePct.toFixed(0)}%
                  </span>
                )}
              </div>

              <div
                style={{
                  marginTop: 8,
                  height: 1,
                  background: "var(--rule-soft)",
                  position: "relative",
                }}
                aria-hidden
              >
                <span
                  className="anim-bar-fill"
                  style={{
                    display: "block",
                    height: "100%",
                    width: `${Math.max(valuePct, 3)}%`,
                    background: "var(--cream-4)",
                    animationDelay: `${300 + i * 70}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
