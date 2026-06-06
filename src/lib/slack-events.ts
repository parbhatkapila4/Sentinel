import crypto from "crypto";
import type { NextRequest } from "next/server";
import { Prisma, type SlackEventsSubscription } from "@prisma/client";
import { prisma } from "./prisma";
import { decryptIntegrationSecret } from "./integration-secrets";
import { batchCheckCrmBook } from "./crm-permission";
import { normalizeContactEmail } from "./contact-utils";
import { incrementMetric } from "./metrics";
import { logError, logInfo, logWarn } from "./logger";

export type SignatureFailureReason =
  | "no_timestamp"
  | "no_signature"
  | "replay"
  | "mismatch"
  | "no_secret";

export interface SignatureVerificationResult {
  valid: boolean;
  reason?: SignatureFailureReason;
}

const REPLAY_WINDOW_SECONDS = 300;
export async function verifySlackSignature(
  req: NextRequest,
  rawBody: string
): Promise<SignatureVerificationResult> {
  const timestampHeader = req.headers.get("x-slack-request-timestamp");
  if (!timestampHeader) return { valid: false, reason: "no_timestamp" };

  const signatureHeader = req.headers.get("x-slack-signature");
  if (!signatureHeader) return { valid: false, reason: "no_signature" };

  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret) return { valid: false, reason: "no_secret" };

  const timestamp = parseInt(timestampHeader, 10);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (
    !Number.isFinite(timestamp) ||
    Math.abs(nowSeconds - timestamp) > REPLAY_WINDOW_SECONDS
  ) {
    return { valid: false, reason: "replay" };
  }

  const baseString = `v0:${timestamp}:${rawBody}`;
  const expected =
    "v0=" +
    crypto.createHmac("sha256", secret).update(baseString).digest("hex");

  if (expected.length !== signatureHeader.length) {
    return { valid: false, reason: "mismatch" };
  }

  const expectedBuf = Buffer.from(expected, "utf8");
  const providedBuf = Buffer.from(signatureHeader, "utf8");
  const equal = crypto.timingSafeEqual(expectedBuf, providedBuf);
  if (!equal) return { valid: false, reason: "mismatch" };

  return { valid: true };
}

interface CachedEmail {
  email: string | null;
  expiresAt: number;
}

const RESOLVER_TTL_MS = 24 * 60 * 60 * 1000;
const userEmailCache = new Map<string, CachedEmail>();

function cacheKey(teamId: string, userId: string): string {
  return `${teamId}:${userId}`;
}

export function __clearSlackResolverCacheForTests(): void {
  userEmailCache.clear();
}

export class SlackRateLimitError extends Error {
  constructor() {
    super("slack_users_info_ratelimited");
    this.name = "SlackRateLimitError";
  }
}

interface SlackUsersInfoResponse {
  ok: boolean;
  error?: string;
  user?: {
    id: string;
    name?: string;
    deleted?: boolean;
    is_bot?: boolean;
    profile?: { email?: string };
  };
}

export async function resolveSlackUserEmail(
  subscription: SlackEventsSubscription,
  slackUserId: string
): Promise<string | null> {
  const key = cacheKey(subscription.teamId, slackUserId);
  const now = Date.now();

  const cached = userEmailCache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.email;
  }

  const botToken = decryptIntegrationSecret(subscription.botToken);
  const url = `https://slack.com/api/users.info?user=${encodeURIComponent(slackUserId)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${botToken}` },
  });

  if (!res.ok) {
    throw new Error(`slack_users_info_http_${res.status}`);
  }

  const json = (await res.json()) as SlackUsersInfoResponse;

  if (!json.ok) {
    if (json.error === "user_not_found") {
      userEmailCache.set(key, { email: null, expiresAt: now + RESOLVER_TTL_MS });
      return null;
    }
    if (json.error === "ratelimited") {
      throw new SlackRateLimitError();
    }
    throw new Error(`slack_users_info_failed:${json.error ?? "unknown"}`);
  }

  const user = json.user;
  if (!user || user.deleted || user.is_bot) {
    userEmailCache.set(key, { email: null, expiresAt: now + RESOLVER_TTL_MS });
    return null;
  }

  const email = user.profile?.email ?? null;
  userEmailCache.set(key, { email, expiresAt: now + RESOLVER_TTL_MS });
  return email;
}

