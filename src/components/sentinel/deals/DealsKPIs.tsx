export interface DealsKPIItem {
  index: string;
  label: string;
  value: string;
  support?: string;
  trendTone?: "up" | "down" | "neutral";
}

interface DealsKPIsProps {
  items: DealsKPIItem[];
}

function toneColor(tone: DealsKPIItem["trendTone"]): string {
  if (tone === "up") return "var(--ivy)";
  if (tone === "down") return "var(--wine)";
  return "var(--cream-3)";
}

export function DealsKPIs({ items }: DealsKPIsProps) {
  return (
    <section
      aria-label="Pipeline KPIs"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      style={{
        borderTop: "1px solid var(--rule-strong)",
        borderBottom: "1px solid var(--rule-strong)",
      }}
    >
      {items.map((k, i) => (
        <div
          key={k.label}
          className="anim-rise"
          style={{
            animationDelay: `${100 + i * 70}ms`,
            padding: "26px 24px 28px",
            borderLeft: i === 0 ? "none" : "1px solid var(--rule)",
            position: "relative",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: "var(--cream-4)",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            № {k.index} - {k.label}
          </div>
          <div
            className="tabular"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(36px, 4.2vw, 54px)",
              lineHeight: 0.98,
              color: "var(--cream)",
              letterSpacing: "-0.02em",
            }}
          >
            {k.value}
          </div>
          {k.support && (
            <div
              className="tabular"
              style={{
                marginTop: 10,
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10.5,
                letterSpacing: "0.14em",
                color: toneColor(k.trendTone),
                textTransform: "uppercase",
              }}
            >
              {k.support}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
