"use client";

import { useState } from "react";

interface DemoBannerProps {
  onDismiss?: () => void;
}

export function DemoBanner({ onDismiss }: DemoBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-red-600/10 border border-blue-500/20 rounded-xl p-4 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-400"
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
            <p className="text-sm text-white font-medium">
              You&apos;re viewing demo data
            </p>
            <p className="text-xs text-white/60">
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
