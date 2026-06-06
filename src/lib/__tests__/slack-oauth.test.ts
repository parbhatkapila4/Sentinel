import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("@/lib/reliable-fetch", () => ({
  fetchWithTimeout: vi.fn(),
}));
vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
  logInfo: vi.fn(),
  logDebug: vi.fn(),
}));

import { exchangeSlackCodeForTokens } from "@/lib/slack-oauth";
import { ExternalServiceError } from "@/lib/errors";
import { fetchWithTimeout } from "@/lib/reliable-fetch";

const mockedFetch = vi.mocked(fetchWithTimeout);

function mockResponse(
  body: unknown,
  init: { ok?: boolean; status?: number } = {}
): Response {
  const ok = init.ok ?? true;
  const status = init.status ?? (ok ? 200 : 400);
  return {
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

function oauthAccessBody(overrides: Record<string, unknown> = {}) {
  return {
    ok: true,
    access_token: "xoxb-BOT-TOKEN",
    token_type: "bot",
    scope: "channels:history,chat:write,users:read,users:read.email",
    bot_user_id: "U0BOTUSER",
    team: { id: "T0TEAM", name: "Acme Workspace" },
    authed_user: {
      id: "U0INSTALLER",
      access_token: "xoxp-USER-TOKEN",
    },
    ...overrides,
  };
}

function usersInfoBody(email: string | null | undefined) {
  return {
    ok: true,
    user: {
      id: "U0INSTALLER",
      profile: email !== undefined ? { email } : {},
    },
  };
}

const env = process.env as Record<string, string | undefined>;
const ORIG_CLIENT_ID = env.SLACK_CLIENT_ID;
const ORIG_CLIENT_SECRET = env.SLACK_CLIENT_SECRET;
const ORIG_REDIRECT_URI = env.SLACK_OAUTH_REDIRECT_URI;

beforeEach(() => {
  mockedFetch.mockReset();
  env.SLACK_CLIENT_ID = "test-slack-client-id";
  env.SLACK_CLIENT_SECRET = "test-slack-client-secret";
  env.SLACK_OAUTH_REDIRECT_URI =
    "http://localhost:3001/api/integrations/slack/oauth/callback";
});

afterEach(() => {
  env.SLACK_CLIENT_ID = ORIG_CLIENT_ID;
  env.SLACK_CLIENT_SECRET = ORIG_CLIENT_SECRET;
  env.SLACK_OAUTH_REDIRECT_URI = ORIG_REDIRECT_URI;
});

describe("exchangeSlackCodeForTokens", () => {
  it("happy path: ok:true → returns botToken/botUserId/teamId/teamName/scopes and resolves selfEmail via users.info", async () => {
    mockedFetch
      // 1st call: oauth.v2.access
      .mockResolvedValueOnce(mockResponse(oauthAccessBody()))
      // 2nd call: users.info
      .mockResolvedValueOnce(
        mockResponse(usersInfoBody("installer@acme.com"))
      );

    const result = await exchangeSlackCodeForTokens("the-auth-code");

    expect(result).toEqual({
      botToken: "xoxb-BOT-TOKEN",
      botUserId: "U0BOTUSER",
      teamId: "T0TEAM",
      teamName: "Acme Workspace",
      scopes: "channels:history,chat:write,users:read,users:read.email",
      selfEmail: "installer@acme.com",
    });

    expect(mockedFetch).toHaveBeenCalledTimes(2);
    expect(String(mockedFetch.mock.calls[0]?.[0])).toBe(
      "https://slack.com/api/oauth.v2.access"
    );
    expect(mockedFetch.mock.calls[0]?.[1]?.method).toBe("POST");
    expect(String(mockedFetch.mock.calls[1]?.[0])).toBe(
      "https://slack.com/api/users.info?user=U0INSTALLER"
    );
    const usersInfoHeaders = mockedFetch.mock.calls[1]?.[1]?.headers as
      | Record<string, string>
      | undefined;
    expect(usersInfoHeaders?.Authorization).toBe("Bearer xoxb-BOT-TOKEN");
  });

  it("REGRESSION: botToken is the TOP-LEVEL access_token, never authed_user.access_token (the user token)", async () => {
    mockedFetch
      .mockResolvedValueOnce(
        mockResponse(
          oauthAccessBody({
            access_token: "xoxb-CORRECT-BOT",
            authed_user: {
              id: "U0INSTALLER",
              access_token: "xoxp-WRONG-USER-TOKEN",
            },
          })
        )
      )
      .mockResolvedValueOnce(mockResponse(usersInfoBody("a@b.com")));

    const result = await exchangeSlackCodeForTokens("code");

    expect(result.botToken).toBe("xoxb-CORRECT-BOT");
    expect(result.botToken).not.toBe("xoxp-WRONG-USER-TOKEN");
    expect(Object.values(result)).not.toContain("xoxp-WRONG-USER-TOKEN");
  });

  it("ok:false body (HTTP 200) → throws ExternalServiceError carrying the slack error code", async () => {
    mockedFetch.mockResolvedValueOnce(
      mockResponse({ ok: false, error: "invalid_code" }, { ok: true, status: 200 })
    );

    let caught: unknown;
    try {
      await exchangeSlackCodeForTokens("stale-code");
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeInstanceOf(ExternalServiceError);
    expect((caught as Error).message).toContain("invalid_code");
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });

  it("HTTP non-200 → throws ExternalServiceError (transport failure)", async () => {
    mockedFetch.mockResolvedValueOnce(
      mockResponse({}, { ok: false, status: 502 })
    );

    let caught: unknown;
    try {
      await exchangeSlackCodeForTokens("code");
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeInstanceOf(ExternalServiceError);
    expect((caught as Error).message).toMatch(/HTTP error: 502/);
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });

  it("users.info fails (HTTP error) → selfEmail null, the rest of the result still returned (best-effort)", async () => {
    mockedFetch
      .mockResolvedValueOnce(mockResponse(oauthAccessBody()))
      .mockResolvedValueOnce(mockResponse({}, { ok: false, status: 500 }));

    const result = await exchangeSlackCodeForTokens("code");

    expect(result.selfEmail).toBeNull();
    expect(result.botToken).toBe("xoxb-BOT-TOKEN");
    expect(result.botUserId).toBe("U0BOTUSER");
    expect(result.teamId).toBe("T0TEAM");
  });

  it("users.info returns no email (profile present, email absent) → selfEmail null", async () => {
    mockedFetch
      .mockResolvedValueOnce(mockResponse(oauthAccessBody()))
      .mockResolvedValueOnce(mockResponse(usersInfoBody(undefined)));

    const result = await exchangeSlackCodeForTokens("code");

    expect(result.selfEmail).toBeNull();
    expect(result.botToken).toBe("xoxb-BOT-TOKEN");
  });

  it("users.info returns ok:false → selfEmail null (best-effort, still returns)", async () => {
    mockedFetch
      .mockResolvedValueOnce(mockResponse(oauthAccessBody()))
      .mockResolvedValueOnce(
        mockResponse({ ok: false, error: "missing_scope" })
      );

    const result = await exchangeSlackCodeForTokens("code");

    expect(result.selfEmail).toBeNull();
    expect(result.botToken).toBe("xoxb-BOT-TOKEN");
  });

  it("missing env var → throws a clear error before any network call", async () => {
    delete env.SLACK_CLIENT_SECRET;

    let caught: unknown;
    try {
      await exchangeSlackCodeForTokens("code");
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeInstanceOf(ExternalServiceError);
    expect((caught as Error).message).toMatch(/env vars are not configured/);
    expect(mockedFetch).not.toHaveBeenCalled();
  });
});
