import {
  Skeleton,
  PipelineHeroSkeleton,
  PerformanceChartSkeleton,
  RevenueSourcesSkeleton,
  PipelineForecastSkeleton,
  InsightsPanelSkeleton,
  TopDealsSkeleton,
  MapSkeleton,
  MeetingsWidgetSkeleton,
} from "@/components/ui/skeleton";
import { DashboardLoadingShell } from "@/components/dashboard-loading-shell";

export default function DashboardLoading() {
  return (
    <DashboardLoadingShell>
      <div
        className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-10 sm:space-y-12 max-w-[1600px] mx-auto min-h-screen"
        aria-live="polite"
        aria-label="Loading dashboard"
      >
        <header>
          <Skeleton className="h-2.5 w-16 rounded mb-3" />
          <Skeleton className="h-12 w-72 rounded-lg sm:w-96 mb-4" />
          <Skeleton className="h-4 w-80 rounded" />
        </header>

        <PipelineHeroSkeleton />

        <section>
          <Skeleton className="h-2.5 w-20 rounded mb-5" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7">
            <PerformanceChartSkeleton />
            <RevenueSourcesSkeleton />
          </div>
        </section>

        <section>
          <Skeleton className="h-2.5 w-28 rounded mb-5" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch">
            <div className="lg:col-span-2 min-w-0 h-full">
              <PipelineForecastSkeleton />
            </div>
            <div className="lg:col-span-1 min-w-0 h-full">
              <InsightsPanelSkeleton />
            </div>
          </div>
        </section>

        <section>
          <Skeleton className="h-2.5 w-40 rounded mb-5" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7">
            <TopDealsSkeleton />
            <MapSkeleton />
            <MeetingsWidgetSkeleton />
          </div>
        </section>
      </div>
    </DashboardLoadingShell>
  );
}
