import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { GET, HEAD } from "../route";

function codeWithoutComments(rel: string): string {
  return readFileSync(resolve(process.cwd(), rel), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const ROUTE_CODE = codeWithoutComments("src/app/api/health/route.ts");

describe("GET /api/health", () => {
  it("returns 200 with an 'ok' body", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.text()).resolves.toBe("ok");
  });

  it("is not cached", async () => {
    const res = await GET();
    expect(res.headers.get("Cache-Control")).toContain("no-store");
  });
});

describe("HEAD /api/health", () => {
  it("returns 200 with no body", async () => {
    const res = await HEAD();
    expect(res.status).toBe(200);
    await expect(res.text()).resolves.toBe("");
  });

  it("matches GET's status so a monitor sees the same result either way", async () => {
    const [get, head] = await Promise.all([GET(), HEAD()]);
    expect(head.status).toBe(get.status);
  });
});

describe("the health check stays a pure liveness check", () => {
  it("pulls in no database, cache, auth or rate-limit dependency", () => {
    for (const forbidden of [
      "withRateLimit",
      "api-rate-limit",
      "@/lib/prisma",
      "@/lib/redis",
      "@/lib/auth",
      "getAuthenticatedUserId",
      "clerk",
    ]) {
      expect(
        ROUTE_CODE.includes(forbidden),
        `src/app/api/health/route.ts must not use "${forbidden}". A health check ` +
          "that depends on Postgres, Redis, Clerk or a rate limiter reports the " +
          "site as down when those degrade, producing false-positive incidents.",
      ).toBe(false);
    }
  });

  it("is registered as a public route in src/proxy.ts", () => {
    const proxy = readFileSync(resolve(process.cwd(), "src/proxy.ts"), "utf8");
    expect(
      /"\/api\/health"/.test(proxy),
      "/api/health must be in isPublicRoute in src/proxy.ts. The middleware " +
        "matcher covers all non-static paths, so without this an unauthenticated " +
        "probe is redirected to /sign-in and never reaches the handler.",
    ).toBe(true);
  });
});
