import type React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-white/[0.04]",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-white/[0.07] before:to-transparent",
        "before:animate-[skeleton-shimmer_2s_ease-in-out_infinite]",
        "before:-translate-x-full",
        className,
      )}
      style={style}
    />
  );
}

export function DealCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 max-sm:p-4 space-y-4">
      <div className="flex items-center gap-3 max-sm:gap-2">
        <Skeleton className="w-10 h-10 rounded-lg shrink-0 max-sm:w-9 max-sm:h-9" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-3.5 w-28 rounded max-sm:w-24" />
          <Skeleton className="h-2.5 w-16 rounded max-sm:w-14" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-7 w-24 rounded max-sm:h-6 max-sm:w-20" />
        <Skeleton className="h-2.5 w-14 rounded max-sm:w-12" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-white/[0.04]">
      <td className="px-4 py-4"><Skeleton className="h-3.5 w-28 rounded" /></td>
      <td className="px-4 py-4"><Skeleton className="h-3.5 w-16 rounded" /></td>
      <td className="px-4 py-4"><Skeleton className="h-3.5 w-20 rounded" /></td>
      <td className="px-4 py-4"><Skeleton className="h-5 w-14 rounded-full" /></td>
      <td className="px-4 py-4"><Skeleton className="h-3.5 w-24 rounded" /></td>
      <td className="px-4 py-4"><Skeleton className="h-3.5 w-16 rounded" /></td>
    </tr>
  );
}

