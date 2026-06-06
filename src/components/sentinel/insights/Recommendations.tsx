interface Anomaly {
  severity: "high" | "medium" | "low";
  dealName: string;
  reason: string;
}

interface Pattern {
  type: string;
  description: string;
  impact: "positive" | "negative" | "neutral";
}

interface RecommendationsProps {
  anomalies: Anomaly[];
  patterns: Pattern[];
  recommendations: string[];
}

function severityColor(sev: Anomaly["severity"]) {
  if (sev === "high") return "var(--wine)";
  if (sev === "medium") return "var(--copper)";
  return "var(--ivy)";
}

function patternDot(impact: Pattern["impact"]) {
  if (impact === "negative") return "var(--copper)";
  if (impact === "positive") return "var(--ivy)";
  return "var(--cream-4)";
}

export function Recommendations({
  anomalies,
  patterns,
  recommendations,
}: RecommendationsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "var(--cream-3)",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Anomaly Alerts
        </div>
        {anomalies.length === 0 ? (
          <p
            style={{
              fontSize: 13,
              color: "var(--cream-4)",
              fontStyle: "italic",
              fontFamily: "var(--font-serif)",
            }}
          >
            No anomalies detected this morning.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {anomalies.slice(0, 4).map((a, i) => {
              const c = severityColor(a.severity);
              return (
                <div
                  key={`${a.dealName}-${i}`}
                  className="anim-rise"
                  style={{
                    animationDelay: `${100 + i * 60}ms`,
                    borderLeft: `2px solid ${c}`,
                    background:
                      a.severity === "high"
                        ? "rgba(139,58,58,0.06)"
                        : "rgba(217,153,90,0.05)",
                    padding: "12px 14px",
                  }}
                >
                  <div
                    className="flex items-baseline"
                    style={{
                      gap: 10,
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      color: c,
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    <span>{a.severity}</span>
                    <span style={{ color: "var(--cream-3)" }}>{a.dealName}</span>
                  </div>
                  <p
                    style={{
                      fontSize: 13.5,
                      lineHeight: 1.5,
                      color: "var(--cream-2)",
                    }}
                  >
                    {a.reason}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "var(--cream-3)",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Pattern Discoveries
        </div>
        {patterns.length === 0 ? (
          <p
            style={{
              fontSize: 13,
              color: "var(--cream-4)",
              fontStyle: "italic",
              fontFamily: "var(--font-serif)",
            }}
          >
            Not enough history yet to surface patterns.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {patterns.slice(0, 5).map((p, i) => (
              <li
                key={`${p.type}-${i}`}
                className="flex items-start"
                style={{
                  gap: 12,
                  padding: "10px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--rule)",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: patternDot(p.impact),
                    marginTop: 7,
                  }}
                />
                <span
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    color: "var(--cream-2)",
                  }}
                >
                  {p.description}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "var(--cream-3)",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Recommendations
        </div>
        {recommendations.length === 0 ? (
          <p
            style={{
              fontSize: 13,
              color: "var(--cream-4)",
              fontStyle: "italic",
              fontFamily: "var(--font-serif)",
            }}
          >
            No actions needed right now.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {recommendations.slice(0, 4).map((r, i) => (
              <li
                key={`${r}-${i}`}
                className="flex items-baseline"
                style={{
                  gap: 14,
                  padding: "12px 0",
                  borderTop: "1px solid var(--rule)",
                }}
              >
                <em
                  style={{
                    fontStyle: "italic",
                    color: "var(--signal)",
                    fontFamily: "var(--font-serif)",
                    fontSize: 18,
                  }}
                >
                  →
                </em>
                <span
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    color: "var(--cream-2)",
                  }}
                >
                  {r}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
