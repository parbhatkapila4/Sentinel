"use client";

import { useEffect } from "react";
import { trackWebVitals, trackPageLoad } from "@/lib/performance";
import { usePathname } from "next/navigation";


export function WebVitalsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackWebVitals();

    if (typeof window !== "undefined") {

      if (document.readyState === "complete") {
        trackPageLoad(pathname || "/");
      } else {
        window.addEventListener("load", () => {
          trackPageLoad(pathname || "/");
        });
      }
    }
  }, [pathname]);

  return null;
}
