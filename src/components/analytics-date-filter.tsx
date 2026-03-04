"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function AnalyticsDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentRange = searchParams.get("range") || "30d";

  const handleChange = (value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "30d") {
        params.delete("range");
      } else {
        params.set("range", value);
      }
      router.push(`/analytics?${params.toString()}`);
    });
  };

  return (
    <select
      value={currentRange}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isPending}
      className="w-full sm:w-auto pl-4 pr-10 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white bg-[#050505] border border-white/[0.06] hover:border-white/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-no-repeat bg-[length:12px_12px] bg-[right_0.75rem_center] transition-colors"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M2 4L6 8L10 4' stroke='rgba(255,255,255,0.5)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
      }}
    >
      <option value="7d">Last 7 days</option>
      <option value="30d">Last 30 days</option>
      <option value="90d">Last 90 days</option>
      <option value="all">All time</option>
    </select>
  );
}
