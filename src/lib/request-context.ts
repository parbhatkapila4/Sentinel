import { AsyncLocalStorage } from "async_hooks";
import type { NextRequest } from "next/server";

export interface RequestContextStore {
  requestId: string;
}

const storage = new AsyncLocalStorage<RequestContextStore>();

export function runWithRequestId<T>(requestId: string, fn: () => T): T {
  return storage.run({ requestId }, fn);
}

export function getRequestId(): string | undefined {
  try {
    return storage.getStore()?.requestId;
  } catch {
    return undefined;
  }
}

export function setRequestId(id: string): void {
  try {
    const store = storage.getStore();
    if (store) {
      store.requestId = id;
    }
  } catch {

  }
}

export function withRequestId<R>(
  handler: (req: NextRequest) => Promise<R>
): (req: NextRequest) => Promise<R> {
  return (req: NextRequest) => {
    const id = req.headers.get("x-request-id") ?? crypto.randomUUID();
    return runWithRequestId(id, () => handler(req)) as Promise<R>;
  };
}
