import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLoadingShell } from "@/components/dashboard-loading-shell";

function AnalyticsCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-2.5 w-20 rounded" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-24 rounded mb-1.5" />
      <Skeleton className="h-2.5 w-28 rounded" />
    </div>
  );
}

export default function AnalyticsLoading() {
  return (
    <DashboardLoadingShell>
      <div
        className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-10 sm:space-y-12 max-w-[1600px] mx-auto min-h-screen"
        aria-live="polite"
        aria-label="Loading analytics"
      >
        <header>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <Skeleton className="h-2.5 w-16 rounded mb-3" />
              <Skeleton className="h-12 w-64 rounded-lg sm:w-80 mb-4" />
              <Skeleton className="h-4 w-80 rounded" />
            </div>
            <div className="flex flex-col gap-3 items-end">
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-36 rounded-xl" />
            </div>
          </div>
        </header>

        <section>
          <Skeleton className="h-2.5 w-20 rounded mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
            {[...Array(4)].map((_, i) => (
              <AnalyticsCardSkeleton key={i} />
            ))}
          </div>
        </section>

        <section>
          <Skeleton className="h-2.5 w-24 rounded mb-5" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7">
            <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6">
              <Skeleton className="h-5 w-36 rounded mb-6" />
              <div className="flex justify-center mb-6">
                <Skeleton className="h-52 w-52 rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="rounded-xl border border-white/[0.06] p-3 text-center space-y-2">
                    <div className="flex items-center justify-center gap-1.5">
                      <Skeleton className="w-2 h-2 rounded-full" />
                      <Skeleton className="h-2 w-10 rounded" />
                    </div>
                    <Skeleton className="h-6 w-8 rounded mx-auto" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6">
              <Skeleton className="h-5 w-44 rounded mb-4" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Skeleton className="w-2 h-2 rounded-full shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3.5 w-36 rounded" />
                        <Skeleton className="h-2.5 w-28 rounded" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-12 rounded-full ml-3" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <Skeleton className="h-2.5 w-28 rounded mb-5" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6">
                <Skeleton className="h-5 w-32 rounded mb-4" />
                <Skeleton className="h-40 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLoadingShell>
  );
}
