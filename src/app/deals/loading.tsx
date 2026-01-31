import {
  DealCardSkeleton,
  Skeleton,
  DealListRowSkeleton,
} from "@/components/ui/skeleton";

export default function DealsLoading() {
  return (
    <div
      className="min-h-full p-4 lg:p-6 space-y-6 bg-[#0b0b0b]"
      aria-live="polite"
      aria-label="Loading deals"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-11 w-24 rounded-xl" />
          <Skeleton className="h-11 w-28 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <DealCardSkeleton key={i} />
        ))}
      </div>

      <div className="rounded-2xl border border-[#1f1f1f] bg-[#101010] p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#1a1a1a] pb-5">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-3">
            <Skeleton className="h-8 w-24 rounded-xl" />
            <Skeleton className="h-8 w-48 rounded-xl" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                {["Deal", "Value", "Stage", "Risk", "Assigned to", "Next Action", "Last Activity", ""].map(
                  (label) => (
                    <th
                      key={label}
                      className="text-left text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-4 font-semibold text-white uppercase tracking-wider"
                    >
                      {label}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {[...Array(8)].map((_, i) => (
                <DealListRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
