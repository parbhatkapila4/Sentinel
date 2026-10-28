import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NOTIFICATIONS_CHANGED, announceNotificationsStale } from "../../unread-notifications";
import type { NotificationRow } from "../model";
import { nextSkip, useNotifications, type UseNotificationsOptions } from "../useNotifications";

const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

const NOW = new Date(2026, 9, 27, 14, 5);

function row(id: string, over: Partial<NotificationRow> = {}): NotificationRow {
  return {
    id,
    type: "deal_at_risk",
    title: `Deal at Risk: ${id}`,
    message: "Negotiation stalled without response",
    dealId: `d-${id}`,
    teamId: null,
    read: false,
    emailSent: false,
    createdAt: new Date(2026, 9, 27, 12, 0).toISOString(),
    ...over,
  };
}

function ok(data: unknown = { success: true }) {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function failed(status = 500) {
  return new Response(JSON.stringify({ success: false, error: { message: "nope" } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function page(items: NotificationRow[], unreadCount: number) {
  return ok({ notifications: items, unreadCount });
}

const BASE: UseNotificationsOptions = {
  initialItems: [
    row("a", { createdAt: new Date(2026, 9, 27, 13, 0).toISOString() }),
    row("b", { createdAt: new Date(2026, 9, 27, 12, 0).toISOString() }),
    row("c", { read: true, createdAt: new Date(2026, 9, 25, 12, 0).toISOString() }),
  ],
  initialUnread: 2,
  initialHasMore: true,
  totalCount: 10,
  todayCount: 2,
  pageSize: 3,
  nowISO: NOW.toISOString(),
};

function urlOf(call: unknown[]): string {
  return String(call[0]);
}

describe("useNotifications", () => {
  const fetchMock = vi.fn();
  const announced: Array<number | undefined> = [];
  const listen = (e: Event) => announced.push((e as CustomEvent).detail?.unread);

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    fetchMock.mockReset();
    toast.error.mockReset();
    toast.success.mockReset();
    announced.length = 0;
    vi.stubGlobal("fetch", fetchMock);
    window.addEventListener(NOTIFICATIONS_CHANGED, listen);
  });

  afterEach(() => {
    window.removeEventListener(NOTIFICATIONS_CHANGED, listen);
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("tells the top bar bell the unread count", async () => {
    fetchMock.mockResolvedValueOnce(ok());
    const { result } = renderHook(() => useNotifications(BASE));
    expect(announced).toContain(2);

    await act(() => result.current.markRead("a"));
    expect(announced[announced.length - 1]).toBe(1);
  });

  it("rolls back a mark-read the server refused, row and count both", async () => {
    fetchMock.mockResolvedValueOnce(failed(500));
    const { result } = renderHook(() => useNotifications(BASE));

    await act(() => result.current.markRead("a"));

    expect(fetchMock).toHaveBeenCalledWith("/api/notifications/a/read", { method: "POST" });
    expect(result.current.items.find((n) => n.id === "a")?.read).toBe(false);
    expect(result.current.unread).toBe(2);
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("treats a sign-in redirect as a failure, not a save", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, redirected: true, status: 200 } as Response);
    const { result } = renderHook(() => useNotifications(BASE));

    await act(() => result.current.markRead("b"));

    expect(result.current.items.find((n) => n.id === "b")?.read).toBe(false);
    expect(result.current.unread).toBe(2);
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it("does not report success when mark-all-read fails, and restores every row it changed", async () => {
    fetchMock.mockResolvedValueOnce(failed(503));
    const { result } = renderHook(() => useNotifications(BASE));

    await act(() => result.current.markAllRead());

    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(result.current.unread).toBe(2);
    expect(result.current.items.map((n) => [n.id, n.read])).toEqual([
      ["a", false],
      ["b", false],
      ["c", true],
    ]);
  });

  it("reports success only after mark-all-read is saved", async () => {
    fetchMock.mockResolvedValueOnce(ok());
    const { result } = renderHook(() => useNotifications(BASE));

    await act(() => result.current.markAllRead());

    expect(toast.success).toHaveBeenCalledWith("Everything marked read");
    expect(result.current.unread).toBe(0);
    expect(result.current.items.every((n) => n.read)).toBe(true);
  });

  it("puts a row back where it was when the delete fails, with every count", async () => {
    fetchMock.mockResolvedValueOnce(failed(500));
    const { result } = renderHook(() => useNotifications(BASE));

    await act(() => result.current.remove("b"));

    expect(fetchMock).toHaveBeenCalledWith("/api/notifications/b", { method: "DELETE" });
    expect(result.current.items.map((n) => n.id)).toEqual(["a", "b", "c"]);
    expect(result.current.unread).toBe(2);
    expect(result.current.total).toBe(10);
    expect(result.current.today).toBe(2);
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it("updates the counts when a delete succeeds", async () => {
    fetchMock.mockResolvedValueOnce(ok());
    const { result } = renderHook(() => useNotifications(BASE));

    await act(() => result.current.remove("a"));

    expect(result.current.items.map((n) => n.id)).toEqual(["b", "c"]);
    expect(result.current.unread).toBe(1);
    expect(result.current.total).toBe(9);
    expect(result.current.today).toBe(1);
    expect(result.current.read).toBe(8);
  });

  it("stays on the current tab when the other tab fails to load", async () => {
    fetchMock.mockResolvedValueOnce(failed(500));
    const { result } = renderHook(() => useNotifications(BASE));

    await act(() => result.current.switchFilter("unread"));

    expect(result.current.filter).toBe("all");
    expect(result.current.items.map((n) => n.id)).toEqual(["a", "b", "c"]);
    expect(result.current.switching).toBe(false);
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it("does not skip an unread row after one is marked read in the Unread tab", async () => {
    fetchMock.mockResolvedValueOnce(page([row("a"), row("b"), row("d")], 5));
    const { result } = renderHook(() => useNotifications(BASE));
    await act(() => result.current.switchFilter("unread"));
    expect(urlOf(fetchMock.mock.calls[0])).toBe(
      "/api/notifications?limit=3&skip=0&unreadOnly=true"
    );

    fetchMock.mockResolvedValueOnce(ok());
    await act(() => result.current.markRead("a"));

    fetchMock.mockResolvedValueOnce(page([row("e"), row("f")], 4));
    await act(() => result.current.loadMore());
    expect(urlOf(fetchMock.mock.calls[2])).toBe(
      "/api/notifications?limit=3&skip=2&unreadOnly=true"
    );
    expect(result.current.shown.map((n) => n.id)).toEqual(["b", "d", "e", "f"]);
    expect(result.current.hasMore).toBe(false);
  });

  it("counts every loaded row in the All tab and drops repeats", async () => {
    fetchMock.mockResolvedValueOnce(page([row("c", { read: true }), row("x")], 2));
    const { result } = renderHook(() => useNotifications(BASE));

    await act(() => result.current.loadMore());

    expect(urlOf(fetchMock.mock.calls[0])).toBe(
      "/api/notifications?limit=3&skip=3&unreadOnly=false"
    );
    expect(result.current.items.map((n) => n.id)).toEqual(["a", "b", "c", "x"]);
  });

  it("refetches the list when a new notification arrives", async () => {
    const fresh = row("new", { createdAt: new Date(2026, 9, 27, 14, 0).toISOString() });
    fetchMock.mockResolvedValueOnce(page([fresh, ...BASE.initialItems], 3));
    const { result } = renderHook(() => useNotifications(BASE));

    act(() => announceNotificationsStale());

    await waitFor(() => expect(result.current.items[0]?.id).toBe("new"));
    expect(urlOf(fetchMock.mock.calls[0])).toBe(
      "/api/notifications?limit=3&skip=0&unreadOnly=false"
    );
    expect(result.current.unread).toBe(3);
    expect(result.current.total).toBe(11);
    expect(result.current.today).toBe(3);
  });

  it("ignores its own unread announcements", async () => {
    fetchMock.mockResolvedValueOnce(ok());
    const { result } = renderHook(() => useNotifications(BASE));

    await act(() => result.current.markRead("a"));

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("nextSkip", () => {
  it("counts only rows still in the server's list for the tab", () => {
    const items = [row("a"), row("b", { read: true }), row("c")];
    expect(nextSkip(items, "all")).toBe(3);
    expect(nextSkip(items, "unread")).toBe(2);
  });
});
