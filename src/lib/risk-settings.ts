import { prisma } from "@/lib/prisma";

export const DEFAULT_INACTIVITY_THRESHOLD = 7;

export async function getUserInactivityThreshold(userId: string): Promise<number> {
  const row = await prisma.userRiskSettings.findUnique({
    where: { userId },
    select: { inactivityThresholdDays: true },
  });
  return row?.inactivityThresholdDays ?? DEFAULT_INACTIVITY_THRESHOLD;
}

export async function isCompetitiveSignalsEnabled(userId: string): Promise<boolean> {
  const row = await prisma.userRiskSettings.findUnique({
    where: { userId },
    select: { enableCompetitiveSignals: true },
  });
  return row?.enableCompetitiveSignals ?? true;
}
