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
    <div className="flex items-center gap-2">
      {filters.map((filterValue) => {
        const isActive = currentFilter === filterValue;
        return (
          <button
            key={filterValue}
            onClick={() => handleFilterChange(filterValue)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${isActive
                ? "bg-[#181818] border border-[#2a2a2a] text-white"
                : "text-[#8a8a8a] hover:text-white hover:bg-[#151515] border border-[#1f1f1f]"
              }`}
          >
            {filterLabels[filterValue]}
          </button>
        );
      })}
    </div>
  );
}
