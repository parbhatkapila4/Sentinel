import { Sparkline } from "./Sparkline";

interface KPIProps {
  label: string;
  hero?: boolean;
  display: string;
  italicWord?: string;
  delta?: { value: string; positive: boolean };
  meta?: string;
  spark?: { values: number[]; color?: string };
  delayMs?: number;
}

export function KPI({
  label,
  hero,
  display,
  italicWord,
  delta,
  meta,
  spark,
  delayMs = 0,
}: KPIProps) {
  return (
    <div
      className={hero ? "anim-rise sentinel-kpi-hero" : "anim-rise"}
      style={{
        animationDelay: `${delayMs}ms`,
        padding: hero ? "0 32px 0 0" : "0 24px 0 24px",
        borderRight: hero ? "1px solid var(--rule)" : "none",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "var(--cream-3)",
          textTransform: "uppercase",
          marginBottom: hero ? 22 : 16,
        }}
      >
        {label}
      </div>
      <div
        className="tabular"
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 400,
          fontSize: hero ? "clamp(46px, 18vw, 92px)" : 44,
          lineHeight: 1,
          color: "var(--cream)",
          letterSpacing: "-0.03em",
          marginBottom: hero ? 22 : 14,
        }}
      >
        {italicWord ? (
          <em
            style={{
              fontStyle: "italic",
              color: "var(--signal)",
              fontFamily: "var(--font-serif)",
            }}
          >
            {italicWord}
          </em>
        ) : (
          display
        )}
        {italicWord && display !== italicWord && (
          <span style={{ marginLeft: 8 }}>{display}</span>
        )}
      </div>
      {spark && (
        <div style={{ marginBottom: 14 }}>
          <Sparkline values={spark.values} color={spark.color ?? "var(--signal)"} />
        </div>
      )}
      <div
        className="flex items-center"
        style={{
          gap: 12,
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        {delta && (
          <span
            className="tabular"
            style={{
              color: delta.positive ? "var(--ivy)" : "var(--wine)",
              fontWeight: 500,
            }}
          >
            {delta.positive ? "↑" : "↓"} {delta.value}
          </span>
        )}
        {meta && <span style={{ color: "var(--cream-4)" }}>{meta}</span>}
      </div>
    </div>
  );
}
