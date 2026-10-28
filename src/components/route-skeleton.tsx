"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { findRouteSkeleton } from "./route-skeletons";

const SHOW_DELAY_MS = 150;
const GIVE_UP_MS = 12000;

interface Shown {
  from: string;
  Skeleton: ComponentType;
}

function internalUrl(anchor: HTMLAnchorElement): URL | null {
  if (anchor.target && anchor.target !== "" && anchor.target !== "_self") {
    return null;
  }
  if (anchor.hasAttribute("download")) return null;

  const href = anchor.getAttribute("href");
  if (!href) return null;
  if (
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("javascript:")
  ) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(href, window.location.origin);
  } catch {
    return null;
  }
  return url.origin === window.location.origin ? url : null;
}

function RouteSkeletonImpl() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [shown, setShown] = useState<Shown | null>(null);

  const routeKey = `${pathname}?${searchParams?.toString() ?? ""}`;
  const routeKeyRef = useRef(routeKey);
  const tokenRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    routeKeyRef.current = routeKey;
  }, [routeKey]);

  useEffect(() => {
    const clearTimers = () => {
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
    };

    const begin = (targetPath: string) => {
      const entry = findRouteSkeleton(targetPath);
      if (!entry) return;

      clearTimers();
      const token = ++tokenRef.current;
      const from = routeKeyRef.current;
      const waited = new Promise<void>((resolve) => {
        timersRef.current.push(window.setTimeout(resolve, SHOW_DELAY_MS));
      });

      Promise.all([entry.load(), waited])
        .then(([mod]) => {
          if (tokenRef.current !== token) return;
          if (routeKeyRef.current !== from) return;
          setShown({ from, Skeleton: mod.default });
          timersRef.current.push(
            window.setTimeout(() => {
              if (tokenRef.current === token) setShown(null);
            }, GIVE_UP_MS)
          );
        })
        .catch(() => { });
    };

    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return;
      const anchor = (e.target as HTMLElement | null)?.closest("a");
      const url = anchor ? internalUrl(anchor) : null;
      if (!url || url.pathname === window.location.pathname) return;
      findRouteSkeleton(url.pathname)
        ?.load()
        .catch(() => { });
    }

    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const anchor = (e.target as HTMLElement | null)?.closest("a");
      const url = anchor ? internalUrl(anchor) : null;
      if (!url) return;

      const samePath = url.pathname === window.location.pathname;
      if (samePath && url.search === window.location.search) return;

      e.preventDefault();
      if (!samePath) begin(url.pathname);
      router.push(`${url.pathname}${url.search}${url.hash}`);
    }

    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    document.addEventListener("click", onClick, { capture: true });
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      });
      document.removeEventListener("click", onClick, { capture: true });
      clearTimers();
    };
  }, [router]);

  if (!shown || shown.from !== routeKey) return null;

  const { Skeleton } = shown;
  return (
    <div
      data-route-skeleton=""
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9990,
        overflow: "hidden",
        background: "#0b0b0b",
      }}
    >
      <Skeleton />
    </div>
  );
}

export function RouteSkeleton() {
  return (
    <Suspense fallback={null}>
      <RouteSkeletonImpl />
    </Suspense>
  );
}
