import { RetryableError } from "./errors";

interface ReliableFetchOptions {
  timeoutMs: number;
  timeoutMessage: string;
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  options: ReliableFetchOptions
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new RetryableError(options.timeoutMessage, {
        statusCode: 504,
        code: "UPSTREAM_TIMEOUT",
      });
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
