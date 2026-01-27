
import { logWarn, logError, logInfo } from "./logger";
import { CircuitBreakerError } from "./errors";

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface CircuitBreakerConfig {
  failureThreshold: number;
  timeout: number;
  name: string;
}

interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  lastFailureTime: number | null;
  successCount: number;
}

const DEFAULT_CONFIG: Omit<CircuitBreakerConfig, "name"> = {
  failureThreshold: parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || "5", 10),
  timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || "60000", 10),
};

const circuitBreakers = new Map<string, CircuitBreakerState>();

function getOrCreateCircuitBreakerState(name: string): CircuitBreakerState {
  if (!circuitBreakers.has(name)) {
    circuitBreakers.set(name, {
      state: "CLOSED",
      failures: 0,
      lastFailureTime: null,
      successCount: 0,
    });
  }
  return circuitBreakers.get(name)!;
}

export function getCircuitBreakerState(name: string): CircuitState {
  const state = getOrCreateCircuitBreakerState(name);
  return state.state;
}

function shouldAttemptRecovery(state: CircuitBreakerState, timeout: number): boolean {
  if (state.state !== "OPEN") {
    return false;
  }

  if (state.lastFailureTime === null) {
    return false;
  }

  const timeSinceLastFailure = Date.now() - state.lastFailureTime;
  return timeSinceLastFailure >= timeout;
}

function recordSuccess(state: CircuitBreakerState, name: string): void {
  state.failures = 0;
  state.successCount++;

  if (state.state === "HALF_OPEN") {
    state.state = "CLOSED";
    state.successCount = 0;
    logInfo(`Circuit breaker "${name}" closed - service recovered`, {
      circuitBreaker: name,
      state: "CLOSED",
    });
  }
}

function recordFailure(
  state: CircuitBreakerState,
  name: string,
  failureThreshold: number,
  timeout: number
): void {
  state.failures++;
  state.lastFailureTime = Date.now();

  if (state.state === "HALF_OPEN") {
    state.state = "OPEN";
    state.successCount = 0;
    logWarn(`Circuit breaker "${name}" opened again - service still failing`, {
      circuitBreaker: name,
      state: "OPEN",
      failures: state.failures,
    });
  } else if (state.state === "CLOSED" && state.failures >= failureThreshold) {
    state.state = "OPEN";
    logError(`Circuit breaker "${name}" opened - too many failures`, undefined, {
      circuitBreaker: name,
      state: "OPEN",
      failures: state.failures,
      threshold: failureThreshold,
    });
  }
}

export async function withCircuitBreaker<T>(
  name: string,
  fn: () => Promise<T>,
  config?: Partial<CircuitBreakerConfig>
): Promise<T> {
  const fullConfig: CircuitBreakerConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    name,
  };

  const state = getOrCreateCircuitBreakerState(name);

  if (state.state === "OPEN") {
    if (shouldAttemptRecovery(state, fullConfig.timeout)) {
      state.state = "HALF_OPEN";
      state.successCount = 0;
      logInfo(`Circuit breaker "${name}" entering HALF_OPEN state - testing recovery`, {
        circuitBreaker: name,
        state: "HALF_OPEN",
      });
    } else {
      throw new CircuitBreakerError(
        `Circuit breaker "${name}" is OPEN - service unavailable`,
        {
          circuitBreaker: name,
          state: "OPEN",
          failures: state.failures,
          lastFailureTime: state.lastFailureTime,
        }
      );
    }
  }

  try {
    const result = await fn();
    recordSuccess(state, name);
    return result;
  } catch (error) {
    recordFailure(state, name, fullConfig.failureThreshold, fullConfig.timeout);
    throw error;
  }
}

export function resetCircuitBreaker(name: string): void {
  const state = getOrCreateCircuitBreakerState(name);
  state.state = "CLOSED";
  state.failures = 0;
  state.lastFailureTime = null; 
  state.successCount = 0;
  logInfo(`Circuit breaker "${name}" manually reset`, {
    circuitBreaker: name,
  });
}

