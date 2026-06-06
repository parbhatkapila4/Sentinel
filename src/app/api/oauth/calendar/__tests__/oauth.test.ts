import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { prismaMock, resetPrismaMock } from "@/test/mocks/prisma";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth", () => ({
  getAuthenticatedUserId: vi.fn(),
}));
vi.mock("@/lib/integration-secrets", () => ({
  encryptIntegrationSecret: vi.fn((v: string) => `ENC:${v}`),
}));
vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
  logInfo: vi.fn(),
  logDebug: vi.fn(),
}));

import { GET as startGet } from "@/app/api/oauth/calendar/start/route";
import { GET as callbackGet } from "@/app/api/oauth/calendar/callback/route";
import { getAuthenticatedUserId } from "@/lib/auth";
import { encryptIntegrationSecret } from "@/lib/integration-secrets";

const mockedAuth = vi.mocked(getAuthenticatedUserId);
const mockedEncrypt = vi.mocked(encryptIntegrationSecret);

const env = process.env as Record<string, string | undefined>;
const ORIG_CLIENT_ID = env.GOOGLE_OAUTH_CLIENT_ID;
const ORIG_CLIENT_SECRET = env.GOOGLE_OAUTH_CLIENT_SECRET;
const ORIG_CALENDAR_REDIRECT = env.GOOGLE_CALENDAR_REDIRECT_URI;
const ORIG_APP_URL = env.NEXT_PUBLIC_APP_URL;

function setEnvVars() {
  env.GOOGLE_OAUTH_CLIENT_ID = "test-client-id";
  env.GOOGLE_OAUTH_CLIENT_SECRET = "test-client-secret";
  env.GOOGLE_CALENDAR_REDIRECT_URI =
    "http://localhost:3001/api/oauth/calendar/callback";
  env.NEXT_PUBLIC_APP_URL = "http://localhost:3001";
}

function clearOAuthEnv() {
  delete env.GOOGLE_OAUTH_CLIENT_ID;
  delete env.GOOGLE_OAUTH_CLIENT_SECRET;
  delete env.GOOGLE_CALENDAR_REDIRECT_URI;
}

function mockJsonResponse(
  body: unknown,
  init: { ok?: boolean; status?: number } = {}
) {
  const ok = init.ok ?? true;
  const status = init.status ?? (ok ? 200 : 400);
  return {
    ok,
    status,
    json: async () => body,
  } as unknown as Response;
}

function makeStateCookie(state: string, userId: string): string {
  return `calendar_oauth_state=${encodeURIComponent(
    JSON.stringify({ state, userId })
  )}`;
}

beforeEach(() => {
  resetPrismaMock();
  mockedAuth.mockReset();
  mockedEncrypt.mockClear();
  setEnvVars();
});

afterEach(() => {
  vi.unstubAllGlobals();
  env.GOOGLE_OAUTH_CLIENT_ID = ORIG_CLIENT_ID;
  env.GOOGLE_OAUTH_CLIENT_SECRET = ORIG_CLIENT_SECRET;
  env.GOOGLE_CALENDAR_REDIRECT_URI = ORIG_CALENDAR_REDIRECT;
  env.NEXT_PUBLIC_APP_URL = ORIG_APP_URL;
});

describe("GET /api/oauth/calendar/start", () => {
  it("returns 500 with canonical error shape when env vars are missing", async () => {
    clearOAuthEnv();
    mockedAuth.mockResolvedValue("user-1");

    const res = await startGet();

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: "Google OAuth env vars are not configured",
    });
  });

  it("returns 401 when there is no Clerk session", async () => {
    mockedAuth.mockRejectedValue(new Error("No session"));

    const res = await startGet();

    expect(res.status).toBe(401);
  });

  it("happy path: redirects to Google with calendar.readonly scope and sets calendar_oauth_state cookie", async () => {
    mockedAuth.mockResolvedValue("user-1");

    const res = await startGet();

    expect(res.status).toBe(307);
    const url = new URL(res.headers.get("location")!);
    expect(url.host).toBe("accounts.google.com");
    expect(url.searchParams.get("client_id")).toBe("test-client-id");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3001/api/oauth/calendar/callback"
    );
    expect(url.searchParams.get("access_type")).toBe("offline");
    expect(url.searchParams.get("prompt")).toBe("consent");

    const scope = url.searchParams.get("scope") ?? "";
    expect(scope).toContain("https://www.googleapis.com/auth/calendar.readonly");
    expect(scope).toContain("https://www.googleapis.com/auth/userinfo.email");
    expect(scope).toContain("openid");
    expect(scope).not.toContain("gmail.readonly");
    expect(scope).not.toContain("gmail.modify");

    const cookieHeader = res.headers.get("set-cookie") ?? "";
    expect(cookieHeader).toContain("calendar_oauth_state=");
    expect(cookieHeader).toContain("Path=/api/oauth/calendar");
    expect(cookieHeader).not.toContain("gmail_oauth_state=");
  });
});

