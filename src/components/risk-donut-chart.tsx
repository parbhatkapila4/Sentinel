"use client";

import React, { useEffect, useState } from "react";

const CX = 50;
const CY = 50;
const RADIUS = 46;

function polarToCartesian(angle: number) {
  return {
    x: CX + RADIUS * Math.cos(angle),
    y: CY + RADIUS * Math.sin(angle),
  };
}

function describePieSlice(startAngle: number, endAngle: number): string {
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return [
    `M ${CX} ${CY}`,
    `L ${start.x} ${start.y}`,
    `A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

export interface RiskDonutChartProps {
  low: number;
  medium: number;
  high: number;
  total: number;
  className?: string;
}

export function RiskDonutChart({ low, medium, high, total, className = "" }: RiskDonutChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const twoPi = 2 * Math.PI;
  const startTop = -Math.PI / 2;

  const slices =
    total > 0
      ? [
        { start: startTop, end: startTop + (low / total) * twoPi, id: "low" as const },
        {
          start: startTop + (low / total) * twoPi,
          end: startTop + ((low + medium) / total) * twoPi,
          id: "medium" as const,
        },
        {
          start: startTop + ((low + medium) / total) * twoPi,
          end: startTop + (low / total) * twoPi + (medium / total) * twoPi + (high / total) * twoPi,
          id: "high" as const,
        },
      ].filter((s) => s.end - s.start > 0.01)
      : [];

  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden>
        <defs>
          <linearGradient id="risk-pie-low" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="risk-pie-medium" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="risk-pie-high" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f87171" stopOpacity="1" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.85" />
          </linearGradient>
        </defs>


        {total === 0 && (
          <circle
            cx={CX}
            cy={CY}
            r={RADIUS}
            fill="rgba(255,255,255,0.04)"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        )}


        {slices.map((slice, i) => (
          <path
            key={slice.id}
            d={describePieSlice(slice.start, slice.end)}
            fill={`url(#risk-pie-${slice.id})`}
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="0.8"
            style={{
              opacity: mounted ? 1 : 0,
              transformOrigin: `${CX}px ${CY}px`,
              transition: "opacity 0.4s ease-out",
              transitionDelay: `${i * 80}ms`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
