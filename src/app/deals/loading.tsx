import {
  Skeleton,
  DealListRowSkeleton,
} from "@/components/ui/skeleton";
import { DashboardLoadingShell } from "@/components/dashboard-loading-shell";

function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-2.5 w-16 rounded" />
          <Skeleton className="h-2 w-12 rounded" />
        </div>
      </div>
      <Skeleton className="h-8 w-20 rounded" />
      <Skeleton className="h-2.5 w-14 rounded" />
    </div>
  );
}

export default function DealsLoading() {
  return (
    <DashboardLoadingShell>
      <div
        className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-10 sm:space-y-12 max-w-[1600px] mx-auto min-h-screen"
        aria-live="polite"
        aria-label="Loading deals"
      >
        <header>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <Skeleton className="h-2.5 w-14 rounded mb-3" />
              <Skeleton className="h-12 w-52 rounded-lg sm:w-64 mb-4" />
              <Skeleton className="h-4 w-72 rounded" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
          </div>
        </header>

        <section>
          <Skeleton className="h-2.5 w-20 rounded mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
            {[...Array(4)].map((_, i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </div>
        </section>

        <section>
          <Skeleton className="h-2.5 w-24 rounded mb-5" />
          <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/[0.04] pb-5">
              <Skeleton className="h-5 w-16 rounded" />
              <div className="flex gap-3">
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-8 w-44 rounded-lg" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    {["Deal", "Value", "Stage", "Risk", "Assigned to", "Next Action", "Last Activity", ""].map(
                      (label) => (
                        <th
                          key={label}
                          className="text-left text-[10px] px-3 sm:px-4 py-3 font-medium text-white/30 uppercase tracking-wider"
                        >
                          {label}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(8)].map((_, i) => (
                    <DealListRowSkeleton key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </DashboardLoadingShell>
  );
}
