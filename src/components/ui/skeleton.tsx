export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-white/5 rounded-lg ${className}`}
    />
  );
}

export function DealCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-5 max-sm:p-4">
      <div className="flex items-center gap-3 mb-4 max-sm:gap-2 max-sm:mb-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0 max-sm:w-9 max-sm:h-9" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-4 w-32 mb-2 max-sm:h-3.5 max-sm:w-24 max-sm:mb-1.5" />
          <Skeleton className="h-3 w-20 max-sm:h-2.5 max-sm:w-16" />
        </div>
      </div>
      <Skeleton className="h-8 w-24 mb-2 max-sm:h-6 max-sm:w-20 max-sm:mb-1.5" />
      <Skeleton className="h-3 w-16 max-sm:h-2.5 max-sm:w-14" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-[#1a1a1a]">
      <td className="px-6 py-4 max-sm:px-3 max-sm:py-3"><Skeleton className="h-4 w-32 max-sm:h-3.5 max-sm:w-24" /></td>
      <td className="px-6 py-4 max-sm:px-3 max-sm:py-3"><Skeleton className="h-4 w-20 max-sm:h-3.5 max-sm:w-14" /></td>
      <td className="px-6 py-4 max-sm:px-3 max-sm:py-3"><Skeleton className="h-4 w-24 max-sm:h-3.5 max-sm:w-20" /></td>
      <td className="px-6 py-4 max-sm:px-3 max-sm:py-3"><Skeleton className="h-6 w-16 rounded-full max-sm:h-5 max-sm:w-12" /></td>
      <td className="px-6 py-4 max-sm:px-3 max-sm:py-3"><Skeleton className="h-4 w-28 max-sm:h-3.5 max-sm:w-20" /></td>
      <td className="px-6 py-4 max-sm:px-3 max-sm:py-3"><Skeleton className="h-4 w-20 max-sm:h-3.5 max-sm:w-14" /></td>
    </tr>
  );
}

export function ChartSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 p-4 lg:p-6 min-h-[280px] lg:min-h-[320px] flex flex-col ${className}`}
    >
      <Skeleton className="h-5 w-40 mb-4" />
      <div className="flex-1 flex items-end gap-2 pt-4">
        {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t min-h-[4px] min-w-0"
            style={{ height: `${h}%` }}
          >
            <Skeleton className="w-full h-full rounded-t" />
          </div>
        ))}
      </div>
    </div>
  );
}


export function DealListRowSkeleton() {
  return (
    <tr className="border-b border-[#1a1a1a]">
      <td className="py-3 sm:py-4 px-3 sm:px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <Skeleton className="h-4 w-32" />
        </div>
      </td>
      <td className="py-3 sm:py-4 px-3 sm:px-4"><Skeleton className="h-4 w-16" /></td>
      <td className="py-3 sm:py-4 px-3 sm:px-4"><Skeleton className="h-4 w-24" /></td>
      <td className="py-3 sm:py-4 px-3 sm:px-4"><Skeleton className="h-6 w-14 rounded-full" /></td>
      <td className="py-3 sm:py-4 px-3 sm:px-4"><Skeleton className="h-4 w-20" /></td>
      <td className="py-3 sm:py-4 px-3 sm:px-4"><Skeleton className="h-4 w-24" /></td>
      <td className="py-3 sm:py-4 px-3 sm:px-4"><Skeleton className="h-4 w-20" /></td>
      <td className="py-3 sm:py-4 px-3 sm:px-4"><Skeleton className="h-4 w-12" /></td>
    </tr>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-sm:space-y-4">
      <div className="grid grid-cols-4 gap-4 max-sm:grid-cols-1 max-sm:gap-3">
        {[...Array(4)].map((_, i) => (
          <DealCardSkeleton key={i} />
        ))}
      </div>
      <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6 max-sm:p-4 max-sm:rounded-xl max-sm:overflow-x-auto">
        <Skeleton className="h-6 w-40 mb-6 max-sm:h-5 max-sm:w-32 max-sm:mb-4" />
        <table className="w-full max-sm:min-w-[480px]">
          <tbody>
            {[...Array(5)].map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
