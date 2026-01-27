"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case "g": {
            e.preventDefault();
            const handleSecondKey = (e2: KeyboardEvent) => {
              if (
                e2.target instanceof HTMLInputElement ||
                e2.target instanceof HTMLTextAreaElement
              ) {
                return;
              }
              e2.preventDefault();
              switch (e2.key.toLowerCase()) {
                case "d":
                  router.push("/dashboard");
                  break;
                case "l":
                  router.push("/deals");
                  break;
                case "i":
                  router.push("/insights");
                  break;
                case "r":
                  router.push("/reports");
                  break;
                case "s":
                  router.push("/settings");
                  break;
                case "n":
                  router.push("/notifications");
                  break;
              }
              document.removeEventListener("keydown", handleSecondKey);
            };
            document.addEventListener("keydown", handleSecondKey);
            setTimeout(() => document.removeEventListener("keydown", handleSecondKey), 1000);
            break;
          }
          case "n":
            e.preventDefault();
            router.push("/deals/new");
            break;
          case "?":
            break;
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);
}
