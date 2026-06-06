import { formatShortMoney as formatM } from "@/lib/format-money";

interface ForecastScenariosProps {
  months: string[];
  best: number[];
  expected: number[];
  worst: number[];
}

export function ForecastScenarios({
  months,
  best,
  expected,
  worst,
}: ForecastScenariosProps) {
  const W = 600;
  const H = 340;
  const pad = { l: 50, r: 16, t: 20, b: 40 };
  const all = [...best, ...expected, ...worst];
  const max = Math.max(...all, 1);
  const min = Math.min(0, ...all);
  const span = Math.max(1, max - min);
  const stepX =
    months.length > 1 ? (W - pad.l - pad.r) / (months.length - 1) : 0;

  const toPts = (vals: number[]) =>
    vals.map((v, i) => {
      const x = pad.l + i * stepX;
      const y = pad.t + (1 - (v - min) / span) * (H - pad.t - pad.b);
      return [x, y] as const;
    });

  const bestPts = toPts(best);
  const expectedPts = toPts(expected);
  const worstPts = toPts(worst);

  const linePath = (pts: ReadonlyArray<readonly [number, number]>) =>
    pts
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ");

  const bandPath =
    bestPts
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ") +
    " " +
    [...worstPts]
      .reverse()
      .map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ") +
    " Z";

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Forecast scenarios">
        {[0.25, 0.5, 0.75].map((p) => (
          <line
            key={p}
            x1={pad.l}
            x2={W - pad.r}
            y1={pad.t + p * (H - pad.t - pad.b)}
            y2={pad.t + p * (H - pad.t - pad.b)}
            stroke="var(--rule)"
          />
        ))}
        <path d={bandPath} fill="var(--signal)" opacity={0.07} />

        <path
          d={linePath(worstPts)}
          fill="none"
          stroke="var(--signal)"
          strokeWidth={1.4}
          className="anim-draw"
        />
        <path
          d={linePath(expectedPts)}
          fill="none"
          stroke="var(--cream-2)"
          strokeWidth={1.2}
          strokeDasharray="4 5"
        />
        <path
          d={linePath(bestPts)}
          fill="none"
          stroke="var(--ivy)"
          strokeWidth={1.4}
          className="anim-draw"
        />

        {bestPts.map(([x, y], i) => (
          <circle key={`b-${i}`} cx={x} cy={y} r={2.5} fill="var(--ivy)" />
        ))}
        {expectedPts.map(([x, y], i) => (
          <circle key={`e-${i}`} cx={x} cy={y} r={2.5} fill="var(--cream-2)" />
        ))}
        {worstPts.map(([x, y], i) => (
          <circle key={`w-${i}`} cx={x} cy={y} r={2.5} fill="var(--signal)" />
        ))}

        {months.map((m, i) => (
          <text
            key={`${m}-${i}`}
            x={pad.l + i * stepX}
            y={H - 10}
            textAnchor="middle"
            fontFamily="var(--font-mono-jb)"
            fontSize={9}
            fill="var(--cream-4)"
            letterSpacing={1.2}
          >
            {m.toUpperCase()}
          </text>
        ))}
      </svg>

      <div
        className="flex flex-wrap"
        style={{
          gap: 18,
          marginTop: 14,
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--cream-3)",
        }}
      >
        <Legend swatch="var(--ivy)" label="Best" value={formatM(best[best.length - 1] ?? 0)} />
        <Legend swatch="var(--cream-2)" label="Expected" value={formatM(expected[expected.length - 1] ?? 0)} dashed />
        <Legend swatch="var(--signal)" label="Worst" value={formatM(worst[worst.length - 1] ?? 0)} />
      </div>
    </div>
  );
}

function Legend({
  swatch,
  label,
  value,
  dashed,
}: {
  swatch: string;
  label: string;
  value: string;
  dashed?: boolean;
}) {
  return (
    <span className="flex items-center" style={{ gap: 6 }}>
      <span
        aria-hidden
        style={{
          width: 14,
          height: 2,
          background: dashed ? "transparent" : swatch,
          borderTop: dashed ? `2px dashed ${swatch}` : "none",
        }}
      />
      <span>{label}</span>
      <span className="tabular" style={{ color: "var(--cream)", marginLeft: 4 }}>
        {value}
      </span>
    </span>
  );
}
