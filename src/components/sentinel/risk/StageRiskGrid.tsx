export interface StageRiskCell {
  stage: string;
  label: string;
  high: number;
  medium: number;
  low: number;
  total: number;
}

interface StageRiskGridProps {
  cells: StageRiskCell[];
}

export function StageRiskGrid({ cells }: StageRiskGridProps) {
  if (cells.length === 0) {
    return (
      <p
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10.5,
          letterSpacing: "0.16em",
          color: "var(--cream-4)",
          textTransform: "uppercase",
        }}
      >
        No stages on the wire.
      </p>
    );
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
      style={{
        gap: 0,
        borderTop: "1px solid var(--rule)",
        borderLeft: "1px solid var(--rule)",
      }}
    >
      {cells.map((c, i) => {
        const highPct = c.total > 0 ? (c.high / c.total) * 100 : 0;
        const tone =
          highPct >= 50
            ? "var(--wine)"
            : highPct >= 25
              ? "var(--copper)"
              : "var(--ivy)";
        return (
          <article
            key={c.stage}
            className="anim-rise"
            style={{
              animationDelay: `${100 + i * 50}ms`,
              padding: "20px 18px 22px",
              borderRight: "1px solid var(--rule)",
              borderBottom: "1px solid var(--rule)",
              minWidth: 0,
            }}
          >
            <header
              className="flex items-baseline justify-between"
              style={{ gap: 8, marginBottom: 14 }}
            >
              <h4
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 18,
                  color: "var(--cream)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.1,
                  textTransform: "capitalize",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {c.label}
              </h4>
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
                N={c.total}
              </span>
            </header>

            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <RiskCount color="var(--wine)" label="HIGH" n={c.high} />
              <RiskCount color="var(--copper)" label="MED" n={c.medium} />
              <RiskCount color="var(--ivy)" label="LOW" n={c.low} />
            </ul>

            <div
              style={{
                paddingTop: 10,
                borderTop: "1px solid var(--rule)",
              }}
            >
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
                    width: `${Math.max(highPct, c.high > 0 ? 4 : 0)}%`,
                    background: tone,
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
                  color: tone,
                  textTransform: "uppercase",
                }}
              >
                {highPct.toFixed(0)}% HIGH RISK
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function RiskCount({
  color,
  label,
  n,
}: {
  color: string;
  label: string;
  n: number;
}) {
  return (
    <li
      className="flex items-center justify-between"
      style={{ gap: 8 }}
    >
      <span
        className="inline-flex items-center"
        style={{
          gap: 6,
          fontFamily: "var(--font-mono-jb)",
          fontSize: 9.5,
          letterSpacing: "0.14em",
          color: "var(--cream-3)",
          textTransform: "uppercase",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            background: color,
          }}
        />
        {label}
      </span>
      <span
        className="tabular"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 14,
          color: n > 0 ? "var(--cream)" : "var(--cream-4)",
          letterSpacing: "-0.01em",
        }}
      >
        {n}
      </span>
    </li>
  );
}
