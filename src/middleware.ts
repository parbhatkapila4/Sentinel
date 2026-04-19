import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
  "/features",
  "/pricing",
  "/privacy",
  "/about",
  "/contact",
  "/api/internal/metrics",
  "/api-docs",
  "/api-docs(.*)",
  "/docs",
  "/docs(.*)",
]);

const MAX_REQUEST_SIZE = 10 * 1024 * 1024;

function checkRequestSize(request: NextRequest): boolean {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (!isNaN(size) && size > MAX_REQUEST_SIZE) {
      return false;
    }
  }
  return true;
}

function addRequestIdToResponse(response: NextResponse, requestId: string): NextResponse {
  response.headers.set("X-Request-Id", requestId);
  return response;
}

function nextWithRequestId(req: NextRequest, requestId: string): NextResponse {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-request-id", requestId);
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  return addRequestIdToResponse(response, requestId);
}

export function isExplicitlyPublicRoute(req: NextRequest): boolean {
  return isPublicRoute(req);
}

export default clerkMiddleware(async (auth, req) => {
  const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();

  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    if (!checkRequestSize(req)) {
      const res = NextResponse.json(
        { error: "Request body too large", code: "PAYLOAD_TOO_LARGE" },
        { status: 413 }
      );
      return addRequestIdToResponse(res, requestId);
    }
  }

  if (isExplicitlyPublicRoute(req)) {
    return nextWithRequestId(req, requestId);
  }

  const { userId } = await auth();

  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect", req.nextUrl.pathname);
    const res = NextResponse.redirect(signInUrl);
    return addRequestIdToResponse(res, requestId);
  }

  return nextWithRequestId(req, requestId);
});

export const config = {
  matcher: [

    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
