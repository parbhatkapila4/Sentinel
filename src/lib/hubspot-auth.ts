import type { HubSpotIntegration } from "@prisma/client";

import { prisma } from "./prisma";
import {
  decryptIntegrationSecret,
  encryptIntegrationSecret,
} from "./integration-secrets";
import { ExternalServiceError, RetryableError } from "./errors";
import { logError } from "./logger";
import { fetchWithTimeout } from "./reliable-fetch";
import { incrementMetric } from "./metrics";
const HUBSPOT_TOKEN_URL = "https://api.hubapi.com/oauth/v1/token";
const HUBSPOT_ACCESS_TOKEN_INFO_URL = (token: string): string =>
  `https://api.hubapi.com/oauth/v1/access-tokens/${token}`;

const REFRESH_TIMEOUT_MS = 15_000;
const REFRESH_SAFETY_BUFFER_MS = 60_000;
const TRUNCATE_BODY_AT = 200;

function truncate(text: string): string {
  return text.length <= TRUNCATE_BODY_AT
    ? text
    : text.slice(0, TRUNCATE_BODY_AT) + "…";
}

function readOAuthEnv(): {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
} {
  const clientId = process.env.HUBSPOT_OAUTH_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.HUBSPOT_OAUTH_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new ExternalServiceError(
      "hubspot",
      "HubSpot OAuth env vars are not configured"
    );
  }
  return { clientId, clientSecret, redirectUri };
}

export async function getHubSpotAccessToken(userId: string): Promise<string> {
  const integration = await prisma.hubSpotIntegration.findUnique({
    where: { userId },
  });

  if (!integration) {
    throw new ExternalServiceError(
      "hubspot",
      "No HubSpot integration found for user"
    );
  }
  if (!integration.isActive) {
    throw new ExternalServiceError(
      "hubspot",
      "HubSpot integration is disabled"
    );
  }

  switch (integration.authMethod) {
    case "api_key": {
      if (!integration.apiKey) {
        throw new ExternalServiceError(
          "hubspot",
          "api_key integration has null apiKey — data integrity violation"
        );
      }
      void incrementMetric("hubspot.oauth.token_resolved.api_key", 1);
      return decryptIntegrationSecret(integration.apiKey);
    }
    case "oauth":
      return getValidOAuthAccessToken(integration);
    default:
      throw new ExternalServiceError(
        "hubspot",
        `Unknown authMethod: ${integration.authMethod}`
      );
  }
}

async function getValidOAuthAccessToken(
  integration: HubSpotIntegration
): Promise<string> {
  if (!integration.accessToken || !integration.tokenExpiresAt) {
    throw new ExternalServiceError(
      "hubspot",
      "OAuth integration is missing tokens - re-connect required"
    );
  }

  const needsRefresh =
    integration.tokenExpiresAt.getTime() <=
    Date.now() + REFRESH_SAFETY_BUFFER_MS;

  if (!needsRefresh) {
    void incrementMetric("hubspot.oauth.token_resolved.oauth_cached", 1);
    return decryptIntegrationSecret(integration.accessToken);
  }

  void incrementMetric("hubspot.oauth.token_resolved.oauth_refreshed", 1);
  return refreshOAuthTokens(integration.userId);
}

const inflightRefreshes = new Map<string, Promise<string>>();

export async function refreshOAuthTokens(userId: string): Promise<string> {
  const existing = inflightRefreshes.get(userId);
  if (existing) return existing;
  const promise = doRefresh(userId).finally(() => {
    inflightRefreshes.delete(userId);
  });
  inflightRefreshes.set(userId, promise);
  return promise;
}

