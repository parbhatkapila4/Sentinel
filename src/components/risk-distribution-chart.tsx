"use client";

import React from "react";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { styled } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "transparent", paper: "transparent" },
    text: { primary: "#e5e5e5", secondary: "#9ca3af" },
  },
});

interface ChartDatum {
  id: string;
  label: string;
  value: number;
  percentage: number;
  color: string;
}

const riskColors = {
  Low: "#15803d",
  Medium: "#a16207",
  High: "#b91c1c",
} as const;

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const StyledText = styled("text")(() => ({
  fill: "#ffffff",
  textAnchor: "middle",
  dominantBaseline: "central",
  fontSize: 16,
  fontWeight: 700,
  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
}));

function PieCenterLabel({ children }: { children: React.ReactNode }) {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      {children}
    </StyledText>
  );
}

export interface RiskDistributionChartProps {
  lowRisk: number;
  mediumRisk: number;
  highRisk: number;
  lowNeedingAction: number;
  mediumNeedingAction: number;
  highNeedingAction: number;
  total: number;
  className?: string;
}

export function RiskDistributionChart({
  lowRisk,
  mediumRisk,
  highRisk,
  lowNeedingAction,
  mediumNeedingAction,
  highNeedingAction,
  total,
  className = "",
}: RiskDistributionChartProps) {
  const innerRadius = 50;
  const middleRadius = 100;
  const outerRadius = 120;

  const riskData: ChartDatum[] = [
    {
      id: "Low",
      label: "Low",
      value: lowRisk,
      percentage: total > 0 ? (lowRisk / total) * 100 : 0,
      color: riskColors.Low,
    },
    {
      id: "Medium",
      label: "Medium",
      value: mediumRisk,
      percentage: total > 0 ? (mediumRisk / total) * 100 : 0,
      color: riskColors.Medium,
    },
    {
      id: "High",
      label: "High",
      value: highRisk,
      percentage: total > 0 ? (highRisk / total) * 100 : 0,
      color: riskColors.High,
    },
  ].filter((d) => d.value > 0);

  const actionData: ChartDatum[] = [
    { risk: "Low" as const, needsAction: lowNeedingAction, total: lowRisk },
    { risk: "Medium" as const, needsAction: mediumNeedingAction, total: mediumRisk },
    { risk: "High" as const, needsAction: highNeedingAction, total: highRisk },
  ].flatMap(({ risk, needsAction, total: riskTotal }) => {
    if (riskTotal <= 0) return [];
    const ok = riskTotal - needsAction;
    const baseColor = riskColors[risk];
    return [
      {
        id: `${risk}-OK`,
        label: "OK",
        value: ok,
        percentage: (ok / riskTotal) * 100,
        color: baseColor,
      },
      {
        id: `${risk}-Action`,
        label: "Needs action",
        value: needsAction,
        percentage: (needsAction / riskTotal) * 100,
        color: hexToRgba(baseColor, 0.45),
      },
    ].filter((d) => d.value > 0);
  });

  return (
    <Box className={className} sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <ThemeProvider theme={darkTheme}>
        <PieChart
          series={[
            {
              innerRadius,
              outerRadius: middleRadius,
              data: riskData.length > 0 ? riskData : [{ id: "empty", value: 1, label: "No data", color: "rgba(255,255,255,0.06)", percentage: 100 }],
              arcLabel: (item) =>
                riskData.length > 0
                  ? `${(item as unknown as ChartDatum).id} (${(item as unknown as ChartDatum).percentage.toFixed(0)}%)`
                  : "",
              valueFormatter: ({ value }) => `${value}`,
              highlightScope: { fade: "global" as const, highlight: "item" as const },
              highlighted: { additionalRadius: 3 },
              cornerRadius: 2,
            },
            ...(actionData.length > 0
              ? [
                {
                  innerRadius: middleRadius,
                  outerRadius,
                  data: actionData,
                  arcLabel: (item: { label?: string; percentage?: number }) =>
                    `${item.label ?? ""} (${(item.percentage ?? 0).toFixed(0)}%)`,
                  arcLabelRadius: outerRadius + 14,
                  valueFormatter: ({ value }: { value: number }) => `${value}`,
                  highlightScope: { fade: "global" as const, highlight: "item" as const },
                  highlighted: { additionalRadius: 3 },
                  cornerRadius: 2,
                },
              ]
              : []),
          ]}
          width={360}
          height={300}
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: {
              fontSize: 12,
              fontWeight: 600,
              fill: "#ffffff",
              paintOrder: "stroke",
              stroke: "rgba(0,0,0,0.4)",
              strokeWidth: 2,
            },
            "& .MuiChartsLegend-series": { display: "none" },
          }}
          hideLegend
        >
          <PieCenterLabel>{total}</PieCenterLabel>
        </PieChart>
      </ThemeProvider>
    </Box>
  );
}
