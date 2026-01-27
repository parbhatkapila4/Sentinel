import { prisma } from "./prisma";
import { retryWithBackoff } from "./retry";
import { RetryableError } from "./errors";
import { logError, logWarn } from "./logger";

interface SlackMessage {
  text?: string;
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
}

interface SlackBlock {
  type: string;
  text?: { type: string; text: string; emoji?: boolean };
  fields?: Array<{ type: string; text: string }>;
  accessory?: Record<string, unknown>;
}

interface SlackAttachment {
  color?: string;
  title?: string;
  text?: string;
  fields?: Array<{ title: string; value: string; short?: boolean }>;
}

export async function sendSlackNotification(
  userId: string,
  teamId: string | null,
  event: string,
  message: SlackMessage
): Promise<void> {
  const integrations = await prisma.slackIntegration.findMany({
    where: {
      OR: [
        { userId, isActive: true },
        ...(teamId ? [{ teamId, isActive: true }] : []),
      ],
      notifyOn: { has: event },
    },
  });

  for (const integration of integrations) {
    try {
      await retryWithBackoff(
        async () => {
          const response = await fetch(integration.webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(message),
          });

          if (!response.ok) {
            if (response.status === 429 || response.status >= 500) {
              throw new RetryableError(`Slack webhook returned ${response.status}`, {
                statusCode: response.status,
              });
            }

            throw new Error(`Slack webhook returned ${response.status}`);
          }
        },
        {
          maxRetries: 3,
          isIdempotent: true,
        }
      );
    } catch (error) {
      logWarn("Failed to send Slack notification", {
        userId,
        teamId,
        event,
        webhookUrl: integration.webhookUrl.substring(0, 50) + "...",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export function formatDealAtRiskSlackMessage(deal: {
  name: string;
  value: number;
  stage: string;
  riskLevel: string;
  riskReason?: string;
}): SlackMessage {
  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: { type: "plain_text", text: "⚠️ Deal At Risk", emoji: true },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Deal:*\n${deal.name}` },
        { type: "mrkdwn", text: `*Value:*\n$${deal.value.toLocaleString("en-US")}` },
        { type: "mrkdwn", text: `*Stage:*\n${deal.stage}` },
        { type: "mrkdwn", text: `*Risk Level:*\n${deal.riskLevel}` },
      ],
    },
  ];
  if (deal.riskReason) {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `*Reason:* ${deal.riskReason}` },
    });
  }
  return { blocks };
}

export function formatDealWonSlackMessage(deal: {
  name: string;
  value: number;
}): SlackMessage {
  return {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "🎉 Deal Closed Won!", emoji: true },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Deal:*\n${deal.name}` },
          { type: "mrkdwn", text: `*Value:*\n$${deal.value.toLocaleString("en-US")}` },
        ],
      },
    ],
  };
}

export function formatStageChangeSlackMessage(deal: {
  name: string;
  value: number;
  oldStage: string;
  newStage: string;
}): SlackMessage {
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `📊 *${deal.name}* moved from _${deal.oldStage}_ to *${deal.newStage}*\nValue: $${deal.value.toLocaleString("en-US")}`,
        },
      },
    ],
  };
}
