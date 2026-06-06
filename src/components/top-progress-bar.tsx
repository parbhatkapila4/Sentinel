"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function TopProgressBarImpl() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [targetRoute, setTargetRoute] = useState<string | null>(null);

  const creepTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const minShowTimerRef = useRef<number | null>(null);
  const shownAtRef = useRef<number>(0);
  const routeKey = `${pathname}?${searchParams?.toString() ?? ""}`;
  const prevRouteRef = useRef(routeKey);
  const activeRef = useRef(false);

  const clearTimers = () => {
    if (creepTimerRef.current !== null) {
      window.clearInterval(creepTimerRef.current);
      creepTimerRef.current = null;
    }
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (minShowTimerRef.current !== null) {
      window.clearTimeout(minShowTimerRef.current);
      minShowTimerRef.current = null;
    }
  };

  const start = (route: string | null) => {
    clearTimers();
    activeRef.current = true;
    shownAtRef.current = Date.now();

    flushSync(() => {
      setVisible(true);
      setProgress(8);
      if (route !== null) setTargetRoute(route);
    });

    creepTimerRef.current = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        const step = p < 30 ? 7 : p < 60 ? 4 : p < 80 ? 2 : 1;
        return Math.min(90, p + step);
      });
    }, 180);
  };

  const hideNow = () => {
    clearTimers();
    setVisible(false);
    setProgress(0);
    setTargetRoute(null);
  };

  const complete = () => {
    if (!activeRef.current) return;
    activeRef.current = false;
    if (creepTimerRef.current !== null) {
      window.clearInterval(creepTimerRef.current);
      creepTimerRef.current = null;
    }
    setProgress(100);

    const elapsed = Date.now() - shownAtRef.current;
    const remaining = Math.max(0, 220 - elapsed);
    minShowTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = window.setTimeout(hideNow, 260);
    }, remaining);
  };

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;

      if (anchor.target && anchor.target !== "" && anchor.target !== "_self") {
        return;
      }
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      let url: URL;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;

      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      e.preventDefault();
      const cleanPath = url.pathname.replace(/^\/+|\/+$/g, "");
      const label = cleanPath || "home";
      start(label);
      router.push(`${url.pathname}${url.search}${url.hash}`);
    }

    document.addEventListener("click", onClick, { capture: true });
    return () =>
      document.removeEventListener("click", onClick, { capture: true });
  }, [router]);

  useEffect(() => {
    if (prevRouteRef.current !== routeKey) {
      prevRouteRef.current = routeKey;
      complete();
    }
  }, [routeKey]);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  if (!visible) return null;

  const done = progress >= 100;

  return (
    <>
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          zIndex: 9998,
          pointerEvents: "none",
          background: "transparent",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background:
              "linear-gradient(90deg, #E05A3F 0%, var(--signal, #C8472E) 60%, #F08060 100%)",
            boxShadow:
              "0 0 14px rgba(200, 71, 46, 0.75), 0 0 6px rgba(200, 71, 46, 0.55)",
            transition: done
              ? "width 220ms ease-out, opacity 240ms ease-out 40ms"
              : "width 200ms ease-out",
            opacity: done ? 0 : 1,
            willChange: "width, opacity",
          }}
        />
      </div>

      <div
        aria-live="polite"
        role="status"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9997,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          animation: "sentinel-tpb-fade 160ms ease both",
          opacity: done ? 0 : 1,
          transition: "opacity 200ms ease",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 18px 10px 14px",
            borderRadius: 999,
            background: "rgba(20, 18, 16, 0.92)",
            border: "1px solid rgba(245, 237, 214, 0.14)",
            boxShadow:
              "0 12px 40px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(245, 237, 214, 0.04) inset",
            fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "-0.005em",
            color: "var(--cream, #F5EDD6)",
            pointerEvents: "auto",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden
            style={{
              animation: "sentinel-tpb-spin 0.9s linear infinite",
              flexShrink: 0,
            }}
          >
            <circle
              cx="7"
              cy="7"
              r="5.5"
              stroke="rgba(245, 237, 214, 0.2)"
              strokeWidth="1.5"
            />
            <path
              d="M7 1.5a5.5 5.5 0 015.5 5.5"
              stroke="var(--cream, #F5EDD6)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span>
            {targetRoute ? `Opening ${targetRoute}...` : "Loading..."}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes sentinel-tpb-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes sentinel-tpb-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export function TopProgressBar() {
  return (
    <Suspense fallback={null}>
      <TopProgressBarImpl />
    </Suspense>
  );
}
