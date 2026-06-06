import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setUserPlanByType } from "@/lib/plans";
import {
  resolvePlanFromCapturedPayment,
  verifyPayPalWebhookSignature,
  type PaypalWebhookEvent,
} from "@/lib/paypal";
import { logError, logInfo, logWarn } from "@/lib/logger";

export const runtime = "nodejs";

function getRequiredHeader(headers: Headers, key: string): string | null {
  return headers.get(key) || headers.get(key.toLowerCase());
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    let event: PaypalWebhookEvent;
    try {
      event = JSON.parse(rawBody) as PaypalWebhookEvent;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const transmissionId = getRequiredHeader(
      request.headers,
      "paypal-transmission-id"
    );
    const transmissionTime = getRequiredHeader(
      request.headers,
      "paypal-transmission-time"
    );
    const certUrl = getRequiredHeader(request.headers, "paypal-cert-url");
    const authAlgo = getRequiredHeader(request.headers, "paypal-auth-algo");
    const transmissionSig = getRequiredHeader(
      request.headers,
      "paypal-transmission-sig"
    );

    if (
      !transmissionId ||
      !transmissionTime ||
      !certUrl ||
      !authAlgo ||
      !transmissionSig
    ) {
      return NextResponse.json(
        { success: false, error: "Missing PayPal signature headers" },
        { status: 400 }
      );
    }

    const verified = await verifyPayPalWebhookSignature({
      transmissionId,
      transmissionTime,
      certUrl,
      authAlgo,
      transmissionSig,
      webhookEvent: event,
    });

    if (!verified) {
      logWarn("Rejected PayPal webhook with invalid signature", {
        eventId: event.id,
        eventType: event.event_type,
      });
      return NextResponse.json(
        { success: false, error: "Signature verification failed" },
        { status: 400 }
      );
    }

    if (event.event_type !== "PAYMENT.CAPTURE.COMPLETED") {
      return NextResponse.json({ success: true, ignored: true });
    }

    const payerEmail = event.resource?.payer?.email_address?.trim().toLowerCase();
    const amountValue = event.resource?.amount?.value;
    const currencyCode = event.resource?.amount?.currency_code;
    const captureId = event.resource?.id || event.id;

    if (!payerEmail || !amountValue || !currencyCode) {
      logWarn("PayPal capture event missing required fields", {
        eventId: event.id,
        captureId,
      });
      return NextResponse.json({ success: true, ignored: true });
    }

    const targetPlan = resolvePlanFromCapturedPayment({
      amountValue,
      currencyCode,
    });

    if (!targetPlan) {
      logWarn("PayPal capture amount did not map to a paid plan", {
        eventId: event.id,
        captureId,
        amountValue,
        currencyCode,
      });
      return NextResponse.json({ success: true, ignored: true });
    }

    const user = await prisma.user.findUnique({
      where: { email: payerEmail },
      select: { id: true, email: true },
    });

    if (!user) {
      logWarn("PayPal payer email does not match any Sentinel user", {
        eventId: event.id,
        captureId,
        payerEmail,
      });
      return NextResponse.json({ success: true, ignored: true });
    }

    await setUserPlanByType(user.id, targetPlan);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "billing.plan_upgraded",
        resource: "user_plan",
        resourceId: user.id,
        metadata: {
          provider: "paypal",
          eventId: event.id,
          captureId,
          payerEmail,
          amountValue,
          currencyCode,
          planType: targetPlan,
        },
      },
    });

    logInfo("Applied paid plan from verified PayPal capture", {
      eventId: event.id,
      captureId,
      payerEmail,
      userId: user.id,
      planType: targetPlan,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("PayPal webhook processing failed", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

