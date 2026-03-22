import { prisma } from "./prisma";
import { calculateDealSignals } from "./dealRisk";
import {
  sendSlackNotification,
  formatCrmSyncSummarySlackMessage,
} from "./slack";
import { logWarn } from "./logger";

function isClosedStage(stage: string): boolean {
  const s = stage.toLowerCase().replace(/\s+/g, "_");
  return (
    s.includes("closed_won") ||
    s.includes("closed_lost") ||
    stage === "Closed Won" ||
    stage === "Closed Lost"
  );
}
export async function notifySlackAfterCrmSync(
  userId: string,
  params: {
    provider: "hubspot" | "salesforce" | "google_calendar";
    created: number;
    updated: number;
  }
): Promise<void> {
  try {
    const base =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";
    const dashboardUrl = base ? `${base}/dashboard` : "";

    const deals = await prisma.deal.findMany({
      where: { userId },
      include: {
        timeline: {
          orderBy: { createdAt: "desc" },
          take: 80,
        },
      },
      take: 200,
    });

    let highRiskCount = 0;
    for (const d of deals) {
      if (isClosedStage(d.stage)) continue;
      const timeline = d.timeline.map((t) => ({
        eventType: t.eventType,
        createdAt: t.createdAt ?? new Date(),
        metadata: (t.metadata as Record<string, unknown> | null) ?? null,
      }));
      const signals = calculateDealSignals(
        {
          stage: d.stage,
          value: d.value,
          status: "active",
          createdAt: d.createdAt,
        },
        timeline
      );
      if (signals.riskLevel === "High") highRiskCount++;
    }

    const providerLabel =
      params.provider === "hubspot"
        ? "HubSpot"
        : params.provider === "salesforce"
          ? "Salesforce"
          : "Google Calendar";

    await sendSlackNotification(
      userId,
      null,
      "crm.sync_summary",
      formatCrmSyncSummarySlackMessage({
        provider: providerLabel,
        created: params.created,
        updated: params.updated,
        highRiskCount,
        dashboardUrl,
      })
    );
  } catch (e) {
    logWarn("notifySlackAfterCrmSync failed", {
      userId,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
