"use client";

import Link from "next/link";

interface UpgradePromptProps {
  current: number;
  limit: number;
  metricType: string;
  message?: string;
}

export function UpgradePrompt({
  current,
  limit,
  metricType,
  message,
}: UpgradePromptProps) {
  const percentage = limit > 0 ? (current / limit) * 100 : 0;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const defaultMessage = message || `You've used ${current} of ${limit} ${metricType}.`;

  return (
    <div
      className={`rounded-xl p-4 border ${isAtLimit
        ? "bg-red-500/10 border-red-500/20"
        : isNearLimit
          ? "bg-amber-500/10 border-amber-500/20"
          : "bg-white/5 border-white/10"
        }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p
            className={`text-sm font-medium mb-1 ${isAtLimit ? "text-red-400" : isNearLimit ? "text-amber-400" : "text-white/70"
              }`}
          >
            {defaultMessage}
          </p>
          <div className="w-full bg-white/10 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all ${isAtLimit
                ? "bg-red-500"
                : isNearLimit
                  ? "bg-amber-500"
                  : "bg-blue-500"
                }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          {isAtLimit && (
            <p className="text-xs text-red-400/80">
              You&apos;ve reached your plan limit. Upgrade to continue using this feature.
            </p>
          )}
        </div>
        {(isNearLimit || isAtLimit) && (
          <Link
            href="/pricing"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors shrink-0"
          >
            Upgrade Plan
          </Link>
        )}
      </div>
    </div>
  );
}
