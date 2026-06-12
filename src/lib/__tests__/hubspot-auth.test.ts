import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { prismaMock, resetPrismaMock } from "@/test/mocks/prisma";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/integration-secrets", () => ({
  encryptIntegrationSecret: vi.fn((v: string) => `ENC:${v}`),
  decryptIntegrationSecret: vi.fn((v: string) =>
    v.startsWith("ENC:") ? v.slice(4) : v
  ),
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
vi.mock("@/lib/reliable-fetch", () => ({
  fetchWithTimeout: vi.fn(),
}));

import {
  exchangeCodeForTokens,
  getHubSpotAccessToken,
  refreshOAuthTokens,
} from "@/lib/hubspot-auth";
import { ExternalServiceError, RetryableError } from "@/lib/errors";
import { fetchWithTimeout } from "@/lib/reliable-fetch";
import { incrementMetric } from "@/lib/metrics";

const mockedFetch = vi.mocked(fetchWithTimeout);
const mockedIncrement = vi.mocked(incrementMetric);

const USER_ID = "user-hubspot-1";

function mockResponse(
  body: unknown,
  init: { ok?: boolean; status?: number; text?: string } = {}
): Response {
  const ok = init.ok ?? true;
  const status = init.status ?? (ok ? 200 : 400);
  const textValue = init.text ?? JSON.stringify(body);
  return {
    ok,
    status,
    json: async () => body,
    text: async () => textValue,
  } as unknown as Response;
}

