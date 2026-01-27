
import { logWarn } from "./logger";
export function isConnectionPoolExhausted(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("MaxClientsInSessionMode") ||
      error.message.includes("max clients reached") ||
      error.message.includes("connection pool") ||
      error.message.includes("too many clients")
    );
  }
  return false;
}

export async function withDbRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 2,
  retryDelay = 100
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (isConnectionPoolExhausted(error) && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
        logWarn(`Database connection pool exhausted, retrying (attempt ${attempt + 1}/${maxRetries})`, {
          attempt: attempt + 1,
          maxRetries,
        });
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}
