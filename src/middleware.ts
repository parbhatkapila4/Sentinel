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

export default clerkMiddleware(async (auth, req) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    if (!checkRequestSize(req)) {
      return NextResponse.json(
        { error: "Request body too large", code: "PAYLOAD_TOO_LARGE" },
        { status: 413 }
      );
    }
  }

  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  const rsc = req.headers.get("RSC") || req.headers.get("rsc");
  const prefetch = req.headers.get("Next-Router-Prefetch");
  if (rsc === "1" || prefetch === "1") {
    return NextResponse.next();
  }

  const referer = req.headers.get("Referer") || req.headers.get("referer");
  if (referer) {
    try {
      const refUrl = new URL(referer);
      const requestUrl = new URL(req.url);
      if (refUrl.origin === requestUrl.origin) {
        return NextResponse.next();
      }
    } catch {
    }
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