describe("GET /api/oauth/calendar/callback", () => {
  function callbackRequest(
    params: Record<string, string>,
    cookieHeader?: string
  ): NextRequest {
    const url = new URL("http://localhost:3001/api/oauth/calendar/callback");
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
    return new NextRequest(url.toString(), {
      headers: cookieHeader ? { cookie: cookieHeader } : {},
    });
  }

  it("redirects with calendar_error=missing_params when code is absent", async () => {
    const req = callbackRequest({ state: "abc" });

    const res = await callbackGet(req);

    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/integrations");
    expect(location.searchParams.get("calendar_error")).toBe("missing_params");
    expect(location.searchParams.get("gmail_error")).toBeNull();
  });

  it("redirects with calendar_error=state_mismatch when cookie state doesn't match query state", async () => {
    const req = callbackRequest(
      { code: "auth-code-123", state: "QUERY_STATE" },
      makeStateCookie("DIFFERENT_COOKIE_STATE", "user-1")
    );

    const res = await callbackGet(req);

    const location = new URL(res.headers.get("location")!);
    expect(location.searchParams.get("calendar_error")).toBe("state_mismatch");
    expect(prismaMock.calendarIntegration.upsert).not.toHaveBeenCalled();
  });

  it("happy path: tokens encrypted, CalendarIntegration upsert called with encrypted values, redirects to calendar_connected=1", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        mockJsonResponse({
          access_token: "PLAINTEXT_ACCESS",
          refresh_token: "PLAINTEXT_REFRESH",
          expires_in: 3599,
          scope: "https://www.googleapis.com/auth/calendar.readonly",
          token_type: "Bearer",
        })
      )
      .mockResolvedValueOnce(
        mockJsonResponse({
          email: "user@example.com",
          verified_email: true,
        })
      );
    vi.stubGlobal("fetch", fetchMock);
    prismaMock.calendarIntegration.upsert.mockResolvedValue({} as never);

    const req = callbackRequest(
      { code: "auth-code-123", state: "STATE_XX" },
      makeStateCookie("STATE_XX", "user-1")
    );

    const res = await callbackGet(req);

    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/integrations");
    expect(location.searchParams.get("calendar_connected")).toBe("1");

    expect(mockedEncrypt).toHaveBeenCalledWith("PLAINTEXT_ACCESS");
    expect(mockedEncrypt).toHaveBeenCalledWith("PLAINTEXT_REFRESH");

    expect(prismaMock.calendarIntegration.upsert).toHaveBeenCalledTimes(1);
    const upsertArg =
      prismaMock.calendarIntegration.upsert.mock.calls[0]?.[0];
    expect(upsertArg?.where).toEqual({ userId: "user-1" });
    expect(upsertArg?.create).toMatchObject({
      userId: "user-1",
      accessToken: "ENC:PLAINTEXT_ACCESS",
      refreshToken: "ENC:PLAINTEXT_REFRESH",
      email: "user@example.com",
      scope: "https://www.googleapis.com/auth/calendar.readonly",
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://oauth2.googleapis.com/token"
    );
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      "https://www.googleapis.com/oauth2/v2/userinfo"
    );
  });

  it("redirects with calendar_error=no_refresh_token and writes nothing when refresh_token is missing", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      mockJsonResponse({
        access_token: "some-access",
        expires_in: 3599,
        scope: "https://www.googleapis.com/auth/calendar.readonly",
        token_type: "Bearer",
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const req = callbackRequest(
      { code: "auth-code-123", state: "STATE_XX" },
      makeStateCookie("STATE_XX", "user-1")
    );

    const res = await callbackGet(req);

    const location = new URL(res.headers.get("location")!);
    expect(location.searchParams.get("calendar_error")).toBe(
      "no_refresh_token"
    );
    expect(prismaMock.calendarIntegration.upsert).not.toHaveBeenCalled();
    expect(mockedEncrypt).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
