"use client";

import { useState } from "react";

interface DemoBannerProps {
  onDismiss?: () => void;
}

export function DemoBanner({ onDismiss }: DemoBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-[#0ea5e9]/10 via-[#0ea5e9]/5 to-transparent border border-[#0ea5e9]/25 rounded-2xl p-5 sm:p-6 shadow-lg shadow-[#0ea5e9]/5 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0ea5e9]/20 flex items-center justify-center border border-[#0ea5e9]/30">
            <svg
              className="w-5 h-5 text-[#0ea5e9]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              You&apos;re viewing demo data
            </p>
            <p className="text-xs text-white/55 mt-0.5">
              Create your first deal to start fresh with your own pipeline
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
          }}
          className="p-2.5 min-w-[44px] min-h-[44px] hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center shrink-0"
          type="button"
          aria-label="Dismiss"
        >
          <svg
            className="w-4 h-4 text-white/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
