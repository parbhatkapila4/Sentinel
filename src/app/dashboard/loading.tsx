import {
  DealCardSkeleton,
  ChartSkeleton,
  Skeleton,
} from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div
      className="p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6 w-full min-h-screen bg-[#0b0b0b]"
      aria-live="polite"
      aria-label="Loading dashboard"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {[...Array(4)].map((_, i) => (
          <DealCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <ChartSkeleton />
        <ChartSkeleton className="min-h-[280px] lg:min-h-[320px] xl:min-h-[350px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-stretch">
        <div className="lg:col-span-2 min-w-0 h-full">
          <ChartSkeleton />
        </div>
        <div className="lg:col-span-1 min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 lg:p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <ChartSkeleton className="min-h-[240px]" />
        <ChartSkeleton className="min-h-[240px]" />
        <ChartSkeleton className="min-h-[240px]" />
      </div>
    </div>
  );
}
