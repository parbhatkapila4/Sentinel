import * as Sentry from "@sentry/nextjs";
import { getRequestId } from "@/lib/request-context";

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  userId?: string;
  requestId?: string;
  actionType?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

function getLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel | undefined;
  if (envLevel && ["debug", "info", "warn", "error"].includes(envLevel)) {
    return envLevel;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

const CURRENT_LOG_LEVEL = getLogLevel();

function shouldLog(level: LogLevel): boolean {
  const levels: LogLevel[] = ["debug", "info", "warn", "error"];
  const currentIndex = levels.indexOf(CURRENT_LOG_LEVEL);
  const messageIndex = levels.indexOf(level);
  return messageIndex >= currentIndex;
}

function formatLogEntry(entry: LogEntry): string {
  if (process.env.NODE_ENV === "production") {
    return JSON.stringify(entry);
  } else {
    const timestamp = new Date(entry.timestamp).toISOString();
    const levelEmoji = {
      debug: "🔍",
      info: "ℹ️",
      warn: "⚠️",
      error: "❌",
    }[entry.level];

    const reqPart = entry.requestId ? ` [req:${entry.requestId}]` : "";
    let output = `${levelEmoji} [${timestamp}]${reqPart} ${entry.level.toUpperCase()}: ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      output += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`;
    }

    if (entry.error) {
      output += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack) {
        output += `\n  Stack: ${entry.error.stack}`;
      }
    }

    return output;
  }
}

function filterPrimitives(obj: LogContext | undefined): Record<string, string | number | boolean | null> | undefined {
  if (!obj) {
    return undefined;
  }

  const result: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      result[key] = value;
    } else if (value !== undefined) {

      result[key] = String(value);
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
  try {
    if (!shouldLog(level)) {
      return;
    }

    const requestId = getRequestId();
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(requestId ? { requestId } : {}),
      ...(context && Object.keys(context).length > 0 ? { context } : {}),
      ...(error
        ? {
          error: {
            name: error.name,
            message: error.message,
            ...(error.stack ? { stack: error.stack } : {}),
          },
        }
        : {}),
    };

    const formatted = formatLogEntry(entry);

    switch (level) {
      case "debug":
        console.debug(formatted);
        break;
      case "info":
        console.info(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "error":
        console.error(formatted);
        break;
    }

    if (level === "error" || level === "warn") {
      try {
        const sentryTags = { ...filterPrimitives(context), ...(requestId ? { requestId } : {}) };
        if (error) {
          Sentry.captureException(error, {
            level: level === "error" ? "error" : "warning",
            tags: sentryTags,
            extra: {
              message,
              ...context,
            },
          });
        } else {
          Sentry.captureMessage(message, {
            level: level === "error" ? "error" : "warning",
            tags: sentryTags,
            extra: context,
          });
        }
      } catch (sentryError) {
        if (process.env.NODE_ENV !== "test") {
          console.warn("[Logger] Failed to send to Sentry:", sentryError);
        }
      }
    }
  } catch (loggingError) {
    if (process.env.NODE_ENV !== "test") {
      console.error("[Logger] Failed to log:", loggingError);
    }
  }
}

export function logDebug(message: string, context?: LogContext): void {
  log("debug", message, context);
}

export function logInfo(message: string, context?: LogContext): void {
  log("info", message, context);
}

export function logWarn(message: string, context?: LogContext): void {
  log("warn", message, context);
}

export function logError(message: string, error?: Error | unknown, context?: LogContext): void {
  const errorObj = error instanceof Error ? error : error ? new Error(String(error)) : undefined;
  log("error", message, context, errorObj);
}
