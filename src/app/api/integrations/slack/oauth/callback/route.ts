import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import { exchangeSlackCodeForTokens } from "@/lib/slack-oauth";
import { encryptIntegrationSecret } from "@/lib/integration-secrets";
import { incrementMetric } from "@/lib/metrics";
import { logError } from "@/lib/logger";
import { verifyCookieValue } from "@/lib/signed-cookies";

const COOKIE_NAME = "slack_oauth_state";
const COOKIE_PATH = "/api/integrations/slack/oauth";

interface StateCookiePayload {
  state: string;
  userId: string;
}

function buildIntegrationsUrl(
  request: NextRequest,
  params: Record<string, string>
): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const url = new URL("/settings", base);
  url.searchParams.set("tab", "integrations");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return url.toString();
}

function clearStateCookie(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, "", {
    maxAge: 0,
    path: COOKIE_PATH,
  });
  return response;
}

function errorResponse(
  status: number,
  code: string,
  clear = true
): NextResponse {
  const res = NextResponse.json({ error: code }, { status });
  return clear ? clearStateCookie(res) : res;
}

export async function GET(request: NextRequest) {
  const errorParam = request.nextUrl.searchParams.get("error");
  if (errorParam) {
    void incrementMetric("slack.oauth.callback.user_denied", 1);
    return clearStateCookie(
      NextResponse.redirect(
        buildIntegrationsUrl(request, { slack: "denied" })
      )
    );
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (!code || !state) {
    void incrementMetric("slack.oauth.callback.invalid_state", 1);
    return errorResponse(400, "missing_params");
  }

  const cookieRaw = request.cookies.get(COOKIE_NAME)?.value;
  const payload = verifyCookieValue<StateCookiePayload>(cookieRaw);
  if (!payload) {
    void incrementMetric("slack.oauth.callback.invalid_state", 1);
    return errorResponse(400, "invalid_state");
  }

  const cookieStateBuf = Buffer.from(payload.state);
  const queryStateBuf = Buffer.from(state);
  if (
    cookieStateBuf.length !== queryStateBuf.length ||
    !crypto.timingSafeEqual(cookieStateBuf, queryStateBuf)
  ) {
    void incrementMetric("slack.oauth.callback.state_mismatch", 1);
    return errorResponse(400, "state_mismatch");
  }

  let currentUserId: string;
  try {
    currentUserId = await getAuthenticatedUserId();
  } catch {
    void incrementMetric("slack.oauth.callback.user_mismatch", 1);
    return errorResponse(403, "user_mismatch");
  }
  if (currentUserId !== payload.userId) {
    void incrementMetric("slack.oauth.callback.user_mismatch", 1);
    return errorResponse(403, "user_mismatch");
  }

  const userId = payload.userId;

  try {
    const tokens = await exchangeSlackCodeForTokens(code);

    await prisma.slackEventsSubscription.upsert({
      where: { userId_teamId: { userId, teamId: tokens.teamId } },
      create: {
        userId,
        teamId: tokens.teamId,
        botToken: encryptIntegrationSecret(tokens.botToken),
        botUserId: tokens.botUserId,
        selfEmail: tokens.selfEmail,
        isActive: true,
      },
      update: {
        botToken: encryptIntegrationSecret(tokens.botToken),
        botUserId: tokens.botUserId,
        selfEmail: tokens.selfEmail,
        isActive: true,
      },
    });

    void incrementMetric("slack.oauth.callback.success", 1);
    return clearStateCookie(
      NextResponse.redirect(
        buildIntegrationsUrl(request, { slack: "connected" })
      )
    );
  } catch (error) {
    logError("slack_oauth_callback_failed", error, { userId });
    return clearStateCookie(
      NextResponse.redirect(
        buildIntegrationsUrl(request, { slack: "error" })
      )
    );
  }
}
