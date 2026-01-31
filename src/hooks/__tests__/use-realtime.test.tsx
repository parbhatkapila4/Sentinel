"use client";

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useRealtime } from "@/hooks/use-realtime";

describe("useRealtime", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns initial state with status idle and reconnect function", () => {
    const { result } = renderHook(() => useRealtime({ enabled: false }));
    expect(result.current.status).toBe("idle");
    expect(result.current.events).toEqual([]);
    expect(result.current.lastEvent).toBeNull();
    expect(result.current.error).toBeNull();
    expect(typeof result.current.reconnect).toBe("function");
  });

  it("when enabled false does not start connecting", () => {
    const { result } = renderHook(() => useRealtime({ enabled: false }));
    expect(result.current.status).toBe("idle");
  });

  it("sets status to error when fetch fails", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useRealtime({ enabled: true }));

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });
    expect(result.current.error).toBeTruthy();
  });

  it("sets status to error when response is 401", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 401 })
    );

    const { result } = renderHook(() => useRealtime({ enabled: true }));

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });
    expect(result.current.error).toContain("Unauthorized");
  });
});
