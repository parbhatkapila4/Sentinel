import type { SalesforceIntegration } from "@prisma/client";

import { prisma } from "./prisma";
import { retryWithBackoff } from "./retry";
import { withCircuitBreaker } from "./circuit-breaker";
import { ExternalServiceError, RetryableError } from "./errors";
import { logError } from "./logger";
import { fetchWithTimeout } from "./reliable-fetch";
import { incrementMetric } from "./metrics";
import {
  decryptIntegrationSecret,
  encryptIntegrationSecret,
} from "./integration-secrets";

export interface SalesforceValidationResult {
  valid: boolean;
  error?: string;
}

export interface SalesforceOpportunity {
  Id: string;
  Name: string;
  Amount: number | null;
  StageName: string;
  CloseDate: string;
  Account?: {
    Name: string;
  };
  OwnerId: string;
}

export interface SalesforceContact {
  Id: string;
  Name: string;
  FirstName: string | null;
  LastName: string | null;
  Email: string | null;
  Phone: string;
  Account?: {
    Name: string;
  };
}

const SALESFORCE_TIMEOUT_MS = 25_000;

export const ACCESS_TOKEN_LIFETIME_MS = 110 * 60 * 1000;
const ACCESS_TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

function normalizeInstanceUrl(instanceUrl: string): string {
  return instanceUrl.replace(/\/$/, "");
}

interface SalesforceTokenResponse {
  access_token: string;
  instance_url?: string;
  token_type?: string;
  issued_at?: string;
}

