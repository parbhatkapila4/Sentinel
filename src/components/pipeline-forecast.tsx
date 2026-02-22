"use client";

import { LineChart } from "@mui/x-charts";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { PipelineForecast } from "@/types";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#0f0f0f", paper: "#0f0f0f" },
    text: { primary: "#e5e5e5", secondary: "#7a7a7a" },
  },
});

interface PipelineForecastProps {
  forecast: PipelineForecast;
}

function formatVal(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

export function PipelineForecastChart({ forecast }: PipelineForecastProps) {
  const { expected, bestCase, worstCase, monthly } = forecast;
  const data = monthly.map((m) => ({
    month: m.month,
    expected: m.value,
    best: m.bestCase ?? m.value,
    worst: m.worstCase ?? m.value,
  }));

  return (
    <div className="min-w-0 overflow-hidden w-full flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5 shrink-0">
        <h3 className="text-base sm:text-lg font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">Pipeline forecast</h3>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
          <span className="text-emerald-400">Best {formatVal(bestCase)}</span>
          <span className="text-white/80">Expected {formatVal(expected)}</span>
          <span className="text-amber-400">Worst {formatVal(worstCase)}</span>
        </div>
      </div>
      <ThemeProvider theme={darkTheme}>
        <div className="flex-1 w-full min-h-[280px] lg:min-h-[300px] min-w-0" style={{ width: "100%" }}>
          <LineChart
            dataset={data}
            xAxis={[
              {
                scaleType: "point",
                dataKey: "month",
                tickLabelStyle: { fill: "#8a8a8a", fontSize: 12 },
              },
            ]}
            yAxis={[
              {
                tickLabelStyle: { fill: "#555555", fontSize: 11 },
                tickNumber: 5,
                valueFormatter: (v: unknown) => (typeof v === "number" ? formatVal(v) : ""),
              },
            ]}
            series={[
              {
                dataKey: "best",
                label: "Best case",
                color: "#22c55e",
                curve: "monotoneX",
                showMark: true,
                valueFormatter: (v: unknown) => (v != null ? formatVal(Number(v)) : ""),
              },
              {
                dataKey: "expected",
                label: "Expected",
                color: "#e5e5e5",
                curve: "monotoneX",
                showMark: true,
                valueFormatter: (v: unknown) => (v != null ? formatVal(Number(v)) : ""),
              },
              {
                dataKey: "worst",
                label: "Worst case",
                color: "#f59e0b",
                curve: "monotoneX",
                showMark: true,
                valueFormatter: (v: unknown) => (v != null ? formatVal(Number(v)) : ""),
              },
            ]}
            sx={{
              backgroundColor: "transparent",
              "& .MuiChartsGrid-horizontalLine": { stroke: "#1a1a1a", strokeWidth: 1, strokeDasharray: "2 4", opacity: 0.6 },
              "& .MuiChartsGrid-verticalLine": { stroke: "transparent" },
              "& .MuiChartsAxis-line": { stroke: "#202020" },
              "& .MuiChartsAxis-tick": { stroke: "#202020" },
              "& .MuiLineElement-root": { strokeWidth: 2.5, fill: "none" },
              "& .MuiChartsAxis-tickLabel": { fill: "#8a8a8a" },
            }}
            grid={{ horizontal: true }}
            margin={{ top: 16, right: 16, bottom: 28, left: 56 }}
          />
        </div>
      </ThemeProvider>
      <p className="text-[11px] text-white/40 mt-2 shrink-0">
        Weighted by stage and win probability. Next 3 months.
      </p>
    </div>
  );
}
