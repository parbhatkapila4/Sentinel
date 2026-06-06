"use client";

import type { TickerItem } from "../types";
import { formatShortMoney as formatVal } from "@/lib/format-money";

interface TickerProps {
  items: TickerItem[];
}

const AGGREGATE_TAGS = new Set<string>([
  "PIPELINE",
  "AT RISK",
  "WON · WEEK",
  "WON · MONTH",
  "TOP DEAL",
  "COVERAGE",
  "ALERTS",
  "SYNC",
  "SENTINEL",
  "SETUP",
  "SOURCES",
  "PRIVACY",
  "SIGNALS",
  "NO DEALS",
  "QUIET MORNING",
]);


export function Ticker({ items }: TickerProps) {
  const safe = items.length > 0
    ? items
    : [
      { tag: "QUIET MORNING", value: 0, trend: "flat" as const, note: "NO NEW SIGNALS" },
      { tag: "SENTINEL", value: 0, trend: "flat" as const, note: "STANDING BY" },
    ];
  const loop = [...safe, ...safe];

  return (
    <div
      className="border-y overflow-hidden"
      style={{
        background: "var(--ink-02)",
        borderColor: "var(--rule)",
        height: 36,
      }}
      aria-label="Live wire ticker"
    >
      <div className="flex items-center h-full overflow-hidden">
        <div
          className="grid place-items-center shrink-0"
          style={{
            width: 80,
            height: "100%",
            background: "var(--signal)",
            color: "var(--cream)",
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.18em",
            position: "relative",
            zIndex: 2,
            boxShadow:
              "6px 0 12px -2px var(--ink-02), 12px 0 24px -8px var(--ink-02)",
          }}
        >
          WIRE ›
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            overflow: "hidden",
            position: "relative",
            maskImage:
              "linear-gradient(to right, black 0, black calc(100% - 48px), transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, black 0, black calc(100% - 48px), transparent 100%)",
          }}
        >
          <div
            className="flex anim-ticker items-center"
            style={{ whiteSpace: "nowrap", height: "100%" }}
          >
            {loop.map((it, i) => {
              const trendColor =
                it.trend === "up"
                  ? "var(--ivy)"
                  : it.trend === "down"
                    ? "var(--wine)"
                    : "var(--cream-3)";
              const isAggregate = AGGREGATE_TAGS.has(it.tag);
              return (
                <span
                  key={`${it.tag}-${i}`}
                  className="flex items-center tabular"
                  style={{
                    padding: "0 20px",
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 11,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--cream-2)",
                    gap: 10,
                    borderRight: "1px solid var(--rule)",
                    height: "100%",
                  }}
                >
                  <strong
                    style={{
                      color: isAggregate ? "var(--signal)" : "var(--cream)",
                      fontWeight: isAggregate ? 600 : 500,
                    }}
                  >
                    {it.tag}
                  </strong>
                  {it.value > 0 && (
                    <span style={{ color: "var(--cream)" }}>
                      {formatVal(it.value)}
                    </span>
                  )}
                  <span style={{ color: trendColor }}>{it.note}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
