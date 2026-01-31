import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
  RetryableError,
  CircuitBreakerError,
  isAppError,
} from "@/lib/errors";
import { errorResponse, successResponse, handleApiError } from "@/lib/api-response";

describe("AppError", () => {
  it("has default statusCode 500 and code INTERNAL_ERROR", () => {
    const err = new AppError("Something broke");
    expect(err.message).toBe("Something broke");
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("INTERNAL_ERROR");
    expect(err.isOperational).toBe(true);
  });

  it("accepts custom options", () => {
    const err = new AppError("Bad", {
      statusCode: 418,
      code: "TEAPOT",
      isOperational: false,
    });
    expect(err.statusCode).toBe(418);
    expect(err.code).toBe("TEAPOT");
    expect(err.isOperational).toBe(false);
  });
});

describe("NotFoundError", () => {
  it("sets message, statusCode 404, code NOT_FOUND", () => {
    const err = new NotFoundError("Deal");
    expect(err.message).toBe("Deal not found");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.isOperational).toBe(true);
  });

  it("works for any resource", () => {
    const err = new NotFoundError("User");
    expect(err.message).toBe("User not found");
  });
});

describe("UnauthorizedError", () => {
  it("sets default message, statusCode 401, code UNAUTHORIZED", () => {
    const err = new UnauthorizedError();
    expect(err.message).toBe("Unauthorized");
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
  });

  it("accepts custom message", () => {
    const err = new UnauthorizedError("Please sign in");
    expect(err.message).toBe("Please sign in");
  });
});

describe("ValidationError", () => {
  it("sets message, statusCode 400, code VALIDATION_ERROR", () => {
    const err = new ValidationError("Invalid input");
    expect(err.message).toBe("Invalid input");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.errors).toBeUndefined();
  });

  it("accepts field-level errors", () => {
    const err = new ValidationError("Missing required fields", {
      name: "Required",
      value: "Must be a number",
    });
    expect(err.errors).toEqual({ name: "Required", value: "Must be a number" });
  });
});

describe("ForbiddenError", () => {
  it("sets default message, statusCode 403, code FORBIDDEN", () => {
    const err = new ForbiddenError();
    expect(err.message).toBe("Forbidden");
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
  });
});

describe("ConflictError", () => {
  it("sets default message, statusCode 409, code CONFLICT", () => {
    const err = new ConflictError();
    expect(err.message).toBe("Conflict");
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe("CONFLICT");
  });
});

describe("isAppError", () => {
  it("returns true for AppError and subclasses", () => {
    expect(isAppError(new AppError("x"))).toBe(true);
    expect(isAppError(new NotFoundError("Deal"))).toBe(true);
    expect(isAppError(new ValidationError("y"))).toBe(true);
  });

  it("returns false for plain Error and non-errors", () => {
    expect(isAppError(new Error("x"))).toBe(false);
    expect(isAppError("oops")).toBe(false);
    expect(isAppError(null)).toBe(false);
  });
});

describe("successResponse", () => {
  it("returns JSON with success true and data", async () => {
    const res = successResponse({ foo: "bar" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true, data: { foo: "bar" } });
  });

  it("accepts custom status code", async () => {
    const res = successResponse({ id: "1" }, 201);
    expect(res.status).toBe(201);
  });
});

describe("errorResponse", () => {
  const origNodeEnv = process.env.NODE_ENV;
  const env = process.env as NodeJS.ProcessEnv & { NODE_ENV?: string };

  beforeEach(() => {
    env.NODE_ENV = "test";
  });

  afterEach(() => {
    env.NODE_ENV = origNodeEnv;
  });

  it("formats AppError with statusCode, message, code", async () => {
    const err = new NotFoundError("Deal");
    const res = errorResponse(err);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("Deal not found");
    expect(body.code).toBe("NOT_FOUND");
  });

  it("formats ValidationError", async () => {
    const err = new ValidationError("Bad input", { field: "Invalid" });
    const res = errorResponse(err);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Bad input");
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  it("formats plain Error as 500", async () => {
    const res = errorResponse(new Error("Something broke"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("Something broke");
    expect(body.code).toBe("INTERNAL_ERROR");
  });

  it("formats unknown as 500 with generic message", async () => {
    const res = errorResponse("string error");
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("string error");
  });

  it("formats RateLimitError with status 429 and retryAfter", async () => {
    const err = new RateLimitError("Too many requests");
    const res = errorResponse(err);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(body.retryAfter).toBe(60);
  });

  it("formats CircuitBreakerError with generic message", async () => {
    const err = new CircuitBreakerError("Circuit open", { failures: 5 });
    const res = errorResponse(err);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toContain("temporarily unavailable");
  });
});

describe("RateLimitError", () => {
  it("sets message, statusCode 429, code RATE_LIMIT_EXCEEDED", () => {
    const err = new RateLimitError();
    expect(err.message).toBe("Rate limit exceeded");
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe("RATE_LIMIT_EXCEEDED");
  });
});

describe("RetryableError", () => {
  it("sets message, statusCode 503, code RETRYABLE_ERROR", () => {
    const err = new RetryableError("Service busy");
    expect(err.message).toBe("Service busy");
    expect(err.statusCode).toBe(503);
    expect(err.code).toBe("RETRYABLE_ERROR");
  });
});

describe("CircuitBreakerError", () => {
  it("sets message, statusCode 503, code CIRCUIT_BREAKER_OPEN and metadata", () => {
    const err = new CircuitBreakerError("Open", { failures: 5 });
    expect(err.message).toBe("Open");
    expect(err.statusCode).toBe(503);
    expect(err.code).toBe("CIRCUIT_BREAKER_OPEN");
    expect(err.metadata).toEqual({ failures: 5 });
  });
});

describe("handleApiError", () => {
  it("returns same response shape as errorResponse", async () => {
    const err = new NotFoundError("Deal");
    const res = handleApiError(err);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("Deal not found");
  });
});
