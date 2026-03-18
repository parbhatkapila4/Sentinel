import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLoadingShell } from "@/components/dashboard-loading-shell";

export default function DealsByStageLoading() {
  return (
    <DashboardLoadingShell>
      <div
        className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-10 sm:space-y-12 max-w-[1600px] mx-auto min-h-screen"
        aria-live="polite"
        aria-label="Loading deals by stage"
      >
        <header>
          <Skeleton className="h-2.5 w-14 rounded mb-3" />
          <Skeleton className="h-12 w-56 rounded-lg sm:w-72 mb-4" />
          <Skeleton className="h-4 w-80 rounded" />
        </header>

        <section>
          <Skeleton className="h-2.5 w-24 rounded mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-[#080808] p-4">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-5 w-6 rounded-full" />
                </div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="p-3 rounded-lg bg-white/[0.02] space-y-2">
                      <Skeleton className="h-3.5 w-28 rounded" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-2.5 w-16 rounded" />
                        <Skeleton className="h-4 w-10 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLoadingShell>
  );
}
