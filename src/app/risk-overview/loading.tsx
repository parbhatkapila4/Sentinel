import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLoadingShell } from "@/components/dashboard-loading-shell";

export default function RiskOverviewLoading() {
  return (
    <DashboardLoadingShell>
      <div
        className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-10 sm:space-y-12 max-w-[1600px] mx-auto min-h-screen"
        aria-live="polite"
        aria-label="Loading risk overview"
      >
        <header>
          <Skeleton className="h-2.5 w-14 rounded mb-3" />
          <Skeleton className="h-12 w-56 rounded-lg sm:w-72 mb-4" />
          <Skeleton className="h-4 w-80 rounded" />
        </header>

        <section>
          <Skeleton className="h-2.5 w-20 rounded mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-2.5 w-20 rounded" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
                <Skeleton className="h-8 w-16 rounded" />
                <Skeleton className="h-2.5 w-24 rounded" />
              </div>
            ))}
          </div>
        </section>

        <section>
          <Skeleton className="h-2.5 w-28 rounded mb-5" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7">
            {["High risk", "Medium risk", "Low risk"].map((label) => (
              <div key={label} className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/[0.02] flex items-center gap-3">
                      <Skeleton className="w-2 h-2 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-32 rounded" />
                        <Skeleton className="h-2.5 w-24 rounded" />
                      </div>
                      <Skeleton className="h-5 w-12 rounded-full" />
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
