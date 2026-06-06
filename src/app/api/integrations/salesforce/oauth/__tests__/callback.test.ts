import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/mocks/prisma";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/integration-secrets", () => ({
  encryptIntegrationSecret: vi.fn((v: string) => `ENC:${v}`),
  decryptIntegrationSecret: vi.fn((v: string) =>
    v.startsWith("ENC:") ? v.slice(4) : v
  ),
}));
vi.mock("@/lib/auth", () => ({
  getAuthenticatedUserId: vi.fn(),
}));
vi.mock("@/lib/salesforce", () => ({
  ACCESS_TOKEN_LIFETIME_MS: 110 * 60 * 1000,
  exchangeSalesforceCodeForTokens: vi.fn(),
}));
vi.mock("@/lib/metrics", () => ({
  incrementMetric: vi.fn(),
}));
vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
  logInfo: vi.fn(),
  logDebug: vi.fn(),
}));

import { GET } from "@/app/api/integrations/salesforce/oauth/callback/route";
import { getAuthenticatedUserId } from "@/lib/auth";
import { exchangeSalesforceCodeForTokens } from "@/lib/salesforce";
import { incrementMetric } from "@/lib/metrics";
import { signCookieValue } from "@/lib/signed-cookies";

const mockedAuth = vi.mocked(getAuthenticatedUserId);
const mockedExchange = vi.mocked(exchangeSalesforceCodeForTokens);
const mockedIncrement = vi.mocked(incrementMetric);

const env = process.env as Record<string, string | undefined>;
const ORIG_APP_URL = env.NEXT_PUBLIC_APP_URL;
const ORIG_ENC_KEY = env.INTEGRATION_ENCRYPTION_KEY;

beforeEach(() => {
  resetPrismaMock();
  mockedAuth.mockReset();
  mockedExchange.mockReset();
  mockedIncrement.mockReset();
  env.INTEGRATION_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
  env.NEXT_PUBLIC_APP_URL = "http://localhost:3001";
});

afterEach(() => {
  env.NEXT_PUBLIC_APP_URL = ORIG_APP_URL;
  env.INTEGRATION_ENCRYPTION_KEY = ORIG_ENC_KEY;
});

function callbackRequest(
  query: Record<string, string>,
  cookie?: string
): NextRequest {
  const url = new URL(
    "http://localhost:3001/api/integrations/salesforce/oauth/callback"
  );
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  const headers = new Headers();
  if (cookie) {
    headers.set("cookie", `salesforce_oauth_state=${cookie}`);
  }
  return new NextRequest(url.toString(), { headers });
}

