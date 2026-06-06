"use client";

type ReportId = "pipeline" | "won" | "at-risk";

export type QuickReportsSummary = {
  pipeline: {
    activeCount: number;
    totalValue: number;
    stageCounts: Record<string, number>;
  };
  won: { count: number; totalValue: number };
  atRisk: { count: number; totalValue: number };
};

interface ReportMeta {
  id: ReportId;
  index: string;
  title: string;
  subtitle: string;
  tone: string;
  toneLabel: string;
}

const REPORTS: ReportMeta[] = [
  {
    id: "pipeline",
    index: "01",
    title: "Pipeline Summary",
    subtitle: "All active deals - composition by stage",
    tone: "var(--signal)",
    toneLabel: "ACTIVE",
  },
  {
    id: "won",
    index: "02",
    title: "Won Deals Report",
    subtitle: "Closed-won deals - value and count",
    tone: "var(--ivy)",
    toneLabel: "WON",
  },
  {
    id: "at-risk",
    index: "03",
    title: "At-Risk Analysis",
    subtitle: "Deals demanding attention - value at risk",
    tone: "var(--wine)",
    toneLabel: "RISK",
  },
];

export function QuickReportsEditorial(_props: { summary: QuickReportsSummary }) {
  return (
    <>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {REPORTS.map((r, i) => (
          <li
            key={r.id}
            className="anim-rise"
            style={{
              animationDelay: `${100 + i * 60}ms`,
              borderTop: i === 0 ? "none" : "1px solid var(--rule)",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 4px",
                background: "transparent",
                border: "none",
                textAlign: "left",
                color: "var(--cream)",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  background: r.tone,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="flex items-baseline"
                  style={{ gap: 10, marginBottom: 4 }}
                >
                  <span
                    className="tabular"
                    style={{
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 9.5,
                      letterSpacing: "0.16em",
                      color: "var(--cream-4)",
                      textTransform: "uppercase",
                    }}
                  >
                    {r.index}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 17,
                      color: "var(--cream)",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.2,
                    }}
                  >
                    {r.title}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 9.5,
                    letterSpacing: "0.14em",
                    color: "var(--cream-3)",
                    textTransform: "uppercase",
                  }}
                >
                  {r.subtitle}
                </div>
              </div>
              <span
                aria-hidden
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 22,
                  color: r.tone,
                  letterSpacing: 0,
                }}
              >
                →
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