async function requestAccessToken(
  consumerKey: string,
  consumerSecret: string,
  instanceUrl: string
): Promise<SalesforceTokenResponse> {
  const normalizedUrl = normalizeInstanceUrl(instanceUrl);
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: consumerKey,
    client_secret: consumerSecret,
  });

  return await retryWithBackoff(
    async () => {
      const response = await fetchWithTimeout(
        `${normalizedUrl}/services/oauth2/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: body.toString(),
        },
        {
          timeoutMs: SALESFORCE_TIMEOUT_MS,
          timeoutMessage: "Salesforce token request timed out",
        }
      );

      if (response.ok) {
        return (await response.json()) as SalesforceTokenResponse;
      }

      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.error_description ||
        errorData.error ||
        `Salesforce token exchange failed: ${response.status}`;

      if (response.status === 429 || response.status >= 500) {
        throw new RetryableError(errorMessage, { statusCode: response.status });
      }

      throw new ExternalServiceError("salesforce", errorMessage);
    },
    { maxRetries: 2, isIdempotent: true }
  );
}

export async function getSalesforceAccessToken(
  integration: SalesforceIntegration
): Promise<string> {
  const authMethod = integration.authMethod ?? "client_credentials";

  switch (authMethod) {
    case "client_credentials":
      return getClientCredentialsAccessToken(integration);
    case "oauth":
      return getValidSalesforceOAuthToken(integration);
    default:
      throw new ExternalServiceError(
        "salesforce",
        `Unknown authMethod: ${authMethod}`
      );
  }
}

async function getClientCredentialsAccessToken(
  integration: SalesforceIntegration
): Promise<string> {
  void incrementMetric("salesforce.token_resolved.client_credentials", 1);

  const now = Date.now();
  const cachedExpiry = integration.accessTokenExpiresAt
    ? integration.accessTokenExpiresAt.getTime()
    : 0;

  if (
    integration.accessToken &&
    cachedExpiry - ACCESS_TOKEN_REFRESH_BUFFER_MS > now
  ) {
    return decryptIntegrationSecret(integration.accessToken);
  }

  if (!integration.consumerKey || !integration.consumerSecret) {
    throw new ExternalServiceError(
      "salesforce",
      "client_credentials integration missing consumerKey/consumerSecret — data integrity violation"
    );
  }

  const consumerKey = decryptIntegrationSecret(integration.consumerKey);
  const consumerSecret = decryptIntegrationSecret(integration.consumerSecret);

  const tokenResponse = await withCircuitBreaker(
    "salesforce",
    () => requestAccessToken(consumerKey, consumerSecret, integration.instanceUrl),
    { failureThreshold: 5, timeout: 60000 }
  );

  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_LIFETIME_MS);

  await prisma.salesforceIntegration.update({
    where: { id: integration.id },
    data: {
      accessToken: encryptIntegrationSecret(tokenResponse.access_token),
      accessTokenExpiresAt: expiresAt,
    },
  });

  return tokenResponse.access_token;
}

async function getValidSalesforceOAuthToken(
  integration: SalesforceIntegration
): Promise<string> {
  if (!integration.refreshToken) {
    throw new ExternalServiceError(
      "salesforce",
      "OAuth integration missing refresh token — re-connect required"
    );
  }

  const now = Date.now();
  const cachedExpiry = integration.accessTokenExpiresAt
    ? integration.accessTokenExpiresAt.getTime()
    : 0;
  const needsRefresh =
    !integration.accessToken ||
    !integration.accessTokenExpiresAt ||
    cachedExpiry - ACCESS_TOKEN_REFRESH_BUFFER_MS <= now;

  if (!needsRefresh && integration.accessToken) {
    void incrementMetric("salesforce.token_resolved.oauth_cached", 1);
    return decryptIntegrationSecret(integration.accessToken);
  }

  void incrementMetric("salesforce.token_resolved.oauth_refreshed", 1);
  return refreshSalesforceOAuthToken(integration.userId);
}

const inflightRefreshes = new Map<string, Promise<string>>();

export async function refreshSalesforceOAuthToken(
  userId: string
): Promise<string> {
  const existing = inflightRefreshes.get(userId);
  if (existing) return existing;
  const promise = doSalesforceRefresh(userId).finally(() => {
    inflightRefreshes.delete(userId);
  });
  inflightRefreshes.set(userId, promise);
  return promise;
}

async function doSalesforceRefresh(userId: string): Promise<string> {
  const integration = await prisma.salesforceIntegration.findUnique({
    where: { userId },
  });
  if (!integration) {
    throw new ExternalServiceError(
      "salesforce",
      "No Salesforce integration found for user"
    );
  }
  if (integration.authMethod !== "oauth" || !integration.refreshToken) {
    throw new ExternalServiceError(
      "salesforce",
      "Refresh attempted on non-OAuth integration or missing refreshToken"
    );
  }

  const { clientId, clientSecret } = readSalesforceOAuthEnv();
  const decryptedRefresh = decryptIntegrationSecret(integration.refreshToken);
  const normalizedUrl = normalizeInstanceUrl(integration.instanceUrl);

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: decryptedRefresh,
  });

  const tokenJson = await withCircuitBreaker(
    "salesforce",
    async () => {
      const res = await fetchWithTimeout(
        `${normalizedUrl}/services/oauth2/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: body.toString(),
        },
        {
          timeoutMs: SALESFORCE_TIMEOUT_MS,
          timeoutMessage: "Salesforce token refresh timed out",
        }
      );

      if (res.status === 400 || res.status === 401) {
        void incrementMetric("salesforce.oauth.refresh.invalid_grant", 1);
        const bodyText = await res.text().catch(() => "");
        await prisma.salesforceIntegration.update({
          where: { userId },
          data: {
            isActive: false,
            syncErrors:
              "Salesforce refresh token was rejected (invalid_grant). User must re-connect from Settings.",
          },
        });
        logError(
          "salesforce_oauth_refresh_invalid_grant",
          new Error(truncate(bodyText)),
          { userId, status: res.status }
        );
        throw new ExternalServiceError(
          "salesforce",
          "Refresh token rejected — user must re-connect"
        );
      }

      if (res.status === 429 || res.status >= 500) {
        void incrementMetric("salesforce.oauth.refresh.transient_error", 1);
        throw new RetryableError(
          `Salesforce token refresh returned ${res.status}`,
          { statusCode: res.status }
        );
      }

      if (!res.ok) {
        void incrementMetric("salesforce.oauth.refresh.unknown_error", 1);
        const bodyText = await res.text().catch(() => "");
        throw new ExternalServiceError(
          "salesforce",
          `Unexpected refresh response ${res.status}: ${truncate(bodyText)}`
        );
      }

      try {
        return (await res.json()) as {
          access_token?: string;
          instance_url?: string;
        };
      } catch (error) {
        void incrementMetric("salesforce.oauth.refresh.unknown_error", 1);
        throw new ExternalServiceError(
          "salesforce",
          "Refresh response body was not JSON",
          error
        );
      }
    },
    { failureThreshold: 5, timeout: 60000 }
  );

  if (!tokenJson.access_token) {
    void incrementMetric("salesforce.oauth.refresh.unknown_error", 1);
    throw new ExternalServiceError(
      "salesforce",
      "Refresh response missing access_token"
    );
  }

  const newExpiresAt = new Date(Date.now() + ACCESS_TOKEN_LIFETIME_MS);

  const updateData: Parameters<
    typeof prisma.salesforceIntegration.update
  >[0]["data"] = {
    accessToken: encryptIntegrationSecret(tokenJson.access_token),
    accessTokenExpiresAt: newExpiresAt,
    isActive: true,
    syncErrors: null,
  };

  if (tokenJson.instance_url) {
    const normalizedNew = normalizeInstanceUrl(tokenJson.instance_url);
    if (normalizedNew !== normalizedUrl) {
      updateData.instanceUrl = normalizedNew;
    }
  }

  await prisma.salesforceIntegration.update({
    where: { userId },
    data: updateData,
  });

  void incrementMetric("salesforce.oauth.refresh.success", 1);
  return tokenJson.access_token;
}

