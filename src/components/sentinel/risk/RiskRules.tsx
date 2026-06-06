export interface RiskRule {
  title: string;
  description: string;
  count: number;
  tone?: "wine" | "copper" | "signal" | "cream";
}

interface RiskRulesProps {
  rules: RiskRule[];
  denominator: number;
  preamble?: string;
  postamble?: string;
}

function toneColor(t: RiskRule["tone"]): string {
  switch (t) {
    case "wine":
      return "var(--wine)";
    case "copper":
      return "var(--copper)";
    case "cream":
      return "var(--cream-2)";
    case "signal":
    default:
      return "var(--signal)";
  }
}

export function RiskRules({
  rules,
  denominator,
  preamble,
  postamble,
}: RiskRulesProps) {
  const denom = Math.max(denominator, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {preamble && (
        <p
          style={{
            fontSize: 13.5,
            lineHeight: 1.6,
            color: "var(--cream-2)",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
          }}
        >
          {preamble}
        </p>
      )}

      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {rules.map((r, i) => {
          const pct = denom > 0 ? (r.count / denom) * 100 : 0;
          const c = toneColor(r.tone);
          return (
            <li
              key={r.title}
              className="anim-rise"
              style={{
                animationDelay: `${100 + i * 60}ms`,
                padding: "16px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--rule)",
              }}
            >
              <div
                className="flex items-baseline justify-between"
                style={{ gap: 12, marginBottom: 8 }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    className="flex items-baseline"
                    style={{ gap: 12, marginBottom: 4 }}
                  >
                    <span
                      className="tabular"
                      style={{
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 9.5,
                        letterSpacing: "0.14em",
                        color: "var(--cream-4)",
                        textTransform: "uppercase",
                      }}
                    >
                      Rule {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 17,
                        color: "var(--cream)",
                        lineHeight: 1.2,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {r.title}
                    </span>
                  </div>
                  <p
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      lineHeight: 1.55,
                      color: "var(--cream-3)",
                    }}
                  >
                    {r.description}
                  </p>
                </div>
                <span
                  className="tabular"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 22,
                    color: r.count > 0 ? c : "var(--cream-4)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {r.count}
                </span>
              </div>
              <div
                style={{
                  height: 2,
                  background: "var(--ink-03)",
                  overflow: "hidden",
                  marginTop: 4,
                }}
                aria-hidden
              >
                <span
                  className="anim-bar-fill"
                  style={{
                    display: "block",
                    height: "100%",
                    width: `${Math.max(pct, r.count > 0 ? 4 : 0)}%`,
                    background: c,
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
                {denom > 0
                  ? `${pct.toFixed(0)}% OF CURRENT HIGH-RISK`
                  : "NO HIGH-RISK BASELINE"}
              </div>
            </li>
          );
        })}
      </ol>

      {postamble && (
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--cream-3)",
            paddingTop: 14,
            borderTop: "1px solid var(--rule)",
          }}
        >
          {postamble}
        </p>
      )}
    </div>
  );
}
