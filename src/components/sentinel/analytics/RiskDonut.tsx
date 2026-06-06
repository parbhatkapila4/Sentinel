interface RiskDonutProps {
  low: number;
  medium: number;
  high: number;
  lowAction: number;
  mediumAction: number;
  highAction: number;
}

const TIERS = [
  {
    key: "low",
    label: "Low risk",
    color: "var(--ivy)",
  },
  {
    key: "medium",
    label: "Medium",
    color: "var(--copper)",
  },
  {
    key: "high",
    label: "High risk",
    color: "var(--wine)",
  },
] as const;

export function RiskDonut({
  low,
  medium,
  high,
  lowAction,
  mediumAction,
  highAction,
}: RiskDonutProps) {
  const total = low + medium + high;
  const totalAction = lowAction + mediumAction + highAction;

  const data = [
    { ...TIERS[0], value: low, action: lowAction },
    { ...TIERS[1], value: medium, action: mediumAction },
    { ...TIERS[2], value: high, action: highAction },
  ];

  const cx = 180;
  const cy = 180;
  const R_MAIN = 108;
  const STROKE_MAIN = 26;
  const R_URGENT = R_MAIN + STROKE_MAIN / 2 + 14;
  const STROKE_URGENT = 2;
  const R_INNER_GUIDE = R_MAIN - STROKE_MAIN / 2 - 14;
  const CIRC_MAIN = 2 * Math.PI * R_MAIN;
  const CIRC_URGENT = 2 * Math.PI * R_URGENT;

  const populatedTiers = data.filter((d) => d.value > 0).length;
  const GAP_ANGLE = populatedTiers > 1 ? (1.8 * Math.PI) / 180 : 0; // radians

  type Segment = {
    color: string;
    length: number;
    offset: number;
  };
  const mainSegments: Segment[] = [];
  const urgentArcs: Segment[] = [];

  if (total > 0) {
    let angleAcc = 0;
    data.forEach((d) => {
      if (d.value <= 0) return;
      const span = (d.value / total) * 2 * Math.PI;
      const drawSpan = Math.max(0, span - GAP_ANGLE);
      mainSegments.push({
        color: d.color,
        length: drawSpan * R_MAIN,
        offset: (angleAcc + GAP_ANGLE / 2) * R_MAIN,
      });

      if (d.action > 0) {
        const urgSpan = Math.min(drawSpan, (d.action / d.value) * drawSpan);
        const urgStart = angleAcc + GAP_ANGLE / 2 + (drawSpan - urgSpan);
        urgentArcs.push({
          color: d.color,
          length: urgSpan * R_URGENT,
          offset: urgStart * R_URGENT,
        });
      }

      angleAcc += span;
    });
  }

  const riskIndex =
    total > 0
      ? Math.round((low * 15 + medium * 55 + high * 95) / total)
      : 0;
  const indexColor =
    riskIndex >= 70
      ? "var(--signal)"
      : riskIndex >= 40
        ? "var(--copper)"
        : "var(--ivy)";

  return (
    <div className="flex flex-col" style={{ gap: 28 }}>
      <div className="flex justify-center">
        <svg
          viewBox="0 0 360 360"
          role="img"
          aria-label={`Risk distribution: ${low} low, ${medium} medium, ${high} high, ${totalAction} urgent`}
          style={{ width: "100%", maxWidth: 360, display: "block" }}
        >
          {totalAction > 0 && (
            <circle
              cx={cx}
              cy={cy}
              r={R_URGENT + 4}
              fill="none"
              stroke="var(--signal)"
              strokeWidth={0.5}
              opacity={0.18}
            />
          )}

          <g opacity={0.5}>
            {[
              { x1: cx - R_URGENT - 10, y1: cy, x2: cx - R_MAIN - STROKE_MAIN / 2 - 4, y2: cy },
              { x1: cx + R_MAIN + STROKE_MAIN / 2 + 4, y1: cy, x2: cx + R_URGENT + 10, y2: cy },
              { x1: cx, y1: cy - R_URGENT - 10, x2: cx, y2: cy - R_MAIN - STROKE_MAIN / 2 - 4 },
              { x1: cx, y1: cy + R_MAIN + STROKE_MAIN / 2 + 4, x2: cx, y2: cy + R_URGENT + 10 },
            ].map((l, i) => (
              <line
                key={i}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke="var(--rule-strong)"
                strokeWidth={1}
                strokeLinecap="round"
              />
            ))}
          </g>

          <circle
            cx={cx}
            cy={cy}
            r={R_MAIN}
            fill="none"
            stroke="var(--ink-03)"
            strokeWidth={STROKE_MAIN}
          />

          <g transform={`rotate(-90 ${cx} ${cy})`}>
            {mainSegments.map((s, i) => (
              <circle
                key={`main-${i}`}
                cx={cx}
                cy={cy}
                r={R_MAIN}
                fill="none"
                stroke={s.color}
                strokeWidth={STROKE_MAIN}
                strokeDasharray={`${s.length.toFixed(2)} ${(CIRC_MAIN - s.length).toFixed(2)}`}
                strokeDashoffset={(-s.offset).toFixed(2)}
                strokeLinecap="butt"
                style={{
                  opacity: 0,
                  transformOrigin: `${cx}px ${cy}px`,
                  animation: `sentinel-donut-draw 720ms cubic-bezier(0.2, 0.8, 0.2, 1) ${i * 110}ms forwards`,
                }}
              />
            ))}
          </g>

          {urgentArcs.length > 0 && (
            <g transform={`rotate(-90 ${cx} ${cy})`}>
              {urgentArcs.map((s, i) => (
                <circle
                  key={`urg-${i}`}
                  cx={cx}
                  cy={cy}
                  r={R_URGENT}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={STROKE_URGENT}
                  strokeDasharray={`${s.length.toFixed(2)} ${(CIRC_URGENT - s.length).toFixed(2)}`}
                  strokeDashoffset={(-s.offset).toFixed(2)}
                  strokeLinecap="round"
                  style={{
                    opacity: 0,
                    animation: `sentinel-donut-fade 500ms ease-out ${500 + i * 90}ms forwards`,
                  }}
                />
              ))}
            </g>
          )}

          <circle
            cx={cx}
            cy={cy}
            r={R_INNER_GUIDE}
            fill="none"
            stroke="var(--rule-strong)"
            strokeWidth={1}
            opacity={0.55}
          />

          <text
            x={cx}
            y={cy - 10}
            textAnchor="middle"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 60,
              fill: "var(--cream)",
              letterSpacing: "-0.035em",
              fontWeight: 400,
            }}
          >
            {total}
          </text>

          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 9,
              fill: "var(--cream-3)",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
            }}
          >
            Total Deals
          </text>

          {total > 0 && (
            <>
              <line
                x1={cx - 22}
                y1={cy + 26}
                x2={cx + 22}
                y2={cy + 26}
                stroke="var(--rule-strong)"
                strokeWidth={1}
                opacity={0.6}
              />
              <text
                x={cx}
                y={cy + 44}
                textAnchor="middle"
                className="tabular"
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  fill: indexColor,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                }}
              >
                Index {riskIndex}
              </text>
            </>
          )}

          {total === 0 && (
            <text
              x={cx}
              y={cy + 44}
              textAnchor="middle"
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 9,
                fill: "var(--cream-4)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Awaiting signal
            </text>
          )}

          <style>{`
            @keyframes sentinel-donut-draw {
              from { opacity: 0; transform: scale(0.94); transform-origin: ${cx}px ${cy}px; }
              to   { opacity: 1; transform: scale(1);    transform-origin: ${cx}px ${cy}px; }
            }
            @keyframes sentinel-donut-fade {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
          `}</style>
        </svg>
      </div>

      {total > 0 && (
        <div style={{ padding: "0 4px" }}>
          <div
            style={{
              display: "flex",
              height: 5,
              gap: 2,
              background: "var(--ink-03)",
            }}
          >
            {data.map((d) => {
              if (d.value === 0) return null;
              const pct = (d.value / total) * 100;
              return (
                <div
                  key={d.key}
                  title={`${d.label}: ${d.value} (${pct.toFixed(1)}%)`}
                  style={{
                    width: `${pct}%`,
                    background: d.color,
                    animation: "sentinel-donut-bar-grow 600ms ease-out both",
                  }}
                />
              );
            })}
          </div>
          <style>{`
            @keyframes sentinel-donut-bar-grow {
              from { transform: scaleX(0); transform-origin: left; }
              to   { transform: scaleX(1); transform-origin: left; }
            }
          `}</style>
        </div>
      )}

      <div className="grid grid-cols-3 w-full" style={{ gap: 0 }}>
        {data.map((d, i) => {
          const pct = total > 0 ? (d.value / total) * 100 : 0;
          return (
            <div
              key={d.key}
              style={{
                padding: "16px 18px 14px",
                borderLeft: i === 0 ? "none" : "1px solid var(--rule)",
              }}
            >
              <div
                className="inline-flex items-center"
                style={{ gap: 10, marginBottom: 12 }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 9,
                    height: 9,
                    background: d.color,
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 9.5,
                    letterSpacing: "0.2em",
                    color: "var(--cream-3)",
                    textTransform: "uppercase",
                  }}
                >
                  {d.label}
                </span>
              </div>
              <div
                className="flex items-baseline"
                style={{ gap: 12 }}
              >
                <span
                  className="tabular"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 34,
                    lineHeight: 1,
                    color: "var(--cream)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {d.value}
                </span>
                <span
                  className="tabular"
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 10,
                    color: "var(--cream-4)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {pct.toFixed(0)}%
                </span>
              </div>
              {d.action > 0 && (
                <div
                  style={{
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: "1px solid var(--rule)",
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 9,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--signal)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "var(--signal)",
                      boxShadow: "0 0 6px rgba(200, 71, 46, 0.55)",
                    }}
                  />
                  {d.action} Urgent
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
