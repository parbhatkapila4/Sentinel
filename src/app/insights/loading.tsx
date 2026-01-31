import { Skeleton } from "@/components/ui/skeleton";

export default function InsightsLoading() {
  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-[#0b0b0b]"
      aria-live="polite"
      aria-label="Loading insights"
    >
      <div className="w-full max-w-4xl mx-auto flex flex-col p-4 lg:p-6">
        <Skeleton className="h-10 w-48 mb-6 rounded-xl" />
        <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col gap-4">
          <div className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <Skeleton className="h-10 flex-1 rounded-xl" />
          </div>
          <div className="space-y-3 flex-1">
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                className={`h-16 rounded-xl ${i % 2 === 0 ? "w-[85%]" : "w-[70%]"}`}
              />
            ))}
          </div>
          <Skeleton className="h-12 w-full rounded-xl mt-auto" />
        </div>
      </div>
    </div>
  );
}