async function doRefresh(userId: string): Promise<string> {
  const integration = await prisma.hubSpotIntegration.findUnique({
    where: { userId },
  });
  if (!integration) {
    throw new ExternalServiceError(
      "hubspot",
      "No HubSpot integration found for user"
    );
  }
  if (integration.authMethod !== "oauth" || !integration.refreshToken) {
    throw new ExternalServiceError(
      "hubspot",
      "Refresh attempted on non-OAuth integration or missing refreshToken"
    );
  }

  const { clientId, clientSecret, redirectUri } = readOAuthEnv();
  const decryptedRefresh = decryptIntegrationSecret(integration.refreshToken);

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    refresh_token: decryptedRefresh,
  });

  const res = await fetchWithTimeout(
    HUBSPOT_TOKEN_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    },
    {
      timeoutMs: REFRESH_TIMEOUT_MS,
      timeoutMessage: "HubSpot token refresh timed out",
    }
  );

  if (res.status === 400 || res.status === 401) {
    void incrementMetric("hubspot.oauth.refresh.invalid_grant", 1);
    const bodyText = await res.text().catch(() => "");
    await prisma.hubSpotIntegration.update({
      where: { userId },
      data: {
        isActive: false,
        syncErrors:
          "HubSpot refresh token was rejected (invalid_grant). User must re-connect from Settings.",
      },
    });
    logError(
      "hubspot_oauth_refresh_invalid_grant",
      new Error(truncate(bodyText)),
      { userId, status: res.status }
    );
    throw new ExternalServiceError(
      "hubspot",
      "Refresh token rejected — user must re-connect"
    );
  }

  if (res.status === 429 || res.status >= 500) {
    void incrementMetric("hubspot.oauth.refresh.transient_error", 1);
    throw new RetryableError(
      `HubSpot token refresh returned ${res.status}`,
      { statusCode: res.status }
    );
  }

  if (!res.ok) {
    void incrementMetric("hubspot.oauth.refresh.unknown_error", 1);
    const bodyText = await res.text().catch(() => "");
    throw new ExternalServiceError(
      "hubspot",
      `Unexpected refresh response ${res.status}: ${truncate(bodyText)}`
    );
  }

  let payload: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  try {
    payload = (await res.json()) as typeof payload;
  } catch (error) {
    void incrementMetric("hubspot.oauth.refresh.unknown_error", 1);
    throw new ExternalServiceError(
      "hubspot",
      "Refresh response body was not JSON",
      error
    );
  }

  if (
    !payload.access_token ||
    !payload.refresh_token ||
    !payload.expires_in
  ) {
    void incrementMetric("hubspot.oauth.refresh.unknown_error", 1);
    throw new ExternalServiceError(
      "hubspot",
      "Refresh response missing required fields"
    );
  }

  const newExpiresAt = new Date(Date.now() + payload.expires_in * 1000);

  await prisma.hubSpotIntegration.update({
    where: { userId },
    data: {
      accessToken: encryptIntegrationSecret(payload.access_token),
      refreshToken: encryptIntegrationSecret(payload.refresh_token),
      tokenExpiresAt: newExpiresAt,
      isActive: true,
      syncErrors: null,
    },
  });

  void incrementMetric("hubspot.oauth.refresh.success", 1);
  return payload.access_token;
}

export interface ExchangedTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  scopes: string[];
  hubId: string;
}

export async function exchangeCodeForTokens(
  code: string
): Promise<ExchangedTokens> {
  const { clientId, clientSecret, redirectUri } = readOAuthEnv();

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  });

  const tokenRes = await fetchWithTimeout(
    HUBSPOT_TOKEN_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    },
    {
      timeoutMs: REFRESH_TIMEOUT_MS,
      timeoutMessage: "HubSpot token exchange timed out",
    }
  );

  if (!tokenRes.ok) {
    const bodyText = await tokenRes.text().catch(() => "");
    throw new ExternalServiceError(
      "hubspot",
      `Token exchange failed (${tokenRes.status}): ${truncate(bodyText)}`
    );
  }

  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };

  if (
    !tokenJson.access_token ||
    !tokenJson.refresh_token ||
    !tokenJson.expires_in
  ) {
    throw new ExternalServiceError(
      "hubspot",
      "Token exchange response missing required fields"
    );
  }

  const infoRes = await fetchWithTimeout(
    HUBSPOT_ACCESS_TOKEN_INFO_URL(tokenJson.access_token),
    { method: "GET" },
    {
      timeoutMs: REFRESH_TIMEOUT_MS,
      timeoutMessage: "HubSpot access-token info timed out",
    }
  );

  if (!infoRes.ok) {
    const bodyText = await infoRes.text().catch(() => "");
    throw new ExternalServiceError(
      "hubspot",
      `Access-token info failed (${infoRes.status}): ${truncate(bodyText)}`
    );
  }

  const infoJson = (await infoRes.json()) as {
    scopes?: string[];
    hub_id?: number | string;
  };

  if (infoJson.hub_id === undefined || infoJson.hub_id === null) {
    throw new ExternalServiceError(
      "hubspot",
      "Access-token info response missing hub_id"
    );
  }

  return {
    accessToken: tokenJson.access_token,
    refreshToken: tokenJson.refresh_token,
    expiresIn: tokenJson.expires_in,
    scopes: infoJson.scopes ?? [],
    hubId: String(infoJson.hub_id),
  };
}
