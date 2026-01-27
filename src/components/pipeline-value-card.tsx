"use client";

import { useState } from "react";
import { formatValueInMillions } from "@/lib/utils";

interface PipelineValueCardProps {
  totalValue: number;
}

export function PipelineValueCard({ totalValue }: PipelineValueCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const formatted = formatValueInMillions(totalValue);
  const exactValue = totalValue.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <div
      className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-4 lg:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] relative cursor-help"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#151515] text-[#0ea5e9] border border-[#1f1f1f]">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-[#7d7d7d]">
            Pipeline Value
          </p>
          <p className="text-[11px] text-[#5f5f5f]">Total value</p>
        </div>
      </div>
      <div className="relative">
        <p className="text-3xl font-bold text-white mb-1">
          ${formatted.value}
          {formatted.suffix}
        </p>
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl z-50 whitespace-nowrap">
            <p className="text-sm text-white font-medium">{exactValue}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-[#2a2a2a]"></div>
          </div>
        )}
      </div>
      <p className="text-xs text-[#7d7d7d]">All deals</p>
    </div>
  );
}
