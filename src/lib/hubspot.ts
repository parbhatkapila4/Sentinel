import { retryWithBackoff } from "./retry";
import { withCircuitBreaker } from "./circuit-breaker";
import { ExternalServiceError, RetryableError } from "./errors";
import { logError } from "./logger";

export interface HubSpotValidationResult {
  valid: boolean;
  portalId?: string;
  error?: string;
}

export interface HubSpotDeal {
  id: string;
  properties: {
    dealname: string;
    amount: string | null;
    dealstage: string;
    closedate: string | null;
    hubspot_owner_id: string | null;
    hs_lastmodifieddate?: string;
  };
}

export interface HubSpotContact {
  id: string;
  properties: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    company: string;
  };
}

export interface HubSpotCompany {
  id: string;
  properties: {
    name: string;
    domain: string;
    industry: string;
  };
}

const HUBSPOT_API_BASE = "https://api.hubapi.com";

export async function validateHubSpotCredentials(
  apiKey: string
): Promise<HubSpotValidationResult> {
  try {
    return await withCircuitBreaker(
      "hubspot",
      async () => {
        return await retryWithBackoff(
          async () => {
            const response = await fetch(`${HUBSPOT_API_BASE}/account-info/v3/details`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              const data = await response.json();
              return { valid: true, portalId: String(data.portalId) };
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
      return { valid: false, error: "Could not connect to HubSpot - please check your network connection" };
    }

    logError("HubSpot validation failed", error, {
      service: "hubspot",
      actionType: "validate_credentials",
    });

    return { valid: false, error: `Connection error: ${String(error)}` };
  }
}

export async function fetchHubSpotDeals(apiKey: string): Promise<HubSpotDeal[]> {
  try {
    return await withCircuitBreaker(
      "hubspot",
      async () => {
        return await retryWithBackoff(
          async () => {
            const allDeals: HubSpotDeal[] = [];
            let after: string | undefined;

            do {
              const params = new URLSearchParams({
                properties: "dealname,amount,dealstage,closedate,hubspot_owner_id,hs_lastmodifieddate",
                limit: "100",
              });
              if (after) {
                params.append("after", after);
              }

              const response = await fetch(
                `${HUBSPOT_API_BASE}/crm/v3/objects/deals?${params.toString()}`,
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
                const errorMessage = error.message || `Failed to fetch deals: ${response.status}`;

                if (response.status === 429 || response.status >= 500) {
                  throw new RetryableError(errorMessage, { statusCode: response.status });
                }

                throw new ExternalServiceError("hubspot", errorMessage);
              }

              const data = await response.json();
              allDeals.push(...(data.results || []));

              after = data.paging?.next?.after;
            } while (after && allDeals.length < 500);

            return allDeals;
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
    logError("Failed to fetch HubSpot deals", error, {
      service: "hubspot",
      actionType: "fetch_deals",
    });
    throw error;
  }
}

export async function fetchHubSpotContacts(apiKey: string): Promise<HubSpotContact[]> {
  try {
    return await withCircuitBreaker(
      "hubspot",
      async () => {
        return await retryWithBackoff(
          async () => {
            const params = new URLSearchParams({
              properties: "firstname,lastname,email,phone,company",
              limit: "100",
            });

            const response = await fetch(
              `${HUBSPOT_API_BASE}/crm/v3/objects/contacts?${params.toString()}`,
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

              throw new ExternalServiceError("hubspot", errorMessage);
            }

            const data = await response.json();
            return data.results || [];
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
    logError("Failed to fetch HubSpot contacts", error, {
      service: "hubspot",
      actionType: "fetch_contacts",
    });
    throw error;
  }
}

export async function fetchHubSpotCompanies(apiKey: string): Promise<HubSpotCompany[]> {
  try {
    return await withCircuitBreaker(
      "hubspot",
      async () => {
        return await retryWithBackoff(
          async () => {
            const params = new URLSearchParams({
              properties: "name,domain,industry",
              limit: "100",
            });

            const response = await fetch(
              `${HUBSPOT_API_BASE}/crm/v3/objects/companies?${params.toString()}`,
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
              const errorMessage = error.message || `Failed to fetch companies: ${response.status}`;

              if (response.status === 429 || response.status >= 500) {
                throw new RetryableError(errorMessage, { statusCode: response.status });
              }

              throw new ExternalServiceError("hubspot", errorMessage);
            }

            const data = await response.json();
            return data.results || [];
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
    logError("Failed to fetch HubSpot companies", error, {
      service: "hubspot",
      actionType: "fetch_companies",
    });
    throw error;
  }
}

function mapHubSpotStage(hubspotStage: string): string {
  const stageMapping: Record<string, string> = {
    "appointmentscheduled": "Discovery",
    "qualifiedtobuy": "Discovery",
    "presentationscheduled": "Proposal",
    "decisionmakerboughtin": "Proposal",
    "contractsent": "Negotiation",
    "closedwon": "Closed Won",
    "closedlost": "Closed Lost",
    "qualification": "Discovery",
    "proposal": "Proposal",
    "negotiation": "Negotiation",
    "closed_won": "Closed Won",
    "closed_lost": "Closed Lost",
  };

  const normalizedStage = hubspotStage.toLowerCase().replace(/[^a-z]/g, "");
  return stageMapping[normalizedStage] || "Discovery";
}

export function mapHubSpotDealToDeal(
  deal: HubSpotDeal,
  userId: string
): {
  name: string;
  value: number;
  stage: string;
  source: string;
  externalId: string;
  userId: string;
} {
  const amount = deal.properties.amount ? parseFloat(deal.properties.amount) : 0;

  return {
    name: deal.properties.dealname || "Unnamed Deal",
    value: Math.round(amount),
    stage: mapHubSpotStage(deal.properties.dealstage || ""),
    source: "hubspot",
    externalId: deal.id,
    userId,
  };
}

export function maskHubSpotApiKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return "••••••••" + key.slice(-4);
}
