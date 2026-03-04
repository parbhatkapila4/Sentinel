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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors max-sm:min-h-[44px] ${isActive
              ? "bg-[#0f766e]/10 border border-[#0f766e]/25 text-teal-300"
              : "text-white/50 hover:text-white hover:bg-white/6 border border-white/8"
              }`}
          >
            {scopeLabels[scopeValue]}
          </button>
        );
      })}
    </div>
  );
}
