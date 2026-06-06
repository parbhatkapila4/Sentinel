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
vi.mock("@/lib/slack-oauth", () => ({
  exchangeSlackCodeForTokens: vi.fn(),
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

import { GET } from "@/app/api/integrations/slack/oauth/callback/route";
import { getAuthenticatedUserId } from "@/lib/auth";
import { exchangeSlackCodeForTokens } from "@/lib/slack-oauth";
import { incrementMetric } from "@/lib/metrics";
import { signCookieValue } from "@/lib/signed-cookies";

const mockedAuth = vi.mocked(getAuthenticatedUserId);
const mockedExchange = vi.mocked(exchangeSlackCodeForTokens);
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
    "http://localhost:3001/api/integrations/slack/oauth/callback"
  );
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  const headers = new Headers();
  if (cookie) {
    headers.set("cookie", `slack_oauth_state=${cookie}`);
  }
  return new NextRequest(url.toString(), { headers });
}

function exchangeResult(overrides: Record<string, unknown> = {}) {
  return {
    botToken: "xoxb-BOT-TOKEN",
    botUserId: "U0BOTUSER",
    teamId: "T0TEAM",
    teamName: "Acme Workspace",
    scopes: "app_mentions:read,chat:write",
    selfEmail: "installer@acme.com",
    ...overrides,
  };
}

describe("GET /api/integrations/slack/oauth/callback", () => {
  it("?error=access_denied redirects to /integrations?slack=denied with the user_denied metric", async () => {
    const req = callbackRequest({ error: "access_denied" });

    const res = await GET(req);

    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/integrations");
    expect(location.searchParams.get("slack")).toBe("denied");
    expect(mockedIncrement).toHaveBeenCalledWith(
      "slack.oauth.callback.user_denied",
      1
    );
    expect(res.headers.get("set-cookie")).toMatch(/Max-Age=0/i);
  });

  it("missing state cookie → 400 invalid_state (no exchange, no DB write)", async () => {
    const req = callbackRequest({ code: "auth-code", state: "abc" });

    const res = await GET(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_state" });
    expect(mockedIncrement).toHaveBeenCalledWith(
      "slack.oauth.callback.invalid_state",
      1
    );
    expect(mockedExchange).not.toHaveBeenCalled();
    expect(prismaMock.slackEventsSubscription.upsert).not.toHaveBeenCalled();
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
      "slack.oauth.callback.invalid_state",
      1
    );
    expect(mockedIncrement).not.toHaveBeenCalledWith(
      "slack.oauth.callback.state_mismatch",
      1
    );
    expect(mockedExchange).not.toHaveBeenCalled();
    expect(prismaMock.slackEventsSubscription.upsert).not.toHaveBeenCalled();
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
      "slack.oauth.callback.state_mismatch",
      1
    );
    expect(mockedExchange).not.toHaveBeenCalled();
    expect(prismaMock.slackEventsSubscription.upsert).not.toHaveBeenCalled();
  });

  it("cookie userId ≠ current Clerk userId → 403 user_mismatch (defends mid-flow session swap)", async () => {
    const cookie = signCookieValue({
      state: "MATCH_STATE",
      userId: "user-original",
    });
    mockedAuth.mockResolvedValue("user-attacker");

    const req = callbackRequest({ code: "c", state: "MATCH_STATE" }, cookie);

    const res = await GET(req);

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "user_mismatch" });
    expect(mockedIncrement).toHaveBeenCalledWith(
      "slack.oauth.callback.user_mismatch",
      1
    );
    expect(prismaMock.slackEventsSubscription.upsert).not.toHaveBeenCalled();
    expect(mockedExchange).not.toHaveBeenCalled();
  });

  it("happy path: upserts on userId_teamId with ENCRYPTED botToken, botUserId, selfEmail, isActive=true", async () => {
    const cookie = signCookieValue({
      state: "MATCH_STATE",
      userId: "user-happy",
    });
    mockedAuth.mockResolvedValue("user-happy");
    mockedExchange.mockResolvedValueOnce(exchangeResult());
    prismaMock.slackEventsSubscription.upsert.mockResolvedValue({} as never);

    const res = await GET(
      callbackRequest({ code: "the-code", state: "MATCH_STATE" }, cookie)
    );

    expect(mockedExchange).toHaveBeenCalledWith("the-code");
    expect(prismaMock.slackEventsSubscription.upsert).toHaveBeenCalledTimes(1);
    const args =
      prismaMock.slackEventsSubscription.upsert.mock.calls[0]?.[0];

    expect(args?.where).toEqual({
      userId_teamId: { userId: "user-happy", teamId: "T0TEAM" },
    });

    expect(args?.create).toMatchObject({
      userId: "user-happy",
      teamId: "T0TEAM",
      botToken: "ENC:xoxb-BOT-TOKEN",
      botUserId: "U0BOTUSER",
      selfEmail: "installer@acme.com",
      isActive: true,
    });
    expect(args?.create?.botToken).not.toBe("xoxb-BOT-TOKEN");

    expect(args?.update).toMatchObject({
      botToken: "ENC:xoxb-BOT-TOKEN",
      botUserId: "U0BOTUSER",
      selfEmail: "installer@acme.com",
      isActive: true,
    });

    expect(mockedIncrement).toHaveBeenCalledWith(
      "slack.oauth.callback.success",
      1
    );
    expect(res.status).toBe(307);
  });

  it("happy path: null selfEmail from the exchange is passed through unchanged (best-effort, install still succeeds)", async () => {
    const cookie = signCookieValue({
      state: "NULL_EMAIL",
      userId: "user-ne",
    });
    mockedAuth.mockResolvedValue("user-ne");
    mockedExchange.mockResolvedValueOnce(
      exchangeResult({ selfEmail: null })
    );
    prismaMock.slackEventsSubscription.upsert.mockResolvedValue({} as never);

    const res = await GET(
      callbackRequest({ code: "c", state: "NULL_EMAIL" }, cookie)
    );

    const args =
      prismaMock.slackEventsSubscription.upsert.mock.calls[0]?.[0];
    expect(args?.create?.selfEmail).toBeNull();
    expect(args?.update?.selfEmail).toBeNull();

    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("slack_oauth_state=");
    expect(setCookie).toMatch(/Max-Age=0/i);
    expect(setCookie).toContain("Path=/api/integrations/slack/oauth");
  });

  it("happy path: redirects to /integrations?slack=connected", async () => {
    const cookie = signCookieValue({
      state: "REDIR_STATE",
      userId: "user-redir",
    });
    mockedAuth.mockResolvedValue("user-redir");
    mockedExchange.mockResolvedValueOnce(exchangeResult());
    prismaMock.slackEventsSubscription.upsert.mockResolvedValue({} as never);

    const res = await GET(
      callbackRequest({ code: "c", state: "REDIR_STATE" }, cookie)
    );

    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/integrations");
    expect(location.searchParams.get("slack")).toBe("connected");
  });
});
