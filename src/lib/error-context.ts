
import { AsyncLocalStorage } from "async_hooks";

export interface ErrorContext {
  userId?: string;
  requestId?: string;
  actionType?: string;
  [key: string]: unknown;
}

const errorContextStorage = new AsyncLocalStorage<ErrorContext>();

export function getErrorContext(): ErrorContext | undefined {
  try {
    return errorContextStorage.getStore();
  } catch {
    return undefined;
  }
}

export async function withErrorContext<T>(
  context: ErrorContext,
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await errorContextStorage.run(context, fn);
  } catch (error) {
    if (error instanceof Error) {
      (error as Error & { context?: ErrorContext }).context = context;
    }
    throw error;
  }
}

export function withErrorContextSync<T>(
  context: ErrorContext,
  fn: () => T
): T {
  try {
    return errorContextStorage.run(context, fn);
  } catch (error) {
    if (error instanceof Error) {
      (error as Error & { context?: ErrorContext }).context = context;
    }
    throw error;
  }
}

export function addErrorContext(additionalContext: Partial<ErrorContext>): void {
  try {
    const currentContext = errorContextStorage.getStore();
    if (currentContext) {
      Object.assign(currentContext, additionalContext);
    }
  } catch {
  }
}
