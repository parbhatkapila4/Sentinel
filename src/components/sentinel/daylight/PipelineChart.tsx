import { formatShortMoney } from "@/lib/format-money";
import { compactNumber, niceCeil } from "./format";

interface PipelineChartProps {
  current: number[];
  prior: number[];
  labels: string[];
  currentIndex: number;
  marker: { index: number; label: string; value: string } | null;
}

const AXIS_WIDTH = 44;
const PAD_RIGHT = 12;
const PAD_TOP = 14;
const AXIS_HEIGHT = 34;

const round = (n: number) => Math.round(n * 100) / 100;

const axisText: React.CSSProperties = {
  position: "absolute",
  fontFamily: "var(--dl-font-mono)",
  fontSize: 10.5,
  lineHeight: 1,
  color: "var(--dl-muted)",
  whiteSpace: "nowrap",
};

const yLabel: React.CSSProperties = {
  ...axisText,
  left: 0,
  width: AXIS_WIDTH - 8,
  textAlign: "right",
};

const gridLine: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  height: 1,
  background: "var(--dl-row)",
};

export function PipelineChart({
  current,
  prior,
  labels,
  currentIndex,
  marker,
}: PipelineChartProps) {
  const count = labels.length;
  if (count === 0) return null;

  const nowIdx = Math.max(0, Math.min(currentIndex, count - 1));
  const peakValue = Math.max(0, ...current, ...prior);
  const hasData = peakValue > 0;
  const max = niceCeil(Math.max(peakValue, 1));
  const x = (i: number) => (count > 1 ? round((i / (count - 1)) * 100) : 0);
  const y = (v: number) => round((1 - Math.max(0, v) / max) * 100);

  const thisYear = current
    .slice(0, nowIdx + 1)
    .map((v, i) => [x(i), y(v)] as const);
  const lastYear = prior.slice(0, count).map((v, i) => [x(i), y(v)] as const);
  const hasPrior = prior.some((v) => v > 0);
  const hasCurrent = thisYear.some(([, py]) => py < 100);
  const toPoints = (pts: ReadonlyArray<readonly [number, number]>) =>
    pts.map(([px, py]) => `${px},${py}`).join(" ");

  const futureStart =
    nowIdx < count - 1 ? round((x(nowIdx) + x(nowIdx + 1)) / 2) : null;
  const [nowX, nowY] = thisYear[thisYear.length - 1] ?? [x(nowIdx), 100];

  const area =
    thisYear.length > 1
      ? `M${thisYear[0][0]},100 ` +
      thisYear.map(([px, py]) => `L${px},${py}`).join(" ") +
      ` L${nowX},100 Z`
      : null;

  const peak =
    marker && marker.index <= nowIdx && thisYear[marker.index]
      ? thisYear[marker.index]
      : null;
  const flagText = marker
    ? `Peak · ${formatShortMoney(current[marker.index] ?? 0)}`
    : "";
  const flagOnRight = !peak || peak[0] <= 55;

  const describe = (values: number[]) =>
    values
      .map((v, i) => `${labels[i]} ${v > 0 ? `$${compactNumber(v)}` : "none"}`)
      .join(", ");
  const ariaLabel =
    `Deal value created per month. This year: ${describe(current.slice(0, nowIdx + 1))}.` +
    (hasPrior ? ` Last year: ${describe(prior.slice(0, count))}.` : "");

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      style={{
        position: "relative",
        height: "clamp(204px, 15cqw, 300px)",
        marginTop: 12,
      }}
    >
      {hasData && (
        <>
          <span
            style={{ ...yLabel, top: PAD_TOP, transform: "translateY(-50%)" }}
          >
            {compactNumber(max)}
          </span>
          <span
            style={{
              ...yLabel,
              top: `calc(${PAD_TOP}px + (100% - ${PAD_TOP + AXIS_HEIGHT}px) / 2)`,
              transform: "translateY(-50%)",
            }}
          >
            {compactNumber(max / 2)}
          </span>
        </>
      )}
      <span
        style={{ ...yLabel, bottom: AXIS_HEIGHT, transform: "translateY(50%)" }}
      >
        0
      </span>

      <div
        style={{
          position: "absolute",
          left: AXIS_WIDTH,
          right: PAD_RIGHT,
          top: PAD_TOP,
          bottom: AXIS_HEIGHT,
        }}
      >
        {futureStart !== null && (
          <div
            style={{
              position: "absolute",
              left: `${futureStart}%`,
              right: 0,
              top: 0,
              bottom: 0,
              borderLeft: "1px solid var(--dl-border-strong)",
              backgroundColor: "var(--dl-tint)",
              backgroundImage:
                "repeating-linear-gradient(135deg, var(--dl-hatch) 0, var(--dl-hatch) 1px, transparent 1px, transparent 7px)",
            }}
          >
            <span
              className="hidden sm:block"
              style={{
                ...axisText,
                top: 10,
                right: 8,
                fontSize: 10,
                letterSpacing: "0.08em",
              }}
            >
              UPCOMING
            </span>
          </div>
        )}
        <div style={{ ...gridLine, top: 0 }} />
        <div style={{ ...gridLine, top: "50%" }} />
        <div
          style={{
            ...gridLine,
            bottom: 0,
            background: "var(--dl-border-strong)",
          }}
        />

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            overflow: "visible",
          }}
        >
          <defs>
            <linearGradient id="dl-pipeline-fade" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0"
                style={{ stopColor: "var(--dl-ink)", stopOpacity: 0.14 }}
              />
              <stop
                offset="1"
                style={{ stopColor: "var(--dl-ink)", stopOpacity: 0 }}
              />
            </linearGradient>
          </defs>
          {hasPrior && (
            <polyline
              points={toPoints(lastYear)}
              fill="none"
              stroke="var(--dl-context)"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          )}
          {area && hasCurrent && (
            <path d={area} fill="url(#dl-pipeline-fade) rgba(20, 23, 26, 0.05)" />
          )}
          {thisYear.length > 1 && hasCurrent && (
            <polyline
              points={toPoints(thisYear)}
              fill="none"
              stroke="var(--dl-ink)"
              strokeWidth={2.25}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>

        {hasCurrent && nowY < 88 && (
          <span
            style={{
              position: "absolute",
              left: `${nowX}%`,
              top: `calc(${nowY}% + 11px)`,
              bottom: 0,
              width: 1,
              backgroundImage:
                "repeating-linear-gradient(to bottom, var(--dl-guide) 0, var(--dl-guide) 2px, transparent 2px, transparent 5px)",
            }}
          />
        )}

        {hasCurrent && (
          <>
            {thisYear.slice(0, -1).map(([px, py], i) => (
              <span
                key={i}
                style={{
                  position: "absolute",
                  left: `${px}%`,
                  top: `${py}%`,
                  width: 9,
                  height: 9,
                  margin: "-4.5px 0 0 -4.5px",
                  borderRadius: "50%",
                  background: "var(--dl-panel)",
                  border: "2px solid var(--dl-ink)",
                }}
              />
            ))}
            <span
              style={{
                position: "absolute",
                left: `${nowX}%`,
                top: `${nowY}%`,
                width: 22,
                height: 22,
                margin: "-11px 0 0 -11px",
                borderRadius: "50%",
                background: "var(--dl-ink)",
                opacity: 0.08,
              }}
            />
            <span
              style={{
                position: "absolute",
                left: `${nowX}%`,
                top: `${nowY}%`,
                width: 12,
                height: 12,
                margin: "-6px 0 0 -6px",
                borderRadius: "50%",
                background: "var(--dl-ink)",
                border: "2px solid var(--dl-panel)",
              }}
            />
          </>
        )}

        {peak && (
          <span
            style={{
              position: "absolute",
              top: `max(calc(${peak[1]}% - 24px), -12px)`,
              ...(flagOnRight
                ? { left: `calc(${peak[0]}% + 15px)` }
                : { right: `calc(${round(100 - peak[0])}% + 15px)` }),
              display: "flex",
              alignItems: "center",
              height: 24,
              padding: "0 12px",
              borderRadius: 7,
              background: "var(--dl-ink)",
              color: "var(--dl-panel)",
              fontSize: 11.5,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {flagText}
          </span>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          left: AXIS_WIDTH,
          right: PAD_RIGHT,
          bottom: 0,
          height: AXIS_HEIGHT,
        }}
      >
        {labels.map((label, i) => {
          const isNow = i === nowIdx;
          const isLast = i === count - 1 && count > 1;
          return (
            <span
              key={`${label}-${i}`}
              style={{
                ...axisText,
                left: `${x(i)}%`,
                top: 14,
                transform: isLast ? "translateX(-100%)" : "translateX(-50%)",
                letterSpacing: "0.04em",
                ...(isNow ? { fontWeight: 600, color: "var(--dl-ink)" } : {}),
              }}
            >
              {label.toUpperCase()}
            </span>
          );
        })}
      </div>
    </div>
  );
}
