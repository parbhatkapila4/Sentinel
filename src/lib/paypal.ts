import { CANONICAL_PRICING } from "@/lib/pricing-catalog";
import type { PlanType } from "@/lib/plans";

export type PaypalWebhookEvent = {
  id: string;
  event_type: string;
  create_time?: string;
  resource?: {
    id?: string;
    custom_id?: string;
    amount?: {
      currency_code?: string;
      value?: string;
    };
    payer?: {
      email_address?: string;
    };
    supplementary_data?: {
      related_ids?: {
        order_id?: string;
      };
    };
  };
};

type PayPalEnvironment = "sandbox" | "live";

const PAYPAL_ENVIRONMENT: PayPalEnvironment =
  process.env.PAYPAL_ENVIRONMENT === "live" ? "live" : "sandbox";

function getPayPalBaseUrl() {
  return PAYPAL_ENVIRONMENT === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function getRequiredPaypalEnv() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (!clientId || !clientSecret || !webhookId) {
    throw new Error(
      "Missing PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, or PAYPAL_WEBHOOK_ID environment variables."
    );
  }

  return { clientId, clientSecret, webhookId };
}

export async function getPayPalAccessToken(): Promise<string> {
  const { clientId, clientSecret } = getRequiredPaypalEnv();
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`PayPal auth failed: ${response.status} ${body}`);
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("PayPal auth response missing access token.");
  }
  return data.access_token;
}

type VerifySignatureInput = {
  transmissionId: string;
  transmissionTime: string;
  certUrl: string;
  authAlgo: string;
  transmissionSig: string;
  webhookEvent: PaypalWebhookEvent;
};

export async function verifyPayPalWebhookSignature(
  input: VerifySignatureInput
): Promise<boolean> {
  const accessToken = await getPayPalAccessToken();
  const { webhookId } = getRequiredPaypalEnv();

  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        auth_algo: input.authAlgo,
        cert_url: input.certUrl,
        transmission_id: input.transmissionId,
        transmission_sig: input.transmissionSig,
        transmission_time: input.transmissionTime,
        webhook_id: webhookId,
        webhook_event: input.webhookEvent,
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `PayPal webhook signature verification failed: ${response.status} ${body}`
    );
  }

  const data = (await response.json()) as { verification_status?: string };
  return data.verification_status === "SUCCESS";
}

function normalizeMoney(raw: string | undefined): number | null {
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * 100) / 100;
}

function parseExpectedValues(
  envValue: string | undefined,
  fallbackValues: number[]
): number[] {
  if (!envValue || envValue.trim() === "") return fallbackValues;
  return envValue
    .split(",")
    .map((v) => normalizeMoney(v.trim()))
    .filter((v): v is number => v !== null);
}

function getPlanAmountMap(): Record<Exclude<PlanType, "free" | "starter">, number[]> {
  const defaults = {
    pro: [
      CANONICAL_PRICING.pro.monthly ?? 31,
      CANONICAL_PRICING.pro.annualMonthlyEquivalent ?? 20,
    ],
    enterprise: [
      CANONICAL_PRICING.enterprise.monthly ?? 85,
      CANONICAL_PRICING.enterprise.annualMonthlyEquivalent ?? 56,
    ],
  };

  return {
    pro: parseExpectedValues(process.env.PAYPAL_PRO_ACCEPTED_AMOUNTS, defaults.pro),
    enterprise: parseExpectedValues(
      process.env.PAYPAL_ENTERPRISE_ACCEPTED_AMOUNTS,
      defaults.enterprise
    ),
  };
}

export function resolvePlanFromCapturedPayment(params: {
  amountValue?: string;
  currencyCode?: string;
}): Exclude<PlanType, "free" | "starter"> | null {
  const amount = normalizeMoney(params.amountValue);
  const currency = (params.currencyCode || "").toUpperCase();
  if (amount === null || currency !== "USD") return null;

  const map = getPlanAmountMap();

  if (map.enterprise.includes(amount)) return "enterprise";
  if (map.pro.includes(amount)) return "pro";
  return null;
}

