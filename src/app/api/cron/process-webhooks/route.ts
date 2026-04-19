import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { deliverWebhook, type WebhookPayload } from "@/lib/webhooks";
import { requireCronBearerAuth } from "@/lib/cron-auth";

export const maxDuration = 60;

const WEBHOOK_QUEUE = "webhook_queue";
const MAX_PER_RUN = 20;

async function runProcessWebhooks(): Promise<NextResponse> {
  if (!redis) {
    return NextResponse.json(
      { processed: 0, error: "Redis not configured" },
      { status: 503 }
    );
  }
  let processed = 0;
  for (let i = 0; i < MAX_PER_RUN; i++) {
    const raw = await redis.rpop(WEBHOOK_QUEUE);
    if (!raw || typeof raw !== "string") break;
    try {
      const job = JSON.parse(raw) as {
        webhookId: string;
        payload: WebhookPayload;
      };
      await deliverWebhook(job.webhookId, job.payload);
      processed++;
    } catch (error) {
      console.error("[cron/process-webhooks] Job error:", error);
    }
  }
  return NextResponse.json({ processed });
}

export async function GET(request: NextRequest) {
  const authError = requireCronBearerAuth(request);
  if (authError) return authError;
  return runProcessWebhooks();
}

export async function POST(request: NextRequest) {
  const authError = requireCronBearerAuth(request);
  if (authError) return authError;
  return runProcessWebhooks();
}
