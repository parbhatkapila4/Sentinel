export interface ValueByStageItem {
  stage: string;
  label: string;
  value: number;
}

interface ValueByStageBarsProps {
  items: ValueByStageItem[];
  formatMoney: (n: number) => string;
}

function stageTone(stage: string) {
  const s = stage.toLowerCase().replace(/\s+/g, "_");
  if (s === "closed_won" || s === "won") return "var(--ivy)";
  if (s === "closed_lost" || s === "lost") return "var(--wine)";
  if (s === "negotiation") return "var(--signal)";
  if (s === "proposal") return "var(--copper)";
  return "var(--cream-2)";
}

export function ValueByStageBars({ items, formatMoney }: ValueByStageBarsProps) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {items.map((it, i) => {
        const pct = (it.value / max) * 100;
        const tone = stageTone(it.stage);
        return (
          <li
            key={it.stage}
            className="anim-rise"
            style={{
              animationDelay: `${100 + i * 60}ms`,
              padding: "12px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--rule)",
            }}
          >
            <div
              className="flex items-baseline justify-between"
              style={{ gap: 12, marginBottom: 8 }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  color: "var(--cream-2)",
                  textTransform: "uppercase",
                }}
              >
                {it.label}
              </span>
              <span
                className="tabular"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 16,
                  color: "var(--cream)",
                  letterSpacing: "-0.01em",
                }}
              >
                {formatMoney(it.value)}
              </span>
            </div>
            <div
              style={{
                height: 2,
                background: "var(--ink-03)",
                position: "relative",
                overflow: "hidden",
              }}
              aria-hidden
            >
              <span
                className="anim-bar-fill"
                style={{
                  display: "block",
                  height: "100%",
                  width: `${Math.max(pct, it.value > 0 ? 4 : 0)}%`,
                  background: tone,
                  animationDelay: `${200 + i * 60}ms`,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
