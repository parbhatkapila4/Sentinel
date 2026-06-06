interface ConcentrationMeterProps {
  label: string;
  value: string;
  percent: number;
  caption: string;
  tone?: "signal" | "ivy" | "wine" | "copper" | "cream";
}

function toneColor(t: ConcentrationMeterProps["tone"]): string {
  switch (t) {
    case "ivy":
      return "var(--ivy)";
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

export function ConcentrationMeter({
  label,
  value,
  percent,
  caption,
  tone = "signal",
}: ConcentrationMeterProps) {
  const fill = toneColor(tone);
  const pct = Math.max(0, Math.min(100, percent));

  return (
    <div>
      <div
        className="flex items-baseline justify-between"
        style={{ gap: 12, marginBottom: 10 }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "var(--cream-3)",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        <span
          className="tabular"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 22,
            color: "var(--cream)",
            letterSpacing: "-0.01em",
          }}
        >
          {value}
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
            width: `${pct}%`,
            background: fill,
          }}
        />
      </div>
      <div
        className="tabular"
        style={{
          marginTop: 8,
          fontFamily: "var(--font-mono-jb)",
          fontSize: 9.5,
          letterSpacing: "0.14em",
          color: "var(--cream-4)",
          textTransform: "uppercase",
        }}
      >
        {caption}
      </div>
    </div>
  );
}

export interface RankedItem {
  id: string;
  rank: number;
  name: string;
  trail: string;
  tone?: "signal" | "ivy" | "wine" | "copper" | "cream";
}

interface RankedListProps {
  items: RankedItem[];
}

export function RankedList({ items }: RankedListProps) {
  if (items.length === 0) return null;
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {items.map((it, i) => (
        <li
          key={it.id}
          className="anim-rise"
          style={{
            animationDelay: `${100 + i * 60}ms`,
            display: "grid",
            gridTemplateColumns: "auto minmax(0,1fr) auto",
            alignItems: "baseline",
            gap: 12,
            padding: "12px 0",
            borderTop: i === 0 ? "none" : "1px solid var(--rule)",
          }}
        >
          <span
            className="tabular"
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10.5,
              letterSpacing: "0.14em",
              color: toneColor(it.tone),
              textTransform: "uppercase",
              minWidth: 26,
            }}
          >
            #{String(it.rank).padStart(2, "0")}
          </span>
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 16,
              color: "var(--cream)",
              lineHeight: 1.25,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {it.name}
          </span>
          <span
            className="tabular"
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10.5,
              letterSpacing: "0.14em",
              color: toneColor(it.tone),
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {it.trail}
          </span>
        </li>
      ))}
    </ul>
  );
}

export interface KeyValueRow {
  label: string;
  value: string;
  tone?: "signal" | "ivy" | "wine" | "copper" | "cream";
}

interface KeyValueListProps {
  rows: KeyValueRow[];
}

export function KeyValueList({ rows }: KeyValueListProps) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {rows.map((r, i) => (
        <li
          key={r.label}
          className="anim-rise"
          style={{
            animationDelay: `${100 + i * 50}ms`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
            padding: "12px 0",
            borderTop: i === 0 ? "none" : "1px solid var(--rule)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10.5,
              letterSpacing: "0.16em",
              color: "var(--cream-3)",
              textTransform: "uppercase",
            }}
          >
            {r.label}
          </span>
          <span
            className="tabular"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 18,
              color: toneColor(r.tone),
              letterSpacing: "-0.01em",
            }}
          >
            {r.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

interface RiskTickerProps {
  high: number;
  medium: number;
  low: number;
}

export function RiskTicker({ high, medium, low }: RiskTickerProps) {
  const total = Math.max(high + medium + low, 1);
  const rows: Array<{ label: string; n: number; color: string }> = [
    { label: "HIGH", n: high, color: "var(--wine)" },
    { label: "MEDIUM", n: medium, color: "var(--copper)" },
    { label: "LOW", n: low, color: "var(--ivy)" },
  ];
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {rows.map((r, i) => {
        const pct = (r.n / total) * 100;
        return (
          <li
            key={r.label}
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
                className="inline-flex items-center"
                style={{
                  gap: 8,
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10.5,
                  letterSpacing: "0.16em",
                  color: "var(--cream-2)",
                  textTransform: "uppercase",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 8,
                    height: 8,
                    background: r.color,
                  }}
                />
                {r.label}
              </span>
              <span
                className="tabular"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 18,
                  color: "var(--cream)",
                  letterSpacing: "-0.01em",
                }}
              >
                {r.n}
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
                  width: `${Math.max(pct, r.n > 0 ? 4 : 0)}%`,
                  background: r.color,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
