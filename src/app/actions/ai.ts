"use server";

import { getDealById } from "@/app/actions/deals";
import { appendDealTimeline } from "@/lib/timeline";
import { callOpenRouterForGeneration } from "@/lib/ai-router";
import {
  getFollowUpEmailPrompt,
  FOLLOW_UP_EMAIL_SYSTEM_PROMPT,
  getDealSummaryPrompt,
  getWinStrategyPrompt,
  WIN_STRATEGY_SYSTEM_PROMPT,
  type FollowUpEmailDealContext,
} from "@/lib/ai-prompts";
import type { EmailTone, GeneratedEmail, WinStrategy } from "@/types";
import { ValidationError } from "@/lib/errors";
import { differenceInDays } from "date-fns";

const HUMAN_EVENT_TYPES = ["email_sent", "email_received", "meeting_held"] as const;

type TimelineEntry = {
  eventType: string;
  createdAt: Date;
  metadata?: Record<string, unknown> | null;
};

function getLastInteractionAndPatterns(timeline: TimelineEntry[]): {
  lastInteractionType: string;
  previousCommunicationPatterns: string[];
} {
  const now = new Date();
  const patterns: string[] = [];
  let lastType = "initial outreach";

  for (const e of timeline) {
    if (e.eventType !== "event_created" || !e.metadata?.eventType) continue;
    const t = e.metadata.eventType as string;
    if (!HUMAN_EVENT_TYPES.includes(t as (typeof HUMAN_EVENT_TYPES)[number]))
      continue;
    const days = differenceInDays(now, new Date(e.createdAt));
    const label =
      t === "email_sent"
        ? "Email sent"
        : t === "email_received"
          ? "Email received"
          : "Meeting held";
    patterns.push(`${label} ${days} day${days !== 1 ? "s" : ""} ago`);
    if (patterns.length === 1) {
      lastType = label;
    }
  }

  if (patterns.length > 0) {
    lastType = patterns[0].replace(/\s+\d+\s+day.*/, "");
  }
  return {
    lastInteractionType: lastType,
    previousCommunicationPatterns: patterns.slice(0, 5),
  };
}

function buildEmailContext(deal: Awaited<ReturnType<typeof getDealById>>): FollowUpEmailDealContext {
  const now = new Date();
  const lastAt = deal.lastActivityAt ? new Date(deal.lastActivityAt) : new Date(deal.createdAt);
  const daysSince = differenceInDays(now, lastAt);
  const { lastInteractionType, previousCommunicationPatterns } = getLastInteractionAndPatterns(
    (deal.timeline ?? []).map((e) => ({
      eventType: e.eventType,
      createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
      metadata:
        e.metadata && typeof e.metadata === "object" && !Array.isArray(e.metadata)
          ? (e.metadata as Record<string, unknown>)
          : null,
    }))
  );

  return {
    dealName: deal.name,
    dealValue: deal.value,
    stage: deal.stage,
    daysSinceActivity: daysSince,
    lastInteractionType,
    riskReasons: deal.riskReasons ?? [],
    primaryRiskReason: deal.primaryRiskReason ?? null,
    recommendedAction: deal.recommendedAction?.label ?? null,
    previousCommunicationPatterns,
  };
}

function extractJson<T>(raw: string): T {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new ValidationError("AI did not return valid JSON");
  }
  const json = trimmed.slice(start, end + 1);
  return JSON.parse(json) as T;
}

