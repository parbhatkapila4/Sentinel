import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLoadingShell } from "@/components/dashboard-loading-shell";

export default function NewDealLoading() {
  return (
    <DashboardLoadingShell>
      <div
        className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-10 sm:space-y-12 max-w-3xl mx-auto min-h-screen"
        aria-live="polite"
        aria-label="Loading new deal form"
      >
        <header>
          <Skeleton className="h-2.5 w-14 rounded mb-3" />
          <Skeleton className="h-12 w-44 rounded-lg mb-4" />
          <Skeleton className="h-4 w-64 rounded" />
        </header>

        <section className="rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6 space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          ))}
          <Skeleton className="h-11 w-32 rounded-lg mt-4" />
        </section>
      </div>
    </DashboardLoadingShell>
  );
}
