export interface VelocityRow {
  stage: string;
  label: string;
  avgDays: number;
  count: number;
}

interface StageVelocityListProps {
  rows: VelocityRow[];
  warnDays?: number;
  alertDays?: number;
}

export function StageVelocityList({
  rows,
  warnDays = 14,
  alertDays = 30,
}: StageVelocityListProps) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {rows.map((r, i) => {
        const tone =
          r.avgDays >= alertDays
            ? "var(--wine)"
            : r.avgDays >= warnDays
              ? "var(--copper)"
              : "var(--ivy)";
        return (
          <li
            key={r.stage}
            className="anim-rise"
            style={{
              animationDelay: `${100 + i * 60}ms`,
              display: "grid",
              gridTemplateColumns: "1fr auto auto",
              alignItems: "baseline",
              gap: 14,
              padding: "12px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--rule)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10.5,
                letterSpacing: "0.16em",
                color: "var(--cream-2)",
                textTransform: "uppercase",
              }}
            >
              {r.label}
            </span>
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
              N={r.count}
            </span>
            <span
              className="tabular"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 18,
                color: tone,
                letterSpacing: "-0.01em",
                minWidth: 70,
                textAlign: "right",
              }}
            >
              {r.avgDays}
              <span
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 9.5,
                  letterSpacing: "0.14em",
                  color: "var(--cream-4)",
                  textTransform: "uppercase",
                  marginLeft: 6,
                }}
              >
                D AVG
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
