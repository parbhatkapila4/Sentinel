import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encryptIntegrationSecret } from "@/lib/integration-secrets";
import { logError, logInfo } from "@/lib/logger";
import {
  exchangeCodeForTokens,
  fetchGoogleUserInfo,
  GoogleOAuthHttpError,
  parseStateCookie,
} from "@/lib/google-oauth";

const OAUTH_COOKIE_NAME = "calendar_oauth_state";
const OAUTH_COOKIE_PATH = "/api/oauth/calendar";

type CallbackErrorCode =
  | "consent_denied"
  | "missing_params"
  | "state_mismatch"
  | "token_exchange"
  | "no_refresh_token"
  | "userinfo_failed"
  | "db_upsert"
  | "unknown";

function buildRedirectUrl(
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
  response.cookies.set(OAUTH_COOKIE_NAME, "", {
    maxAge: 0,
    path: OAUTH_COOKIE_PATH,
  });
  return response;
}

function redirectWithError(
  request: NextRequest,
  code: CallbackErrorCode
): NextResponse {
  return clearStateCookie(
    NextResponse.redirect(buildRedirectUrl(request, { calendar_error: code }))
  );
}

function redirectSuccess(request: NextRequest): NextResponse {
  return clearStateCookie(
    NextResponse.redirect(buildRedirectUrl(request, { calendar_connected: "1" }))
  );
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return redirectWithError(request, "unknown");
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const errorParam = request.nextUrl.searchParams.get("error");

  if (errorParam) {
    return redirectWithError(request, "consent_denied");
  }
  if (!code || !state) {
    return redirectWithError(request, "missing_params");
  }

  const cookieState = parseStateCookie(
    request.cookies.get(OAUTH_COOKIE_NAME)?.value
  );
  if (!cookieState || cookieState.state !== state) {
    return redirectWithError(request, "state_mismatch");
  }

  const userId = cookieState.userId;

  try {
    let tokens;
    try {
      tokens = await exchangeCodeForTokens({
        code,
        clientId,
        clientSecret,
        redirectUri,
      });
    } catch (error) {
      const status = error instanceof GoogleOAuthHttpError ? error.status : undefined;
      logError("calendar_oauth_error", error, {
        step: "token_exchange",
        userId,
        ...(status !== undefined ? { status } : {}),
      });
      return redirectWithError(request, "token_exchange");
    }
    if (!tokens.refresh_token) {
      logError("calendar_oauth_error", new Error("no_refresh_token"), {
        step: "token_exchange",
        userId,
      });
      return redirectWithError(request, "no_refresh_token");
    }

    let userinfo;
    try {
      userinfo = await fetchGoogleUserInfo(tokens.access_token);
    } catch (error) {
      const status = error instanceof GoogleOAuthHttpError ? error.status : undefined;
      logError("calendar_oauth_error", error, {
        step: "userinfo",
        userId,
        ...(status !== undefined ? { status } : {}),
      });
      return redirectWithError(request, "userinfo_failed");
    }
    const connectedEmail = userinfo.email ?? null;

    const encryptedAccess = encryptIntegrationSecret(tokens.access_token);
    const encryptedRefresh = encryptIntegrationSecret(tokens.refresh_token);
    const expiryDate = new Date(
      Date.now() + (tokens.expires_in ?? 3600) * 1000
    );

    try {
      await prisma.calendarIntegration.upsert({
        where: { userId },
        create: {
          userId,
          email: connectedEmail,
          accessToken: encryptedAccess,
          refreshToken: encryptedRefresh,
          scope: tokens.scope ?? "",
          expiryDate,
        },
        update: {
          email: connectedEmail,
          accessToken: encryptedAccess,
          refreshToken: encryptedRefresh,
          scope: tokens.scope ?? "",
          expiryDate,
        },
      });
    } catch (error) {
      logError("calendar_oauth_error", error, {
        step: "db_upsert",
        userId,
      });
      return redirectWithError(request, "db_upsert");
    }

    logInfo("calendar_oauth_connected", { userId });
    return redirectSuccess(request);
  } catch (error) {
    logError("calendar_oauth_error", error, {
      step: "unknown",
      userId,
    });
    return redirectWithError(request, "unknown");
  }
}
