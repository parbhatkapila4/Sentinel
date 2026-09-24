import crypto from "node:crypto";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
  const env = process.env as Record<string, string | undefined>;
  const ORIG_KEY = env.INTEGRATION_ENCRYPTION_KEY;

  beforeEach(() => {
    env.INTEGRATION_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
  });

  afterEach(() => {
    env.INTEGRATION_ENCRYPTION_KEY = ORIG_KEY;
  });

  function signedWith(key: Buffer, payload: unknown): string {
    const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString(
      "base64url"
    );
    const sig = crypto
      .createHmac("sha256", key)
      .update(payloadB64)
      .digest("base64url");
    return `${payloadB64}.${sig}`;
  }

  it("roundtrips a well-formed payload", () => {
    const payload = { state: "abc123", userId: "user-1" };
    const cookie = serializeStateCookie(payload);
    expect(parseStateCookie(cookie)).toEqual(payload);
  });

  it("emits a signed value, not bare JSON", () => {
    const cookie = serializeStateCookie({ state: "abc123", userId: "user-1" });
    expect(cookie).not.toContain("user-1");
    expect(cookie).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  it("rejects a payload whose userId was swapped after signing (tampering)", () => {
    const cookie = serializeStateCookie({ state: "abc123", userId: "victim" });
    const [, sig] = cookie.split(".");
    const forgedPayload = Buffer.from(
      JSON.stringify({ state: "abc123", userId: "attacker" }),
      "utf8"
    ).toString("base64url");

    expect(parseStateCookie(`${forgedPayload}.${sig}`)).toBeNull();
  });

  it("rejects a value signed with a different key", () => {
    const foreign = signedWith(Buffer.alloc(32, 9), {
      state: "abc123",
      userId: "user-1",
    });
    expect(parseStateCookie(foreign)).toBeNull();
  });

  it("rejects the pre-signing bare-JSON cookie format", () => {
    expect(parseStateCookie('{"state":"abc123","userId":"user-1"}')).toBeNull();
  });

  it("returns null for every malformed-input shape (does not throw)", () => {
    expect(parseStateCookie(undefined)).toBeNull();
    expect(parseStateCookie("")).toBeNull();
    expect(parseStateCookie("not-json")).toBeNull();
    expect(parseStateCookie("null")).toBeNull();
    expect(parseStateCookie('"a string"')).toBeNull();
    expect(parseStateCookie("{}")).toBeNull();
    expect(parseStateCookie("nodot")).toBeNull();
    expect(parseStateCookie(".onlysig")).toBeNull();
    expect(parseStateCookie("onlypayload.")).toBeNull();

    const key = Buffer.from(env.INTEGRATION_ENCRYPTION_KEY!, "base64");
    expect(parseStateCookie(signedWith(key, { state: "abc" }))).toBeNull();
    expect(parseStateCookie(signedWith(key, { userId: "user-1" }))).toBeNull();
    expect(
      parseStateCookie(signedWith(key, { state: 123, userId: "user-1" }))
    ).toBeNull();
    expect(
      parseStateCookie(signedWith(key, { state: "", userId: "user-1" }))
    ).toBeNull();
    expect(
      parseStateCookie(signedWith(key, { state: "abc", userId: "" }))
    ).toBeNull();
  });

  it("returns null instead of throwing when the signing key is unset", () => {
    const cookie = serializeStateCookie({ state: "abc123", userId: "user-1" });
    delete env.INTEGRATION_ENCRYPTION_KEY;
    expect(parseStateCookie(cookie)).toBeNull();
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
