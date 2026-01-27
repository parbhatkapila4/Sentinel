export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly isOperational: boolean;

  constructor(
    message: string,
    options: {
      statusCode?: number;
      code?: string;
      isOperational?: boolean;
    } = {}
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code ?? "INTERNAL_ERROR";
    this.isOperational = options.isOperational ?? true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, {
      statusCode: 404,
      code: "NOT_FOUND",
      isOperational: true,
    });
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, {
      statusCode: 401,
      code: "UNAUTHORIZED",
      isOperational: true,
    });
    this.name = "UnauthorizedError";
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ValidationError extends AppError {
  readonly errors?: Record<string, string>;

  constructor(
    message = "Validation failed",
    errors?: Record<string, string>
  ) {
    super(message, {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      isOperational: true,
    });
    this.name = "ValidationError";
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, {
      statusCode: 403,
      code: "FORBIDDEN",
      isOperational: true,
    });
    this.name = "ForbiddenError";
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, {
      statusCode: 409,
      code: "CONFLICT",
      isOperational: true,
    });
    this.name = "ConflictError";
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded") {
    super(message, {
      statusCode: 429,
      code: "RATE_LIMIT_EXCEEDED",
      isOperational: true,
    });
    this.name = "RateLimitError";
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class RetryableError extends AppError {
  constructor(message: string, options?: { statusCode?: number; code?: string }) {
    super(message, {
      statusCode: options?.statusCode ?? 503,
      code: options?.code ?? "RETRYABLE_ERROR",
      isOperational: true,
    });
    this.name = "RetryableError";
    Object.setPrototypeOf(this, RetryableError.prototype);
  }
}

export class CircuitBreakerError extends AppError {
  readonly metadata?: Record<string, unknown>;

  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, {
      statusCode: 503,
      code: "CIRCUIT_BREAKER_OPEN",
      isOperational: true,
    });
    this.name = "CircuitBreakerError";
    this.metadata = metadata;
    Object.setPrototypeOf(this, CircuitBreakerError.prototype);
  }
}

export class ExternalServiceError extends AppError {
  readonly service: string;
  readonly originalError?: unknown;

  constructor(service: string, message: string, originalError?: unknown) {
    super(`External service error (${service}): ${message}`, {
      statusCode: 502,
      code: "EXTERNAL_SERVICE_ERROR",
      isOperational: true,
    });
    this.name = "ExternalServiceError";
    this.service = service;
    this.originalError = originalError;
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof RetryableError) {
    return true;
  }

  if (error instanceof Error && "statusCode" in error) {
    const statusCode = (error as Error & { statusCode: number }).statusCode;
    return statusCode === 429 || statusCode === 502 || statusCode === 503 || statusCode === 504;
  }

  if (error instanceof TypeError && error.message.includes("fetch")) {
    return true;
  }

  if (error instanceof Error && (error.name === "TimeoutError" || error.message.includes("timeout"))) {
    return true;
  }

  return false;
}
