"use client";

import dynamic from "next/dynamic";

const RiskDonut3D = dynamic(
  () => import("@/components/risk-donut-3d").then((m) => ({ default: m.RiskDonut3D })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-square max-w-[260px] mx-auto rounded-2xl bg-white/5 border border-white/5 animate-pulse flex items-center justify-center">
        <span className="text-white/30 text-sm">Loading…</span>
      </div>
    ),
  }
);

export interface RiskDonut3DClientProps {
  lowRisk: number;
  mediumRisk: number;
  highRisk: number;
  className?: string;
}

export function RiskDonut3DClient({
  lowRisk,
  mediumRisk,
  highRisk,
  className = "",
}: RiskDonut3DClientProps) {
  return (
    <RiskDonut3D
      lowRisk={lowRisk}
      mediumRisk={mediumRisk}
      highRisk={highRisk}
      className={className}
    />
  );
}