export async function generateFollowUpEmail(
  dealId: string,
  tone: EmailTone = "professional",
  options?: { logToTimeline?: boolean }
): Promise<GeneratedEmail> {
  const deal = await getDealById(dealId);
  const ctx = buildEmailContext(deal);
  const prompt = getFollowUpEmailPrompt(ctx, tone);
  const raw = await callOpenRouterForGeneration(
    FOLLOW_UP_EMAIL_SYSTEM_PROMPT,
    prompt,
    { temperature: 0.5, maxTokens: 1500 }
  );

  const parsed = extractJson<{ subject: string; body: string; suggestedSendTime: string }>(raw);
  const subject = typeof parsed.subject === "string" ? parsed.subject : "Follow-up";
  const body = typeof parsed.body === "string" ? parsed.body : "";
  let suggestedSendTime: Date;
  try {
    suggestedSendTime = new Date(parsed.suggestedSendTime);
    if (Number.isNaN(suggestedSendTime.getTime())) {
      suggestedSendTime = new Date();
    }
  } catch {
    suggestedSendTime = new Date();
  }

  if (options?.logToTimeline !== false) {
    try {
      await appendDealTimeline(dealId, "email_drafted", {
        tone,
        subject,
        generatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Failed to log email_drafted to timeline:", e);
    }
  }

  return { subject, body, suggestedSendTime };
}

function timelineSummary(timeline: TimelineEntry[], max = 8): string {
  return timeline
    .slice(0, max)
    .map(
      (e) =>
        `- ${e.eventType}${e.metadata?.stage ? ` (${e.metadata.stage})` : ""} @ ${new Date(e.createdAt).toISOString().slice(0, 10)}`
    )
    .join("\n");
}

function eventsSummary(events: Array<{ type: string; createdAt: Date }>): string {
  if (events.length === 0) return "No events recorded.";
  return events
    .slice(0, 10)
    .map((e) => `- ${e.type} @ ${new Date(e.createdAt).toISOString().slice(0, 10)}`)
    .join("\n");
}

export async function generateDealSummary(dealId: string): Promise<string> {
  const deal = await getDealById(dealId);
  const timeline = (deal.timeline ?? []).map((e) => ({
    eventType: e.eventType,
    createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
    metadata:
      e.metadata && typeof e.metadata === "object" && !Array.isArray(e.metadata)
        ? (e.metadata as Record<string, unknown>)
        : null,
  })) as TimelineEntry[];
  const events = (deal.events ?? []).map((e) => ({
    type: e.type,
    createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
  }));

  const prompt = getDealSummaryPrompt({
    name: deal.name,
    stage: deal.stage,
    value: deal.value,
    status: deal.status ?? "active",
    riskLevel: deal.riskLevel ?? "Low",
    primaryRiskReason: deal.primaryRiskReason ?? null,
    lastActivityAt: deal.lastActivityAt ? new Date(deal.lastActivityAt) : new Date(deal.createdAt),
    timelineSummary: timelineSummary(timeline),
    eventsSummary: eventsSummary(events),
  });

  const raw = await callOpenRouterForGeneration(
    "You are a sales analyst. Output a clear, formatted plain-text summary. No JSON.",
    prompt,
    { temperature: 0.3, maxTokens: 1200 }
  );
  return raw.trim();
}

export async function generateWinStrategy(dealId: string): Promise<WinStrategy> {
  const deal = await getDealById(dealId);
  const timeline = (deal.timeline ?? []).map((e) => ({
    eventType: e.eventType,
    createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
    metadata:
      e.metadata && typeof e.metadata === "object" && !Array.isArray(e.metadata)
        ? (e.metadata as Record<string, unknown>)
        : null,
  })) as TimelineEntry[];

  const prompt = getWinStrategyPrompt({
    name: deal.name,
    stage: deal.stage,
    value: deal.value,
    primaryRiskReason: deal.primaryRiskReason ?? null,
    timelineSummary: timelineSummary(timeline),
  });

  const raw = await callOpenRouterForGeneration(
    WIN_STRATEGY_SYSTEM_PROMPT,
    prompt,
    { temperature: 0.4, maxTokens: 1500 }
  );

  const parsed = extractJson<{
    talkingPoints?: string[];
    objectionHandling?: Array<{ objection: string; response: string }>;
    timelineSuggestions?: string[];
    summary?: string;
  }>(raw);

  return {
    talkingPoints: Array.isArray(parsed.talkingPoints) ? parsed.talkingPoints : [],
    objectionHandling: Array.isArray(parsed.objectionHandling)
      ? parsed.objectionHandling.filter(
        (x) => x && typeof x.objection === "string" && typeof x.response === "string"
      )
      : [],
    timelineSuggestions: Array.isArray(parsed.timelineSuggestions) ? parsed.timelineSuggestions : [],
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
  };
}
