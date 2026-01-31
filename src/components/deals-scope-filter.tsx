"use client";

import { useRouter, useSearchParams } from "next/navigation";

type ScopeType = "my" | "all";

const scopeLabels: Record<ScopeType, string> = {
  my: "My Deals",
  all: "All Team Deals",
};

export function DealsScopeFilter({ currentScope }: { currentScope: ScopeType }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleScopeChange = (newScope: ScopeType) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newScope === "my") {
      params.delete("scope");
    } else {
      params.set("scope", newScope);
    }
    const queryString = params.toString();
    router.push(`/deals${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <div className="flex items-center gap-2 max-sm:flex-wrap max-sm:gap-1.5">
      {(["my", "all"] as const).map((scopeValue) => {
        const isActive = currentScope === scopeValue;
        return (
          <button
            key={scopeValue}
            onClick={() => handleScopeChange(scopeValue)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all max-sm:min-h-[44px] ${isActive
              ? "bg-[#181818] border border-[#2a2a2a] text-white"
              : "text-[#8a8a8a] hover:text-white hover:bg-[#151515] border border-[#1f1f1f]"
              }`}
          >
            {scopeLabels[scopeValue]}
          </button>
        );
      })}
    </div>
  );
}
