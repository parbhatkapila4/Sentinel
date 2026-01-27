import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { rateLimiter, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
]);

const isApiRoute = createRouteMatcher(["/api/(.*)"]);

function getClientIP(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    return ips[0] || "unknown";
  }

  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  const remoteAddr = req.headers.get("remote-addr");
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

export default clerkMiddleware(async (auth, req) => {
  if (isApiRoute(req)) {
    try {
      const { userId } = await auth();

      if (userId) {
        const userResult = await rateLimiter.checkLimit(
          `user:${userId}`,
          RATE_LIMIT_CONFIGS.USER_DEFAULT.limit,
          RATE_LIMIT_CONFIGS.USER_DEFAULT.window
        );

        if (!userResult.allowed) {
          const headers = createRateLimitHeaders(
            RATE_LIMIT_CONFIGS.USER_DEFAULT.limit,
            userResult.remaining,
            userResult.resetAt
          );

          return NextResponse.json(
            {
              success: false,
              error: `Rate limit exceeded. Please try again in ${Math.ceil(
                (userResult.resetAt - Date.now()) / 1000
              )} seconds.`,
              code: "RATE_LIMIT_EXCEEDED",
              retryAfter: Math.ceil((userResult.resetAt - Date.now()) / 1000),
            },
            {
              status: 429,
              headers,
            }
          );
        }
      } else {
        const ip = getClientIP(req);
        if (ip !== "unknown") {
          const ipResult = await rateLimiter.checkLimit(
            `ip:${ip}`,
            RATE_LIMIT_CONFIGS.IP_PUBLIC.limit,
            RATE_LIMIT_CONFIGS.IP_PUBLIC.window
          );

          if (!ipResult.allowed) {
            const headers = createRateLimitHeaders(
              RATE_LIMIT_CONFIGS.IP_PUBLIC.limit,
              ipResult.remaining,
              ipResult.resetAt
            );

            return NextResponse.json(
              {
                success: false,
                error: `Rate limit exceeded. Please try again in ${Math.ceil(
                  (ipResult.resetAt - Date.now()) / 1000
                )} seconds.`,
                code: "RATE_LIMIT_EXCEEDED",
                retryAfter: Math.ceil((ipResult.resetAt - Date.now()) / 1000),
              },
              {
                status: 429,
                headers,
              }
            );
          }
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        console.error("[Middleware] Rate limiting error:", error);
      }
    }
  }

  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  const { userId } = await auth();

  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [

    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
