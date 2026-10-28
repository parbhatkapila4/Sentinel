"use client";

import { useEffect, useState } from "react";


export const NOTIFICATIONS_CHANGED = "sentinel:notifications-changed";

const FRESH_MS = 30_000;

export interface NotificationsChangedDetail {
  unread?: number;
}

let lastKnown: { unread: number; at: number } | null = null;

export function announceUnread(unread: number): void {
  lastKnown = { unread, at: Date.now() };
  window.dispatchEvent(
    new CustomEvent<NotificationsChangedDetail>(NOTIFICATIONS_CHANGED, {
      detail: { unread },
    })
  );
}

export function announceNotificationsStale(): void {
  lastKnown = null;
  window.dispatchEvent(
    new CustomEvent<NotificationsChangedDetail>(NOTIFICATIONS_CHANGED, {
      detail: {},
    })
  );
}

export function resetUnreadCacheForTests(): void {
  lastKnown = null;
}

async function fetchUnread(signal: AbortSignal): Promise<number | null> {
  const res = await fetch("/api/notifications?limit=1", { signal });
  if (!res.ok) return null;
  const json = await res.json();
  const count = (json?.data ?? json)?.unreadCount;
  return typeof count === "number" ? count : null;
}

export function useUnreadNotifications(): number | null {
  const [unread, setUnread] = useState<number | null>(
    () => lastKnown?.unread ?? null
  );

  useEffect(() => {
    const ctrl = new AbortController();

    const refresh = async () => {
      try {
        const count = await fetchUnread(ctrl.signal);
        if (count === null || ctrl.signal.aborted) return;
        lastKnown = { unread: count, at: Date.now() };
        setUnread(count);
      } catch {
      }
    };

    if (!lastKnown || Date.now() - lastKnown.at > FRESH_MS) void refresh();

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<NotificationsChangedDetail>).detail;
      if (typeof detail?.unread === "number") setUnread(detail.unread);
      else void refresh();
    };
    window.addEventListener(NOTIFICATIONS_CHANGED, onChange);
    return () => {
      ctrl.abort();
      window.removeEventListener(NOTIFICATIONS_CHANGED, onChange);
    };
  }, []);

  return unread;
}
