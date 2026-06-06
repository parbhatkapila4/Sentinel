import crypto from "crypto";

export type GoogleScope = string;

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export class GoogleOAuthHttpError extends Error {
  constructor(
    public readonly step: "token_exchange" | "userinfo" | "refresh",
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "GoogleOAuthHttpError";
  }
}

export function buildGoogleAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  scopes: GoogleScope[];
  state: string;
}): string {
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", params.scopes.join(" "));
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("state", params.state);
  return url.toString();
}

export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString("hex");
}

export type OAuthStateCookie = { state: string; userId: string };

export function serializeStateCookie(payload: OAuthStateCookie): string {
  return JSON.stringify(payload);
}

export function parseStateCookie(
  raw: string | undefined
): OAuthStateCookie | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    typeof (parsed as { state?: unknown }).state !== "string" ||
    typeof (parsed as { userId?: unknown }).userId !== "string"
  ) {
    return null;
  }
  const payload = parsed as OAuthStateCookie;
  if (!payload.state || !payload.userId) return null;
  return payload;
}

export type GoogleTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  id_token?: string;
  token_type: string;
};

export async function exchangeCodeForTokens(params: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<GoogleTokenResponse> {
  const body = new URLSearchParams({
    code: params.code,
    client_id: params.clientId,
    client_secret: params.clientSecret,
    redirect_uri: params.redirectUri,
    grant_type: "authorization_code",
  });
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new GoogleOAuthHttpError(
      "token_exchange",
      res.status,
      "Google token exchange returned non-200"
    );
  }
  const parsed = (await res.json()) as GoogleTokenResponse;
  if (!parsed.access_token) {
    throw new GoogleOAuthHttpError(
      "token_exchange",
      res.status,
      "Google token exchange response missing access_token"
    );
  }
  return parsed;
}

export type GoogleUserInfo = {
  email: string;
  verified_email?: boolean;
  id?: string;
};

export type GoogleRefreshResponse = {
  access_token: string;
  expires_in: number;
  scope?: string;
  token_type: string;
};

export async function refreshGoogleAccessToken(params: {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}): Promise<GoogleRefreshResponse> {
  const body = new URLSearchParams({
    client_id: params.clientId,
    client_secret: params.clientSecret,
    grant_type: "refresh_token",
    refresh_token: params.refreshToken,
  });
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new GoogleOAuthHttpError(
      "refresh",
      res.status,
      "Google refresh-token exchange returned non-200"
    );
  }
  const parsed = (await res.json()) as GoogleRefreshResponse;
  if (!parsed.access_token) {
    throw new GoogleOAuthHttpError(
      "refresh",
      res.status,
      "Google refresh-token response missing access_token"
    );
  }
  return parsed;
}

export async function fetchGoogleUserInfo(
  accessToken: string
): Promise<GoogleUserInfo> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new GoogleOAuthHttpError(
      "userinfo",
      res.status,
      "Google userinfo returned non-200"
    );
  }
  return (await res.json()) as GoogleUserInfo;
}
