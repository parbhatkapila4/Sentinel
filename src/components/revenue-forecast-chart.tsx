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
  [key: string]: string | number;
}

export type ChartType = "bar" | "graph" | "column";

interface RevenueForecastChartProps {
  data: ChartDataPoint[];
  chartType?: ChartType;
}

const commonSx = {
  backgroundColor: "transparent",
  "& .MuiChartsGrid-horizontalLine": {
    stroke: "#1a1a1a",
    strokeWidth: 1,
    strokeDasharray: "2 4",
    opacity: 0.6,
  },
  "& .MuiChartsGrid-verticalLine": {
    stroke: "transparent",
  },
  "& .MuiChartsAxis-line": { stroke: "#202020" },
  "& .MuiChartsAxis-tick": { stroke: "#202020" },
  "& .MuiChartsAxis-tickLabel": { fill: "#8a8a8a" },
};

export function RevenueForecastChart({
  data,
  chartType = "graph",
}: RevenueForecastChartProps) {
  const valueFormatter = (value: number | null) =>
    value != null ? formatRevenue(value) : "";

  return (
    <ThemeProvider theme={darkTheme}>
      <div style={{ width: "100%", height: 280, position: "relative" }}>
        {chartType === "graph" && (
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
              },
            ]}
            series={[
              {
                dataKey: "actual",
                label: "Actual",
                color: "#ffffff",
                curve: "monotoneX",
                showMark: false,
                area: true,
                valueFormatter,
              },
            ]}
            sx={{
              ...commonSx,
              "& .MuiLineElement-root": {
                stroke: "#ffffff",
                strokeWidth: 2.5,
                fill: "none",
              },
              "& .MuiAreaElement-root": {
                fill: "#ffffff",
                fillOpacity: 0.15,
              },
            }}
            grid={{ horizontal: true }}
            margin={{ top: 20, right: 20, bottom: 30, left: 50 }}
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
