import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import type { NextFetchEvent } from "next/server";

const FRONTEND_API = "example-test-42.clerk.accounts.dev";
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = `pk_test_${btoa("example-test-42.clerk.accounts.dev$")}`;
  process.env.CLERK_SECRET_KEY = `sk_test_${"x".repeat(40)}`;
});

import proxy from "@/proxy";

const ORIGIN = "https://www.sentinels.in";
const event = {
  waitUntil: () => undefined,
  sourcePage: "/",
} as unknown as NextFetchEvent;

async function probe(
  path: string,
  method: "GET" | "HEAD",
  headers: Record<string, string>,
) {
  const res = await proxy(
    new NextRequest(`${ORIGIN}${path}`, { method, headers }),
    event,
  );
  if (!res) throw new Error("proxy returned no response");
  return res;
}

const BROWSER_ACCEPT =
  "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
const UPTIMEROBOT_HEADERS = {
  accept: BROWSER_ACCEPT,
  "user-agent":
    "Mozilla/5.0+(compatible; UptimeRobot/2.0; http://www.uptimerobot.com/)",
};

describe("proxy: HEAD probes never enter the Clerk browser handshake", () => {
  it("control: a cookie-less GET document request on a dev instance IS handshake-redirected", async () => {
    const res = await probe("/", "GET", { accept: BROWSER_ACCEPT });
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain(
      `https://${FRONTEND_API}/v1/client/handshake`,
    );
    expect(res.headers.get("x-clerk-auth-status")).toBe("handshake");
    expect(res.headers.get("x-clerk-auth-reason")).toBe("dev-browser-missing");
  });

  it.each(["/", "/api/health", "/pricing", "/sign-in"])(
    "HEAD %s with a browser-like Accept passes straight through (200, no redirect)",
    async (path) => {
      const res = await probe(path, "HEAD", UPTIMEROBOT_HEADERS);
      expect(res.status).toBe(200);
      expect(res.headers.get("location")).toBeNull();
      expect(
        res.headers.get("x-middleware-rewrite") ?? `${ORIGIN}${path}`,
      ).toBe(`${ORIGIN}${path}`);
      expect(res.headers.get("x-middleware-request-sec-fetch-dest")).toBe(
        "empty",
      );
      expect(res.headers.get("x-clerk-auth-status")).toBe("signed-out");
      expect(res.headers.get("x-clerk-auth-reason")).toBe(
        "dev-browser-missing",
      );
      expect(res.headers.get("x-request-id")).toBeTruthy();
    },
  );

  it("HEAD is protected even when the client claims sec-fetch-dest: document", async () => {
    const res = await probe("/", "HEAD", {
      ...UPTIMEROBOT_HEADERS,
      "sec-fetch-dest": "document",
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("HEAD with stale Clerk cookies (a handshake trigger that also exists on production instances) still passes through", async () => {
    const res = await probe("/", "HEAD", {
      ...UPTIMEROBOT_HEADERS,
      cookie: "__client_uat=1700000000; __clerk_db_jwt=abc",
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-clerk-auth-status")).toBe("signed-out");
    expect(res.headers.get("x-clerk-auth-reason")).toBe(
      "client-uat-but-no-session-token",
    );
  });

  it("HEAD on a protected route redirects to the local sign-in page, never to Clerk", async () => {
    const res = await probe("/dashboard", "HEAD", UPTIMEROBOT_HEADERS);
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location") ?? "");
    expect(location.origin).toBe(ORIGIN);
    expect(location.pathname).toBe("/sign-in");
    expect(location.searchParams.get("redirect")).toBe("/dashboard");
  });
});
