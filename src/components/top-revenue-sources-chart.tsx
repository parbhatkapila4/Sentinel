"use client";

import * as React from "react";
import { formatRevenue } from "@/lib/utils";

interface RevenueSource {
  source: string;
  value: number;
  change: number;
}

interface TopRevenueSourcesChartProps {
  data: RevenueSource[];
}

export function TopRevenueSourcesChart({ data }: TopRevenueSourcesChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [highlightedIndex, setHighlightedIndex] = React.useState<number | null>(
    2
  );

  React.useEffect(() => {
    const paidAdsIndex = data.findIndex((item) => item.source === "Paid Ads");
    if (paidAdsIndex !== -1) {
      setHighlightedIndex(paidAdsIndex);
    }
  }, [data]);

  const maxValue = Math.max(...data.map((d) => d.value), 0) || 1;
  const labelAreaHeight = 20;
  const numBars = data.length;
  const chartHeight = 260;

  const viewBoxWidth = 600;
  const viewBoxPadding = 16;
  const availableWidth = viewBoxWidth - viewBoxPadding * 2;

  const minBarWidth = 60;
  const maxBarGap = 20;

  let barWidth: number;
  let barGap: number;

  if (numBars > 0) {
    const totalGapSpace = (numBars - 1) * maxBarGap;
    barWidth = Math.max(
      minBarWidth,
      Math.floor((availableWidth - totalGapSpace) / numBars)
    );

    if (barWidth < minBarWidth && numBars > 1) {
      barWidth = minBarWidth;
      const totalBarSpace = numBars * barWidth;
      const remainingSpace = availableWidth - totalBarSpace;
      barGap = Math.max(12, Math.floor(remainingSpace / (numBars - 1)));
    } else {
      barGap = maxBarGap;
    }
  } else {
    barWidth = minBarWidth;
    barGap = maxBarGap;
  }

  const chartWidth = viewBoxWidth;

  const chartAreaHeight = chartHeight - viewBoxPadding - labelAreaHeight - 8;

  const getBarHeight = (value: number) => {
    if (maxValue === 0) return 0;
    return (value / maxValue) * chartAreaHeight;
  };

  const getBarX = (index: number) => {
    return viewBoxPadding + index * (barWidth + barGap);
  };

  const getBarY = (value: number) => {
    const barHeight = getBarHeight(value);

    return chartHeight - labelAreaHeight - 4 - barHeight;
  };

  const getTooltipPosition = (index: number) => {
    const barX = getBarX(index);
    const barCenterPct = ((barX + barWidth / 2) / chartWidth) * 100;
    const clampedPct = Math.max(15, Math.min(85, barCenterPct));
    return {
      left: `${clampedPct}%`,
      transform: "translateX(-50%)",
    };
  };

  return (
    <div className="w-full h-full flex flex-col min-w-0 overflow-hidden">
      <div className="flex flex-row items-center gap-2 mb-4 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <svg
            className="w-4 h-4 text-[#0ea5e9]/80 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
          </svg>
          <h3 className="text-sm sm:text-base font-semibold text-white truncate [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
            Top Revenue Sources
          </h3>
        </div>
      </div>

      <div
        className="flex-1 relative"
        style={{ width: "100%", minHeight: chartHeight, height: "100%" }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: "visible" }}
          className="absolute inset-0"
        >
          <defs>
            <linearGradient id="revenue-bar-accent" x1="0" x2="0" y1="1" y2="0">
              <stop offset="0%" stopColor="#0c4a6e" />
              <stop offset="40%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="revenue-bar-default" x1="0" x2="0" y1="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.12)" />
            </linearGradient>
            <linearGradient id="revenue-bar-hover" x1="0" x2="0" y1="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.16)" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3, 4].map((i) => {
            const y = viewBoxPadding + (i * chartAreaHeight) / 4;
            return (
              <line
                key={i}
                x1={viewBoxPadding}
                y1={y}
                x2={chartWidth - viewBoxPadding}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
                strokeDasharray="4 6"
              />
            );
          })}

          <line
            x1={viewBoxPadding}
            y1={chartHeight - labelAreaHeight - 4}
            x2={chartWidth - viewBoxPadding}
            y2={chartHeight - labelAreaHeight - 4}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />

          {data.map((item, index) => {
            const barHeight = getBarHeight(item.value);
            const barX = getBarX(index);
            const barY = getBarY(item.value);
            const isHighlighted = index === highlightedIndex;
            const isHovered = index === hoveredIndex && !isHighlighted;

            return (
              <g key={item.source}>
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill={
                    isHighlighted
                      ? "url(#revenue-bar-accent)"
                      : isHovered
                        ? "url(#revenue-bar-hover)"
                        : "url(#revenue-bar-default)"
                  }
                  rx="8"
                  ry="8"
                  style={{
                    cursor: "pointer",
                    transition: "fill 0.2s ease, filter 0.2s ease",
                    filter: isHighlighted
                      ? "drop-shadow(0 0 12px rgba(14, 165, 233, 0.35))"
                      : "none",
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => setHighlightedIndex(index)}
                />

                <text
                  x={barX + barWidth / 2}
                  y={chartHeight - 6}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.5)"
                  fontSize="11"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight="500"
                  letterSpacing="0.02em"
                >
                  {item.source}
                </text>
              </g>
            );
          })}
        </svg>

        {(hoveredIndex !== null || highlightedIndex !== null) && (
          <div
            className="absolute pointer-events-none z-10"
            style={{
              ...getTooltipPosition(hoveredIndex ?? highlightedIndex ?? 0),
              bottom: `${labelAreaHeight + 16}px`,
            }}
          >
            <div
              className="relative rounded-lg px-3 py-2 shadow-lg"
              style={{
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div
                className="absolute left-1/2 -bottom-1 transform -translate-x-1/2"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "6px solid transparent",
                  borderRight: "6px solid transparent",
                  borderTop: "6px solid #1a1a1a",
                }}
              />

              <div className="text-white font-semibold text-sm leading-tight">
                {formatRevenue(
                  data[hoveredIndex ?? highlightedIndex ?? 0]?.value ?? 0
                )}
              </div>
              <div
                className="text-xs mt-1 leading-tight"
                style={{
                  color:
                    data[hoveredIndex ?? highlightedIndex ?? 0]?.change >= 0
                      ? "#38bdf8"
                      : "rgba(255,255,255,0.5)",
                }}
              >
                {data[hoveredIndex ?? highlightedIndex ?? 0]?.change >= 0
                  ? "+"
                  : ""}
                {data[hoveredIndex ?? highlightedIndex ?? 0]?.change.toFixed(0)}
                %
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
