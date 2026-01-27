
import { logWarn, logError } from "./logger";
import { RetryableError } from "./errors";

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  multiplier?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  calculateDelay?: (attempt: number, initialDelay: number, multiplier: number) => number;
  isIdempotent?: boolean;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, "shouldRetry" | "calculateDelay">> = {
  maxRetries: parseInt(process.env.RETRY_MAX_RETRIES || "3", 10),
  initialDelay: parseInt(process.env.RETRY_INITIAL_DELAY || "1000", 10),
  maxDelay: parseInt(process.env.RETRY_MAX_DELAY || "30000", 10),
  multiplier: parseFloat(process.env.RETRY_MULTIPLIER || "2"),
  isIdempotent: true,
};

function calculateExponentialDelay(
  attempt: number,
  initialDelay: number,
  multiplier: number,
  maxDelay: number
): number {
  const delay = initialDelay * Math.pow(multiplier, attempt - 1);
  return Math.min(delay, maxDelay);
}

function isRetryableError(error: unknown, attempt: number, isIdempotent: boolean): boolean {
  if (!isIdempotent) {
    return false;
  }

  if (error instanceof RetryableError) {
    return true;
  }

  if (error instanceof TypeError && error.message.includes("fetch")) {
    return true;
  }

  if (error instanceof Error && "statusCode" in error) {
    const statusCode = (error as Error & { statusCode: number }).statusCode;
    if (statusCode === 429 || statusCode === 503 || statusCode === 502 || statusCode === 504) {
      return true;
    }
  }

  if (error instanceof Error && (error.name === "TimeoutError" || error.message.includes("timeout"))) {
    return true;
  }

  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const shouldRetry = options.shouldRetry || ((error, attempt) =>
    isRetryableError(error, attempt, config.isIdempotent)
  );

  const calculateDelayFn = options.calculateDelay ||
    ((attempt, initialDelay, multiplier) =>
      calculateExponentialDelay(attempt, initialDelay, multiplier, config.maxDelay)
    );

  let lastError: unknown;
  let attempt = 0;

  while (attempt <= config.maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < config.maxRetries && shouldRetry(error, attempt + 1)) {
        const delay = calculateDelayFn(attempt + 1, config.initialDelay, config.multiplier);

        logWarn(`Retry attempt ${attempt + 1}/${config.maxRetries} after ${delay}ms`, {
          error: error instanceof Error ? error.message : String(error),
          attempt: attempt + 1,
          maxRetries: config.maxRetries,
        });

        await sleep(delay);
        attempt++;
      } else {
        break;
      }
    }
  }

  logError("Retry exhausted", lastError, {
    attempts: attempt + 1,
    maxRetries: config.maxRetries,
  });

  throw lastError;
}
