import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { triggerActionOverdueNotification, triggerDealAtRiskNotification } from "@/lib/notification-triggers";
import { dispatchWebhookEvent } from "@/lib/webhooks";
import {
  formatDealAtRiskSlackMessage,
  sendSlackNotification,
} from "@/lib/slack";
import { notifyRealtimeEvent } from "@/lib/realtime";
import { formatRiskLevel } from "@/lib/dealRisk";

type EnrichedDeal = {
  id: string;
  userId: string;
  name: string;
  value: number;
  stage: string;
  status: string;
  riskScore: number;
  riskLevel?: string;
  primaryRiskReason?: string | null;
  recommendedAction?: { label: string } | null;
  actionOverdueByDays?: number | null;
  isActionOverdue?: boolean;
};

function isHighOrCriticalRisk(riskLevel: string): boolean {
  return riskLevel === "High" || riskLevel.toLowerCase() === "critical";
}

export async function runDealStageRiskSideEffects(params: {
  dealId: string;
  userId: string;
  teamId: string | null;
  loadEnrichedDeal: () => Promise<EnrichedDeal>;
}): Promise<void> {
  const { dealId, userId, teamId, loadEnrichedDeal } = params;
  const enriched = await loadEnrichedDeal();
  const riskLevel = enriched.riskLevel ?? formatRiskLevel(enriched.riskScore);
  const isHighRisk = isHighOrCriticalRisk(riskLevel);

  let alreadySentRiskEmail = false;
  try {
    const dealRecord = await prisma.deal.findUnique({
      where: { id: dealId },
      select: { riskEmailSentAt: true } as Prisma.DealSelect,
    });
    alreadySentRiskEmail =
      (dealRecord as { riskEmailSentAt?: Date | null } | null)?.riskEmailSentAt != null;
  } catch {
  }

  if (isHighRisk) {
    await triggerDealAtRiskNotification(
      {
        id: enriched.id,
        name: enriched.name,
        userId: enriched.userId,
        riskLevel,
        primaryRiskReason: enriched.primaryRiskReason ?? undefined,
      },
      { sendEmail: !alreadySentRiskEmail }
    );
    if (!alreadySentRiskEmail) {
      try {
        await prisma.deal.update({
          where: { id: dealId },
          data: { riskEmailSentAt: new Date() } as Prisma.DealUpdateInput,
        });
      } catch {
      }
    }
    await dispatchWebhookEvent(userId, teamId, "deal.at_risk", {
      id: enriched.id,
      name: enriched.name,
      value: enriched.value,
      stage: enriched.stage,
      riskLevel,
      primaryRiskReason: enriched.primaryRiskReason ?? undefined,
    });
    await sendSlackNotification(
      userId,
      teamId,
      "deal.at_risk",
      formatDealAtRiskSlackMessage({
        name: enriched.name,
        value: enriched.value,
        stage: enriched.stage,
        riskLevel,
        riskReason: enriched.primaryRiskReason ?? undefined,
      })
    );
  } else if (enriched.status !== "at_risk") {
    try {
      await prisma.deal.update({
        where: { id: dealId },
        data: { riskEmailSentAt: null } as Prisma.DealUpdateInput,
      });
    } catch {
    }
  }

  if (
    enriched.isActionOverdue &&
    enriched.recommendedAction &&
    enriched.actionOverdueByDays != null
  ) {
    await triggerActionOverdueNotification(
      { id: enriched.id, name: enriched.name, userId: enriched.userId },
      enriched.recommendedAction.label,
      enriched.actionOverdueByDays
    );
  }

  try {
    await notifyRealtimeEvent(userId, {
      type: "deal.updated",
      dealId,
      stage: enriched.stage,
    });
    if (isHighRisk) {
      await notifyRealtimeEvent(userId, { type: "deal.at_risk", dealId });
    }
  } catch {
  }
}