export interface SalesforceExchangedTokens {
  accessToken: string;
  refreshToken: string;
  instanceUrl: string;
  scopes: string[];
}

export async function exchangeSalesforceCodeForTokens(
  code: string,
  instanceUrlFromCallback: string
): Promise<SalesforceExchangedTokens> {
  const { clientId, clientSecret, redirectUri } = readSalesforceOAuthEnv();
  const normalizedCallbackUrl = normalizeInstanceUrl(instanceUrlFromCallback);

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  const res = await fetchWithTimeout(
    `${normalizedCallbackUrl}/services/oauth2/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: body.toString(),
    },
    {
      timeoutMs: SALESFORCE_TIMEOUT_MS,
      timeoutMessage: "Salesforce token exchange timed out",
    }
  );

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    throw new ExternalServiceError(
      "salesforce",
      `Token exchange failed (${res.status}): ${truncate(bodyText)}`
    );
  }

  let payload: {
    access_token?: string;
    refresh_token?: string;
    instance_url?: string;
    scope?: string;
    id?: string;
  };
  try {
    payload = (await res.json()) as typeof payload;
  } catch (error) {
    throw new ExternalServiceError(
      "salesforce",
      "Token exchange response body was not JSON",
      error
    );
  }

  if (!payload.access_token || !payload.refresh_token) {
    throw new ExternalServiceError(
      "salesforce",
      "Token exchange response missing required fields (access_token or refresh_token)"
    );
  }

  const resolvedInstanceUrl = payload.instance_url
    ? normalizeInstanceUrl(payload.instance_url)
    : normalizedCallbackUrl;
  const scopes = payload.scope
    ? payload.scope.split(/\s+/).filter(Boolean)
    : [];

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    instanceUrl: resolvedInstanceUrl,
    scopes,
  };
}

const TRUNCATE_BODY_AT = 200;

function truncate(text: string): string {
  return text.length <= TRUNCATE_BODY_AT
    ? text
    : text.slice(0, TRUNCATE_BODY_AT) + "…";
}

function readSalesforceOAuthEnv(): {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
} {
  const clientId = process.env.SALESFORCE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.SALESFORCE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.SALESFORCE_OAUTH_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new ExternalServiceError(
      "salesforce",
      "Salesforce OAuth env vars are not configured"
    );
  }
  return { clientId, clientSecret, redirectUri };
}

export async function validateSalesforceCredentials(
  consumerKey: string,
  consumerSecret: string,
  instanceUrl: string
): Promise<SalesforceValidationResult> {
  try {
    await withCircuitBreaker(
      "salesforce",
      () => requestAccessToken(consumerKey, consumerSecret, instanceUrl),
      { failureThreshold: 5, timeout: 60000 }
    );
    return { valid: true };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return { valid: false, error: "Could not connect to Salesforce - check your instance URL" };
    }

    if (error instanceof ExternalServiceError) {
      const message = error.message;
      return { valid: false, error: message };
    }

    logError("Salesforce validation failed", error, {
      service: "salesforce",
      actionType: "validate_credentials",
    });

    return { valid: false, error: `Connection error: ${String(error)}` };
  }
}

export async function fetchSalesforceOpportunities(
  integration: SalesforceIntegration
): Promise<SalesforceOpportunity[]> {
  try {
    return await withCircuitBreaker(
      "salesforce",
      async () => {
        return await retryWithBackoff(
          async () => {
            const accessToken = await getSalesforceAccessToken(integration);
            const normalizedUrl = normalizeInstanceUrl(integration.instanceUrl);
            const query = encodeURIComponent(
              "SELECT Id, Name, Amount, StageName, CloseDate, Account.Name, OwnerId FROM Opportunity ORDER BY LastModifiedDate DESC LIMIT 100"
            );

            const response = await fetchWithTimeout(
              `${normalizedUrl}/services/data/v58.0/query?q=${query}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
              },
              {
                timeoutMs: SALESFORCE_TIMEOUT_MS,
                timeoutMessage: "Salesforce opportunities request timed out",
              }
            );

            if (!response.ok) {
              const error = await response.json().catch(() => ({}));
              const errorMessage = error.message || `Failed to fetch opportunities: ${response.status}`;

              if (response.status === 429 || response.status >= 500) {
                throw new RetryableError(errorMessage, { statusCode: response.status });
              }

              throw new ExternalServiceError("salesforce", errorMessage);
            }

            const data = await response.json();
            return data.records || [];
          },
          {
            maxRetries: 3,
            isIdempotent: true,
          }
        );
      },
      {
        failureThreshold: 5,
        timeout: 60000,
      }
    );
  } catch (error) {
    logError("Failed to fetch Salesforce opportunities", error, {
      service: "salesforce",
      actionType: "fetch_opportunities",
    });
    throw error;
  }
}

