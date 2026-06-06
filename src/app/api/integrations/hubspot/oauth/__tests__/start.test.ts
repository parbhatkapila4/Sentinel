import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  getAuthenticatedUserId: vi.fn(),
}));
vi.mock("@/lib/metrics", () => ({
  incrementMetric: vi.fn(),
}));

import * as startRoute from "@/app/api/integrations/hubspot/oauth/start/route";
import { GET } from "@/app/api/integrations/hubspot/oauth/start/route";
import { getAuthenticatedUserId } from "@/lib/auth";
import { incrementMetric } from "@/lib/metrics";
import { verifyCookieValue } from "@/lib/signed-cookies";

const mockedAuth = vi.mocked(getAuthenticatedUserId);
const mockedIncrement = vi.mocked(incrementMetric);

const env = process.env as Record<string, string | undefined>;
const ORIG_CLIENT_ID = env.HUBSPOT_OAUTH_CLIENT_ID;
const ORIG_REDIRECT_URI = env.HUBSPOT_OAUTH_REDIRECT_URI;
const ORIG_ENC_KEY = env.INTEGRATION_ENCRYPTION_KEY;

beforeEach(() => {
  env.HUBSPOT_OAUTH_CLIENT_ID = "test-hs-client-id";
  env.HUBSPOT_OAUTH_REDIRECT_URI =
    "http://localhost:3001/api/integrations/hubspot/oauth/callback";
  env.INTEGRATION_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
  mockedAuth.mockReset();
  mockedIncrement.mockReset();
});

afterEach(() => {
  env.HUBSPOT_OAUTH_CLIENT_ID = ORIG_CLIENT_ID;
  env.HUBSPOT_OAUTH_REDIRECT_URI = ORIG_REDIRECT_URI;
  env.INTEGRATION_ENCRYPTION_KEY = ORIG_ENC_KEY;
});

function parseSetCookie(
  header: string,
  cookieName: string
): {
  value: string;
  attrs: Record<string, string | true>;
} | null {
  const cookies = header.split(/,(?=\s*[A-Za-z0-9_-]+=)/);
  for (const c of cookies) {
    const parts = c.split(";").map((p) => p.trim());
    if (parts.length === 0) continue;
    const first = parts[0];
    const eqIdx = first.indexOf("=");
    if (eqIdx === -1) continue;
    const name = first.slice(0, eqIdx);
    if (name !== cookieName) continue;
    const value = first.slice(eqIdx + 1);
    const attrs: Record<string, string | true> = {};
    for (let i = 1; i < parts.length; i++) {
      const p = parts[i];
      const e = p.indexOf("=");
      if (e === -1) attrs[p.toLowerCase()] = true;
      else attrs[p.slice(0, e).toLowerCase()] = p.slice(e + 1);
    }
    return { value, attrs };
  }
  return null;
}

describe("GET /api/integrations/hubspot/oauth/start", () => {
  it("returns 401 when the request is unauthenticated", async () => {
    mockedAuth.mockRejectedValue(new Error("no session"));

    const res = await GET();

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "unauthorized" });
  });

  it("only exports GET — POST and other methods fall through to Next.js's automatic 405", () => {
    expect(typeof (startRoute as { GET?: unknown }).GET).toBe("function");
    expect("POST" in startRoute).toBe(false);
    expect("PUT" in startRoute).toBe(false);
    expect("DELETE" in startRoute).toBe(false);
    expect("PATCH" in startRoute).toBe(false);
  });

  it("authenticated GET redirects to app.hubspot.com/oauth/authorize with all required query params", async () => {
    mockedAuth.mockResolvedValue("user-1");

    const res = await GET();

    expect(res.status).toBe(307);
    const url = new URL(res.headers.get("location")!);
    expect(url.host).toBe("app.hubspot.com");
    expect(url.pathname).toBe("/oauth/authorize");
    expect(url.searchParams.get("client_id")).toBe("test-hs-client-id");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3001/api/integrations/hubspot/oauth/callback"
    );
    expect(url.searchParams.get("state")).toBeTruthy();

    const scope = url.searchParams.get("scope") ?? "";
    const scopes = scope.split(" ");
    expect(scopes).toEqual(
      expect.arrayContaining([
        "crm.objects.contacts.read",
        "crm.objects.deals.read",
        "crm.objects.companies.read",
        "crm.schemas.contacts.read",
        "crm.schemas.deals.read",
        "crm.schemas.companies.read",
      ])
    );
    expect(scopes).not.toContain("oauth");

    expect(mockedIncrement).toHaveBeenCalledWith(
      "hubspot.oauth.start.initiated",
      1
    );
  });

  it("sets hubspot_oauth_state cookie with httpOnly + sameSite=lax + 10-min maxAge + correct path", async () => {
    mockedAuth.mockResolvedValue("user-1");

    const res = await GET();
    const setCookie = res.headers.get("set-cookie")!;
    const parsed = parseSetCookie(setCookie, "hubspot_oauth_state");

    expect(parsed).not.toBeNull();
    expect(parsed!.attrs.httponly).toBe(true);
    expect(
      String(parsed!.attrs.samesite).toLowerCase()
    ).toBe("lax");
    expect(parsed!.attrs.path).toBe("/api/integrations/hubspot/oauth");
    expect(parsed!.attrs["max-age"]).toBe(String(60 * 10));
  });

  it("state token in the cookie payload matches the state query param on the redirect URL", async () => {
    mockedAuth.mockResolvedValue("user-1");

    const res = await GET();
    const url = new URL(res.headers.get("location")!);
    const stateInUrl = url.searchParams.get("state");

    const setCookie = res.headers.get("set-cookie")!;
    const parsed = parseSetCookie(setCookie, "hubspot_oauth_state");
    const payload = verifyCookieValue<{ state: string; userId: string }>(
      parsed!.value
    );

    expect(payload).not.toBeNull();
    expect(payload!.state).toBe(stateInUrl);
    expect(payload!.userId).toBe("user-1");
  });
});
