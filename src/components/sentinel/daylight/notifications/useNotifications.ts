"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  NOTIFICATIONS_CHANGED,
  announceUnread,
  type NotificationsChangedDetail,
} from "../unread-notifications";
import {
  isCreatedToday,
  visibleRows,
  type NotificationFilter,
  type NotificationRow,
} from "./model";

export interface UseNotificationsOptions {
  initialItems: NotificationRow[];
  initialUnread: number;
  initialHasMore: boolean;
  totalCount: number;
  todayCount: number;
  pageSize: number;
  nowISO: string;
}

interface Page {
  items: NotificationRow[];
  unread: number;
}

const MAX_LIMIT = 100;

class RequestFailed extends Error {}

function saved(res: Response): boolean {
  return res.ok && !res.redirected;
}

async function fetchPage(
  filter: NotificationFilter,
  skip: number,
  limit: number
): Promise<Page> {
  const res = await fetch(
    `/api/notifications?limit=${limit}&skip=${skip}&unreadOnly=${filter === "unread"}`
  );
  if (!saved(res)) throw new RequestFailed(`notifications ${res.status}`);
  const json = await res.json();
  const data = (json?.data ?? json) as {
    notifications?: Array<Omit<NotificationRow, "createdAt"> & { createdAt: string | Date }>;
    unreadCount?: number;
  };
  const items = (data.notifications ?? []).map((n) => ({
    ...n,
    createdAt:
      typeof n.createdAt === "string" ? n.createdAt : new Date(n.createdAt).toISOString(),
  }));
  return { items, unread: typeof data.unreadCount === "number" ? data.unreadCount : 0 };
}

async function post(url: string, method: "POST" | "DELETE"): Promise<void> {
  const res = await fetch(url, { method });
  if (!saved(res)) throw new RequestFailed(`${url} ${res.status}`);
}

function byNewest(a: NotificationRow, b: NotificationRow): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function nextSkip(items: NotificationRow[], filter: NotificationFilter): number {
  return filter === "unread" ? items.filter((n) => !n.read).length : items.length;
}

