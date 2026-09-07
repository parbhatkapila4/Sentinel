import { prisma } from "@/lib/prisma";
import {
  decryptIntegrationSecret,
  encryptIntegrationSecret,
} from "@/lib/integration-secrets";
import { fetchRecentGmailMessages, refreshGoogleToken } from "@/lib/gmail";
import { scoreSentiment } from "@/lib/sentiment";
import { extractGmailParticipants } from "@/lib/email-participants";
import { hasCrmParticipant } from "@/lib/crm-permission";
import { logInfo, logWarn } from "@/lib/logger";
import { SYNC_IN_PROGRESS, withSyncLock } from "./lock";

export interface GmailSyncResult {
  success: boolean;
  synced: number;
  scanned?: number;
  created?: number;
  updated?: number;
  failed?: number;
  skipped?: number;
  errors?: string[];
  lockSkipped?: boolean;
}

async function ensureFreshToken(integration: {
  id: string;
  accessToken: string;
  refreshToken: string;
  expiryDate: Date | null;
}) {
  if (!integration.expiryDate || integration.expiryDate > new Date(Date.now() + 60_000)) {
    return {
      accessToken: decryptIntegrationSecret(integration.accessToken),
      changed: false,
    };
  }
  const refreshed = await refreshGoogleToken(decryptIntegrationSecret(integration.refreshToken));
  const nextExpiry = new Date(Date.now() + refreshed.expiresIn * 1000);
  await prisma.gmailIntegration.update({
    where: { id: integration.id },
    data: {
      accessToken: encryptIntegrationSecret(refreshed.accessToken),
      tokenType: refreshed.tokenType,
      scope: refreshed.scope ?? null,
      expiryDate: nextExpiry,
    },
  });
  return { accessToken: refreshed.accessToken, changed: true };
}

export async function syncGmailForUser(userId: string): Promise<GmailSyncResult> {
  const outcome = await withSyncLock(userId, "gmail", () => runGmailSync(userId));
  if (outcome.skipped) {
    return { success: false, synced: 0, errors: [SYNC_IN_PROGRESS], lockSkipped: true };
  }
  return outcome.result;
}

async function runGmailSync(userId: string): Promise<GmailSyncResult> {
  const integration = await prisma.gmailIntegration.findUnique({ where: { userId } });
  if (!integration || !integration.isActive || !integration.syncEnabled) {
    return { success: false, synced: 0 };
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { email: true },
  });
  if (!user.email) {
    await prisma.gmailIntegration.update({
      where: { userId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "failed",
        syncErrors: "User email missing; permission filter cannot run",
      },
    });
    return {
      success: false,
      synced: 0,
      errors: ["User email missing; permission filter cannot run"],
      failed: 1,
    };
  }

  const errors: string[] = [];
  try {
    const { accessToken } = await ensureFreshToken(integration);
    const messages = await fetchRecentGmailMessages(accessToken, {
      since: integration.lastSyncAt,
    });

    let persisted = 0;
    let skipped = 0;
    let failed = 0;
    for (const message of messages) {
      const participants = extractGmailParticipants(message.headers);
      const filter = await hasCrmParticipant(userId, user.email, participants.all);
      if (!filter.passed) {
        skipped++;
        continue;
      }

      try {
        const sentiment = scoreSentiment(`${message.subject}\n${message.snippet}`);
        await prisma.emailMessage.upsert({
          where: {
            userId_externalId_source: {
              userId,
              externalId: message.externalId,
              source: "gmail",
            },
          },
          create: {
            userId,
            externalId: message.externalId,
            threadId: message.threadId,
            subject: message.subject,
            bodySnippet: message.snippet,
            fromEmail: message.fromEmail,
            toEmails: message.toEmails,
            sentAt: message.sentAt,
            sentimentScore: sentiment.score,
            sentimentLabel: sentiment.label,
            source: "gmail",
          },
          update: {
            threadId: message.threadId,
            subject: message.subject,
            bodySnippet: message.snippet,
            fromEmail: message.fromEmail,
            toEmails: message.toEmails,
            sentAt: message.sentAt,
            sentimentScore: sentiment.score,
            sentimentLabel: sentiment.label,
          },
        });
        persisted++;
      } catch (error) {
        failed++;
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }

    await prisma.gmailIntegration.update({
      where: { userId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "success",
        totalSynced: integration.totalSynced + persisted,
        syncErrors: errors.length ? errors.join("; ") : null,
      },
    });

    logInfo("Gmail sync completed", {
      userId,
      fetched: messages.length,
      persisted,
      skipped,
      errors: failed,
    });

    return {
      success: true,
      synced: persisted,
      scanned: messages.length,
      created: persisted,
      updated: 0,
      failed,
      skipped,
      errors: errors.length ? errors : undefined,
    };
  } catch (error) {
    await prisma.gmailIntegration.update({
      where: { userId },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "failed",
        syncErrors: String(error),
      },
    });
    logWarn("Gmail sync failed", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, synced: 0, errors: [String(error)], failed: 1 };
  }
}
