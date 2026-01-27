import { retryWithBackoff } from "./retry";
import { withCircuitBreaker } from "./circuit-breaker";
import { ExternalServiceError, RetryableError } from "./errors";
import { logError, logInfo } from "./logger";

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
  Email: string;
  Phone: string;
  Account?: {
    Name: string;
  };
}

export async function validateSalesforceCredentials(
  apiKey: string,
  instanceUrl: string
): Promise<SalesforceValidationResult> {
  try {
    return await withCircuitBreaker(
      "salesforce",
      async () => {
        return await retryWithBackoff(
          async () => {
            const normalizedUrl = instanceUrl.replace(/\/$/, "");

            const response = await fetch(`${normalizedUrl}/services/data/v58.0/`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              return { valid: true };
            }

            if (response.status === 401) {
              return { valid: false, error: "Invalid API key - please check your credentials" };
            }

            if (response.status === 403) {
              return { valid: false, error: "Permission denied - ensure your API key has the required scopes" };
            }

            if (response.status === 429) {
              throw new RetryableError("Rate limit exceeded - please try again in a few minutes", {
                statusCode: 429,
              });
            }

            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `Connection failed with status ${response.status}`;

            if (response.status >= 500) {
              throw new RetryableError(errorMessage, { statusCode: response.status });
            }

            return {
              valid: false,
              error: errorMessage,
            };
          },
          {
            maxRetries: 2,
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
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return { valid: false, error: "Could not connect to Salesforce - check your instance URL" };
    }

    logError("Salesforce validation failed", error, {
      service: "salesforce",
      actionType: "validate_credentials",
    });

    return { valid: false, error: `Connection error: ${String(error)}` };
  }
}

export async function fetchSalesforceOpportunities(
  apiKey: string,
  instanceUrl: string
): Promise<SalesforceOpportunity[]> {
  try {
    return await withCircuitBreaker(
      "salesforce",
      async () => {
        return await retryWithBackoff(
          async () => {
            const normalizedUrl = instanceUrl.replace(/\/$/, "");
            const query = encodeURIComponent(
              "SELECT Id, Name, Amount, StageName, CloseDate, Account.Name, OwnerId FROM Opportunity ORDER BY LastModifiedDate DESC LIMIT 100"
            );

            const response = await fetch(
              `${normalizedUrl}/services/data/v58.0/query?q=${query}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                  "Content-Type": "application/json",
                },
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
  apiKey: string,
  instanceUrl: string
): Promise<SalesforceContact[]> {
  try {
    return await withCircuitBreaker(
      "salesforce",
      async () => {
        return await retryWithBackoff(
          async () => {
            const normalizedUrl = instanceUrl.replace(/\/$/, "");
            const query = encodeURIComponent(
              "SELECT Id, Name, Email, Phone, Account.Name FROM Contact ORDER BY LastModifiedDate DESC LIMIT 100"
            );

            const response = await fetch(
              `${normalizedUrl}/services/data/v58.0/query?q=${query}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                  "Content-Type": "application/json",
                },
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
    "Prospecting": "Discovery",
    "Qualification": "Discovery",
    "Needs Analysis": "Discovery",
    "Value Proposition": "Proposal",
    "Id. Decision Makers": "Proposal",
    "Perception Analysis": "Proposal",
    "Proposal/Price Quote": "Proposal",
    "Negotiation/Review": "Negotiation",
    "Closed Won": "Closed Won",
    "Closed Lost": "Closed Lost",
  };

  return stageMapping[salesforceStage] || "Discovery";
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

export function maskSalesforceApiKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return "••••••••" + key.slice(-4);
}
