"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createSlackIntegration(data: {
  webhookUrl: string;
  channelName?: string;
  notifyOn: string[];
  teamId?: string;
}) {
  const userId = await getAuthenticatedUserId();

  const integration = await prisma.slackIntegration.create({
    data: {
      userId,
      teamId: data.teamId ?? null,
      webhookUrl: data.webhookUrl,
      channelName: data.channelName ?? null,
      notifyOn: data.notifyOn,
    },
  });

  revalidatePath("/settings/integrations");
  return integration;
}

export async function getMySlackIntegrations() {
  const userId = await getAuthenticatedUserId();

  return prisma.slackIntegration.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateSlackIntegration(
  id: string,
  data: {
    webhookUrl?: string;
    channelName?: string;
    notifyOn?: string[];
    isActive?: boolean;
  }
) {
  const userId = await getAuthenticatedUserId();

  await prisma.slackIntegration.updateMany({
    where: { id, userId },
    data,
  });

  revalidatePath("/settings/integrations");
}

export async function deleteSlackIntegration(id: string) {
  const userId = await getAuthenticatedUserId();

  await prisma.slackIntegration.deleteMany({
    where: { id, userId },
  });

  revalidatePath("/settings/integrations");
}

export async function testSlackIntegration(id: string) {
  const userId = await getAuthenticatedUserId();

  const integration = await prisma.slackIntegration.findFirst({
    where: { id, userId },
  });

  if (!integration) throw new Error("Integration not found");

  try {
    const response = await fetch(integration.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Sentinel Test Message*\nYour Slack integration is working correctly!",
            },
          },
        ],
      }),
    });

    return { success: response.ok };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export interface SlackStatus {
  connected: boolean;
  channelCount: number;
  channels: string[];
}

export async function getSlackStatus(): Promise<SlackStatus> {
  const userId = await getAuthenticatedUserId();

  const integrations = await prisma.slackIntegration.findMany({
    where: { userId, isActive: true },
  });

  if (integrations.length === 0) {
    return {
      connected: false,
      channelCount: 0,
      channels: [],
    };
  }

  return {
    connected: true,
    channelCount: integrations.length,
    channels: integrations
      .map((i) => i.channelName)
      .filter((name): name is string => Boolean(name)),
  };
}
