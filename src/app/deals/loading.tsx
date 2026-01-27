import { DashboardLayout } from "@/components/dashboard-layout";
import { TableRowSkeleton } from "@/components/ui/skeleton";

export default function DealsLoading() {
  return (
    <DashboardLayout>
      <div className="min-h-full p-8 space-y-6 bg-[#0b0b0b] max-sm:p-4 max-sm:space-y-4 max-sm:overflow-x-hidden">
        <div className="flex items-start justify-between max-sm:flex-col max-sm:gap-3">
          <div className="min-w-0">
            <div className="h-8 w-32 bg-white/5 rounded-lg animate-pulse mb-2 max-sm:h-6 max-sm:w-24 max-sm:mb-1.5" />
            <div className="h-4 w-48 bg-white/5 rounded-lg animate-pulse max-sm:h-3.5 max-sm:w-36" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 max-sm:grid-cols-1 max-sm:gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-5 max-sm:p-4 max-sm:rounded-xl">
              <div className="h-4 w-20 bg-white/5 rounded animate-pulse mb-4 max-sm:h-3.5 max-sm:w-16 max-sm:mb-3" />
              <div className="h-8 w-16 bg-white/5 rounded animate-pulse max-sm:h-6 max-sm:w-14" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6 max-sm:p-4 max-sm:rounded-xl max-sm:overflow-x-auto">
          <table className="w-full max-sm:min-w-[480px]">
            <tbody>
              {[...Array(8)].map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
