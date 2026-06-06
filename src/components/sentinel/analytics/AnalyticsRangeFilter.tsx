"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type AnalyticsRange = "7d" | "30d" | "90d" | "all";

const RANGES: Array<{ value: AnalyticsRange; label: string }> = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time" },
];

interface AnalyticsRangeFilterProps {
  currentRange: AnalyticsRange;
}

export function AnalyticsRangeFilter({ currentRange }: AnalyticsRangeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const change = (next: AnalyticsRange) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "30d") params.delete("range");
    else params.set("range", next);
    const qs = params.toString();
    startTransition(() => {
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
    });
  };

  return (
    <div
      className="inline-flex flex-wrap"
      role="group"
      aria-label="Analytics date range"
      style={{ gap: 0, opacity: isPending ? 0.7 : 1 }}
    >
      <span
        style={{
          alignSelf: "center",
          marginRight: 12,
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "var(--cream-3)",
          textTransform: "uppercase",
        }}
      >
        Range
      </span>
      {RANGES.map((r, i) => {
        const active = currentRange === r.value;
        return (
          <button
            key={r.value}
            type="button"
            onClick={() => change(r.value)}
            aria-pressed={active}
            disabled={isPending}
            style={{
              padding: "6px 14px",
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: active ? "var(--signal)" : "var(--cream-3)",
              background: active ? "rgba(200,71,46,0.06)" : "transparent",
              border: "1px solid var(--rule-strong)",
              borderLeft: i === 0 ? "1px solid var(--rule-strong)" : "none",
              cursor: isPending ? "wait" : "pointer",
            }}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
