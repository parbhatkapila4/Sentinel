"use client";

import * as React from "react";
import { LineChart, BarChart } from "@mui/x-charts";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { formatRevenue } from "@/lib/utils";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0f0f0f",
      paper: "#0f0f0f",
    },
    text: {
      primary: "#e5e5e5",
      secondary: "#7a7a7a",
    },
  },
});

export interface ChartDataPoint {
  month: string;
  actual: number;
  prediction: number;
  lastMonth?: number;
  [key: string]: string | number | undefined;
}

export type ChartType = "bar" | "graph" | "column";

interface RevenueForecastChartProps {
  data: ChartDataPoint[];
  chartType?: ChartType;
}

const commonSx = {
  backgroundColor: "transparent",
  "& .MuiChartsGrid-horizontalLine": {
    stroke: "rgba(255,255,255,0.04)",
    strokeWidth: 1,
    strokeDasharray: "none",
  },
  "& .MuiChartsGrid-verticalLine": {
    stroke: "transparent",
  },
  "& .MuiChartsAxis-line": { stroke: "transparent" },
  "& .MuiChartsAxis-tick": { stroke: "transparent" },
  "& .MuiChartsAxis-tickLabel": {
    fill: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: "0.02em",
  },
};

export function RevenueForecastChart({
  data,
  chartType = "graph",
}: RevenueForecastChartProps) {
  const valueFormatter = (value: number | null) =>
    value != null ? formatRevenue(value) : "";

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="relative w-full" style={{ height: 300 }}>
        {chartType === "graph" && (
          <LineChart
            dataset={data}
            xAxis={[
              {
                scaleType: "point",
                dataKey: "month",
                tickLabelStyle: {
                  fill: "rgba(255,255,255,0.55)",
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                },
              },
            ]}
            yAxis={[
              {
                tickLabelStyle: { fill: "transparent" },
                tickNumber: 5,
              },
            ]}
            series={[
              {
                dataKey: "actual",
                label: "Actual",
                color: "#2563eb",
                curve: "monotoneX",
                showMark: false,
                area: true,
                valueFormatter,
              },
              {
                dataKey: "lastMonth",
                label: "Total revenue (last month)",
                color: "#7dd3fc",
                curve: "monotoneX",
                showMark: false,
                area: false,
                valueFormatter,
              },
            ]}
            sx={{
              ...commonSx,
              "& .MuiLineElement-root": {
                strokeWidth: 3,
                fill: "none",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              },
              "& .MuiAreaElement-root": {
                fill: "#2563eb",
                fillOpacity: 0.12,
              },
            }}
            grid={{ horizontal: true, vertical: false }}
            margin={{ top: 36, right: 28, bottom: 36, left: 28 }}
          />
        )}

        {chartType === "bar" && (
          <BarChart
            dataset={data}
            layout="horizontal"
            xAxis={[
              {
                id: "bar-x",
                scaleType: "linear",
                tickLabelStyle: { fill: "#555555", fontSize: 11 },
                tickNumber: 5,
              },
            ]}
            yAxis={[
              {
                id: "bar-y",
                scaleType: "band",
                dataKey: "month",
                tickLabelStyle: { fill: "#8a8a8a", fontSize: 12 },
              },
            ]}
            series={[
              {
                dataKey: "actual",
                label: "Actual",
                color: "#ffffff",
                valueFormatter,
              },
            ]}
            sx={{
              ...commonSx,
              "& .MuiBarElement-root": {
                fill: "#ffffff",
                fillOpacity: 0.9,
              },
            }}
            margin={{ top: 20, right: 20, bottom: 30, left: 50 }}
          />
        )}

        {chartType === "column" && (
          <BarChart
            dataset={data}
            layout="vertical"
            xAxis={[
              {
                id: "col-x",
                scaleType: "band",
                dataKey: "month",
                tickLabelStyle: { fill: "#8a8a8a", fontSize: 12 },
              },
            ]}
            yAxis={[
              {
                id: "col-y",
                scaleType: "linear",
                tickLabelStyle: { fill: "#555555", fontSize: 11 },
                tickNumber: 5,
              },
            ]}
            series={[
              {
                dataKey: "actual",
                label: "Actual",
                color: "#ffffff",
                valueFormatter,
              },
            ]}
            sx={{
              ...commonSx,
              "& .MuiBarElement-root": {
                fill: "#ffffff",
                fillOpacity: 0.9,
              },
            }}
            margin={{ top: 20, right: 20, bottom: 30, left: 50 }}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
