import type { AsyncLocalStorage as AsyncLocalStorageType } from "async_hooks";
import type { NextRequest } from "next/server";

export interface RequestContextStore {
  requestId: string;
}
let storage: AsyncLocalStorageType<RequestContextStore> | null = null;

function getStorage(): AsyncLocalStorageType<RequestContextStore> | null {
  if (storage) return storage;
  if (typeof window !== "undefined") return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeRequire = eval("require") as NodeJS.Require;
    const { AsyncLocalStorage } = nodeRequire("async_hooks") as typeof import("async_hooks");
    storage = new AsyncLocalStorage<RequestContextStore>();
    return storage;
  } catch {
    return null;
  }
}

export function runWithRequestId<T>(requestId: string, fn: () => T): T {
  const s = getStorage();
  if (!s) return fn();
  return s.run({ requestId }, fn);
}

export function getRequestId(): string | undefined {
  try {
    return getStorage()?.getStore()?.requestId;
  } catch {
    return undefined;
  }
}

export function setRequestId(id: string): void {
  try {
    const s = getStorage();
    if (!s) return;
    const store = s.getStore();
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