describe("GET /api/integrations/salesforce/oauth/callback", () => {
  it("?error=access_denied redirects to /integrations?salesforce=denied with the user_denied metric", async () => {
    const req = callbackRequest({ error: "access_denied" });

    const res = await GET(req);

    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/integrations");
    expect(location.searchParams.get("salesforce")).toBe("denied");
    expect(mockedIncrement).toHaveBeenCalledWith(
      "salesforce.oauth.callback.user_denied",
      1
    );
    expect(res.headers.get("set-cookie")).toMatch(/Max-Age=0/i);
  });

  it("missing state cookie → 400 with invalid_state metric (no exchange, no DB write)", async () => {
    const req = callbackRequest({ code: "auth-code", state: "abc" });

    const res = await GET(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_state" });
    expect(mockedIncrement).toHaveBeenCalledWith(
      "salesforce.oauth.callback.invalid_state",
      1
    );
    expect(mockedExchange).not.toHaveBeenCalled();
    expect(prismaMock.salesforceIntegration.upsert).not.toHaveBeenCalled();
  });

  it("cookie present but signature invalid → 400 invalid_state (signature checked BEFORE state-equality)", async () => {
    const goodPayload = Buffer.from(
      JSON.stringify({ state: "abc", userId: "user-1" }),
      "utf8"
    ).toString("base64url");
    const forgedCookie = `${goodPayload}.${"X".repeat(43)}`;
    const req = callbackRequest({ code: "c", state: "abc" }, forgedCookie);

    const res = await GET(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_state" });
    expect(mockedIncrement).toHaveBeenCalledWith(
      "salesforce.oauth.callback.invalid_state",
      1
    );
    expect(mockedIncrement).not.toHaveBeenCalledWith(
      "salesforce.oauth.callback.state_mismatch",
      1
    );
    expect(prismaMock.salesforceIntegration.upsert).not.toHaveBeenCalled();
    expect(mockedExchange).not.toHaveBeenCalled();
  });

  it("cookie state ≠ query state → 400 state_mismatch (cookie signature valid)", async () => {
    const cookie = signCookieValue({
      state: "STATE_IN_COOKIE",
      userId: "user-1",
    });
    const req = callbackRequest(
      { code: "c", state: "DIFFERENT_QUERY_STATE" },
      cookie
    );

    const res = await GET(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "state_mismatch" });
    expect(mockedIncrement).toHaveBeenCalledWith(
      "salesforce.oauth.callback.state_mismatch",
      1
    );
    expect(prismaMock.salesforceIntegration.upsert).not.toHaveBeenCalled();
    expect(mockedExchange).not.toHaveBeenCalled();
  });

  it("cookie userId ≠ current Clerk userId → 403 user_mismatch (defends mid-flow session swap)", async () => {
    const cookie = signCookieValue({
      state: "MATCH_STATE",
      userId: "user-original",
    });
    mockedAuth.mockResolvedValue("user-attacker");

    const req = callbackRequest(
      { code: "c", state: "MATCH_STATE" },
      cookie
    );

    const res = await GET(req);

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "user_mismatch" });
    expect(mockedIncrement).toHaveBeenCalledWith(
      "salesforce.oauth.callback.user_mismatch",
      1
    );
    expect(prismaMock.salesforceIntegration.upsert).not.toHaveBeenCalled();
    expect(mockedExchange).not.toHaveBeenCalled();
  });

  it("happy path: upserts SalesforceIntegration with authMethod=oauth, encrypted tokens, response-body instanceUrl, joined scopes, healed flags", async () => {
    const cookie = signCookieValue({
      state: "MATCH_STATE",
      userId: "user-happy",
    });
    mockedAuth.mockResolvedValue("user-happy");
    mockedExchange.mockResolvedValueOnce({
      accessToken: "PLAINTEXT_ACCESS",
      refreshToken: "PLAINTEXT_REFRESH",
      instanceUrl: "https://na55.my.salesforce.com",
      scopes: ["api", "refresh_token"],
    });
    prismaMock.salesforceIntegration.upsert.mockResolvedValue({} as never);

    const before = Date.now();
    const res = await GET(
      callbackRequest({ code: "the-code", state: "MATCH_STATE" }, cookie)
    );
    const after = Date.now();

    expect(mockedExchange).toHaveBeenCalledWith(
      "the-code",
      "https://login.salesforce.com"
    );

    expect(prismaMock.salesforceIntegration.upsert).toHaveBeenCalledTimes(1);
    const args =
      prismaMock.salesforceIntegration.upsert.mock.calls[0]?.[0];
    expect(args?.where).toEqual({ userId: "user-happy" });

    expect(args?.create).toMatchObject({
      userId: "user-happy",
      authMethod: "oauth",
      accessToken: "ENC:PLAINTEXT_ACCESS",
      refreshToken: "ENC:PLAINTEXT_REFRESH",
      instanceUrl: "https://na55.my.salesforce.com",
      scopes: "api refresh_token",
      isActive: true,
      syncEnabled: true,
    });

    expect(args?.update).toMatchObject({
      authMethod: "oauth",
      accessToken: "ENC:PLAINTEXT_ACCESS",
      refreshToken: "ENC:PLAINTEXT_REFRESH",
      instanceUrl: "https://na55.my.salesforce.com",
      scopes: "api refresh_token",
      isActive: true,
      syncErrors: null,
    });
    expect(args?.update).not.toHaveProperty("consumerKey");
    expect(args?.update).not.toHaveProperty("consumerSecret");

    const expectedLifetime = 110 * 60 * 1000;
    const expiry = args?.create?.accessTokenExpiresAt as Date;
    expect(expiry).toBeInstanceOf(Date);
    expect(expiry.getTime()).toBeGreaterThanOrEqual(
      before + expectedLifetime - 5000
    );
    expect(expiry.getTime()).toBeLessThanOrEqual(
      after + expectedLifetime + 5000
    );

    expect(mockedIncrement).toHaveBeenCalledWith(
      "salesforce.oauth.callback.success",
      1
    );
  });

  it("happy path: clears the salesforce_oauth_state cookie on the response", async () => {
    const cookie = signCookieValue({
      state: "CLR_STATE",
      userId: "user-clr",
    });
    mockedAuth.mockResolvedValue("user-clr");
    mockedExchange.mockResolvedValueOnce({
      accessToken: "a",
      refreshToken: "r",
      instanceUrl: "https://na55.my.salesforce.com",
      scopes: ["api"],
    });
    prismaMock.salesforceIntegration.upsert.mockResolvedValue({} as never);

    const res = await GET(
      callbackRequest({ code: "c", state: "CLR_STATE" }, cookie)
    );

    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("salesforce_oauth_state=");
    expect(setCookie).toMatch(/Max-Age=0/i);
    expect(setCookie).toContain("Path=/api/integrations/salesforce/oauth");
  });

  it("happy path: redirects to /integrations?salesforce=connected", async () => {
    const cookie = signCookieValue({
      state: "REDIR_STATE",
      userId: "user-redir",
    });
    mockedAuth.mockResolvedValue("user-redir");
    mockedExchange.mockResolvedValueOnce({
      accessToken: "a",
      refreshToken: "r",
      instanceUrl: "https://na55.my.salesforce.com",
      scopes: [],
    });
    prismaMock.salesforceIntegration.upsert.mockResolvedValue({} as never);

    const res = await GET(
      callbackRequest({ code: "c", state: "REDIR_STATE" }, cookie)
    );

    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/integrations");
    expect(location.searchParams.get("salesforce")).toBe("connected");
  });
});