export function ChartSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-white/[0.06] bg-[#080808] p-5 lg:p-6 min-h-[280px] lg:min-h-[320px] flex flex-col", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-3.5 w-36 rounded" />
      </div>
      <Skeleton className="h-7 w-28 rounded mb-1" />
      <Skeleton className="h-3 w-20 rounded mb-6" />
      <div className="flex-1 flex items-end gap-3 pt-2">
        {[38, 62, 48, 78, 55, 72, 44].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end h-full">
            <Skeleton
              className="w-full rounded-t-md"
              style={{ height: `${h}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-3">
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="h-2.5 w-6 rounded" />
        ))}
      </div>
    </div>
  );
}

export function DealListRowSkeleton() {
  return (
    <tr className="border-b border-white/[0.04]">
      <td className="py-3.5 px-3 sm:px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-md shrink-0" />
          <Skeleton className="h-3.5 w-28 rounded" />
        </div>
      </td>
      <td className="py-3.5 px-3 sm:px-4"><Skeleton className="h-3.5 w-14 rounded" /></td>
      <td className="py-3.5 px-3 sm:px-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
      <td className="py-3.5 px-3 sm:px-4"><Skeleton className="h-5 w-12 rounded-full" /></td>
      <td className="py-3.5 px-3 sm:px-4"><Skeleton className="h-3.5 w-16 rounded" /></td>
      <td className="py-3.5 px-3 sm:px-4"><Skeleton className="h-3.5 w-20 rounded" /></td>
      <td className="py-3.5 px-3 sm:px-4"><Skeleton className="h-3.5 w-16 rounded" /></td>
      <td className="py-3.5 px-3 sm:px-4"><Skeleton className="h-3.5 w-10 rounded" /></td>
    </tr>
  );
}

export function PipelineHeroSkeleton() {
  return (
    <div className="relative rounded-xl border border-white/[0.06] overflow-hidden bg-[#080808]">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
      <div className="relative pl-6 pr-6 sm:pl-8 sm:pr-8 lg:px-10 py-8 sm:py-9">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-12">
          <div className="space-y-3">
            <Skeleton className="h-2.5 w-20 rounded" />
            <Skeleton className="h-12 w-52 rounded-lg sm:w-64" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
          <div className="flex flex-wrap items-end gap-8 sm:gap-10 lg:gap-14 border-t lg:border-t-0 lg:border-l border-white/[0.06] pt-6 lg:pt-0 lg:pl-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-2.5 w-16 rounded" />
                <Skeleton className="h-7 w-14 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PerformanceChartSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6 min-h-[300px] lg:min-h-[340px] xl:min-h-[360px] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3 w-44 rounded" />
          </div>
          <Skeleton className="h-8 w-28 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-end">
          <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
            <path
              d="M0 180 Q50 160 100 140 T200 100 T300 120 T400 80"
              fill="none"
              className="stroke-white/[0.06]"
              strokeWidth="2"
            />
            <path
              d="M0 180 Q50 160 100 140 T200 100 T300 120 T400 80 L400 200 L0 200 Z"
              className="fill-white/[0.02]"
            />
          </svg>
        </div>
      </div>
      <div className="flex justify-between mt-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-2.5 w-8 rounded" />
        ))}
      </div>
    </div>
  );
}

export function RevenueSourcesSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6 min-h-[300px] lg:min-h-[340px] xl:min-h-[360px] flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3 w-36 rounded" />
          </div>
          <Skeleton className="h-8 w-24 rounded" />
        </div>
      </div>
      <div className="flex-1 flex items-end gap-4 pt-4 pb-2">
        {[55, 80, 45, 70, 35].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
            <Skeleton
              className="w-full max-w-[64px] rounded-t-lg"
              style={{ height: `${h}%` }}
            />
            <Skeleton className="h-2 w-10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PipelineForecastSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6 lg:p-8 flex flex-col h-full min-h-[340px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <Skeleton className="h-5 w-36 rounded" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      </div>
      <div className="flex-1 relative min-h-[240px]">
        <div className="absolute inset-0 flex items-center">
          <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
            <path d="M0 160 Q60 140 120 120 T240 80 T360 60 L400 50" fill="none" className="stroke-white/[0.04]" strokeWidth="2" strokeDasharray="6 4" />
            <path d="M0 140 Q60 120 120 100 T240 60 T360 40 L400 30" fill="none" className="stroke-white/[0.06]" strokeWidth="2" />
            <path d="M0 180 Q60 170 120 150 T240 120 T360 100 L400 90" fill="none" className="stroke-white/[0.04]" strokeWidth="2" strokeDasharray="6 4" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function InsightsPanelSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-5">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-48 rounded" />
      </div>
      <div className="space-y-2.5 mb-5">
        <Skeleton className="h-2.5 w-24 rounded" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-white/[0.02]">
            <Skeleton className="h-4 w-4 rounded-full shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-3/4 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2.5 mt-auto">
        <Skeleton className="h-2.5 w-28 rounded" />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-white/[0.02]">
            <Skeleton className="h-4 w-4 rounded-full shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopDealsSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6 flex flex-col h-full">
      <div className="mb-5">
        <Skeleton className="h-5 w-24 rounded mb-1.5" />
        <Skeleton className="h-2.5 w-14 rounded" />
      </div>
      <div className="flex gap-6 mb-4">
        <Skeleton className="h-2 w-10 rounded" />
        <Skeleton className="h-2 w-10 rounded" />
        <Skeleton className="h-2 w-10 rounded flex-1 text-right" />
      </div>
      <div className="space-y-0">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3.5 border-t border-white/[0.04] first:border-t-0">
            <Skeleton className="h-7 w-7 rounded-md shrink-0" />
            <Skeleton className="h-3.5 w-28 rounded flex-1" />
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-3.5 w-16 rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MeetingsWidgetSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-5 w-40 rounded" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-3 rounded-lg bg-white/[0.02] space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-44 rounded" />
              <Skeleton className="h-3 w-12 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-2.5 w-16 rounded" />
              <Skeleton className="h-2.5 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6 flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 mb-5">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-5 w-40 rounded" />
      </div>
      <div className="flex-1 relative min-h-[200px] rounded-lg overflow-hidden bg-white/[0.02]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-3/4 relative">
            <Skeleton className="absolute w-full h-full rounded-xl opacity-50" />
            {[
              { top: "20%", left: "25%", size: 6 },
              { top: "35%", left: "55%", size: 8 },
              { top: "45%", left: "70%", size: 5 },
              { top: "30%", left: "45%", size: 7 },
              { top: "50%", left: "30%", size: 5 },
            ].map((dot, i) => (
              <Skeleton
                key={i}
                className="absolute rounded-full"
                style={{ top: dot.top, left: dot.left, width: dot.size, height: dot.size }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-sm:space-y-4">
      <div className="grid grid-cols-4 gap-4 max-sm:grid-cols-1 max-sm:gap-3">
        {[...Array(4)].map((_, i) => (
          <DealCardSkeleton key={i} />
        ))}
      </div>
      <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6 max-sm:p-4 max-sm:rounded-xl max-sm:overflow-x-auto">
        <Skeleton className="h-6 w-40 mb-6 max-sm:h-5 max-sm:w-32 max-sm:mb-4" />
        <table className="w-full max-sm:min-w-[480px]">
          <tbody>
            {[...Array(5)].map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
