import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLoadingShell } from "@/components/dashboard-loading-shell";

export default function ReportsLoading() {
  return (
    <DashboardLoadingShell>
      <div
        className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-10 sm:space-y-12 max-w-[1600px] mx-auto min-h-screen"
        aria-live="polite"
        aria-label="Loading reports"
      >
        <header>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <Skeleton className="h-2.5 w-14 rounded mb-3" />
              <Skeleton className="h-12 w-44 rounded-lg sm:w-56 mb-4" />
              <Skeleton className="h-4 w-72 rounded" />
            </div>
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
        </header>

        <section>
          <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <Skeleton className="h-6 w-56 rounded" />
              <Skeleton className="h-3 w-36 rounded" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-2.5 w-16 rounded" />
                  <Skeleton className="h-8 w-20 rounded" />
                  <Skeleton className="h-2.5 w-12 rounded" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <Skeleton className="h-2.5 w-28 rounded mb-5" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7">
            <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6">
              <Skeleton className="h-5 w-36 rounded mb-5" />
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-24 rounded" />
                      <Skeleton className="h-3 w-14 rounded" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6">
              <Skeleton className="h-5 w-36 rounded mb-5" />
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/[0.02] flex items-center gap-3">
                    <Skeleton className="w-3 h-3 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-24 rounded" />
                      <Skeleton className="h-2.5 w-16 rounded" />
                    </div>
                    <Skeleton className="h-6 w-10 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <Skeleton className="h-2.5 w-32 rounded mb-5" />
          <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6">
            <Skeleton className="h-5 w-40 rounded mb-5" />
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
                  <Skeleton className="h-8 w-8 rounded-md shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-40 rounded" />
                    <Skeleton className="h-2.5 w-28 rounded" />
                  </div>
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </DashboardLoadingShell>
  );
}
