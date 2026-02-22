import { AsyncLocalStorage } from "async_hooks";
import type { NextRequest } from "next/server";

export interface RequestContextStore {
  requestId: string;
}

const storage = new AsyncLocalStorage<RequestContextStore>();

/**
 * Runs `fn` inside a new async context where the storage holds `{ requestId }`.
 * Any code in the same request (middleware → route handler → server actions → libs)
 * that runs within this call tree can read the same requestId via getRequestId().
 */
export function runWithRequestId<T>(requestId: string, fn: () => T): T {
  return storage.run({ requestId }, fn);
}

/**
 * Returns the current context's requestId, or undefined if not inside runWithRequestId.
 * Use this when outside a request (e.g. cron, background worker) — logs will still
 * be written; requestId will be omitted.
 */
export function getRequestId(): string | undefined {
  try {
    return storage.getStore()?.requestId;
  } catch {
    return undefined;
  }
}

/**
 * Sets the requestId in the current async context's store (if one exists).
 * Use when you are already inside a runWithRequestId context and want to
 * set or override the id (e.g. from an incoming X-Request-Id header).
 * For API routes that run in a new async context, use withRequestId(handler)
 * or runWithRequestId(headerId, () => { ... }) so that getRequestId() is available.
 */
export function setRequestId(id: string): void {
  try {
    const store = storage.getStore();
    if (store) {
      store.requestId = id;
    }
  } catch {
    // no-op
  }
}

/**
 * Wraps an API route handler so the entire handler runs inside a request context
 * with requestId from the X-Request-Id header (or a new UUID). Use when Next.js
 * runs the handler in a different async context and AsyncLocalStorage from
 * middleware doesn't propagate.
 *
 * Usage: export const POST = withRequestId(handler) or withRateLimit(withRequestId(handler), opts).
 */
export function withRequestId<R>(
  handler: (req: NextRequest) => Promise<R>
): (req: NextRequest) => Promise<R> {
  return (req: NextRequest) => {
    const id = req.headers.get("x-request-id") ?? crypto.randomUUID();
    return runWithRequestId(id, () => handler(req)) as Promise<R>;
  };
}
