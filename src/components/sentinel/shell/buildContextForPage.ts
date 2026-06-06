import { getAllDeals } from "@/app/actions/deals";
import { getAllIntegrationStatuses } from "@/app/actions/integrations";
import {
  buildSentinelShellContext,
  mapRawDealsToSentinel,
  type SentinelShellContext,
} from "@/components/sentinel/shell-context";

export async function buildShellContextForPage(): Promise<SentinelShellContext> {
  let dealsRaw: Awaited<ReturnType<typeof getAllDeals>> = [];
  try {
    dealsRaw = await getAllDeals();
  } catch {
    dealsRaw = [];
  }

  let integrationStatuses: Awaited<
    ReturnType<typeof getAllIntegrationStatuses>
  > | null = null;
  try {
    integrationStatuses = await getAllIntegrationStatuses();
  } catch {
    integrationStatuses = null;
  }

  const hasAnyDeals = dealsRaw.length > 0;
  const isDemoMode = dealsRaw.length > 0 && dealsRaw.every((d) => d.isDemo);
  const deals = mapRawDealsToSentinel(dealsRaw);

  return buildSentinelShellContext({
    deals,
    integrationStatuses,
    coveragePercent: 0,
    hasAnyDeals,
    isDemoMode,
    now: new Date(),
  });
}
