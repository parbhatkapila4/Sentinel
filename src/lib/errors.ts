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

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
