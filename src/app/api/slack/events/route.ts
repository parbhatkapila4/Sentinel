import { NextRequest, NextResponse } from "next/server";
import {
  handleSlackEvent,
  verifySlackSignature,
  type SlackEventEnvelope,
} from "@/lib/slack-events";
import { logError, logWarn } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch (error) {
    logError("slack_webhook_body_read_failed", error, {});
    return NextResponse.json({ error: "body_read_failed" }, { status: 400 });
  }

  let body: SlackEventEnvelope & { challenge?: string };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "malformed_json" }, { status: 400 });
  }

  if (body.type === "url_verification" && typeof body.challenge === "string") {
    return NextResponse.json({ challenge: body.challenge });
  }

  const verification = await verifySlackSignature(req, rawBody);
  if (!verification.valid) {
    logWarn("slack_webhook_signature_failed", {
      reason: verification.reason,
    });
    return NextResponse.json(
      { error: "signature_invalid", reason: verification.reason },
      { status: 401 }
    );
  }

  void handleSlackEvent(body).catch((error) => {
    logError("slack_handler_unhandled_error", error, {
      slackEventId: body.event_id ?? null,
      teamId: body.team_id ?? null,
    });
  });

  return NextResponse.json({ ok: true });
}
