import { NextResponse } from "next/server";
import { AppError, ValidationError, CircuitBreakerError, ExternalServiceError, RateLimitError } from "@/lib/errors";
import { logError } from "./logger";
import { getErrorContext } from "./error-context";
import { sanitizeString } from "./security";

export function successResponse<T>(data: T, statusCode = 200) {
  return NextResponse.json({ success: true, data }, { status: statusCode });
}

type ErrorBody = {
  success: false;
  error: string;
  code: string;
  requestId?: string;
  stack?: string;
  errors?: Record<string, string>;
  retryAfter?: number;
  service?: string;
};

function generateRequestId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  } catch {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

function getRequestId(): string {
  try {
    const context = getErrorContext();
    if (context?.requestId) {
      return context.requestId as string;
    }
  } catch {
  }
  return generateRequestId();
}

export function errorResponse(error: unknown, requestId?: string): NextResponse {
  let status = 500;
  let message = "Internal server error";
  let code = "INTERNAL_ERROR";
  let retryAfter: number | undefined;
  let service: string | undefined;

  if (error instanceof AppError) {
    status = error.statusCode;
    message = error.message;
    code = error.code;

    if (error instanceof CircuitBreakerError) {
      message = "Service temporarily unavailable. Please try again later.";
    } else if (error instanceof ExternalServiceError) {
      service = error.service;
      message = `External service error: ${message}`;
    } else if (error instanceof RateLimitError) {
      retryAfter = 60;
    }
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }

  const context = getErrorContext();
  const finalRequestId = requestId || context?.requestId || getRequestId();


  const isProduction = process.env.NODE_ENV === "production";
  let sanitizedMessage = sanitizeString(message);


  if (isProduction && status === 500) {
    sanitizedMessage = "An internal error occurred. Please try again later.";
  }


  let sanitizedErrors: Record<string, string> | undefined;
  if (error instanceof ValidationError && error.errors) {
    sanitizedErrors = {};
    for (const [key, value] of Object.entries(error.errors)) {
      sanitizedErrors[sanitizeString(key)] = sanitizeString(value);
    }
  }

  const body: ErrorBody = {
    success: false,
    error: sanitizedMessage,
    code,
    requestId: finalRequestId,
  };

  if (sanitizedErrors) {
    body.errors = sanitizedErrors;
  }

  if (retryAfter !== undefined) {
    body.retryAfter = retryAfter;
  }

  if (service) {
    body.service = sanitizeString(service);
  }


  if (process.env.NODE_ENV === "development" && error instanceof Error && error.stack) {
    body.stack = sanitizeString(error.stack);
  }

  const errorContext = {
    requestId: finalRequestId,
    ...context,
    statusCode: status,
    errorCode: code,
    ...(service && { service }),
  };


  logError(`API Error: ${message}`, error instanceof Error ? error : undefined, errorContext);

  return NextResponse.json(body, { status });
}

export function handleApiError(error: unknown, requestId?: string): NextResponse {
  return errorResponse(error, requestId);
}
