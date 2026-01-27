
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const startTime = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    return { result, duration };
  } catch (error) {
    const duration = performance.now() - startTime;

    throw { error, duration, name };
  }
}

export function measureSync<T>(
  name: string,
  fn: () => T
): { result: T; duration: number } {
  const startTime = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - startTime;
    return { result, duration };
  } catch (error) {
    const duration = performance.now() - startTime;
    throw { error, duration, name };
  }
}

export function trackWebVitals(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if ("PerformanceObserver" in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
            renderTime?: number;
            loadTime?: number;
          };
          if (lastEntry) {
            const lcp = lastEntry.renderTime || lastEntry.loadTime || 0;
            reportWebVital("LCP", lcp);
          }
        });
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
      } catch {
      }

      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const timing = entry as PerformanceEntry & {
              processingStart?: number;
            };
            if (timing.processingStart) {
              const fid = timing.processingStart - entry.startTime;
              reportWebVital("FID", fid);
            }
          });
        });
        fidObserver.observe({ entryTypes: ["first-input"] });
      } catch {
      }

      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const shift = entry as PerformanceEntry & {
              hadRecentInput?: boolean;
              value?: number;
            };
            if (!shift.hadRecentInput && shift.value) {
              clsValue += shift.value;
            }
          });
          reportWebVital("CLS", clsValue);
        });
        clsObserver.observe({ entryTypes: ["layout-shift"] });
      } catch {
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[Performance] Failed to track web vitals:", error);
    }
  }
}

function reportWebVital(name: string, value: number): void {
  try {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (typeof window !== "undefined") {
      import("@sentry/nextjs").then((Sentry) => {
        Sentry.metrics.distribution(`web_vital.${name.toLowerCase()}`, value);
      }).catch(() => {
      });
    }
  } catch {
  }
}

export function trackPageLoad(pageName: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if ("performance" in window && "timing" in window.performance) {
      const timing = window.performance.timing;
      const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
      const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      const domInteractive = timing.domInteractive - timing.navigationStart;

      if (process.env.NODE_ENV === "production") {
        import("@sentry/nextjs").then((Sentry) => {
          Sentry.metrics.distribution("page.load_time", pageLoadTime, {
            attributes: { page: pageName },
          });
          Sentry.metrics.distribution("page.dom_content_loaded", domContentLoaded, {
            attributes: { page: pageName },
          });
          Sentry.metrics.distribution("page.dom_interactive", domInteractive, {
            attributes: { page: pageName },
          });
        }).catch(() => {
        });
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[Performance] Failed to track page load:", error);
    }
  }
}
