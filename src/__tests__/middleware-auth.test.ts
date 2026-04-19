import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { isExplicitlyPublicRoute } from "@/middleware";

function makeReq(path: string, headers?: Record<string, string>) {
  return new NextRequest(`http://localhost${path}`, {
    headers,
  });
}

describe("middleware explicit public auth boundary", () => {
  it("allows configured public routes", () => {
    expect(isExplicitlyPublicRoute(makeReq("/"))).toBe(true);
    expect(isExplicitlyPublicRoute(makeReq("/sign-in"))).toBe(true);
    expect(isExplicitlyPublicRoute(makeReq("/api-docs"))).toBe(true);
    expect(isExplicitlyPublicRoute(makeReq("/api/internal/metrics"))).toBe(true);
  });

  it("does not allow protected route via spoofable headers", () => {
    const req = makeReq("/dashboard", {
      referer: "http://localhost/",
      rsc: "1",
      "next-router-prefetch": "1",
    });
    expect(isExplicitlyPublicRoute(req)).toBe(false);
  });

  it("does not treat other /api/internal paths as public", () => {
    expect(isExplicitlyPublicRoute(makeReq("/api/internal/other"))).toBe(false);
  });
});
