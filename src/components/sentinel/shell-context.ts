import { format } from "date-fns";
import type { getAllIntegrationStatuses } from "@/app/actions/integrations";
import { buildTickerItems, deriveAtRisk } from "./derive";
import type {
  OnboardingState,
  SentinelDeal,
  TickerItem,
} from "./types";

export interface SentinelShellContext {
  syncTime: string;
  coveragePercent: number;
  sourceLabels: string[];
  alertCount: number;
  tickerItems: TickerItem[];
  onboarding: OnboardingState;
}

interface BuildArgs {
  deals: SentinelDeal[];
  integrationStatuses:
    | Awaited<ReturnType<typeof getAllIntegrationStatuses>>
    | null;
  coveragePercent: number;
  hasAnyDeals: boolean;
  isDemoMode: boolean;
  now?: Date;
}

export function buildSentinelShellContext({
  deals,
  integrationStatuses,
  coveragePercent,
  hasAnyDeals,
  isDemoMode,
  now = new Date(),
}: BuildArgs): SentinelShellContext {
  const syncTime = format(now, "HH:mm");

  const labels: string[] = [];
  let crmConnected = false;
  let crmEverSynced = false;

  if (integrationStatuses) {
    if (integrationStatuses.salesforce.connected) {
      labels.push("SALESFORCE");
      crmConnected = true;
    }
    if (integrationStatuses.hubspot.connected) {
      labels.push("HUBSPOT");
      crmConnected = true;
    }
    if (integrationStatuses.googleCalendar.connected) {
      labels.push("CALENDAR");
    }
    const slack = integrationStatuses.slack as
      | { connected?: boolean; workspaces?: unknown[] }
      | unknown[]
      | undefined;
    const slackConnected = Array.isArray(slack)
      ? slack.length > 0
      : Boolean(slack?.connected) ||
        (Array.isArray(slack?.workspaces) && slack!.workspaces!.length > 0);
    if (slackConnected) labels.push("SLACK");

    crmEverSynced = Boolean(
      integrationStatuses.salesforce.lastSyncAt ||
        integrationStatuses.hubspot.lastSyncAt
    );
  }

  if (labels.length === 0) {
    labels.push(isDemoMode ? "DEMO" : "NONE");
  }

  const atRisk = deriveAtRisk(deals);

  const isOnboarding =
    !crmConnected || (crmConnected && !crmEverSynced) || !hasAnyDeals;

  const tickerItems = buildTickerItems(deals, {
    sourceLabels: labels,
    coveragePercent,
    alertCount: atRisk.flaggedCount,
    syncTime,
    isDemoMode,
    crmConnected,
  });

  return {
    syncTime,
    coveragePercent: Math.max(0, Math.min(100, coveragePercent)),
    sourceLabels: labels,
    alertCount: atRisk.flaggedCount,
    tickerItems,
    onboarding: {
      isOnboarding,
      isDemoMode,
      crmConnected,
      crmEverSynced,
    },
  };
}

export function mapRawDealsToSentinel<
  T extends {
    id: string;
    name: string;
    stage: string;
    value: number;
    createdAt: Date;
    lastActivityAt?: Date | null;
    riskScore: number;
    riskLevel?: string | null;
    status?: string | null;
    isDemo?: boolean;
    location?: string | null;
  },
>(raw: T[]): SentinelDeal[] {
  return raw.map((d) => ({
    id: d.id,
    name: d.name,
    stage: d.stage,
    value: d.value,
    createdAt: d.createdAt,
    lastActivityAt: d.lastActivityAt ?? null,
    riskScore: d.riskScore,
    riskLevel: d.riskLevel ?? null,
    status: d.status ?? null,
    isDemo: d.isDemo,
    country: d.location ?? null,
  }));
}
