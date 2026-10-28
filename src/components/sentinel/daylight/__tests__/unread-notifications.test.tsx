import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  announceNotificationsStale,
  announceUnread,
  resetUnreadCacheForTests,
  useUnreadNotifications,
} from "../unread-notifications";

function respondWith(unreadCount: number) {
  return new Response(
    JSON.stringify({ success: true, data: { notifications: [], unreadCount } }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

describe("useUnreadNotifications", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    resetUnreadCacheForTests();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the unread count, not the at-risk count", async () => {
    fetchMock.mockResolvedValueOnce(respondWith(3));
    const { result } = renderHook(() => useUnreadNotifications());
    expect(result.current).toBeNull();
    await waitFor(() => expect(result.current).toBe(3));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/notifications?limit=1",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it("keeps the count between pages instead of refetching", async () => {
    fetchMock.mockResolvedValueOnce(respondWith(2));
    const first = renderHook(() => useUnreadNotifications());
    await waitFor(() => expect(first.result.current).toBe(2));
    first.unmount();

    const second = renderHook(() => useUnreadNotifications());
    expect(second.result.current).toBe(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("takes the count the notifications page announces", async () => {
    fetchMock.mockResolvedValueOnce(respondWith(4));
    const { result } = renderHook(() => useUnreadNotifications());
    await waitFor(() => expect(result.current).toBe(4));

    act(() => announceUnread(1));
    expect(result.current).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refetches when a new notification arrives", async () => {
    fetchMock.mockResolvedValueOnce(respondWith(0)).mockResolvedValueOnce(respondWith(1));
    const { result } = renderHook(() => useUnreadNotifications());
    await waitFor(() => expect(result.current).toBe(0));

    act(() => announceNotificationsStale());
    await waitFor(() => expect(result.current).toBe(1));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("keeps the last count when the request fails", async () => {
    fetchMock.mockResolvedValueOnce(respondWith(5));
    const { result } = renderHook(() => useUnreadNotifications());
    await waitFor(() => expect(result.current).toBe(5));

    fetchMock.mockResolvedValueOnce(new Response("nope", { status: 500 }));
    act(() => announceNotificationsStale());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(result.current).toBe(5);
  });
});
