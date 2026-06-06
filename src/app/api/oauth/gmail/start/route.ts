import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import {
  buildGoogleAuthUrl,
  generateOAuthState,
  serializeStateCookie,
} from "@/lib/google-oauth";

const OAUTH_COOKIE_NAME = "gmail_oauth_state";
const OAUTH_COOKIE_PATH = "/api/oauth/gmail";
const OAUTH_COOKIE_MAX_AGE_SECONDS = 60 * 10;
const GMAIL_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
];

export async function GET() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "Google OAuth env vars are not configured" },
      { status: 500 }
    );
  }

  let userId: string;
  try {
    userId = await getAuthenticatedUserId();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const state = generateOAuthState();
  const authUrl = buildGoogleAuthUrl({
    clientId,
    redirectUri,
    scopes: GMAIL_OAUTH_SCOPES,
    state,
  });

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(OAUTH_COOKIE_NAME, serializeStateCookie({ state, userId }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
    path: OAUTH_COOKIE_PATH,
  });
  return response;
}
