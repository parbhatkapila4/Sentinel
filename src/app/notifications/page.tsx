"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  dealId: string | null;
  teamId: string | null;
  read: boolean;
  emailSent: boolean;
  createdAt: string;
}

interface ApiPayload {
  notifications: NotificationItem[];
  unreadCount: number;
}

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(
    async (skip: number, append: boolean) => {
      const res = await fetch(
        `/api/notifications?limit=${PAGE_SIZE}&skip=${skip}&unreadOnly=${filter === "unread"}`
      );
      if (!res.ok) return [];
      const json = await res.json();
      const data = (json.data ?? json) as ApiPayload;
      const list = data.notifications ?? [];
      if (append) setNotifications((prev) => [...prev, ...list]);
      else setNotifications(list);
      setUnreadCount(data.unreadCount ?? 0);
      setHasMore(list.length === PAGE_SIZE);
      return list;
    },
    [filter]
  );

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setPage(0);
        setLoading(true);
        setHasMore(true);
      }
    });
    (async () => {
      await fetchPage(0, false);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [filter, fetchPage]);

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = page + 1;
    await fetchPage(next * PAGE_SIZE, true);
    setPage(next);
    setLoadingMore(false);
  }

  async function markAllRead() {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error("Mark all read:", e);
    }
  }

  async function markRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error("Mark read:", e);
    }
  }

  async function deleteOne(id: string) {
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((c) => {
        const n = notifications.find((x) => x.id === id);
        return n && !n.read ? Math.max(0, c - 1) : c;
      });
    } catch (e) {
      console.error("Delete notification:", e);
    }
  }

  function formatTime(createdAt: string) {
    const d = new Date(createdAt);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <DashboardLayout>
      <div className="p-6 min-h-full" style={{ background: "#0a0a0f" }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Notifications</h1>
            <p className="text-sm text-white/40">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You're all caught up"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value as "all" | "unread")
              }
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-white/5 border border-white/10 focus:border-red-600/50 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="unread">Unread only</option>
            </select>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {loading ? (
            <div className="px-6 py-12 text-center text-white/50">
              Loading…
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-white/60">No notifications</p>
              <p className="text-sm text-white/40 mt-1">
                {filter === "unread"
                  ? "No unread notifications."
                  : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {notifications.map((n) => {
                const inner = (
                  <>
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    <p className="text-xs text-white/50 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-white/30 mt-1">
                      {formatTime(n.createdAt)}
                    </p>
                  </>
                );
                return (
                  <li
                    key={n.id}
                    className={`flex items-start gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02] ${!n.read ? "bg-white/[0.02]" : ""
                      }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.read ? "bg-blue-500" : "bg-transparent"
                        }`}
                    />
                    {n.dealId ? (
                      <Link
                        href={`/deals/${n.dealId}`}
                        className="flex-1 min-w-0"
                        onClick={() => !n.read && markRead(n.id)}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div
                        className="flex-1 min-w-0 cursor-default"
                        onClick={() => !n.read && markRead(n.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (!n.read) markRead(n.id);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        {inner}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        deleteOne(n.id);
                      }}
                      className="shrink-0 p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      aria-label="Delete"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {!loading && hasMore && notifications.length > 0 && (
            <div className="px-6 py-4 border-t border-white/5">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-50 transition-colors"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
