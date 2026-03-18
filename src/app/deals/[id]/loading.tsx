import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLoadingShell } from "@/components/dashboard-loading-shell";

export default function DealDetailLoading() {
  return (
    <DashboardLoadingShell>
      <div
        className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-10 sm:space-y-12 max-w-[1600px] mx-auto min-h-screen"
        aria-live="polite"
        aria-label="Loading deal"
      >
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-12 rounded" />
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>

        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-8 w-56 rounded" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-20 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 space-y-2">
              <Skeleton className="h-2.5 w-16 rounded" />
              <Skeleton className="h-7 w-24 rounded" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6 space-y-5">
              <Skeleton className="h-5 w-28 rounded" />
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-3.5 w-24 rounded" />
                    <Skeleton className="h-3.5 w-32 rounded" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6 space-y-4">
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6 space-y-4">
              <Skeleton className="h-5 w-32 rounded" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-2 w-2 rounded-full shrink-0 mt-2" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-full rounded" />
                    <Skeleton className="h-2.5 w-20 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLoadingShell>
  );
}
