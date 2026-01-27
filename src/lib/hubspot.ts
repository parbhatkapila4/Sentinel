
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
      return { valid: false, error: "Rate limit exceeded - please try again in a few minutes" };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      valid: false,
      error: errorData.message || `Connection failed with status ${response.status}`
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return { valid: false, error: "Could not connect to HubSpot - please check your network connection" };
    }
    return { valid: false, error: `Connection error: ${String(error)}` };
  }
}

export async function fetchHubSpotDeals(apiKey: string): Promise<HubSpotDeal[]> {
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
      throw new Error(error.message || `Failed to fetch deals: ${response.status}`);
    }

    const data = await response.json();
    allDeals.push(...(data.results || []));

    after = data.paging?.next?.after;
  } while (after && allDeals.length < 500);

  return allDeals;
}

export async function fetchHubSpotContacts(apiKey: string): Promise<HubSpotContact[]> {
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
    throw new Error(error.message || `Failed to fetch contacts: ${response.status}`);
  }

  const data = await response.json();
  return data.results || [];
}

export async function fetchHubSpotCompanies(apiKey: string): Promise<HubSpotCompany[]> {
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
    throw new Error(error.message || `Failed to fetch companies: ${response.status}`);
  }

  const data = await response.json();
  return data.results || [];
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
