import { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { routeToAI, analyzeTaskType } from "@/lib/ai-router";
import { enforceApiCallLimit } from "@/lib/plan-enforcement";
import { getAllDeals, getDealById } from "@/app/actions/deals";
import {
  formatContextForAI,
  formatPredictionsForAI,
  findMentionedDeals,
  resolveDealReference,
  formatDealDetailForAI,
} from "@/lib/ai-context";
import type { DealForContext, DealWithTimeline } from "@/lib/ai-context";
import { generateFollowUpEmail } from "@/app/actions/ai";
import { AppError, ValidationError } from "@/lib/errors";
import { successResponse, handleApiError } from "@/lib/api-response";
import { withRateLimit } from "@/lib/api-rate-limit";
import { withRequestId } from "@/lib/request-context";
import { logInfo, logError } from "@/lib/logger";
import { trackPerformance, trackApiCall } from "@/lib/monitoring";
import { trackApiCall as trackApiMetric } from "@/lib/metrics";

const FOLLOW_UP_EMAIL_PATTERN =
  /\b(write|draft|generate|compose)\s+(a\s+)?(follow-up\s+)?email\s+for\b|\bfollow-up\s+email\s+for\s+/i;

const PREDICTIONS_QUERY_PATTERN =
  /\b(outlook|forecast|predict|prediction|win\s+probability|days\s+to\s+close|pipeline\s+forecast|deal\s+outcome)\b/i;

export const maxDuration = 60;
export const runtime = "nodejs";

interface RequestBody {
  messages?: Array<{
    role: string;
    content: string;
  }>;
  attachments?: Array<{
    name: string;
    type: string;
    size: number;
  }>;
}

interface Message {
  role: string;
  content: string;
}

interface Attachment {
  name: string;
  type: string;
  size: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

async function chatHandler(request: NextRequest) {
  const startTime = Date.now();
  logInfo("Chat API request started", { path: "/api/insights/chat" });

  try {
    const userId = await getAuthenticatedUserId();

    await enforceApiCallLimit(userId);

    let body: RequestBody;
    try {
      const contentType = request.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new ValidationError("Content-Type must be application/json");
      }
      body = (await request.json()) as RequestBody;
    } catch (parseError) {
      const msg =
        parseError instanceof Error ? parseError.message : String(parseError);
      if (
        msg.includes("too large") ||
        msg.includes("size") ||
        msg.includes("limit") ||
        msg.includes("413")
      ) {
        throw new AppError(
          "Request body is too large. Maximum file size for attachments is 10MB. Please select smaller files.",
          { statusCode: 413, code: "PAYLOAD_TOO_LARGE" }
        );
      }
      if (parseError instanceof ValidationError) throw parseError;
      throw new ValidationError(
        process.env.NODE_ENV === "development"
          ? msg
          : "Invalid request body format"
      );
    }

    const messages = body?.messages;
    const attachments = body?.attachments;

    if (!messages) throw new ValidationError("Messages are required");
    if (!Array.isArray(messages)) {
      throw new ValidationError("Messages must be an array");
    }
    if (messages.length === 0) {
      throw new ValidationError("At least one message is required");
    }

    let processedMessages: Message[];
    try {
      processedMessages = messages.map((msg: Message, index: number) => {
        if (!msg || typeof msg !== "object") {
          throw new ValidationError(
            `Invalid message at index ${index}: must be an object`
          );
        }
        if (!msg.role || typeof msg.role !== "string") {
          throw new ValidationError(
            `Invalid message at index ${index}: 'role' is required and must be a string`
          );
        }
        const content =
          msg.content === null || msg.content === undefined
            ? ""
            : String(msg.content);
        return { role: String(msg.role), content };
      });
    } catch (e) {
      if (e instanceof ValidationError) throw e;
      throw new ValidationError(
        e instanceof Error ? e.message : "Invalid messages"
      );
    }

    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      try {
        let lastUserIndex = -1;
        for (let i = processedMessages.length - 1; i >= 0; i--) {
          if (processedMessages[i].role === "user") {
            lastUserIndex = i;
            break;
          }
        }
        if (lastUserIndex >= 0) {
          const attachmentInfo = attachments
            .filter(
              (att: Attachment): att is Attachment =>
                att && typeof att === "object"
            )
            .map((att: Attachment) => {
              const name = att.name || "Unknown file";
              const type = att.type || "unknown";
              const size = typeof att.size === "number" ? att.size : 0;
              return `[Attachment: ${name} (${type}, ${formatFileSize(size)})]`;
            })
            .join("\n");
          if (attachmentInfo) {
            const originalContent =
              processedMessages[lastUserIndex].content || "";
            processedMessages[lastUserIndex].content =
              originalContent +
              (originalContent ? "\n\n" : "") +
              attachmentInfo +
              "\n\nNote: I can see you've attached files. Please describe what you'd like me to help you with regarding these files, as I cannot directly process file contents in this version.";
          }
        }
      } catch {

      }
    }

    const lastUserMessage =
      processedMessages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .pop() || "";

    const taskType = analyzeTaskType(lastUserMessage);

    let dealContext: string | undefined;
    try {
      const deals = await getAllDeals();
      const dealsForContext = deals as unknown as DealForContext[];

      if (deals.length > 0) {
        const baseContext = formatContextForAI(dealsForContext);

        const resolved = resolveDealReference(processedMessages, dealsForContext);
        const mentioned = findMentionedDeals(lastUserMessage, dealsForContext);
        const dealsToEnrich = resolved ? [resolved] : mentioned;

        let detailBlock = "";
        if (taskType === "deal_specific" && dealsToEnrich.length > 0) {
          const enriched: DealWithTimeline[] = [];
          for (const d of dealsToEnrich.slice(0, 3)) {
            try {
              const full = await getDealById(d.id);
              const timeline = (full as { timeline?: Array<{ eventType: string; createdAt: Date; metadata?: Record<string, unknown> | null }> }).timeline;
              enriched.push({
                ...d,
                timeline: timeline?.map((e) => ({
                  eventType: e.eventType,
                  createdAt: e.createdAt ?? new Date(),
                  metadata: (e.metadata as Record<string, unknown> | null) ?? null,
                })),
              });
            } catch {
              enriched.push({ ...d });
            }
          }
          detailBlock = "\n\nSPECIFIC DEAL(S) USER ASKED ABOUT:\n" + enriched.map((d) => formatDealDetailForAI(d)).join("\n\n");
        }

        let emailBlock = "";
        const wantsFollowUpEmail = FOLLOW_UP_EMAIL_PATTERN.test(lastUserMessage);
        const emailDeal = wantsFollowUpEmail && dealsToEnrich.length === 1 ? dealsToEnrich[0] : null;
        if (emailDeal) {
          try {
            const generated = await generateFollowUpEmail(emailDeal.id, "professional", {
              logToTimeline: true,
            });
            emailBlock =
              "\n\nGENERATED FOLLOW-UP EMAIL (user asked for this):\n" +
              `Deal: ${emailDeal.name}\n` +
              `Subject: ${generated.subject}\n\n` +
              `Body:\n${generated.body}\n\n` +
              "Present this email clearly in your response (subject + body). Offer to help with modifications (e.g. different tone, shorter, more urgent).";
          } catch (err) {
            console.error("Error generating follow-up email in chat:", err);
          }
        }

        let predictionsBlock = "";
        if (PREDICTIONS_QUERY_PATTERN.test(lastUserMessage)) {
          predictionsBlock = "\n\n" + formatPredictionsForAI(dealsForContext);
        }
        dealContext = baseContext + detailBlock + emailBlock + predictionsBlock;
      }
    } catch (error) {
      console.error("Error building deal context for AI:", error);
    }

    const aiMessages = processedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const content = await trackPerformance("ai.chat", async () => {
      return await routeToAI(aiMessages, lastUserMessage, {
        dealContext: dealContext ?? undefined,
      });
    });

    const duration = Date.now() - startTime;
    trackApiCall("/api/insights/chat", "POST", duration, 200);
    trackApiMetric("/api/insights/chat", duration, 200);
    logInfo("Chat API request completed", { path: "/api/insights/chat", durationMs: duration });
    return successResponse({ content, taskType });
  } catch (error) {
    const duration = Date.now() - startTime;
    const statusCode =
      error instanceof Error && "statusCode" in error
        ? (error as Error & { statusCode: number }).statusCode
        : 500;
    trackApiCall("/api/insights/chat", "POST", duration, statusCode);
    trackApiMetric("/api/insights/chat", duration, statusCode);
    logError("Chat API request failed", error, {
      path: "/api/insights/chat",
      durationMs: duration,
      statusCode,
    });
    const is500 = statusCode === 500;
    if (process.env.NODE_ENV === "production" && is500) {
      return handleApiError(
        new AppError(
          "AI assistant is temporarily unavailable. Please try again.",
          { statusCode: 503, code: "SERVICE_UNAVAILABLE" }
        )
      );
    }
    return handleApiError(error);
  }
}

export const POST = withRateLimit<NextRequest>(withRequestId(chatHandler), { tier: "ai" });
