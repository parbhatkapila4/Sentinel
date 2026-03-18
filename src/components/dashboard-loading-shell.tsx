import { Skeleton } from "@/components/ui/skeleton";

function SidebarSkeleton() {
  return (
    <aside
      className="hidden lg:flex w-64 bg-[#000000] border-r border-white/[0.06] flex-col h-screen overflow-hidden shrink-0"
      aria-hidden="true"
    >
      <div className="flex-1 overflow-hidden">
        <div className="pt-16 pb-4 px-3">
          <Skeleton className="h-2 w-10 rounded mb-4 ml-3" />
          <nav className="space-y-1">
            {[
              { w: "w-24", active: true },
              { w: "w-20" },
              { w: "w-22" },
              { w: "w-16" },
              { w: "w-10" },
              { w: "w-20" },
              { w: "w-20" },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${item.active ? "bg-white/10" : ""
                  }`}
              >
                <Skeleton className="w-5 h-5 rounded shrink-0" />
                <Skeleton className={`h-3.5 ${item.w} rounded`} />
              </div>
            ))}
          </nav>

          <div className="mt-6 mb-6 px-3">
            <div className="rounded-xl bg-white/[0.02] p-4 border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-2.5 w-20 rounded" />
              </div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-2.5 w-20 rounded" />
                    <Skeleton className="h-2.5 w-10 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6 px-3">
            <div className="rounded-xl bg-white/[0.02] p-4 border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-2.5 w-16 rounded" />
              </div>
              <div className="space-y-2.5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Skeleton className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-2.5 w-full rounded" />
                      <Skeleton className="h-2.5 w-3/4 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6 px-3">
            <div className="rounded-xl bg-white/[0.02] p-4 border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-2.5 w-24 rounded" />
              </div>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg">
                    <Skeleton className="w-3.5 h-3.5 rounded shrink-0" />
                    <Skeleton className="h-2.5 w-24 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 p-4 border-t border-white/[0.06] space-y-4">
        <div className="rounded-2xl bg-white/[0.02] p-5 border border-white/[0.06]">
          <Skeleton className="h-4 w-24 rounded mb-1" />
          <Skeleton className="h-2.5 w-full rounded mb-4" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        <div className="text-center space-y-1">
          <Skeleton className="h-2 w-20 rounded mx-auto" />
          <Skeleton className="h-2 w-36 rounded mx-auto" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </aside>
  );
}

function HeaderSkeleton() {
  return (
    <header
      className="flex-shrink-0 sticky top-0 z-30 flex items-center justify-between gap-3 px-4 lg:px-6 py-3 bg-[#000000] border-b border-white/[0.06] min-w-0"
      aria-hidden="true"
    >
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#050505] border border-white/[0.06]">
          <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
          <Skeleton className="h-3.5 w-12 rounded hidden sm:block" />
        </div>
      </div>

      <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
        <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#050505] border border-white/[0.06] flex-1 max-w-72 min-h-[44px]">
          <Skeleton className="w-4 h-4 rounded shrink-0" />
          <Skeleton className="h-3.5 w-40 rounded" />
        </div>

        <Skeleton className="w-11 h-11 rounded-full shrink-0" />

        <Skeleton className="w-11 h-11 rounded-full shrink-0" />

        <Skeleton className="w-11 h-11 rounded-full shrink-0" />
      </div>
    </header>
  );
}

export function DashboardLoadingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0b0b0b]">
      <SidebarSkeleton />
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <HeaderSkeleton />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
