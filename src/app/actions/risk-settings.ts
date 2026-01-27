"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_INACTIVITY_THRESHOLD = 7;

export async function getMyRiskSettings() {
  const userId = await getAuthenticatedUserId();
  const row = await prisma.userRiskSettings.findUnique({
    where: { userId },
  });
  if (!row) {
    return {
      id: null,
      userId,
      inactivityThresholdDays: DEFAULT_INACTIVITY_THRESHOLD,
      enableCompetitiveSignals: true,
    };
  }
  return {
    id: row.id,
    userId: row.userId,
    inactivityThresholdDays: row.inactivityThresholdDays,
    enableCompetitiveSignals: row.enableCompetitiveSignals,
  };
}

export async function updateMyRiskSettings(settings: {
  inactivityThresholdDays?: number;
  enableCompetitiveSignals?: boolean;
}) {
  const userId = await getAuthenticatedUserId();


  if (settings.inactivityThresholdDays !== undefined) {
    if (settings.inactivityThresholdDays < 1 || settings.inactivityThresholdDays > 30) {
      throw new Error("Inactivity threshold must be between 1 and 30 days");
    }
  }

  await prisma.userRiskSettings.upsert({
    where: { userId },
    create: {
      userId,
      inactivityThresholdDays:
        settings.inactivityThresholdDays ?? DEFAULT_INACTIVITY_THRESHOLD,
      enableCompetitiveSignals:
        settings.enableCompetitiveSignals ?? true,
    },
    update: {
      ...(settings.inactivityThresholdDays !== undefined && {
        inactivityThresholdDays: settings.inactivityThresholdDays,
      }),
      ...(settings.enableCompetitiveSignals !== undefined && {
        enableCompetitiveSignals: settings.enableCompetitiveSignals,
      }),
    },
  });
  revalidatePath("/settings");
}

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
