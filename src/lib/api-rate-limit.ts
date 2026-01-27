import { NextRequest, NextResponse } from "next/server";
import { rateLimiter, RATE_LIMIT_CONFIGS, RateLimitConfig } from "./rate-limit";
import { getAuthenticatedUserId } from "./auth";
import { RateLimitError } from "./errors";
import { errorResponse } from "./api-response";


export type RateLimitTier = "strict" | "normal" | "lenient" | "ai" | "export";

function getConfigForTier(tier: RateLimitTier): RateLimitConfig {
  switch (tier) {
    case "strict":
      return {
        limit: parseInt(process.env.RATE_LIMIT_STRICT || "30", 10),
        window: 60,
      };
    case "normal":
      return RATE_LIMIT_CONFIGS.USER_DEFAULT;
    case "lenient":
      return {
        limit: parseInt(process.env.RATE_LIMIT_LENIENT || "200", 10),
        window: 60,
      };
    case "ai":
      return RATE_LIMIT_CONFIGS.USER_AI;
    case "export":
      return RATE_LIMIT_CONFIGS.USER_EXPORT;
    default:
      return RATE_LIMIT_CONFIGS.USER_DEFAULT;
  }
}

function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    return ips[0] || "unknown";
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  const remoteAddr = request.headers.get("remote-addr");
  if (remoteAddr) {
    return remoteAddr;
  }

  return "unknown";
}

function createRateLimitHeaders(
  limit: number,
  remaining: number,
  resetAt: number
): Record<string, string> {
  const resetIn = Math.ceil((resetAt - Date.now()) / 1000);
  return {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": Math.max(0, remaining).toString(),
    "X-RateLimit-Reset": resetAt.toString(),
    "Retry-After": resetIn.toString(),
  };
}

export interface RateLimitOptions {
  tier?: RateLimitTier;
  config?: RateLimitConfig;
  perUser?: boolean;
  perIP?: boolean;
  identifier?: string;
}

export function withRateLimit<T = NextRequest>(
  handler: (request: T) => Promise<NextResponse>,
  options: RateLimitOptions = {}
): (request: T) => Promise<NextResponse> {
  const {
    tier = "normal",
    config,
    perUser = true,
    perIP = false,
    identifier: customIdentifier,
  } = options;

  const rateLimitConfig = config || getConfigForTier(tier);

  return async (request: T) => {
    const nextRequest = request as unknown as NextRequest;

    const identifiers: string[] = [];

    if (customIdentifier) {
      identifiers.push(customIdentifier);
    } else {
      if (perUser) {
        try {
          const userId = await getAuthenticatedUserId();
          identifiers.push(`user:${userId}`);
        } catch {
        }
      }

      if (perIP) {
        const ip = getClientIP(nextRequest);
        if (ip !== "unknown") {
          identifiers.push(`ip:${ip}`);
        }
      }
    }

    if (identifiers.length === 0) {
      if (process.env.NODE_ENV !== "test") {
        console.warn(
          "[RateLimit] No identifiers found - allowing request without rate limiting"
        );
      }
      return handler(request);
    }

    let rateLimitResult = {
      allowed: true,
      remaining: rateLimitConfig.limit,
      resetAt: Date.now() + rateLimitConfig.window * 1000,
    };

    for (const identifier of identifiers) {
      const result = await rateLimiter.checkLimit(
        identifier,
        rateLimitConfig.limit,
        rateLimitConfig.window
      );

      if (!result.allowed) {
        rateLimitResult = result;
        break;
      }

      rateLimitResult = {
        allowed: result.allowed && rateLimitResult.allowed,
        remaining: Math.min(result.remaining, rateLimitResult.remaining),
        resetAt: Math.max(result.resetAt, rateLimitResult.resetAt),
      };
    }

    if (!rateLimitResult.allowed) {
      const headers = createRateLimitHeaders(
        rateLimitConfig.limit,
        rateLimitResult.remaining,
        rateLimitResult.resetAt
      );

      const error = new RateLimitError(
        `Rate limit exceeded. Please try again in ${Math.ceil(
          (rateLimitResult.resetAt - Date.now()) / 1000
        )} seconds.`
      );

      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers,
        }
      );
    }

    const response = await handler(request);

    const headers = createRateLimitHeaders(
      rateLimitConfig.limit,
      rateLimitResult.remaining,
      rateLimitResult.resetAt
    );

    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}
