import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { redis } from "./redis";

const WEBHOOK_QUEUE = "webhook_queue";

export type WebhookEventType =
  | "deal.created"
  | "deal.updated"
  | "deal.stage_changed"
  | "deal.at_risk"
  | "deal.closed_won"
  | "deal.closed_lost"
  | "team.member_added"
  | "team.member_removed";

export interface WebhookPayload {
  id: string;
  event: WebhookEventType;
  timestamp: string;
  data: Record<string, unknown>;
}

export function generateSignature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function queueWebhookDelivery(
  webhookId: string,
  event: WebhookEventType,
  data: Record<string, unknown>
): Promise<void> {
  const payload: WebhookPayload = {
    id: crypto.randomUUID(),
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  if (!redis) {
    console.warn("[webhooks] Redis not configured; skipping queue.");
    return;
  }

  try {
    await redis.lpush(
      WEBHOOK_QUEUE,
      JSON.stringify({ webhookId, payload })
    );
  } catch (e) {
    console.error("[webhooks] Failed to queue delivery:", e);
  }
}

export async function dispatchWebhookEvent(
  userId: string,
  teamId: string | null,
  event: WebhookEventType,
  data: Record<string, unknown>
): Promise<void> {
  const webhooks = await prisma.webhook.findMany({
    where: {
      OR: [
        { userId, isActive: true },
        ...(teamId ? [{ teamId, isActive: true }] : []),
      ],
      events: { has: event },
    },
  });

  if (!webhooks || !Array.isArray(webhooks)) {
    return;
  }

  for (const webhook of webhooks) {
    const payload: WebhookPayload = {
      id: crypto.randomUUID(),
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    deliverWebhook(webhook.id, payload).catch((err) => {
      console.error("Webhook delivery failed:", err);
    });
  }
}

export async function deliverWebhook(
  webhookId: string,
  payload: WebhookPayload
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const webhook = await prisma.webhook.findUnique({
    where: { id: webhookId },
  });

  if (!webhook || !webhook.isActive) {
    return { success: false, error: "Webhook not found or inactive" };
  }

  const payloadString = JSON.stringify(payload);
  const signature = generateSignature(payloadString, webhook.secret);

  try {
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Event": payload.event,
        "X-Webhook-Delivery-Id": payload.id,
      },
      body: payloadString,
    });

    const responseText = await response.text().catch(() => "");

    await prisma.webhookDelivery.create({
      data: {
        webhookId,
        event: payload.event,
        payload: JSON.parse(JSON.stringify(payload)) as Prisma.InputJsonValue,
        statusCode: response.status,
        response: responseText.slice(0, 1000),
        success: response.ok,
      },
    });

    return { success: response.ok, statusCode: response.status };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    await prisma.webhookDelivery.create({
      data: {
        webhookId,
        event: payload.event,
        payload: JSON.parse(JSON.stringify(payload)) as Prisma.InputJsonValue,
        success: false,
        response: errorMessage,
      },
    });

    return { success: false, error: errorMessage };
  }
}
