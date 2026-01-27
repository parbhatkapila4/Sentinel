import { NextResponse } from "next/server";
import { AppError, ValidationError } from "@/lib/errors";

export function successResponse<T>(data: T, statusCode = 200) {
  return NextResponse.json({ success: true, data }, { status: statusCode });
}

type ErrorBody = {
  success: false;
  error: string;
  code: string;
  stack?: string;
  errors?: Record<string, string>;
};

export function errorResponse(error: unknown) {
  let status = 500;
  let message = "Internal server error";
  let code = "INTERNAL_ERROR";

  if (error instanceof AppError) {
    status = error.statusCode;
    message = error.message;
    code = error.code;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }

  const body: ErrorBody = {
    success: false,
    error: message,
    code,
  };

  if (error instanceof ValidationError && error.errors) {
    body.errors = error.errors;
  }

  if (process.env.NODE_ENV === "development" && error instanceof Error && error.stack) {
    body.stack = error.stack;
  }

  return NextResponse.json(body, { status });
}

export function handleApiError(error: unknown) {
  if (process.env.NODE_ENV !== "test") {
    console.error("[API Error]", error);
  }
  return errorResponse(error);
}
