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
      className="w-full sm:w-auto pl-4 pr-8 py-2.5 rounded-xl text-sm font-medium text-white/60 bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M2 4L6 8L10 4' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.75rem center",
        paddingRight: "2.5rem",
      }}
    >
      <option value="7d">Last 7 days</option>
      <option value="30d">Last 30 days</option>
      <option value="90d">Last 90 days</option>
      <option value="all">All time</option>
    </select>
  );
}
