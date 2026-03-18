import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLoadingShell } from "@/components/dashboard-loading-shell";

export default function NotificationsLoading() {
  return (
    <DashboardLoadingShell>
      <div
        className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-10 sm:space-y-12 max-w-[1600px] mx-auto min-h-screen"
        aria-live="polite"
        aria-label="Loading notifications"
      >
        <header>
          <Skeleton className="h-2.5 w-20 rounded mb-3" />
          <Skeleton className="h-12 w-52 rounded-lg mb-4" />
          <Skeleton className="h-4 w-64 rounded" />
        </header>

        <section>
          <div className="flex items-center justify-between mb-5">
            <Skeleton className="h-2.5 w-16 rounded" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-[#080808] p-4 sm:p-5 flex items-start gap-3">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <Skeleton className="h-3.5 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
                <Skeleton className="h-2.5 w-12 rounded shrink-0" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLoadingShell>
  );
}
