"use client";

import { useRouter, useSearchParams } from "next/navigation";

type FilterType = "all" | "active" | "at-risk" | "closed";

const filterLabels: Record<FilterType, string> = {
  all: "All",
  active: "Active",
  "at-risk": "At Risk",
  closed: "Closed",
};

export function DealsFilter({ currentFilter }: { currentFilter: FilterType }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (newFilter: FilterType) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newFilter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", newFilter);
    }
    const queryString = params.toString();
    router.push(`/deals${queryString ? `?${queryString}` : ""}`);
  };

  const filters: FilterType[] = ["all", "active", "at-risk", "closed"];

  return (
    <div className="flex items-center gap-2 max-sm:flex-wrap max-sm:gap-1.5" role="group" aria-label="Filter deals">
      {filters.map((filterValue) => {
        const isActive = currentFilter === filterValue;
        return (
          <button
            key={filterValue}
            onClick={() => handleFilterChange(filterValue)}
            aria-pressed={isActive}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors max-sm:min-h-[44px] ${isActive
              ? "bg-[#0f766e]/10 border border-[#0f766e]/25 text-teal-300"
              : "text-white/50 hover:text-white hover:bg-white/6 border border-white/8"
              }`}
          >
            {filterLabels[filterValue]}
          </button>
        );
      })}
    </div>
  );
}