export function useNotifications({
  initialItems,
  initialUnread,
  initialHasMore,
  totalCount,
  todayCount,
  pageSize,
  nowISO,
}: UseNotificationsOptions) {
  const [items, setItems] = useState<NotificationRow[]>(initialItems);
  const [unread, setUnread] = useState(initialUnread);
  const [total, setTotal] = useState(totalCount);
  const [today, setToday] = useState(todayCount);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [search, setSearch] = useState("");
  const [switching, setSwitching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const now = useMemo(() => new Date(nowISO), [nowISO]);

  const itemsRef = useRef(items);
  const filterRef = useRef(filter);
  const unreadRef = useRef(unread);
  useLayoutEffect(() => {
    itemsRef.current = items;
    filterRef.current = filter;
    unreadRef.current = unread;
  });

  const requestRef = useRef(0);

  useEffect(() => {
    announceUnread(unread);
  }, [unread]);

  const shown = useMemo(() => visibleRows(items, filter, search), [items, filter, search]);

  const switchFilter = useCallback(
    async (next: NotificationFilter) => {
      const previous = filterRef.current;
      if (next === previous) return;
      const request = ++requestRef.current;
      setFilter(next);
      setSwitching(true);
      try {
        const page = await fetchPage(next, 0, pageSize);
        if (request !== requestRef.current) return;
        setItems(page.items);
        setUnread(page.unread);
        setHasMore(page.items.length === pageSize);
      } catch {
        if (request !== requestRef.current) return;
        setFilter(previous);
        toast.error("Couldn't load notifications. Try again in a moment.");
      } finally {
        if (request === requestRef.current) setSwitching(false);
      }
    },
    [pageSize]
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    const request = ++requestRef.current;
    const listFilter = filterRef.current;
    setLoadingMore(true);
    try {
      const page = await fetchPage(listFilter, nextSkip(itemsRef.current, listFilter), pageSize);
      if (request !== requestRef.current) return;
      setItems((current) => {
        const seen = new Set(current.map((n) => n.id));
        return [...current, ...page.items.filter((n) => !seen.has(n.id))];
      });
      setUnread(page.unread);
      setHasMore(page.items.length === pageSize);
    } catch {
      if (request !== requestRef.current) return;
      toast.error("Couldn't load more notifications.");
    } finally {
      if (request === requestRef.current) setLoadingMore(false);
    }
  }, [hasMore, loadingMore, pageSize]);

  const refresh = useCallback(async () => {
    const request = ++requestRef.current;
    const listFilter = filterRef.current;
    const limit = Math.min(MAX_LIMIT, Math.max(pageSize, nextSkip(itemsRef.current, listFilter)));
    try {
      const page = await fetchPage(listFilter, 0, limit);
      if (request !== requestRef.current) return;
      const known = new Set(itemsRef.current.map((n) => n.id));
      const arrived = page.items.filter((n) => !known.has(n.id));
      setItems(page.items);
      setUnread(page.unread);
      setHasMore(page.items.length === limit);
      if (arrived.length > 0) {
        setTotal((t) => t + arrived.length);
        setToday((t) => t + arrived.filter((n) => isCreatedToday(n.createdAt, new Date())).length);
      }
    } catch {
    } finally {
      if (request === requestRef.current) {
        setSwitching(false);
        setLoadingMore(false);
      }
    }
  }, [pageSize]);

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<NotificationsChangedDetail>).detail;
      if (typeof detail?.unread === "number") return;
      void refresh();
    };
    window.addEventListener(NOTIFICATIONS_CHANGED, onChange);
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED, onChange);
  }, [refresh]);

  const markRead = useCallback(async (id: string) => {
    const target = itemsRef.current.find((n) => n.id === id);
    if (!target || target.read) return;
    setItems((current) => current.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
    try {
      await post(`/api/notifications/${id}/read`, "POST");
    } catch {
      setItems((current) => current.map((n) => (n.id === id ? { ...n, read: false } : n)));
      setUnread((u) => u + 1);
      toast.error("Couldn't mark that read. Try again.");
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const previousUnread = unreadRef.current;
    if (previousUnread === 0) return;
    const flipped = new Set(itemsRef.current.filter((n) => !n.read).map((n) => n.id));
    const listFilter = filterRef.current;
    const previousHasMore = hasMore;
    setItems((current) => current.map((n) => (n.read ? n : { ...n, read: true })));
    setUnread(0);
    if (listFilter === "unread") setHasMore(false);
    try {
      await post("/api/notifications/read-all", "POST");
      toast.success("Everything marked read");
    } catch {
      setItems((current) =>
        current.map((n) => (flipped.has(n.id) ? { ...n, read: false } : n))
      );
      setUnread(previousUnread);
      if (listFilter === "unread") setHasMore(previousHasMore);
      toast.error("Couldn't mark everything read. Try again.");
    }
  }, [hasMore]);

  const remove = useCallback(async (id: string) => {
    const target = itemsRef.current.find((n) => n.id === id);
    if (!target) return;
    const wasToday = isCreatedToday(target.createdAt, new Date());
    setItems((current) => current.filter((n) => n.id !== id));
    if (!target.read) setUnread((u) => Math.max(0, u - 1));
    setTotal((t) => Math.max(0, t - 1));
    if (wasToday) setToday((t) => Math.max(0, t - 1));
    try {
      await post(`/api/notifications/${id}`, "DELETE");
    } catch {
      setItems((current) =>
        current.some((n) => n.id === id) ? current : [...current, target].sort(byNewest)
      );
      if (!target.read) setUnread((u) => u + 1);
      setTotal((t) => t + 1);
      if (wasToday) setToday((t) => t + 1);
      toast.error("Couldn't delete that notification. Try again.");
    }
  }, []);

  return {
    now,
    items,
    shown,
    unread,
    read: Math.max(0, total - unread),
    total,
    today,
    hasMore,
    filter,
    search,
    switching,
    loadingMore,
    setSearch,
    switchFilter,
    loadMore,
    refresh,
    markRead,
    markAllRead,
    remove,
  };
}
