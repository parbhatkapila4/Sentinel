import * as Sentry from "@sentry/nextjs";

function getActiveSpan(): ReturnType<typeof Sentry.getActiveSpan> {
  try {
    return typeof Sentry.getActiveSpan === "function" ? Sentry.getActiveSpan() : undefined;
  } catch {
    return undefined;
  }
}

export async function trackPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  const tracingDisabled = process.env.NEXT_PUBLIC_SENTRY_ENABLE_PERFORMANCE === "false";

  if (tracingDisabled) {
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      if (duration > 1000) {
        trackCustomMetric("slow_operation", duration, {
          operation: name,
          threshold: "1000ms",
        });
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  try {
    return await Sentry.startSpan(
      { name, op: "function" },
      async (span) => {
        const result = await fn();
        const duration = Date.now() - startTime;
        if (duration > 1000) {
          span.setAttribute("duration_ms", duration);
          trackCustomMetric("slow_operation", duration, {
            operation: name,
            threshold: "1000ms",
          });
        }
        return result;
      }
    );
  } catch (error) {
    throw error;
  }
}

export function trackApiCall(
  endpoint: string,
  method: string,
  duration: number,
  statusCode: number
): void {
  try {
    if (typeof window === "undefined") {
      const span = getActiveSpan();
      if (span?.isRecording?.()) {
        span.setAttribute("endpoint", endpoint);
        span.setAttribute("method", method);
        span.setAttribute("statusCode", statusCode.toString());
        span.setAttribute("duration", duration);
      }
    }

    if (duration > 1000) {
      trackCustomMetric("slow_api_call", duration, {
        endpoint,
        method,
        statusCode: statusCode.toString(),
      });
    }

    if (statusCode >= 400) {
      trackCustomMetric("api_error", 1, {
        endpoint,
        method,
        statusCode: statusCode.toString(),
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[Monitoring] Failed to track API call:", error);
    }
  }
}

export function trackDatabaseQuery(query: string, duration: number): void {
  try {
    if (process.env.NODE_ENV === "development" && duration > 100) {
      console.log(`[Slow Query] ${query} took ${duration}ms`);
    }

    if (duration > 1000) {
      trackCustomMetric("slow_database_query", duration, {
        query: query.substring(0, 100),
      });
    }

    if (duration > 100) {
      const span = getActiveSpan();
      if (span?.isRecording?.()) {
        span.setAttribute("db_query", "true");
        span.setAttribute("query_duration", duration);
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[Monitoring] Failed to track database query:", error);
    }
  }
}

export function trackCustomMetric(
  name: string,
  value: number,
  tags?: Record<string, string>
): void {
  try {
    const span = getActiveSpan();
    if (span?.isRecording?.()) {
      span.setAttribute(`metric.${name}`, value);
      if (tags) {
        for (const [key, val] of Object.entries(tags)) {
          span.setAttribute(key, val);
        }
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[Monitoring] Failed to track custom metric:", error);
    }
  }
}

export function setUserContext(userId: string, email?: string): void {
  try {
    Sentry.setUser({
      id: userId,
      email,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[Monitoring] Failed to set user context:", error);
    }
  }
}

export function addBreadcrumb(
  message: string,
  category: string,
  level: "debug" | "info" | "warning" | "error" | "fatal" = "info"
): void {
  try {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[Monitoring] Failed to add breadcrumb:", error);
    }
  }
}
