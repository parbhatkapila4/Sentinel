import { prisma } from "@/lib/prisma";
import { calculateDealRisk, determineDealStatus } from "@/lib/risk";

export async function recalculateAndPersistDealRisk(dealId: string) {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { events: true },
  });

  if (!deal) return;

  const risk = calculateDealRisk(deal, deal.events);

  await prisma.deal.update({
    where: { id: deal.id },
    data: {
      riskScore: risk.score,
      status: determineDealStatus(risk.score, deal.status),
    },
  });
}
