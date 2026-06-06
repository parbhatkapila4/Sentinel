import { describe, it, expect, vi, afterEach } from "vitest";
import {
  buildGoogleAuthUrl,
  exchangeCodeForTokens,
  fetchGoogleUserInfo,
  generateOAuthState,
  GoogleOAuthHttpError,
  parseStateCookie,
  serializeStateCookie,
} from "@/lib/google-oauth";

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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("buildGoogleAuthUrl", () => {
  it("produces a fully-formed Google auth URL with every required param", async () => {
    const url = buildGoogleAuthUrl({
      clientId: "client-abc",
      redirectUri: "http://localhost:3001/api/oauth/gmail/callback",
      scopes: [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
        "openid",
      ],
      state: "state-xyz",
    });

    const parsed = new URL(url);
    expect(parsed.host).toBe("accounts.google.com");
    expect(parsed.pathname).toBe("/o/oauth2/v2/auth");
    expect(parsed.searchParams.get("client_id")).toBe("client-abc");
    expect(parsed.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3001/api/oauth/gmail/callback"
    );
    expect(parsed.searchParams.get("response_type")).toBe("code");
    expect(parsed.searchParams.get("access_type")).toBe("offline");
    expect(parsed.searchParams.get("prompt")).toBe("consent");
    expect(parsed.searchParams.get("include_granted_scopes")).toBe("true");
    expect(parsed.searchParams.get("state")).toBe("state-xyz");

    const scope = parsed.searchParams.get("scope") ?? "";
    expect(scope.split(" ")).toEqual([
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      "openid",
    ]);
  });
});

describe("generateOAuthState", () => {
  it("returns a 64-character hex string (256 bits)", () => {
    const a = generateOAuthState();
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(generateOAuthState()).not.toBe(a);
  });
});

describe("serializeStateCookie / parseStateCookie roundtrip", () => {
  it("roundtrips a well-formed payload", () => {
    const payload = { state: "abc123", userId: "user-1" };
    const cookie = serializeStateCookie(payload);
    expect(parseStateCookie(cookie)).toEqual(payload);
  });

  it("returns null for every malformed-input shape (does not throw)", () => {
    expect(parseStateCookie(undefined)).toBeNull();
    expect(parseStateCookie("")).toBeNull();
    expect(parseStateCookie("not-json")).toBeNull();
    expect(parseStateCookie("null")).toBeNull();
    expect(parseStateCookie('"a string"')).toBeNull();
    expect(parseStateCookie("{}")).toBeNull();
    expect(parseStateCookie('{"state":"abc"}')).toBeNull();
    expect(parseStateCookie('{"userId":"user-1"}')).toBeNull();
    expect(parseStateCookie('{"state":123,"userId":"user-1"}')).toBeNull();
    expect(parseStateCookie('{"state":"","userId":"user-1"}')).toBeNull();
    expect(parseStateCookie('{"state":"abc","userId":""}')).toBeNull();
  });
});

describe("exchangeCodeForTokens", () => {
  it("throws GoogleOAuthHttpError on non-200 (carrying the status for structured logs)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockJsonResponse({}, { ok: false, status: 400 }))
    );

    let caught: unknown;
    try {
      await exchangeCodeForTokens({
        code: "bad-code",
        clientId: "cid",
        clientSecret: "secret",
        redirectUri: "http://localhost/cb",
      });
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeInstanceOf(GoogleOAuthHttpError);
    expect((caught as GoogleOAuthHttpError).status).toBe(400);
    expect((caught as GoogleOAuthHttpError).step).toBe("token_exchange");
  });

  it("throws when the 200 response lacks access_token (treats as unusable)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        mockJsonResponse({
          refresh_token: "r",
          expires_in: 3599,
          scope: "s",
          token_type: "Bearer",
        })
      )
    );

    await expect(
      exchangeCodeForTokens({
        code: "c",
        clientId: "cid",
        clientSecret: "secret",
        redirectUri: "http://localhost/cb",
      })
    ).rejects.toBeInstanceOf(GoogleOAuthHttpError);
  });
});

describe("fetchGoogleUserInfo", () => {
  it("throws GoogleOAuthHttpError on non-200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockJsonResponse({}, { ok: false, status: 401 }))
    );

    let caught: unknown;
    try {
      await fetchGoogleUserInfo("expired-token");
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeInstanceOf(GoogleOAuthHttpError);
    expect((caught as GoogleOAuthHttpError).status).toBe(401);
    expect((caught as GoogleOAuthHttpError).step).toBe("userinfo");
  });

  it("returns the parsed body on 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        mockJsonResponse({
          email: "alice@example.com",
          verified_email: true,
          id: "g-1",
        })
      )
    );

    const result = await fetchGoogleUserInfo("good-token");
    expect(result.email).toBe("alice@example.com");
  });
});
