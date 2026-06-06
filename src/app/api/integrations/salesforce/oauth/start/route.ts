import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { signCookieValue } from "@/lib/signed-cookies";
import { incrementMetric } from "@/lib/metrics";

const COOKIE_NAME = "salesforce_oauth_state";
const COOKIE_PATH = "/api/integrations/salesforce/oauth";
const COOKIE_MAX_AGE_SECONDS = 60 * 10; // 10 minutes

const SALESFORCE_OAUTH_SCOPES = ["api", "refresh_token"];

export async function GET() {
  const clientId = process.env.SALESFORCE_OAUTH_CLIENT_ID;
  const redirectUri = process.env.SALESFORCE_OAUTH_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Salesforce OAuth env vars are not configured" },
      { status: 500 }
    );
  }

  let userId: string;
  try {
    userId = await getAuthenticatedUserId();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const state = crypto.randomBytes(32).toString("base64url");
  const cookieValue = signCookieValue({ state, userId });

  const authUrl = new URL(
    "https://login.salesforce.com/services/oauth2/authorize"
  );
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", SALESFORCE_OAUTH_SCOPES.join(" "));
  authUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set(COOKIE_NAME, cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: COOKIE_PATH,
  });

  void incrementMetric("salesforce.oauth.start.initiated", 1);
  return response;
}
