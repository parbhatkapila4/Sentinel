import { CountPill, cellTitleStyle } from "./ui";

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

interface SignalsPanelProps {
  anomalies: Anomaly[];
  patterns: Pattern[];
  recommendations: string[];
}

const SEVERITY: Record<
  Anomaly["severity"],
  { label: string; mark: string; text: string }
> = {
  high: { label: "High", mark: "var(--dl-signal)", text: "var(--dl-signal-d)" },
  medium: {
    label: "Medium",
    mark: "var(--dl-amber)",
    text: "var(--dl-amber-text)",
  },
  low: { label: "Low", mark: "var(--dl-bar)", text: "var(--dl-muted)" },
};

function patternDot(impact: Pattern["impact"]): string {
  if (impact === "negative") return "var(--dl-amber)";
  if (impact === "positive") return "var(--dl-green)";
  return "var(--dl-bar)";
}

const cellStyle: React.CSSProperties = {
  padding: "18px var(--dl-gutter) 8px",
};

const rowRule = "1px solid var(--dl-row)";

function CellHeader({
  title,
  count,
  note,
}: {
  title: string;
  count: number;
  note: string;
}) {
  return (
    <div className="flex items-center" style={{ gap: 9 }}>
      <h2 style={cellTitleStyle}>{title}</h2>
      <CountPill>{count}</CountPill>
      <span
        style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--dl-muted)" }}
      >
        {note}
      </span>
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        padding: "12px 0",
        borderTop: rowRule,
        fontSize: 13.5,
        color: "var(--dl-muted)",
      }}
    >
      {children}
    </p>
  );
}

export function SignalsPanel({
  anomalies,
  patterns,
  recommendations,
}: SignalsPanelProps) {
  const shownAnomalies = anomalies.slice(0, 4);
  const shownPatterns = patterns.slice(0, 5);
  const shownSteps = recommendations.slice(0, 4);

  return (
    <section aria-label="Signals" className="dl-grid">
      <div className="dl-third" style={cellStyle}>
        <CellHeader
          title="Alerts"
          count={anomalies.length}
          note="From the risk model"
        />
        <ul style={{ marginTop: 12 }}>
          {shownAnomalies.length === 0 && (
            <li>
              <EmptyNote>No anomalies detected this morning.</EmptyNote>
            </li>
          )}
          {shownAnomalies.map((a, i) => {
            const sev = SEVERITY[a.severity];
            return (
              <li
                key={`${a.dealName}-${i}`}
                style={{ padding: "12px 0", borderTop: rowRule }}
              >
                <div className="flex items-center" style={{ gap: 10 }}>
                  <span
                    aria-hidden
                    style={{
                      flex: "0 0 8px",
                      height: 8,
                      margin: "0 1px",
                      borderRadius: 2,
                      background: sev.mark,
                      transform: "rotate(45deg)",
                    }}
                  />
                  <span
                    style={{
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {a.dealName}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: sev.text,
                    }}
                  >
                    {sev.label}
                  </span>
                </div>
                <p
                  style={{
                    marginTop: 3,
                    paddingLeft: 20,
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    color: "var(--dl-text-2)",
                  }}
                >
                  {a.reason}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="dl-third" style={cellStyle}>
        <CellHeader
          title="Patterns"
          count={patterns.length}
          note="From the pattern model"
        />
        <ul style={{ marginTop: 12 }}>
          {shownPatterns.length === 0 && (
            <li>
              <EmptyNote>Not enough history yet to surface patterns.</EmptyNote>
            </li>
          )}
          {shownPatterns.map((p, i) => (
            <li
              key={`${p.type}-${i}`}
              style={{
                display: "flex",
                gap: 12,
                padding: "12px 0",
                borderTop: rowRule,
              }}
            >
              <span
                aria-hidden
                style={{
                  flex: "0 0 7px",
                  height: 7,
                  margin: "7px 1px 0 2px",
                  borderRadius: "50%",
                  background: patternDot(p.impact),
                }}
              />
              <p style={{ fontSize: 14, lineHeight: 1.5 }}>{p.description}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="dl-third" style={cellStyle}>
        <CellHeader
          title="Next steps"
          count={recommendations.length}
          note="Recommended"
        />
        <ol style={{ marginTop: 12 }}>
          {shownSteps.length === 0 && (
            <li>
              <EmptyNote>No actions needed right now.</EmptyNote>
            </li>
          )}
          {shownSteps.map((r, i) => (
            <li
              key={`${r}-${i}`}
              style={{
                display: "flex",
                gap: 12,
                padding: "12px 0",
                borderTop: rowRule,
              }}
            >
              <span
                aria-hidden
                style={{
                  display: "flex",
                  flex: "0 0 22px",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 22,
                  borderRadius: "50%",
                  background: "var(--dl-ink)",
                  color: "var(--dl-panel)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {i + 1}
              </span>
              <p style={{ fontSize: 14, lineHeight: 1.5 }}>{r}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
