import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLoadingShell } from "@/components/dashboard-loading-shell";

export default function SettingsLoading() {
  return (
    <DashboardLoadingShell>
      <div
        className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-10 sm:space-y-12 max-w-[1600px] mx-auto min-h-screen"
        aria-live="polite"
        aria-label="Loading settings"
      >
        <header>
          <Skeleton className="h-2.5 w-14 rounded mb-3" />
          <Skeleton className="h-12 w-36 rounded-lg mb-4" />
          <Skeleton className="h-4 w-64 rounded" />
        </header>

        <div className="flex gap-2 border-b border-white/[0.06] pb-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>

        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6 space-y-5">
              <Skeleton className="h-5 w-32 rounded" />
              <div className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-28 rounded" />
                      <Skeleton className="h-2.5 w-44 rounded" />
                    </div>
                    <Skeleton className="h-9 w-20 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLoadingShell>
  );
}
