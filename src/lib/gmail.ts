import { fetchWithTimeout } from "./reliable-fetch";
import { ExternalServiceError } from "./errors";
import {
  parseEmailAddressList,
  type GmailHeaders,
} from "./email-participants";

const GMAIL_BASE = "https://gmail.googleapis.com/gmail/v1";

type GmailListResponse = {
  messages?: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
};

type GmailMessageResponse = {
  id: string;
  threadId: string;
  snippet?: string;
  internalDate?: string;
  payload?: {
    headers?: Array<{ name: string; value: string }>;
  };
};

export type GmailMessage = {
  externalId: string;
  threadId: string;
  subject: string;
  snippet: string;
  fromEmail: string | null;
  toEmails: string[];
  sentAt: Date;
  headers: GmailHeaders;
};

function parseHeader(
  headers: Array<{ name: string; value: string }> | undefined,
  key: string
): string | null {
  const value = headers?.find((h) => h.name.toLowerCase() === key.toLowerCase())?.value;
  return value ?? null;
}

function parseEmails(raw: string | null): string[] {
  return parseEmailAddressList(raw ?? undefined);
}

// First-ever sync (no checkpoint) preserves the original behavior: newest 25, single page.
const FIRST_SYNC_MAX_RESULTS = 25;
// Per-run safety cap for incremental syncs so a large backlog cannot run unbounded.
const MAX_MESSAGES_PER_INCREMENTAL_SYNC = 500;

/**
 * Lists recent Gmail messages and returns their parsed metadata.
 *
 * When `since` is provided (the integration's last successful sync), only messages
 * newer than that checkpoint are fetched via the Gmail `after:` search filter, paging
 * through results up to `maxMessages` (default 500) so a busy mailbox is not capped at a
 * single page. When `since` is null (first-ever sync) the original behavior is preserved:
 * the newest `FIRST_SYNC_MAX_RESULTS` messages, single page, no filter.
 */
export async function fetchRecentGmailMessages(
  accessToken: string,
  options: { since?: Date | null; maxMessages?: number } = {}
): Promise<GmailMessage[]> {
  const since = options.since ?? null;
  const cap = since
    ? options.maxMessages ?? MAX_MESSAGES_PER_INCREMENTAL_SYNC
    : FIRST_SYNC_MAX_RESULTS;
  const pageSize = since ? 100 : FIRST_SYNC_MAX_RESULTS;

  const ids: Array<{ id: string; threadId: string }> = [];
  let pageToken: string | undefined;
  do {
    const listUrl = new URL(`${GMAIL_BASE}/users/me/messages`);
    listUrl.searchParams.set("maxResults", String(pageSize));
    if (since) {
      // Gmail search `after:` accepts epoch seconds; any boundary overlap is absorbed by the
      // upsert on @@unique([userId, externalId, source]), so this never under-fetches.
      listUrl.searchParams.set("q", `after:${Math.floor(since.getTime() / 1000)}`);
    }
    if (pageToken) {
      listUrl.searchParams.set("pageToken", pageToken);
    }

    const list = await fetchWithTimeout(
      listUrl.toString(),
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      {
        timeoutMs: 25000,
        timeoutMessage: "Gmail list request timed out",
      }
    );
    if (!list.ok) {
      throw new ExternalServiceError("gmail", `Failed listing messages (${list.status})`);
    }
    const listJson = (await list.json()) as GmailListResponse;
    for (const msg of listJson.messages ?? []) {
      if (ids.length >= cap) break;
      ids.push(msg);
    }
    pageToken = listJson.nextPageToken;
    // First-ever sync keeps single-page behavior; only incremental syncs paginate.
    if (!since) break;
  } while (pageToken && ids.length < cap);

  const output: GmailMessage[] = [];
  for (const msg of ids) {
    const details = await fetchWithTimeout(
      `${GMAIL_BASE}/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Cc&metadataHeaders=Bcc&metadataHeaders=Date`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
      {
        timeoutMs: 25000,
        timeoutMessage: "Gmail message details request timed out",
      }
    );
    if (!details.ok) continue;
    const body = (await details.json()) as GmailMessageResponse;
    const headers = body.payload?.headers ?? [];
    const subject = parseHeader(headers, "Subject") ?? "(No subject)";
    const from = parseHeader(headers, "From");
    const to = parseHeader(headers, "To");
    const cc = parseHeader(headers, "Cc");
    const bcc = parseHeader(headers, "Bcc");
    const date = parseHeader(headers, "Date");
    const sentAt = date ? new Date(date) : new Date(Number(body.internalDate ?? Date.now()));

    output.push({
      externalId: body.id,
      threadId: body.threadId,
      subject,
      snippet: body.snippet ?? "",
      fromEmail: from,
      toEmails: parseEmails(to),
      sentAt,
      headers: {
        from: from ?? undefined,
        to: to ?? undefined,
        cc: cc ?? undefined,
        bcc: bcc ?? undefined,
      },
    });
  }
  return output;
}

export async function refreshGoogleToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  scope?: string;
}> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials are not configured");
  }
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetchWithTimeout(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    },
    {
      timeoutMs: 25000,
      timeoutMessage: "Google OAuth token refresh request timed out",
    }
  );
  if (!res.ok) {
    throw new ExternalServiceError("gmail", `Google token refresh failed (${res.status})`);
  }
  const json = (await res.json()) as {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope?: string;
  };
  return {
    accessToken: json.access_token,
    expiresIn: json.expires_in,
    tokenType: json.token_type,
    scope: json.scope,
  };
}
