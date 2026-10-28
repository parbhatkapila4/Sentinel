"use server";

import crypto from "crypto";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
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
import { ForbiddenError, ValidationError } from "@/lib/errors";
import { getUserTeamRole } from "@/lib/team-utils";
import { isHttpsWebhookUrl, WEBHOOK_URL_HTTPS_MESSAGE } from "@/lib/webhook-url";
const WEBHOOK_PUBLIC_SELECT = {
  id: true,
  name: true,
  url: true,
  events: true,
  isActive: true,
  createdAt: true,
  _count: { select: { deliveries: true } },
} satisfies Prisma.WebhookSelect;

const RECENT_DELIVERIES = 20;
const RESPONSE_PREVIEW_CHARS = 200;

export async function createWebhook(data: {
  name: string;
  url: string;
  events: string[];
  teamId?: string;
}) {
  const userId = await getAuthenticatedUserId();

  if (!isHttpsWebhookUrl(data.url)) {
    throw new ValidationError(WEBHOOK_URL_HTTPS_MESSAGE, { url: "Must use https" });
  }

  if (data.teamId != null) {
    const role = await getUserTeamRole(userId, data.teamId);
    if (!role) throw new ForbiddenError("You are not a member of this team");
  }

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
  return {
    id: webhook.id,
    name: webhook.name,
    url: webhook.url,
    events: webhook.events,
    isActive: webhook.isActive,
    createdAt: webhook.createdAt,
  };
}

export async function getMyWebhooks() {
  const userId = await getAuthenticatedUserId();

  return prisma.webhook.findMany({
    where: { userId },
    select: WEBHOOK_PUBLIC_SELECT,
    orderBy: { createdAt: "desc" },
  });
}

export async function getWebhookById(id: string) {
  const userId = await getAuthenticatedUserId();

  const webhook = await prisma.webhook.findFirst({
    where: { id, userId },
    select: {
      ...WEBHOOK_PUBLIC_SELECT,
      deliveries: {
        orderBy: { createdAt: "desc" },
        take: RECENT_DELIVERIES,
        select: {
          id: true,
          event: true,
          statusCode: true,
          response: true,
          success: true,
          createdAt: true,
        },
      },
    },
  });
  if (!webhook) return null;
  const deliveryIds = webhook.deliveries.map((d) => d.id);
  const tests =
    deliveryIds.length === 0
      ? []
      : await prisma.webhookDelivery.findMany({
          where: {
            id: { in: deliveryIds },
            payload: { path: ["data", "test"], equals: true },
          },
          select: { id: true },
        });
  const testIds = new Set(tests.map((t) => t.id));

  return {
    ...webhook,
    deliveries: webhook.deliveries.map((d) => ({
      ...d,
      response: d.response ? d.response.slice(0, RESPONSE_PREVIEW_CHARS) : null,
      isTest: testIds.has(d.id),
    })),
  };
}

export async function revealWebhookSecret(id: string): Promise<string | null> {
  const userId = await getAuthenticatedUserId();

  const webhook = await prisma.webhook.findFirst({
    where: { id, userId },
    select: { secret: true },
  });
  return webhook?.secret ?? null;
}

const webhookUpdateSchema = z.object({
  name: z.string().optional(),
  url: z.string().optional(),
  events: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

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

  const parsed = webhookUpdateSchema.safeParse(data);
  if (!parsed.success) throw new ValidationError("Invalid webhook update");
  const updates = parsed.data;

  if (updates.url !== undefined && !isHttpsWebhookUrl(updates.url)) {
    throw new ValidationError(WEBHOOK_URL_HTTPS_MESSAGE, { url: "Must use https" });
  }

  const webhook = await prisma.webhook.findFirst({
    where: { id, userId },
  });

  if (!webhook) {
    throw new Error("Webhook not found");
  }

  const result = await prisma.webhook.updateMany({
    where: { id, userId },
    data: updates,
  });

  await logAuditEvent(
    userId,
    AUDIT_ACTIONS.WEBHOOK_UPDATED,
    "webhook",
    id,
    {
      name: updates.name || webhook.name,
      changes: Object.keys(updates),
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
