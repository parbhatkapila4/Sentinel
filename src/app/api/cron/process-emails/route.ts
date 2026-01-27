import { NextRequest } from "next/server";
import { redis } from "@/lib/redis";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const EMAIL_QUEUE = "email_queue";
const MAX_PER_RUN = 10;

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
    ?? request.headers.get("x-cron-secret")
    ?? request.nextUrl.searchParams.get("secret");
  const expected = process.env.CRON_SECRET;
  if (expected && secret !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!redis) {
    return Response.json(
      { processed: 0, error: "Redis not configured" },
      { status: 503 }
    );
  }

  let processed = 0;
  for (let i = 0; i < MAX_PER_RUN; i++) {
    const raw = await redis.rpop(EMAIL_QUEUE);
    if (!raw || typeof raw !== "string") break;

    try {
      const job = JSON.parse(raw) as {
        notificationId?: string;
        to?: string;
        subject?: string;
        html?: string;
      };
      const to = job.to?.trim();
      const subject = typeof job.subject === "string" ? job.subject : "Notification";
      const html = typeof job.html === "string" ? job.html : "";

      if (!to) continue;

      await sendEmail(to, subject, html);
      processed++;

      if (job.notificationId) {
        await prisma.notification.updateMany({
          where: { id: job.notificationId },
          data: { emailSent: true },
        });
      }
    } catch (e) {
      console.error("[cron/process-emails] Job error:", e);
    }
  }

  return Response.json({ processed });
}
