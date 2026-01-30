"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { RealtimeEvent } from "@/lib/realtime";

export type RealtimeStatus = "idle" | "connecting" | "connected" | "error" | "closed";

export interface UseRealtimeOptions {
  onEvent?: (event: RealtimeEvent) => void;
  enabled?: boolean;
}

export interface UseRealtimeResult {
  events: RealtimeEvent[];
  lastEvent: RealtimeEvent | null;
  status: RealtimeStatus;
  error: string | null;
  reconnect: () => void;
}

const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30000;
const BACKOFF_MULTIPLIER = 1.5;

function parseSSELine(line: string): RealtimeEvent | null {
  const trimmed = line.trim();
  if (trimmed.startsWith("data: ")) {
    const json = trimmed.slice(6);
    if (json === "" || json === "{}") return null;
    try {
      const parsed = JSON.parse(json) as RealtimeEvent;
      if (parsed.type && parsed.payload) return parsed;
    } catch {
    }
  }
  return null;
}

export function useRealtime(options: UseRealtimeOptions = {}): UseRealtimeResult {
  const { onEvent, enabled = true } = options;
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const backoffRef = useRef(INITIAL_BACKOFF_MS);
  const onEventRef = useRef(onEvent);
  const connectRef = useRef<() => void>(() => { });

  const connect = useCallback(() => {
    if (!enabled) return;

    const base = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${base}/api/events`;
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("connecting");
    setError(null);

    fetch(url, {
      method: "GET",
      credentials: "include",
      signal: controller.signal,
      headers: { Accept: "text/event-stream" },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.status === 401 ? "Unauthorized" : `HTTP ${res.status}`);
        }
        setStatus("connected");
        backoffRef.current = INITIAL_BACKOFF_MS;

        const reader = res.body?.getReader();
        if (!reader) {
          setStatus("error");
          setError("No response body");
          return;
        }

        const streamReader = reader;
        const decoder = new TextDecoder();
        let buffer = "";

        function processChunk(value: Uint8Array | undefined, done: boolean): void {
          if (done) {
            setStatus("closed");
            return;
          }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const event = parseSSELine(line);
            if (event) {
              setEvents((prev) => [...prev, event]);
              setLastEvent(event);
              onEventRef.current?.(event);
            }
          }
        }

        function read(): void {
          streamReader
            .read()
            .then(({ value, done }) => {
              processChunk(value, done);
              if (!done) read();
            })
            .catch((err) => {
              if (err?.name === "AbortError") {
                setStatus("closed");
                return;
              }
              setStatus("error");
              setError(err instanceof Error ? err.message : String(err));
              const delay = backoffRef.current;
              backoffRef.current = Math.min(
                Math.floor(delay * BACKOFF_MULTIPLIER),
                MAX_BACKOFF_MS
              );
              setTimeout(() => connectRef.current(), delay);
            });
        }

        read();
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setStatus("error");
        setError(err instanceof Error ? err.message : String(err));
        const delay = backoffRef.current;
        backoffRef.current = Math.min(
          Math.floor(delay * BACKOFF_MULTIPLIER),
          MAX_BACKOFF_MS
        );
        setTimeout(() => connectRef.current(), delay);
      });
  }, [enabled]);

  const disconnect = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setStatus("closed");
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    backoffRef.current = INITIAL_BACKOFF_MS;
    setStatus("idle");
    setError(null);
    setTimeout(() => connect(), 0);
  }, [disconnect, connect]);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    if (!enabled) return;
    const id = setTimeout(() => connect(), 0);
    return () => {
      clearTimeout(id);
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return { events, lastEvent, status, error, reconnect };
}