function apiKeyIntegration(overrides: Record<string, unknown> = {}) {
  return {
    id: "hs-int-1",
    userId: USER_ID,
    apiKey: "ENC:legacy-api-key-plaintext",
    authMethod: "api_key",
    accessToken: null,
    refreshToken: null,
    tokenExpiresAt: null,
    scopes: null,
    portalId: "12345",
    isActive: true,
    syncEnabled: true,
    lastSyncAt: null,
    lastSyncStatus: null,
    syncErrors: null,
    totalSynced: 0,
    lastContactsSyncedAt: null,
    totalContactsSynced: 0,
    rotatedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function oauthIntegration(overrides: Record<string, unknown> = {}) {
  return {
    ...apiKeyIntegration({
      apiKey: null,
      authMethod: "oauth",
      accessToken: "ENC:current-access-token",
      refreshToken: "ENC:current-refresh-token",
      tokenExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // +2h
      scopes: "crm.objects.contacts.read crm.objects.deals.read",
    }),
    ...overrides,
  };
}

const env = process.env as Record<string, string | undefined>;
const ORIG_CLIENT_ID = env.HUBSPOT_OAUTH_CLIENT_ID;
const ORIG_CLIENT_SECRET = env.HUBSPOT_OAUTH_CLIENT_SECRET;
const ORIG_REDIRECT_URI = env.HUBSPOT_OAUTH_REDIRECT_URI;

beforeEach(() => {
  resetPrismaMock();
  mockedFetch.mockReset();
  mockedIncrement.mockReset();
  env.HUBSPOT_OAUTH_CLIENT_ID = "test-client-id";
  env.HUBSPOT_OAUTH_CLIENT_SECRET = "test-client-secret";
  env.HUBSPOT_OAUTH_REDIRECT_URI =
    "http://localhost:3001/api/oauth/hubspot/callback";
});

afterEach(() => {
  env.HUBSPOT_OAUTH_CLIENT_ID = ORIG_CLIENT_ID;
  env.HUBSPOT_OAUTH_CLIENT_SECRET = ORIG_CLIENT_SECRET;
  env.HUBSPOT_OAUTH_REDIRECT_URI = ORIG_REDIRECT_URI;
});

describe("getHubSpotAccessToken - entry point", () => {
  it("throws ExternalServiceError when no integration row exists for the user", async () => {
    prismaMock.hubSpotIntegration.findUnique.mockResolvedValue(null);

    await expect(getHubSpotAccessToken(USER_ID)).rejects.toBeInstanceOf(
      ExternalServiceError
    );
    await expect(getHubSpotAccessToken(USER_ID)).rejects.toThrow(
      /No HubSpot integration found/
    );
  });

  it("throws when the integration row exists but isActive=false", async () => {
    prismaMock.hubSpotIntegration.findUnique.mockResolvedValue(
      apiKeyIntegration({ isActive: false }) as never
    );

    await expect(getHubSpotAccessToken(USER_ID)).rejects.toThrow(
      /integration is disabled/
    );
  });

  it("api_key path: returns the decrypted apiKey and emits the api_key metric", async () => {
    prismaMock.hubSpotIntegration.findUnique.mockResolvedValue(
      apiKeyIntegration() as never
    );

    const token = await getHubSpotAccessToken(USER_ID);

    expect(token).toBe("legacy-api-key-plaintext");
    expect(mockedIncrement).toHaveBeenCalledWith(
      "hubspot.oauth.token_resolved.api_key",
      1
    );
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it("api_key path with null apiKey throws a data-integrity error", async () => {
    prismaMock.hubSpotIntegration.findUnique.mockResolvedValue(
      apiKeyIntegration({ apiKey: null }) as never
    );

    await expect(getHubSpotAccessToken(USER_ID)).rejects.toThrow(
      /data integrity violation/
    );
  });

  it("oauth path: token still valid (expiresAt well beyond 60s) returns cached, fetch NOT called", async () => {
    prismaMock.hubSpotIntegration.findUnique.mockResolvedValue(
      oauthIntegration() as never
    );

    const token = await getHubSpotAccessToken(USER_ID);

    expect(token).toBe("current-access-token");
    expect(mockedFetch).not.toHaveBeenCalled();
    expect(mockedIncrement).toHaveBeenCalledWith(
      "hubspot.oauth.token_resolved.oauth_cached",
      1
    );
  });

  it("oauth path: token expiring within 60s triggers a refresh and returns the new token", async () => {
    prismaMock.hubSpotIntegration.findUnique.mockResolvedValue(
      oauthIntegration({
        tokenExpiresAt: new Date(Date.now() + 30_000),
      }) as never
    );
    prismaMock.hubSpotIntegration.update.mockResolvedValue({} as never);
    mockedFetch.mockResolvedValueOnce(
      mockResponse({
        access_token: "freshly-minted-access",
        refresh_token: "freshly-minted-refresh",
        expires_in: 3600,
      })
    );

    const token = await getHubSpotAccessToken(USER_ID);

    expect(token).toBe("freshly-minted-access");
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedIncrement).toHaveBeenCalledWith(
      "hubspot.oauth.token_resolved.oauth_refreshed",
      1
    );
    expect(mockedIncrement).toHaveBeenCalledWith(
      "hubspot.oauth.refresh.success",
      1
    );
  });
});

describe("refreshOAuthTokens", () => {
  it("success: persists access + refresh + expiry + heals isActive/syncErrors in ONE atomic update", async () => {
    prismaMock.hubSpotIntegration.findUnique.mockResolvedValue(
      oauthIntegration({
        isActive: true,
        syncErrors: "old transient error",
      }) as never
    );
    prismaMock.hubSpotIntegration.update.mockResolvedValue({} as never);
    mockedFetch.mockResolvedValueOnce(
      mockResponse({
        access_token: "new-access-token",
        refresh_token: "new-rotated-refresh-token",
        expires_in: 3600,
      })
    );

    const before = Date.now();
    const result = await refreshOAuthTokens(USER_ID);
    const after = Date.now();

    expect(result).toBe("new-access-token");

    expect(prismaMock.hubSpotIntegration.update).toHaveBeenCalledTimes(1);
    const updateArg =
      prismaMock.hubSpotIntegration.update.mock.calls[0]?.[0];
    expect(updateArg?.where).toEqual({ userId: USER_ID });
    expect(updateArg?.data).toMatchObject({
      accessToken: "ENC:new-access-token",
      refreshToken: "ENC:new-rotated-refresh-token",
      isActive: true,
      syncErrors: null,
    });
    const expiry = updateArg?.data?.tokenExpiresAt as Date;
    expect(expiry).toBeInstanceOf(Date);
    expect(expiry.getTime()).toBeGreaterThanOrEqual(before + 3600_000 - 5000);
    expect(expiry.getTime()).toBeLessThanOrEqual(after + 3600_000 + 5000);
  });

  it("400 invalid_grant: marks isActive=false with a re-connect message and throws ExternalServiceError", async () => {
    prismaMock.hubSpotIntegration.findUnique.mockResolvedValue(
      oauthIntegration() as never
    );
    prismaMock.hubSpotIntegration.update.mockResolvedValue({} as never);
    mockedFetch.mockResolvedValueOnce(
      mockResponse(
        { status: "BAD_REFRESH_TOKEN", message: "refresh_token expired" },
        { ok: false, status: 400 }
      )
    );

    await expect(refreshOAuthTokens(USER_ID)).rejects.toBeInstanceOf(
      ExternalServiceError
    );

    expect(prismaMock.hubSpotIntegration.update).toHaveBeenCalledTimes(1);
    const data = prismaMock.hubSpotIntegration.update.mock.calls[0]?.[0]
      ?.data as { isActive?: boolean; syncErrors?: string };
    expect(data.isActive).toBe(false);
    expect(data.syncErrors).toMatch(/re-connect/i);
    expect(mockedIncrement).toHaveBeenCalledWith(
      "hubspot.oauth.refresh.invalid_grant",
      1
    );
  });

  it("5xx transient: throws RetryableError and does NOT disable the integration", async () => {
    prismaMock.hubSpotIntegration.findUnique.mockResolvedValue(
      oauthIntegration() as never
    );
    mockedFetch.mockResolvedValueOnce(
      mockResponse({}, { ok: false, status: 503 })
    );

    await expect(refreshOAuthTokens(USER_ID)).rejects.toBeInstanceOf(
      RetryableError
    );

    expect(prismaMock.hubSpotIntegration.update).not.toHaveBeenCalled();
    expect(mockedIncrement).toHaveBeenCalledWith(
      "hubspot.oauth.refresh.transient_error",
      1
    );
  });

  it("single-flight: two parallel refresh calls for the same userId share one fetch and return the same value", async () => {
    prismaMock.hubSpotIntegration.findUnique.mockResolvedValue(
      oauthIntegration() as never
    );
    prismaMock.hubSpotIntegration.update.mockResolvedValue({} as never);

    let resolveFetch!: (value: Response) => void;
    const deferred = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    mockedFetch.mockReturnValueOnce(deferred);

    const p1 = refreshOAuthTokens(USER_ID);
    const p2 = refreshOAuthTokens(USER_ID);

    resolveFetch(
      mockResponse({
        access_token: "single-flight-access",
        refresh_token: "single-flight-refresh",
        expires_in: 3600,
      })
    );

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBe("single-flight-access");
    expect(r2).toBe("single-flight-access");

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(prismaMock.hubSpotIntegration.update).toHaveBeenCalledTimes(1);
  });
});

describe("exchangeCodeForTokens", () => {
  it("success: returns access/refresh/expiresIn plus scopes parsed from the introspection call", async () => {
    mockedFetch
      .mockResolvedValueOnce(
        mockResponse({
          access_token: "exchange-access",
          refresh_token: "exchange-refresh",
          expires_in: 3600,
        })
      )
      .mockResolvedValueOnce(
        mockResponse({
          scopes: ["crm.objects.contacts.read", "crm.objects.deals.read"],
          hub_id: 99999,
          user_id: 12345,
        })
      );

    const result = await exchangeCodeForTokens("one-time-code-abc");

    expect(result).toEqual({
      accessToken: "exchange-access",
      refreshToken: "exchange-refresh",
      expiresIn: 3600,
      scopes: ["crm.objects.contacts.read", "crm.objects.deals.read"],
      hubId: "99999",
    });

    expect(mockedFetch).toHaveBeenCalledTimes(2);
    expect(String(mockedFetch.mock.calls[0]?.[0])).toBe(
      "https://api.hubapi.com/oauth/v1/token"
    );
    expect(String(mockedFetch.mock.calls[1]?.[0])).toBe(
      "https://api.hubapi.com/oauth/v1/access-tokens/exchange-access"
    );
  });

  it("400 from /oauth/v1/token throws ExternalServiceError with the body truncated to ≤200 chars", async () => {
    const longBody = "x".repeat(500);
    mockedFetch.mockResolvedValueOnce(
      mockResponse(null, { ok: false, status: 400, text: longBody })
    );

    let caught: unknown;
    try {
      await exchangeCodeForTokens("bad-code");
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeInstanceOf(ExternalServiceError);
    const message = (caught as Error).message;
    expect(message).toContain("…");
    expect(message.length).toBeLessThan(longBody.length);
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });
});
