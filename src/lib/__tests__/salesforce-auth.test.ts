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
vi.mock("@/lib/circuit-breaker", () => ({
  withCircuitBreaker: vi.fn(async (_service: string, fn: () => unknown) =>
    fn()
  ),
}));
vi.mock("@/lib/retry", () => ({
  retryWithBackoff: vi.fn(async (fn: () => unknown) => fn()),
}));

import {
  exchangeSalesforceCodeForTokens,
  getSalesforceAccessToken,
  refreshSalesforceOAuthToken,
} from "@/lib/salesforce";
import { ExternalServiceError, RetryableError } from "@/lib/errors";
import { fetchWithTimeout } from "@/lib/reliable-fetch";
import { incrementMetric } from "@/lib/metrics";

const mockedFetch = vi.mocked(fetchWithTimeout);
const mockedIncrement = vi.mocked(incrementMetric);

const USER_ID = "user-salesforce-1";
const INSTANCE_URL = "https://test.my.salesforce.com";

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

function ccIntegration(overrides: Record<string, unknown> = {}) {
  return {
    id: "sf-int-1",
    userId: USER_ID,
    consumerKey: "ENC:consumer-key-plain",
    consumerSecret: "ENC:consumer-secret-plain",
    authMethod: "client_credentials",
    accessToken: "ENC:cached-access-token",
    accessTokenExpiresAt: new Date(Date.now() + 90 * 60 * 1000), // +90m
    refreshToken: null,
    scopes: null,
    instanceUrl: INSTANCE_URL,
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
  return ccIntegration({
    consumerKey: null,
    consumerSecret: null,
    authMethod: "oauth",
    accessToken: "ENC:oauth-access-current",
    refreshToken: "ENC:oauth-refresh-stored",
    scopes: "api refresh_token offline_access",
    accessTokenExpiresAt: new Date(Date.now() + 90 * 60 * 1000), // +90m
    ...overrides,
  });
}

const env = process.env as Record<string, string | undefined>;
const ORIG_CLIENT_ID = env.SALESFORCE_OAUTH_CLIENT_ID;
const ORIG_CLIENT_SECRET = env.SALESFORCE_OAUTH_CLIENT_SECRET;
const ORIG_REDIRECT_URI = env.SALESFORCE_OAUTH_REDIRECT_URI;

beforeEach(() => {
  resetPrismaMock();
  mockedFetch.mockReset();
  mockedIncrement.mockReset();
  env.SALESFORCE_OAUTH_CLIENT_ID = "test-sf-client-id";
  env.SALESFORCE_OAUTH_CLIENT_SECRET = "test-sf-client-secret";
  env.SALESFORCE_OAUTH_REDIRECT_URI =
    "http://localhost:3001/api/oauth/salesforce/callback";
});

afterEach(() => {
  env.SALESFORCE_OAUTH_CLIENT_ID = ORIG_CLIENT_ID;
  env.SALESFORCE_OAUTH_CLIENT_SECRET = ORIG_CLIENT_SECRET;
  env.SALESFORCE_OAUTH_REDIRECT_URI = ORIG_REDIRECT_URI;
});

describe("getSalesforceAccessToken — client_credentials branch", () => {
  it("valid cached token → returns decrypted token, no fetch, single client_credentials metric", async () => {
    const token = await getSalesforceAccessToken(ccIntegration() as never);

    expect(token).toBe("cached-access-token");
    expect(mockedFetch).not.toHaveBeenCalled();
    expect(prismaMock.salesforceIntegration.update).not.toHaveBeenCalled();
    expect(mockedIncrement).toHaveBeenCalledWith(
      "salesforce.token_resolved.client_credentials",
      1
    );
  });

  it("null consumerKey on a client_credentials row throws a data-integrity error before any fetch", async () => {
    const bad = ccIntegration({
      consumerKey: null,
      accessToken: null,
      accessTokenExpiresAt: null,
    });

    await expect(
      getSalesforceAccessToken(bad as never)
    ).rejects.toBeInstanceOf(ExternalServiceError);
    await expect(getSalesforceAccessToken(bad as never)).rejects.toThrow(
      /data integrity violation/
    );
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it("expired cached token → mints a new client_credentials token and persists encrypted (legacy path preserved)", async () => {
    const integration = ccIntegration({
      accessToken: "ENC:stale",
      accessTokenExpiresAt: new Date(Date.now() - 1000),
    });
    prismaMock.salesforceIntegration.update.mockResolvedValue({} as never);
    mockedFetch.mockResolvedValueOnce(
      mockResponse({
        access_token: "fresh-cc-token",
        instance_url: INSTANCE_URL,
      })
    );

    const token = await getSalesforceAccessToken(integration as never);

    expect(token).toBe("fresh-cc-token");
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(String(mockedFetch.mock.calls[0]?.[0])).toBe(
      `${INSTANCE_URL}/services/oauth2/token`
    );
    expect(prismaMock.salesforceIntegration.update).toHaveBeenCalledTimes(1);
    const updateArg =
      prismaMock.salesforceIntegration.update.mock.calls[0]?.[0];
    expect(updateArg?.where).toEqual({ id: "sf-int-1" });
    expect(updateArg?.data).toMatchObject({
      accessToken: "ENC:fresh-cc-token",
    });
    expect(updateArg?.data?.accessTokenExpiresAt).toBeInstanceOf(Date);
  });
});

describe("getSalesforceAccessToken — oauth branch", () => {
  it("valid cached oauth token → returns cached, no fetch, oauth_cached metric", async () => {
    const token = await getSalesforceAccessToken(
      oauthIntegration() as never
    );

    expect(token).toBe("oauth-access-current");
    expect(mockedFetch).not.toHaveBeenCalled();
    expect(prismaMock.salesforceIntegration.update).not.toHaveBeenCalled();
    expect(mockedIncrement).toHaveBeenCalledWith(
      "salesforce.token_resolved.oauth_cached",
      1
    );
  });

  it("expired oauth token → triggers refresh and returns the refreshed token", async () => {
    const integration = oauthIntegration({
      accessTokenExpiresAt: new Date(Date.now() + 30_000),
    });
    prismaMock.salesforceIntegration.findUnique.mockResolvedValue(
      integration as never
    );
    prismaMock.salesforceIntegration.update.mockResolvedValue({} as never);
    mockedFetch.mockResolvedValueOnce(
      mockResponse({ access_token: "refreshed-oauth-token" })
    );

    const token = await getSalesforceAccessToken(integration as never);

    expect(token).toBe("refreshed-oauth-token");
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedIncrement).toHaveBeenCalledWith(
      "salesforce.token_resolved.oauth_refreshed",
      1
    );
    expect(mockedIncrement).toHaveBeenCalledWith(
      "salesforce.oauth.refresh.success",
      1
    );
  });

  it("oauth row with null refreshToken → throws 're-connect required' without any fetch", async () => {
    const integration = oauthIntegration({ refreshToken: null });

    await expect(
      getSalesforceAccessToken(integration as never)
    ).rejects.toThrow(/re-connect required/);
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it("unknown authMethod → throws ExternalServiceError", async () => {
    const integration = ccIntegration({ authMethod: "service_account" });

    await expect(
      getSalesforceAccessToken(integration as never)
    ).rejects.toBeInstanceOf(ExternalServiceError);
    await expect(getSalesforceAccessToken(integration as never)).rejects.toThrow(
      /Unknown authMethod: service_account/
    );
  });
});

describe("refreshSalesforceOAuthToken", () => {
  it("success: persists accessToken + expiry + heals isActive/syncErrors in ONE atomic update — does NOT write refreshToken", async () => {
    prismaMock.salesforceIntegration.findUnique.mockResolvedValue(
      oauthIntegration({
        isActive: true,
        syncErrors: "old transient error",
      }) as never
    );
    prismaMock.salesforceIntegration.update.mockResolvedValue({} as never);
    mockedFetch.mockResolvedValueOnce(
      mockResponse({
        access_token: "new-oauth-access",
      })
    );

    const before = Date.now();
    const result = await refreshSalesforceOAuthToken(USER_ID);
    const after = Date.now();

    expect(result).toBe("new-oauth-access");

    expect(prismaMock.salesforceIntegration.update).toHaveBeenCalledTimes(1);
    const updateArg =
      prismaMock.salesforceIntegration.update.mock.calls[0]?.[0];
    expect(updateArg?.where).toEqual({ userId: USER_ID });

    const data = updateArg?.data as Record<string, unknown>;
    expect(data.accessToken).toBe("ENC:new-oauth-access");
    expect(data.isActive).toBe(true);
    expect(data.syncErrors).toBeNull();

    expect(data).not.toHaveProperty("refreshToken");

    const expiry = data.accessTokenExpiresAt as Date;
    expect(expiry).toBeInstanceOf(Date);
    const expectedLifetime = 110 * 60 * 1000;
    expect(expiry.getTime()).toBeGreaterThanOrEqual(
      before + expectedLifetime - 5000
    );
    expect(expiry.getTime()).toBeLessThanOrEqual(after + expectedLifetime + 5000);
  });

  it("success WITH instance_url in response that differs → also updates instanceUrl (Salesforce-specific)", async () => {
    prismaMock.salesforceIntegration.findUnique.mockResolvedValue(
      oauthIntegration() as never
    );
    prismaMock.salesforceIntegration.update.mockResolvedValue({} as never);
    mockedFetch.mockResolvedValueOnce(
      mockResponse({
        access_token: "fresh-after-pod-migration",
        instance_url: "https://na123.my.salesforce.com",
      })
    );

    await refreshSalesforceOAuthToken(USER_ID);

    const data = prismaMock.salesforceIntegration.update.mock.calls[0]?.[0]
      ?.data as Record<string, unknown>;
    expect(data.instanceUrl).toBe("https://na123.my.salesforce.com");
  });

  it("success withOUT instance_url → leaves instanceUrl untouched", async () => {
    prismaMock.salesforceIntegration.findUnique.mockResolvedValue(
      oauthIntegration() as never
    );
    prismaMock.salesforceIntegration.update.mockResolvedValue({} as never);
    mockedFetch.mockResolvedValueOnce(
      mockResponse({ access_token: "fresh-no-instance" })
    );

    await refreshSalesforceOAuthToken(USER_ID);

    const data = prismaMock.salesforceIntegration.update.mock.calls[0]?.[0]
      ?.data as Record<string, unknown>;
    expect(data).not.toHaveProperty("instanceUrl");
  });

  it("success WITH instance_url that matches existing (after normalization) → skips the instanceUrl update", async () => {
    prismaMock.salesforceIntegration.findUnique.mockResolvedValue(
      oauthIntegration({ instanceUrl: INSTANCE_URL }) as never
    );
    prismaMock.salesforceIntegration.update.mockResolvedValue({} as never);
    mockedFetch.mockResolvedValueOnce(
      mockResponse({
        access_token: "fresh-same-instance",
        instance_url: `${INSTANCE_URL}/`,
      })
    );

    await refreshSalesforceOAuthToken(USER_ID);

    const data = prismaMock.salesforceIntegration.update.mock.calls[0]?.[0]
      ?.data as Record<string, unknown>;
    expect(data).not.toHaveProperty("instanceUrl");
  });

  it("400 invalid_grant: marks isActive=false with a re-connect message and throws ExternalServiceError", async () => {
    prismaMock.salesforceIntegration.findUnique.mockResolvedValue(
      oauthIntegration() as never
    );
    prismaMock.salesforceIntegration.update.mockResolvedValue({} as never);
    mockedFetch.mockResolvedValueOnce(
      mockResponse(
        { error: "invalid_grant", error_description: "expired access/refresh token" },
        { ok: false, status: 400 }
      )
    );

    await expect(refreshSalesforceOAuthToken(USER_ID)).rejects.toBeInstanceOf(
      ExternalServiceError
    );

    expect(prismaMock.salesforceIntegration.update).toHaveBeenCalledTimes(1);
    const data = prismaMock.salesforceIntegration.update.mock.calls[0]?.[0]
      ?.data as { isActive?: boolean; syncErrors?: string };
    expect(data.isActive).toBe(false);
    expect(data.syncErrors).toMatch(/re-connect/i);
    expect(mockedIncrement).toHaveBeenCalledWith(
      "salesforce.oauth.refresh.invalid_grant",
      1
    );
  });

  it("5xx transient: throws RetryableError and does NOT disable the integration", async () => {
    prismaMock.salesforceIntegration.findUnique.mockResolvedValue(
      oauthIntegration() as never
    );
    mockedFetch.mockResolvedValueOnce(
      mockResponse({}, { ok: false, status: 503 })
    );

    await expect(refreshSalesforceOAuthToken(USER_ID)).rejects.toBeInstanceOf(
      RetryableError
    );

    expect(prismaMock.salesforceIntegration.update).not.toHaveBeenCalled();
    expect(mockedIncrement).toHaveBeenCalledWith(
      "salesforce.oauth.refresh.transient_error",
      1
    );
  });

  it("single-flight: two parallel refresh calls for the same userId share ONE fetch and ONE persist", async () => {
    prismaMock.salesforceIntegration.findUnique.mockResolvedValue(
      oauthIntegration() as never
    );
    prismaMock.salesforceIntegration.update.mockResolvedValue({} as never);

    let resolveFetch!: (value: Response) => void;
    const deferred = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    mockedFetch.mockReturnValueOnce(deferred);

    const p1 = refreshSalesforceOAuthToken(USER_ID);
    const p2 = refreshSalesforceOAuthToken(USER_ID);

    resolveFetch(
      mockResponse({ access_token: "single-flight-sf-access" })
    );

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBe("single-flight-sf-access");
    expect(r2).toBe("single-flight-sf-access");

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(prismaMock.salesforceIntegration.update).toHaveBeenCalledTimes(1);
  });
});

describe("exchangeSalesforceCodeForTokens", () => {
  it("success: returns accessToken, refreshToken, instanceUrl (from response), scopes (split on whitespace)", async () => {
    mockedFetch.mockResolvedValueOnce(
      mockResponse({
        access_token: "exchange-access-token",
        refresh_token: "exchange-refresh-token",
        instance_url: "https://na55.my.salesforce.com",
        scope: "api refresh_token offline_access",
        id: "https://login.salesforce.com/id/00D.../005...",
      })
    );

    const result = await exchangeSalesforceCodeForTokens(
      "one-time-code-xyz",
      "https://login.salesforce.com"
    );

    expect(result).toEqual({
      accessToken: "exchange-access-token",
      refreshToken: "exchange-refresh-token",
      instanceUrl: "https://na55.my.salesforce.com",
      scopes: ["api", "refresh_token", "offline_access"],
    });
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(String(mockedFetch.mock.calls[0]?.[0])).toBe(
      "https://login.salesforce.com/services/oauth2/token"
    );
  });

  it("falls back to the callback instanceUrl when the response omits instance_url, and yields empty scopes when scope is missing", async () => {
    mockedFetch.mockResolvedValueOnce(
      mockResponse({
        access_token: "minimal-access",
        refresh_token: "minimal-refresh",
      })
    );

    const result = await exchangeSalesforceCodeForTokens(
      "code-abc",
      "https://test.salesforce.com/"
    );

    expect(result.instanceUrl).toBe("https://test.salesforce.com");
    expect(result.scopes).toEqual([]);
  });

  it("400: throws ExternalServiceError with the body truncated to ≤200 chars", async () => {
    const longBody = "y".repeat(500);
    mockedFetch.mockResolvedValueOnce(
      mockResponse(null, { ok: false, status: 400, text: longBody })
    );

    let caught: unknown;
    try {
      await exchangeSalesforceCodeForTokens(
        "bad-code",
        "https://login.salesforce.com"
      );
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeInstanceOf(ExternalServiceError);
    const message = (caught as Error).message;
    expect(message).toContain("…");
    expect(message.length).toBeLessThan(longBody.length);
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });

  it("does NOT touch the database (persistence is the callback's responsibility)", async () => {
    mockedFetch.mockResolvedValueOnce(
      mockResponse({
        access_token: "a",
        refresh_token: "r",
        instance_url: INSTANCE_URL,
        scope: "api",
      })
    );

    await exchangeSalesforceCodeForTokens(
      "code-abc",
      "https://login.salesforce.com"
    );

    expect(prismaMock.salesforceIntegration.update).not.toHaveBeenCalled();
    expect(prismaMock.salesforceIntegration.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.salesforceIntegration.create).not.toHaveBeenCalled();
  });
});
