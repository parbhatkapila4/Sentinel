export interface InsightItem {
  label: string;
  value: string;
  support?: string;
  tone?: "ivy" | "wine" | "copper" | "signal" | "neutral";
}

interface QuickInsightsProps {
  items: InsightItem[];
}

function toneColor(t: InsightItem["tone"]): string {
  switch (t) {
    case "ivy":
      return "var(--ivy)";
    case "wine":
      return "var(--wine)";
    case "copper":
      return "var(--copper)";
    case "signal":
      return "var(--signal)";
    case "neutral":
    default:
      return "var(--cream-2)";
  }
}

export function QuickInsights({ items }: QuickInsightsProps) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {items.map((it, i) => (
        <li
          key={it.label}
          className="anim-rise"
          style={{
            animationDelay: `${100 + i * 70}ms`,
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "baseline",
            gap: 14,
            padding: "16px 0",
            borderTop: i === 0 ? "none" : "1px solid var(--rule)",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "var(--cream-3)",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              {it.label}
            </div>
            {it.support && (
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 13,
                  color: "var(--cream-3)",
                  lineHeight: 1.4,
                }}
              >
                {it.support}
              </div>
            )}
          </div>
          <span
            className="tabular"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 28,
              color: toneColor(it.tone),
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {it.value}
          </span>
        </li>
      ))}
    </ul>
  );
}
