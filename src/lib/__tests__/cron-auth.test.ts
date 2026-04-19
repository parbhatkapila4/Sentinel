import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { requireCronBearerAuth } from "@/lib/cron-auth";

function req(url: string, authorization?: string): NextRequest {
  return new NextRequest(url, {
    headers: authorization ? { authorization } : undefined,
  });
}

describe("cron-auth fail-closed", () => {
  beforeEach(() => {
    delete process.env.CRON_SECRET;
  });

  it("rejects when CRON_SECRET is missing", () => {
    const response = requireCronBearerAuth(req("http://localhost/api/cron/x"));
    expect(response).not.toBeNull();
    expect(response?.status).toBe(503);
  });

  it("rejects when CRON_SECRET is blank/whitespace", () => {
    process.env.CRON_SECRET = "   ";
    const response = requireCronBearerAuth(
      req("http://localhost/api/cron/x", "Bearer cron-secret")
    );
    expect(response).not.toBeNull();
    expect(response?.status).toBe(503);
  });

  it("rejects missing Authorization header", () => {
    process.env.CRON_SECRET = "cron-secret";
    const response = requireCronBearerAuth(req("http://localhost/api/cron/x"));
    expect(response).not.toBeNull();
    expect(response?.status).toBe(401);
  });

  it("rejects wrong bearer token", () => {
    process.env.CRON_SECRET = "cron-secret";
    const response = requireCronBearerAuth(
      req("http://localhost/api/cron/x", "Bearer bad")
    );
    expect(response).not.toBeNull();
    expect(response?.status).toBe(401);
  });

  it("accepts only exact Bearer <CRON_SECRET>", () => {
    process.env.CRON_SECRET = "cron-secret";
    const response = requireCronBearerAuth(
      req("http://localhost/api/cron/x", "Bearer cron-secret")
    );
    expect(response).toBeNull();
  });

  it("does not accept query-param secret fallback", () => {
    process.env.CRON_SECRET = "cron-secret";
    const response = requireCronBearerAuth(
      req("http://localhost/api/cron/x?secret=cron-secret")
    );
    expect(response).not.toBeNull();
    expect(response?.status).toBe(401);
  });
});
