import { prisma } from "@/lib/prisma";

export async function calculateDealRiskFromTimeline(dealId: string): Promise<{
  riskScore: number;
  status: string;
  reasons: string[];
}> {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
  });

  if (!deal) {
    throw new Error(`Deal not found: ${dealId}`);
  }

  const timelineEvents = await prisma.dealTimeline.findMany({
    where: { dealId: deal.id },
    orderBy: { createdAt: "desc" },
  });

  const lastActivityAt =
    timelineEvents.length > 0 ? timelineEvents[0].createdAt : deal.createdAt;

  let score = 0;
  const reasons: string[] = [];

  const now = new Date();
  const daysSinceLastActivity =
    (now.getTime() - lastActivityAt.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceLastActivity > 7) {
    score += 0.4;
    reasons.push("No activity in last 7 days");
  }

  if (deal.stage === "negotiation") {
    const recentEmailReceived = timelineEvents.some((e) => {
      if (e.eventType !== "event_created") return false;
      const metadata = e.metadata as Record<string, unknown> | null;
      if (!metadata || metadata.eventType !== "email_received") return false;
      const daysSinceEvent =
        (now.getTime() - e.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceEvent <= 5;
    });

    if (!recentEmailReceived) {
      score += 0.4;
      reasons.push("Negotiation stalled without response");
    }
  }

  if (deal.value > 5000) {
    score += 0.2;
    reasons.push("High value deal requires attention");
  }

  score = Math.min(score, 1);

  let newStatus: string;
  if (deal.status === "saved" || deal.status === "lost") {
    newStatus = deal.status;
  } else {
    newStatus = score >= 0.6 ? "at_risk" : "active";
  }

  await prisma.deal.update({
    where: { id: deal.id },
    data: {
      riskScore: score,
      status: newStatus,
    },
  });

  return {
    riskScore: score,
    status: newStatus,
    reasons,
  };
}
