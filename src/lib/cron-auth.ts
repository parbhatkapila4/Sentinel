import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function requireCronBearerAuth(
  request: NextRequest
): NextResponse | null {
  const expectedRaw = process.env.CRON_SECRET;
  const expected = expectedRaw?.trim();
  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const bearerPrefix = "Bearer ";
  if (!authHeader || !authHeader.startsWith(bearerPrefix)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const provided = authHeader.slice(bearerPrefix.length);
  if (!safeEqual(provided, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