export interface SlackEventEnvelope {
  type: string;
  team_id?: string;
  event_id?: string;
  event?: SlackInnerEvent;
}

export interface SlackInnerEvent {
  type?: string;
  subtype?: string;
  user?: string;
  text?: string;
  channel?: string;
  channel_type?: string;
  ts?: string;
  bot_id?: string;
}

const OUT_OF_SCOPE_SUBTYPES = new Set([
  "message_changed",
  "message_deleted",
  "channel_join",
  "channel_leave",
  "channel_topic",
  "channel_purpose",
  "channel_archive",
  "channel_unarchive",
  "thread_broadcast",
  "file_share",
  "me_message",
  "pinned_item",
  "unpinned_item",
]);

const MENTION_REGEX = /<@([UW][A-Z0-9]+)>/g;

function extractMentionedUserIds(text: string | undefined): string[] {
  if (!text) return [];
  const ids = new Set<string>();
  for (const match of text.matchAll(MENTION_REGEX)) {
    if (match[1]) ids.add(match[1]);
  }
  return Array.from(ids);
}

function isPrismaUniqueViolation(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}


export async function handleSlackEvent(
  body: SlackEventEnvelope
): Promise<void> {
  if (body.type !== "event_callback") return;

  const slackEventId = body.event_id;
  const teamId = body.team_id;
  const event = body.event;
  if (!slackEventId || !teamId || !event) return;

  const eventType = event.type ?? "unknown";

  if (event.subtype === "bot_message" || event.bot_id) {
    void incrementMetric(
      "crm_permission.slack_filter.dropped_bot_message",
      1
    );
    logInfo("slack_event_processed", {
      slackEventId,
      teamId,
      eventType,
      outcome: "dropped_bot_message",
    });
    return;
  }

  if (event.subtype && OUT_OF_SCOPE_SUBTYPES.has(event.subtype)) {
    void incrementMetric("crm_permission.slack_filter.out_of_scope", 1);
    logInfo("slack_event_processed", {
      slackEventId,
      teamId,
      eventType,
      outcome: "out_of_scope",
    });
    return;
  }

  const subscription = await prisma.slackEventsSubscription.findUnique({
    where: { teamId },
  });
  if (!subscription || !subscription.isActive) {
    void incrementMetric("crm_permission.slack_filter.no_subscription", 1);
    logInfo("slack_event_processed", {
      slackEventId,
      teamId,
      eventType,
      outcome: "no_subscription",
    });
    return;
  }

  if (event.user && event.user === subscription.botUserId) {
    void incrementMetric("crm_permission.slack_filter.dropped_self_bot", 1);
    logInfo("slack_event_processed", {
      slackEventId,
      teamId,
      eventType,
      outcome: "dropped_self_bot",
    });
    return;
  }

  const existing = await prisma.slackMessage.findUnique({
    where: {
      userId_slackEventId: {
        userId: subscription.userId,
        slackEventId,
      },
    },
    select: { id: true },
  });
  if (existing) {
    void incrementMetric("crm_permission.slack_filter.duplicate_event", 1);
    logInfo("slack_event_processed", {
      slackEventId,
      teamId,
      eventType,
      outcome: "duplicate_event",
    });
    return;
  }

  if (!event.user) {
    void incrementMetric("crm_permission.slack_filter.out_of_scope", 1);
    return;
  }

  let senderEmail: string | null;
  try {
    senderEmail = await resolveSlackUserEmail(subscription, event.user);
  } catch (error) {
    void incrementMetric("crm_permission.slack_filter.fail_closed", 1);
    logWarn("slack_resolver_failed", {
      slackEventId,
      teamId,
      eventType,
      step: "resolve_sender",
      errorCode:
        error instanceof SlackRateLimitError
          ? "ratelimited"
          : error instanceof Error
            ? error.message
            : "unknown",
    });
    return;
  }

  if (senderEmail === null) {
    void incrementMetric(
      "crm_permission.slack_filter.dropped_deleted_user",
      1
    );
    logInfo("slack_event_processed", {
      slackEventId,
      teamId,
      eventType,
      outcome: "dropped_deleted_user",
    });
    return;
  }

  const normalizedSelf = normalizeContactEmail(subscription.selfEmail);
  const normalizedSender = normalizeContactEmail(senderEmail);
  if (
    normalizedSelf &&
    normalizedSender &&
    normalizedSender === normalizedSelf
  ) {
    void incrementMetric("crm_permission.slack_filter.dropped_self_user", 1);
    logInfo("slack_event_processed", {
      slackEventId,
      teamId,
      eventType,
      outcome: "dropped_self_user",
    });
    return;
  }

  const candidateEmails = new Set<string>();
  if (normalizedSender) candidateEmails.add(normalizedSender);

  const channelType = event.channel_type ?? "channel";
  if (
    eventType === "app_mention" ||
    eventType === "message" && channelType !== "im"
  ) {
    const mentionedIds = extractMentionedUserIds(event.text).filter(
      (id) => id !== event.user && id !== subscription.botUserId
    );
    for (const mid of mentionedIds) {
      let email: string | null;
      try {
        email = await resolveSlackUserEmail(subscription, mid);
      } catch (error) {
        void incrementMetric("crm_permission.slack_filter.fail_closed", 1);
        logWarn("slack_resolver_failed", {
          slackEventId,
          teamId,
          eventType,
          step: "resolve_mention",
          errorCode:
            error instanceof SlackRateLimitError
              ? "ratelimited"
              : error instanceof Error
                ? error.message
                : "unknown",
        });
        return;
      }
      const norm = normalizeContactEmail(email);
      if (!norm) continue;
      if (normalizedSelf && norm === normalizedSelf) continue;
      candidateEmails.add(norm);
    }
  }

  if (candidateEmails.size === 0) {
    void incrementMetric("crm_permission.slack_filter.dropped_no_crm_match", 1);
    return;
  }

  const candidates = Array.from(candidateEmails);
  const bookResults = await batchCheckCrmBook(
    subscription.userId,
    candidates
  );
  const matchedEmails: string[] = [];
  for (const [email, check] of bookResults.entries()) {
    if (check.isInBook) matchedEmails.push(email);
  }

  if (matchedEmails.length === 0) {
    void incrementMetric(
      "crm_permission.slack_filter.dropped_no_crm_match",
      1
    );
    logInfo("slack_event_processed", {
      slackEventId,
      teamId,
      eventType,
      outcome: "dropped_no_crm_match",
    });
    return;
  }

  try {
    await prisma.slackMessage.create({
      data: {
        userId: subscription.userId,
        subscriptionId: subscription.id,
        slackEventId,
        teamId,
        channelId: event.channel ?? "",
        channelType,
        messageTs: event.ts ?? "",
        senderUserId: event.user,
        senderEmail: normalizedSender ?? senderEmail,
        text: event.text ?? null,
        matchedCrmContacts: matchedEmails,
        rawEvent: body as unknown as Prisma.InputJsonValue,
      },
    });
    void incrementMetric("crm_permission.slack_filter.passed", 1);
    logInfo("slack_event_processed", {
      slackEventId,
      teamId,
      eventType,
      outcome: "passed",
      matchedCount: matchedEmails.length,
    });
  } catch (error) {
    if (isPrismaUniqueViolation(error)) {
      void incrementMetric("crm_permission.slack_filter.duplicate_event", 1);
      logInfo("slack_event_processed", {
        slackEventId,
        teamId,
        eventType,
        outcome: "duplicate_event",
      });
      return;
    }
    void incrementMetric("crm_permission.slack_filter.fail_closed", 1);
    logError("slack_event_persist_failed", error, {
      slackEventId,
      teamId,
      eventType,
    });
  }
}
