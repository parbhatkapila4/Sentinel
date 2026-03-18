"use client";

import { formatRelativeTime } from "@/lib/utils";

export function IntegrationCard({
  name,
  description,
  icon,
  iconBg,
  connected,
  lastSyncAt,
  totalSynced,
  channelCount,
  onConnect,
  onManage,
  onSync,
  syncing,
  hideSync,
}: {
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  connected: boolean;
  lastSyncAt?: Date | null;
  totalSynced?: number;
  channelCount?: number;
  onConnect: () => void;
  onManage: () => void;
  onSync?: () => void;
  syncing?: boolean;
  hideSync?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center text-2xl shrink-0`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{name}</p>
          <p className="text-xs text-white/40">{description}</p>
          {connected && lastSyncAt && (
            <p className="text-xs text-white/30 mt-0.5">
              Last sync: {formatRelativeTime(lastSyncAt)}
              {totalSynced !== undefined &&
                totalSynced > 0 &&
                ` · ${totalSynced} synced`}
            </p>
          )}
          {connected &&
            channelCount !== undefined &&
            channelCount > 0 && (
              <p className="text-xs text-white/30 mt-0.5">
                {channelCount} channel{channelCount > 1 ? "s" : ""} connected
              </p>
            )}
        </div>
      </div>

      {connected ? (
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Connected
          </span>
          {!hideSync && onSync && (
            <button
              type="button"
              onClick={onSync}
              disabled={syncing}
              className="px-3 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {syncing ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Syncing
                </span>
              ) : (
                "Sync"
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onManage}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            Manage
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onConnect}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-[#0f766e]/10 text-teal-400 hover:bg-[#0f766e]/20 transition-colors"
        >
          Connect
        </button>
      )}
    </div>
  );
}
