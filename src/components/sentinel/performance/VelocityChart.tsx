interface VelocityChartProps {
  current: number[];
  prior?: number[];
  labels: string[];
  marker?: { index: number; label: string; value: string } | null;
}

export function VelocityChart({
  current,
  prior,
  labels,
  marker,
}: VelocityChartProps) {
  const W = 600;
  const H = 220;
  const pad = { l: 40, r: 16, t: 16, b: 28 };
  const all = [...current, ...(prior ?? [])];
  const max = Math.max(...all, 1);
  const min = Math.min(...all, 0);
  const span = Math.max(1, max - min);
  const stepX =
    current.length > 1 ? (W - pad.l - pad.r) / (current.length - 1) : 0;

  const toPoints = (values: number[]) =>
    values.map((v, i) => {
      const x = pad.l + i * stepX;
      const y = pad.t + (1 - (v - min) / span) * (H - pad.t - pad.b);
      return [x, y] as const;
    });

  const curr = toPoints(current);
  const priorPts = prior ? toPoints(prior) : [];
  const path = curr
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const priorPath = priorPts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Pipeline velocity"
    >
      <defs>
        <filter id="signal-glow" x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      {[0.25, 0.5, 0.75].map((p) => (
        <line
          key={p}
          x1={pad.l}
          x2={W - pad.r}
          y1={pad.t + p * (H - pad.t - pad.b)}
          y2={pad.t + p * (H - pad.t - pad.b)}
          stroke="var(--rule)"
          strokeWidth={1}
        />
      ))}
      {prior && (
        <path
          d={priorPath}
          fill="none"
          stroke="var(--cream-3)"
          strokeWidth={1}
          strokeDasharray="4 5"
          opacity={0.7}
        />
      )}
      <path
        d={path}
        fill="none"
        stroke="var(--signal)"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#signal-glow)"
        opacity={0.5}
      />
      <path
        d={path}
        fill="none"
        stroke="var(--signal)"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="anim-draw"
      />
      {marker && curr[marker.index] && (
        <g>
          <circle
            cx={curr[marker.index][0]}
            cy={curr[marker.index][1]}
            r={4}
            fill="var(--signal)"
          />
          <circle
            cx={curr[marker.index][0]}
            cy={curr[marker.index][1]}
            r={4}
            fill="none"
            stroke="var(--signal)"
            strokeWidth={1}
            className="anim-pulse-ring"
          />
          <line
            x1={curr[marker.index][0]}
            x2={curr[marker.index][0]}
            y1={curr[marker.index][1] - 8}
            y2={pad.t + 6}
            stroke="var(--signal)"
            strokeWidth={1}
            strokeDasharray="2 3"
          />
          <text
            x={curr[marker.index][0] + 6}
            y={pad.t + 12}
            fontFamily="var(--font-mono-jb)"
            fontSize={9}
            fill="var(--cream-2)"
            letterSpacing={1.4}
          >
            {marker.label.toUpperCase()} · {marker.value}
          </text>
        </g>
      )}
      {labels.map((l, i) => {
        if (i % Math.ceil(labels.length / 6) !== 0) return null;
        const x = pad.l + i * stepX;
        return (
          <text
            key={`${l}-${i}`}
            x={x}
            y={H - 8}
            textAnchor="middle"
            fontFamily="var(--font-mono-jb)"
            fontSize={9}
            fill="var(--cream-4)"
            letterSpacing={1.2}
          >
            {l.toUpperCase()}
          </text>
        );
      })}
    </svg>
  );
}
