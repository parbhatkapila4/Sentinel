export interface AgeBucket {
  label: string;
  count: number;
  maxDays: number;
}

interface AgeDistributionProps {
  buckets: AgeBucket[];
  total: number;
}

function bucketTone(maxDays: number): string {
  if (maxDays <= 14) return "var(--ivy)";
  if (maxDays <= 30) return "var(--copper)";
  if (maxDays <= 60) return "var(--copper)";
  return "var(--wine)";
}

export function AgeDistribution({ buckets, total }: AgeDistributionProps) {
  return (
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {buckets.map((b, i) => {
        const pct = total > 0 ? (b.count / total) * 100 : 0;
        const tone = bucketTone(b.maxDays);
        return (
          <li
            key={b.label}
            className="anim-rise"
            style={{ animationDelay: `${100 + i * 50}ms` }}
          >
            <div
              className="flex items-baseline justify-between"
              style={{ gap: 12, marginBottom: 6 }}
            >
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
              <span
                className="tabular"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 16,
                  color: b.count > 0 ? "var(--cream)" : "var(--cream-4)",
                  letterSpacing: "-0.01em",
                }}
              >
                {b.count}
                <span
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 9.5,
                    color: "var(--cream-4)",
                    letterSpacing: "0.14em",
                    marginLeft: 6,
                    textTransform: "uppercase",
                  }}
                >
                  {b.count === 1 ? "DEAL" : "DEALS"}
                </span>
              </span>
            </div>
            <div
              style={{
                height: 2,
                background: "var(--ink-03)",
                overflow: "hidden",
              }}
              aria-hidden
            >
              <span
                className="anim-bar-fill"
                style={{
                  display: "block",
                  height: "100%",
                  width: `${Math.max(pct, b.count > 0 ? 4 : 0)}%`,
                  background: tone,
                }}
              />
            </div>
            <div
              className="tabular"
              style={{
                marginTop: 4,
                fontFamily: "var(--font-mono-jb)",
                fontSize: 9,
                letterSpacing: "0.14em",
                color: "var(--cream-4)",
                textTransform: "uppercase",
              }}
            >
              {pct.toFixed(0)}% OF PIPELINE
            </div>
          </li>
        );
      })}
    </ul>
  );
}