export async function fetchSalesforceContacts(
  integration: SalesforceIntegration
): Promise<SalesforceContact[]> {
  try {
    return await withCircuitBreaker(
      "salesforce",
      async () => {
        return await retryWithBackoff(
          async () => {
            const accessToken = await getSalesforceAccessToken(integration);
            const normalizedUrl = normalizeInstanceUrl(integration.instanceUrl);
            const query = encodeURIComponent(
              "SELECT Id, Name, FirstName, LastName, Email, Phone, Account.Name FROM Contact ORDER BY LastModifiedDate DESC LIMIT 100"
            );

            const response = await fetchWithTimeout(
              `${normalizedUrl}/services/data/v58.0/query?q=${query}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
              },
              {
                timeoutMs: SALESFORCE_TIMEOUT_MS,
                timeoutMessage: "Salesforce contacts request timed out",
              }
            );

            if (!response.ok) {
              const error = await response.json().catch(() => ({}));
              const errorMessage = error.message || `Failed to fetch contacts: ${response.status}`;

              if (response.status === 429 || response.status >= 500) {
                throw new RetryableError(errorMessage, { statusCode: response.status });
              }

              throw new ExternalServiceError("salesforce", errorMessage);
            }

            const data = await response.json();
            return data.records || [];
          },
          {
            maxRetries: 3,
            isIdempotent: true,
          }
        );
      },
      {
        failureThreshold: 5,
        timeout: 60000,
      }
    );
  } catch (error) {
    logError("Failed to fetch Salesforce contacts", error, {
      service: "salesforce",
      actionType: "fetch_contacts",
    });
    throw error;
  }
}

function mapSalesforceStage(salesforceStage: string): string {
  const stageMapping: Record<string, string> = {
    "Prospecting": "discover",
    "Qualification": "qualify",
    "Needs Analysis": "discover",
    "Value Proposition": "proposal",
    "Id. Decision Makers": "proposal",
    "Perception Analysis": "proposal",
    "Proposal/Price Quote": "proposal",
    "Negotiation/Review": "negotiation",
    "Closed Won": "closed_won",
    "Closed Lost": "closed_lost",
  };

  return stageMapping[salesforceStage] || "discover";
}

export function mapSalesforceOpportunityToDeal(
  opportunity: SalesforceOpportunity,
  userId: string
): {
  name: string;
  value: number;
  stage: string;
  source: string;
  externalId: string;
  userId: string;
} {
  return {
    name: opportunity.Account?.Name
      ? `${opportunity.Name} (${opportunity.Account.Name})`
      : opportunity.Name,
    value: opportunity.Amount ? Math.round(opportunity.Amount) : 0,
    stage: mapSalesforceStage(opportunity.StageName),
    source: "salesforce",
    externalId: opportunity.Id,
    userId,
  };
}
