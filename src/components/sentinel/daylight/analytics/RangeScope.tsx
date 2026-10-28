"use client";

import { useOptimistic, useTransition, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ANALYTICS_RANGES,
  RANGE_LABELS,
  rangeSentence,
  type AnalyticsRange,
} from "./model";

interface RangeScopeProps {
  range: AnalyticsRange;
  counts: Record<AnalyticsRange, number>;
  children: ReactNode;
}

export function RangeScope({ range, counts, children }: RangeScopeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [shown, setShown] = useOptimistic(range);

  const change = (next: AnalyticsRange) => {
    if (next === shown) return;
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("range");
    else params.set("range", next);
    const qs = params.toString();
    startTransition(() => {
      setShown(next);
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
    });
  };

  return (
    <>
      <div className="dl-viewbar">
        <div
          role="group"
          aria-label="Date range"
          className="dl-viewbar-tabs dl-tabs-tight"
        >
          {ANALYTICS_RANGES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={shown === value}
              onClick={() => change(value)}
              className="dl-tab"
            >
              <span className="dl-tab-label" data-label={RANGE_LABELS[value]}>
                <span>{RANGE_LABELS[value]}</span>
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 20,
                  padding: "0 7px",
                  borderRadius: 6,
                  background: "var(--dl-chip)",
                  fontSize: 12,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                  color: "var(--dl-text-2)",
                }}
              >
                {counts[value].toLocaleString("en-US")}
              </span>
            </button>
          ))}
        </div>
        <p
          className="dl-viewbar-controls dl-wide-only"
          style={{ fontSize: 13, color: "var(--dl-muted)" }}
        >
          {rangeSentence(shown)}
        </p>
      </div>
      <div
        aria-busy={isPending}
        className="dl-fill"
        style={{
          opacity: isPending ? 0.55 : 1,
          transition: "opacity 160ms ease",
        }}
      >
        {children}
      </div>
    </>
  );
}
