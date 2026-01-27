"use client";

import { useState, useRef, useEffect } from "react";
import { RevenueForecastChart, type ChartDataPoint, type ChartType } from "@/components/revenue-forecast-chart";
import { formatRevenue } from "@/lib/utils";

interface BusinessPerformanceTrendsProps {
  chartData: ChartDataPoint[];
  totalValue: number;
  avgGrowthRate: number;
}

const CHART_OPTIONS: { value: ChartType; label: string }[] = [
  { value: "bar", label: "Bar" },
  { value: "graph", label: "Graph" },
  { value: "column", label: "Column" },
];

export function BusinessPerformanceTrends({
  chartData,
  totalValue,
  avgGrowthRate,
}: BusinessPerformanceTrendsProps) {
  const [chartType, setChartType] = useState<ChartType>("graph");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLabel = CHART_OPTIONS.find((o) => o.value === chartType)?.label ?? "Graph";

  return (
    <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 w-full min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 sm:mb-5">
        <div className="contents sm:block sm:space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap order-1 sm:order-none">
            <svg
              className="w-4 h-4 text-[#8a8a8a]"
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
            <p className="text-xs sm:text-sm text-[#7d7d7d] uppercase tracking-[0.08em] break-words">
              Business Performance Trends
            </p>
          </div>
          <p className="text-2xl sm:text-3xl font-semibold text-white break-words order-3 sm:order-none">
            {formatRevenue(totalValue)}
          </p>
          <div className="flex items-center gap-1 order-4 sm:order-none -mt-2 sm:mt-0">
            {avgGrowthRate >= 0 ? (
              <svg
                className="w-3 h-3 text-[#22c55e]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94 2.28m5.94 2.28l-2.28 5.941"
                />
              </svg>
            ) : (
              <svg
                className="w-3 h-3 text-[#ef4444]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-5.94 2.28m5.94-2.28l2.28-5.941"
                />
              </svg>
            )}
            <p
              className={`text-xs ${avgGrowthRate >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}
            >
              {avgGrowthRate >= 0 ? "+" : ""}
              {(avgGrowthRate * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 min-w-0 order-2 sm:order-none">
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-white bg-[#181818] border border-[#2a2a2a] min-h-[44px] whitespace-nowrap flex items-center gap-2"
            >
              <span>{currentLabel}</span>
              <svg
                className={`w-4 h-4 text-white/60 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 min-w-[8rem] rounded-xl bg-[#131313] border border-[#1f1f1f] shadow-xl py-1">
                {CHART_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setChartType(opt.value);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${chartType === opt.value
                        ? "text-white bg-white/10"
                        : "text-[#8a8a8a] hover:text-white hover:bg-white/5"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            className="p-2 min-w-[44px] min-h-[44px] rounded-xl text-[#8a8a8a] hover:text-white hover:bg-[#1a1a1a] transition-colors flex items-center justify-center shrink-0"
            aria-label="More options"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-3 overflow-x-auto min-w-0">
        <RevenueForecastChart data={chartData} chartType={chartType} />
      </div>
    </div>
  );
}
