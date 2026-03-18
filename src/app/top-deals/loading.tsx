import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLoadingShell } from "@/components/dashboard-loading-shell";

export default function TopDealsLoading() {
  return (
    <DashboardLoadingShell>
      <div
        className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-10 sm:space-y-12 max-w-[1600px] mx-auto min-h-screen"
        aria-live="polite"
        aria-label="Loading top deals"
      >
        <header>
          <Skeleton className="h-2.5 w-14 rounded mb-3" />
          <Skeleton className="h-12 w-48 rounded-lg sm:w-64 mb-4" />
          <Skeleton className="h-4 w-72 rounded" />
        </header>

        <section>
          <Skeleton className="h-2.5 w-28 rounded mb-5" />
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6 flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5 min-w-0">
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLoadingShell>
  );
}
