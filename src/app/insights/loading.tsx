import { Skeleton } from "@/components/ui/skeleton";

export default function InsightsLoading() {
  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-[#0b0b0b]"
      aria-live="polite"
      aria-label="Loading insights"
    >
      <div className="w-full max-w-4xl mx-auto flex flex-col p-4 lg:p-6">

        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-32 rounded" />
        </div>

        <div className="flex-1 rounded-xl border border-white/[0.06] bg-[#080808] p-5 sm:p-6 flex flex-col">
          <div className="flex-1 space-y-5 overflow-hidden">
            <div className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2 max-w-[80%]">
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-5/6 rounded" />
                <Skeleton className="h-3.5 w-3/4 rounded" />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <div className="space-y-2 max-w-[70%]">
                <Skeleton className="h-10 w-56 rounded-xl ml-auto" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            </div>

            <div className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2 max-w-[80%]">
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-4/5 rounded" />
                <Skeleton className="h-20 w-full rounded-lg mt-2" />
                <Skeleton className="h-3.5 w-2/3 rounded" />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <div className="space-y-2 max-w-[70%]">
                <Skeleton className="h-10 w-40 rounded-xl ml-auto" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.04]">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 flex-1 rounded-xl" />
              <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
