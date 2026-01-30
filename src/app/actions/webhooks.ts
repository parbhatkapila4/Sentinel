"use server";

import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import {
  generateWebhookSecret,
  deliverWebhook,
  type WebhookPayload,
} from "@/lib/webhooks";
import { revalidatePath } from "next/cache";
import { enforceWebhookLimit } from "@/lib/plan-enforcement";
import { incrementUsage } from "@/lib/plans";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/audit-log";

export async function createWebhook(data: {
  name: string;
  url: string;
  events: string[];
  teamId?: string;
}) {
  const userId = await getAuthenticatedUserId();

  await enforceWebhookLimit(userId);

  const webhook = await prisma.webhook.create({
    data: {
      userId,
      teamId: data.teamId ?? null,
      name: data.name,
      url: data.url,
      secret: generateWebhookSecret(),
      events: data.events,
    },
  });

  await incrementUsage(userId, "webhooks", 1);

  await logAuditEvent(
    userId,
    AUDIT_ACTIONS.WEBHOOK_CREATED,
    "webhook",
    webhook.id,
    {
      name: webhook.name,
      url: webhook.url.replace(/^(https?:\/\/[^\/]+).*$/, "$1/***"), 
      events: webhook.events,
    }
  );

  revalidatePath("/settings/webhooks");
  return webhook;
}

export async function getMyWebhooks() {
  const userId = await getAuthenticatedUserId();

  return prisma.webhook.findMany({
    where: { userId },
    include: {
      _count: { select: { deliveries: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getWebhookById(id: string) {
  const userId = await getAuthenticatedUserId();

  return prisma.webhook.findFirst({
    where: { id, userId },
    include: {
      deliveries: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
}

export async function updateWebhook(
  id: string,
  data: {
    name?: string;
    url?: string;
    events?: string[];
    isActive?: boolean;
  }
) {
  const userId = await getAuthenticatedUserId();

  const webhook = await prisma.webhook.findFirst({
    where: { id, userId },
  });

  if (!webhook) {
    throw new Error("Webhook not found");
  }

  const result = await prisma.webhook.updateMany({
    where: { id, userId },
    data,
  });

  await logAuditEvent(
    userId,
    AUDIT_ACTIONS.WEBHOOK_UPDATED,
    "webhook",
    id,
    {
      name: data.name || webhook.name,
      changes: Object.keys(data),
    }
  );

  revalidatePath("/settings/webhooks");
  return result;
}

export async function deleteWebhook(id: string) {
  const userId = await getAuthenticatedUserId();

  const webhook = await prisma.webhook.findFirst({
    where: { id, userId },
  });

  await prisma.webhook.deleteMany({
    where: { id, userId },
  });

  if (webhook) {
    await logAuditEvent(
      userId,
      AUDIT_ACTIONS.WEBHOOK_DELETED,
      "webhook",
      id,
      {
        name: webhook.name,
      }
    );
  }

  revalidatePath("/settings/webhooks");
}

export async function regenerateWebhookSecret(id: string) {
  const userId = await getAuthenticatedUserId();

  const newSecret = generateWebhookSecret();

  await prisma.webhook.updateMany({
    where: { id, userId },
    data: { secret: newSecret },
  });

  await logAuditEvent(
    userId,
    AUDIT_ACTIONS.WEBHOOK_SECRET_REGENERATED,
    "webhook",
    id,
    {
      timestamp: new Date().toISOString(),
    }
  );

  revalidatePath("/settings/webhooks");
  return newSecret;
}

export async function testWebhook(id: string) {
  const userId = await getAuthenticatedUserId();

  const webhook = await prisma.webhook.findFirst({
    where: { id, userId },
  });

  if (!webhook) throw new Error("Webhook not found");

  const payload: WebhookPayload = {
    id: crypto.randomUUID(),
    event: "deal.created",
    timestamp: new Date().toISOString(),
    data: {
      test: true,
      message: "This is a test webhook delivery from Sentinel",
    },
  };

  const result = await deliverWebhook(webhook.id, payload);
  return result;
}
