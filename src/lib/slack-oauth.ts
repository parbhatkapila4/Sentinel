import { ExternalServiceError } from "./errors";
import { fetchWithTimeout } from "./reliable-fetch";
import { logWarn } from "./logger";

const SLACK_OAUTH_ACCESS_URL = "https://slack.com/api/oauth.v2.access";
const slackUsersInfoUrl = (slackUserId: string): string =>
  `https://slack.com/api/users.info?user=${encodeURIComponent(slackUserId)}`;

const SLACK_TIMEOUT_MS = 15_000;

function readSlackOAuthEnv(): {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
} {
  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  const redirectUri = process.env.SLACK_OAUTH_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new ExternalServiceError(
      "slack",
      "Slack OAuth env vars are not configured"
    );
  }
  return { clientId, clientSecret, redirectUri };
}

export interface SlackExchangedTokens {
  botToken: string;
  botUserId: string;
  teamId: string;
  teamName: string | null;
  scopes: string;
  selfEmail: string | null;
}

interface SlackOAuthAccessResponse {
  ok: boolean;
  error?: string;
  access_token?: string;
  token_type?: string;
  scope?: string;
  bot_user_id?: string;
  team?: { id?: string; name?: string };
  authed_user?: { id?: string; access_token?: string };
}

interface SlackUsersInfoResponse {
  ok: boolean;
  error?: string;
  user?: { profile?: { email?: string } };
}

export async function exchangeSlackCodeForTokens(
  code: string
): Promise<SlackExchangedTokens> {
  const { clientId, clientSecret, redirectUri } = readSlackOAuthEnv();

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  const res = await fetchWithTimeout(
    SLACK_OAUTH_ACCESS_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: body.toString(),
    },
    {
      timeoutMs: SLACK_TIMEOUT_MS,
      timeoutMessage: "Slack token exchange timed out",
    }
  );

  if (!res.ok) {
    throw new ExternalServiceError(
      "slack",
      `oauth.v2.access HTTP error: ${res.status}`
    );
  }

  let payload: SlackOAuthAccessResponse;
  try {
    payload = (await res.json()) as SlackOAuthAccessResponse;
  } catch (error) {
    throw new ExternalServiceError(
      "slack",
      "oauth.v2.access response body was not JSON",
      error
    );
  }

  if (!payload.ok) {
    throw new ExternalServiceError(
      "slack",
      `oauth.v2.access failed: ${payload.error ?? "unknown_error"}`
    );
  }

  const botToken = payload.access_token;
  const botUserId = payload.bot_user_id;
  const teamId = payload.team?.id;

  if (!botToken || !botUserId || !teamId) {
    throw new ExternalServiceError(
      "slack",
      "oauth.v2.access response missing required fields (access_token / bot_user_id / team.id)"
    );
  }

  const selfEmail = await resolveInstallerEmail(
    botToken,
    payload.authed_user?.id
  );

  return {
    botToken,
    botUserId,
    teamId,
    teamName: payload.team?.name ?? null,
    scopes: payload.scope ?? "",
    selfEmail,
  };
}

async function resolveInstallerEmail(
  botToken: string,
  authedUserId: string | undefined
): Promise<string | null> {
  if (!authedUserId) return null;

  try {
    const res = await fetchWithTimeout(
      slackUsersInfoUrl(authedUserId),
      {
        method: "GET",
        headers: { Authorization: `Bearer ${botToken}` },
      },
      {
        timeoutMs: SLACK_TIMEOUT_MS,
        timeoutMessage: "Slack users.info timed out",
      }
    );

    if (!res.ok) return null;
    const json = (await res.json()) as SlackUsersInfoResponse;
    if (!json.ok) return null;

    return json.user?.profile?.email ?? null;
  } catch (error) {
    logWarn("slack_oauth_users_info_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
