"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ValidationError } from "@/lib/errors";
import { withDbRetry } from "@/lib/db-connection-helper";
import { logError, logInfo } from "@/lib/logger";
import { withErrorContext } from "@/lib/error-context";

const DEFAULT_INACTIVITY_THRESHOLD = 7;

export async function getMyRiskSettings() {
  try {
    const userId = await getAuthenticatedUserId();
    const row = await withDbRetry(
      () =>
        prisma.userRiskSettings.findUnique({
          where: { userId },
        }),
      2,
      100
    );
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
  } catch (error) {
    logError("Failed to get risk settings", error, {
      actionType: "get_risk_settings",
    });

    return {
      id: null,
      userId: "",
      inactivityThresholdDays: DEFAULT_INACTIVITY_THRESHOLD,
      enableCompetitiveSignals: true,
    };
  }
}

export async function updateMyRiskSettings(settings: {
  inactivityThresholdDays?: number;
  enableCompetitiveSignals?: boolean;
}) {
  return await withErrorContext(
    {
      actionType: "update_risk_settings",
    },
    async () => {
      const userId = await getAuthenticatedUserId();


      if (settings.inactivityThresholdDays !== undefined) {
        if (
          settings.inactivityThresholdDays < 1 ||
          settings.inactivityThresholdDays > 30
        ) {
          throw new ValidationError(
            "Inactivity threshold must be between 1 and 30 days"
          );
        }
      }

      try {
        await withDbRetry(
          () =>
            prisma.userRiskSettings.upsert({
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
            }),
          2,
          100
        );

        logInfo("Risk settings updated successfully", {
          userId,
          inactivityThresholdDays: settings.inactivityThresholdDays,
          enableCompetitiveSignals: settings.enableCompetitiveSignals,
        });

        revalidatePath("/settings");
      } catch (error) {
        logError("Failed to update risk settings", error, {
          userId,
          settings,
        });
        throw error;
      }
    }
  );
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
