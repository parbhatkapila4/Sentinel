"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const GOTO_ROUTES: Record<string, string> = {
  d: "/dashboard",
  l: "/deals",
  i: "/insights",
  r: "/reports",
  s: "/settings",
  n: "/notifications",
};

const GOTO_WINDOW_MS = 1000;

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target instanceof HTMLInputElement) return true;
  if (target instanceof HTMLTextAreaElement) return true;
  if (target instanceof HTMLSelectElement) return true;
  if (target.isContentEditable) return true;
  const role = target.getAttribute("role");
  if (role === "textbox" || role === "combobox" || role === "searchbox") {
    return true;
  }
  return false;
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const leaderUntilRef = useRef(0);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isEditable(e.target)) return;

      if (Date.now() < leaderUntilRef.current) {
        leaderUntilRef.current = 0;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const dest = GOTO_ROUTES[e.key.toLowerCase()];
        if (dest) {
          e.preventDefault();
          router.push(dest);
        }
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case "g":
          e.preventDefault();
          leaderUntilRef.current = Date.now() + GOTO_WINDOW_MS;
          break;
        case "n":
          e.preventDefault();
          router.push("/deals/new");
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);
}
