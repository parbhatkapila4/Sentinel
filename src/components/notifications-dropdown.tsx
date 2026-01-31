"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRealtime } from "@/hooks/use-realtime";

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

const POLL_MS = 30_000;

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fetchRef = useRef<() => Promise<void>>(() => Promise.resolve());

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications?limit=15");
      if (!res.ok) return;
      const json = await res.json();
      const data = (json.data ?? json) as ApiPayload;
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (e) {
      console.error("Fetch notifications:", e);
    } finally {
      setLoading(false);
    }
  }

  fetchRef.current = fetchNotifications;

  useRealtime({
    onEvent(ev) {
      if (ev.type === "notification.new") fetchRef.current();
    },
  });

  useEffect(() => {
    fetchNotifications();
    const t = setInterval(fetchNotifications, POLL_MS);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open]);

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

  async function markAllRead() {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error("Mark all read:", e);
    }
  }

  function formatTime(createdAt: string) {
    const d = new Date(createdAt);
    const now = new Date();
    const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (sec < 60) return "Just now";
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    return `${Math.floor(sec / 86400)}d ago`;
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2.5 min-w-[44px] min-h-[44px] rounded-full bg-[#131313] border border-[#1f1f1f] flex items-center justify-center text-[#8a8a8a] hover:text-white hover:border-white/20 transition-all relative"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
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
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-[#1a1a1a] rounded-xl border border-white/10 shadow-2xl z-50 max-h-96 overflow-hidden flex flex-col"
          role="menu"
          aria-label="Notifications"
        >
          <div className="px-4 py-3 border-b border-[#1f1f1f] flex items-center justify-between shrink-0">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-[#8a8a8a] hover:text-white transition-colors"
                aria-label="Mark all notifications as read"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1 py-2">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-[#8a8a8a]">
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-[#8a8a8a]">No notifications</p>
                <p className="text-xs text-[#6b6b6b] mt-1">You&apos;re all caught up!</p>
              </div>
            ) : (
              notifications.map((n) => {
                const href = n.dealId ? `/deals/${n.dealId}` : "/notifications";
                return (
                  <Link
                    key={n.id}
                    href={href}
                    onClick={() => {
                      if (!n.read) markRead(n.id);
                      setOpen(false);
                    }}
                    className={`block p-3 sm:p-4 hover:bg-[#1a1a1a] transition-colors min-h-[44px] flex flex-col justify-center ${!n.read ? "bg-[#1a1a1a]/50" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.read ? "bg-blue-500" : "bg-transparent"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{n.title}</p>
                        <p className="text-xs text-[#8a8a8a] mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-[#6b6b6b] mt-1">
                          {formatTime(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-[#1f1f1f] shrink-0">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
