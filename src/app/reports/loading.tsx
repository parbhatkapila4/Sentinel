import { DealCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <div
      className="min-h-full p-4 lg:p-6 space-y-6 bg-[#0b0b0b]"
      aria-live="polite"
      aria-label="Loading reports"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-6">
        <div className="flex justify-between mb-6">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <DealCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-4 lg:p-6">
          <Skeleton className="h-6 w-36 mb-4" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-4 lg:p-6">
          <Skeleton className="h-6 w-36 mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-4 lg:p-6">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
