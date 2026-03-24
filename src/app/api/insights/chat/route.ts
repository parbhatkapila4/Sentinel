import { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import {
  routeToAI,
  analyzeTaskType,
  type ChatCompletionContentPart,
  type ChatMessageContent,
} from "@/lib/ai-router";
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

export const maxDuration = 120;
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
    data?: string;
  }>;
}

interface Message {
  role: string;
  content: ChatMessageContent;
}

interface Attachment {
  name: string;
  type: string;
  size: number;
  data?: string;
}

const MAX_TOTAL_ATTACHMENT_BASE64_CHARS = 4_000_000;
const MAX_VISION_IMAGES = 4;
const MAX_TEXT_ATTACHMENTS = 4;
const MAX_TEXT_ATTACHMENT_CHARS = 16_000;
const MAX_TEXT_CHUNKS = 4;
const TEXT_CHUNK_SIZE = 4_000;

function decodeDataUrlToBuffer(dataUrl: string): Buffer | null {
  const commaIdx = dataUrl.indexOf(",");
  if (commaIdx <= 0) return null;
  const payload = dataUrl.slice(commaIdx + 1);
  try {
    return Buffer.from(payload, "base64");
  } catch {
    return null;
  }
}

function detectAttachmentKind(att: Attachment): "image" | "pdf" | "text" | "other" {
  const mime = (att.type || "").toLowerCase();
  const name = (att.name || "").toLowerCase();
  if (
    mime.startsWith("image/") ||
    name.match(/\.(jpe?g|png|gif|webp|bmp|svg|heic|avif)$/)
  ) {
    return "image";
  }
  if (mime === "application/pdf" || name.endsWith(".pdf")) {
    return "pdf";
  }
  if (
    mime.startsWith("text/") ||
    mime.includes("json") ||
    mime.includes("xml") ||
    mime.includes("javascript") ||
    mime.includes("typescript") ||
    name.match(/\.(txt|md|csv|json|xml|yaml|yml|js|ts|tsx|jsx|py|java|go|rb|php|sql)$/)
  ) {
    return "text";
  }
  return "other";
}

function buildFileSpecificGuidance(att: Attachment): string {
  const name = (att.name || "").toLowerCase();
  const type = (att.type || "").toLowerCase();
  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return "Extract key topics, important points, and summarize clearly with section-wise bullets.";
  }
  if (name.match(/\.(csv|xlsx?)$/) || type.includes("csv") || type.includes("spreadsheet")) {
    return "Explain table/column meaning, highlight trends/outliers, and answer numeric questions precisely.";
  }
  if (name.match(/\.(json|xml|ya?ml)$/) || type.includes("json") || type.includes("xml")) {
    return "Describe structure/schema, key fields, and provide concise examples if needed.";
  }
  if (name.match(/\.(js|ts|tsx|jsx|py|java|go|rb|php|sql)$/)) {
    return "Explain what the code does, detect potential issues, and suggest concrete improvements.";
  }
  if (name.match(/\.(txt|md)$/) || type.startsWith("text/")) {
    return "Summarize content, extract action items, and answer direct questions from the text.";
  }
  return "Identify file type from metadata and provide the best possible high-confidence analysis.";
}

function chunkTextForPrompt(input: string): string[] {
  const text = input.trim();
  if (!text) return [];
  if (text.length <= TEXT_CHUNK_SIZE) return [text];

  const chunks: string[] = [];
  let i = 0;
  while (i < text.length && chunks.length < MAX_TEXT_CHUNKS) {
    const slice = text.slice(i, i + TEXT_CHUNK_SIZE);
    chunks.push(slice);
    i += TEXT_CHUNK_SIZE;
  }
  return chunks;
}

async function extractPdfText(dataUrl: string): Promise<string | null> {
  const buf = decodeDataUrlToBuffer(dataUrl);
  if (!buf) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
      dataBuffer: Buffer
    ) => Promise<{ text?: string }>;
    const out = await pdfParse(buf);
    const text = (out?.text || "").trim();
    return text ? text.slice(0, MAX_TEXT_ATTACHMENT_CHARS) : null;
  } catch (error) {
    logError("PDF extraction failed in chat route", error);
    return null;
  }
}

function extractTextDataUrl(dataUrl: string): string | null {
  const commaIdx = dataUrl.indexOf(",");
  if (commaIdx <= 0) return null;
  const payload = dataUrl.slice(commaIdx + 1);
  try {
    const text = Buffer.from(payload, "base64").toString("utf8").trim();
    if (!text) return null;
    return text.slice(0, MAX_TEXT_ATTACHMENT_CHARS);
  } catch {
    return null;
  }
}

function getTextFromUserContent(content: ChatMessageContent): string {
  if (typeof content === "string") return content;
  return content
    .filter((p): p is { type: "text"; text: string } => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text)
    .join("\n");
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
      processedMessages = messages.map((msg, index: number) => {
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
      const rawList = attachments.filter(
        (att: Attachment): att is Attachment => att && typeof att === "object"
      );
      const dataChars = rawList.reduce(
        (sum, att) => sum + (typeof att.data === "string" ? att.data.length : 0),
        0
      );
      if (dataChars > MAX_TOTAL_ATTACHMENT_BASE64_CHARS) {
        throw new AppError(
          "Attachments are too large to send in one request. Try images under ~3MB each or fewer files.",
          { statusCode: 413, code: "PAYLOAD_TOO_LARGE" }
        );
      }

      let lastUserIndex = -1;
      for (let i = processedMessages.length - 1; i >= 0; i--) {
        if (processedMessages[i].role === "user") {
          lastUserIndex = i;
          break;
        }
      }

      if (lastUserIndex >= 0) {
        const metaLines = rawList.map((att: Attachment) => {
          const name = att.name || "Unknown file";
          const type = att.type || "unknown";
          const size = typeof att.size === "number" ? att.size : 0;
          const guidance = buildFileSpecificGuidance(att);
          return `- ${name} (${type}, ${formatFileSize(size)}): ${guidance}`;
        });

        const imageWithData = rawList.filter((att) => {
          const hasData =
            typeof att.data === "string" &&
            att.data.startsWith("data:image/");
          if (!hasData) return false;
          const mime = (att.type || "").toLowerCase();
          if (mime.startsWith("image/")) return true;
          return /\.(jpe?g|png|gif|webp|bmp|svg|heic|avif)$/i.test(
            att.name || ""
          );
        });

        const textExtracts: string[] = [];
        for (const att of rawList) {
          if (textExtracts.length >= MAX_TEXT_ATTACHMENTS) break;
          if (typeof att.data !== "string") continue;
          const kind = detectAttachmentKind(att);
          if (kind === "pdf") {
            const extracted = await extractPdfText(att.data);
            if (extracted) {
              const chunks = chunkTextForPrompt(extracted);
              textExtracts.push(
                `--- BEGIN FILE: ${att.name} (pdf extracted text) ---\n` +
                chunks
                  .map((chunk, idx) => `[Chunk ${idx + 1}/${chunks.length}]\n${chunk}`)
                  .join("\n\n") +
                `\n--- END FILE: ${att.name} ---`
              );
            }
          } else if (kind === "text") {
            const extracted = extractTextDataUrl(att.data);
            if (extracted) {
              const chunks = chunkTextForPrompt(extracted);
              textExtracts.push(
                `--- BEGIN FILE: ${att.name} (text) ---\n` +
                chunks
                  .map((chunk, idx) => `[Chunk ${idx + 1}/${chunks.length}]\n${chunk}`)
                  .join("\n\n") +
                `\n--- END FILE: ${att.name} ---`
              );
            }
          }
        }

        const baseText = String(
          typeof processedMessages[lastUserIndex].content === "string"
            ? processedMessages[lastUserIndex].content
            : getTextFromUserContent(processedMessages[lastUserIndex].content)
        );

        if (imageWithData.length > 0) {
          const parts: ChatCompletionContentPart[] = [
            {
              type: "text",
              text:
                `${baseText}\n\nAttached files:\n${metaLines.join("\n")}` +
                (textExtracts.length > 0
                  ? `\n\nExtracted file text (for analysis):\n${textExtracts.join("\n\n")}`
                  : "") +
                "\n\nAnswer using image(s) and extracted text when available.",
            },
          ];
          const visionImages = imageWithData
            .map((i) => i.data as string)
            .slice(0, MAX_VISION_IMAGES);
          for (const img of visionImages) {
            parts.push({
              type: "image_url",
              image_url: { url: img },
            });
          }
          processedMessages[lastUserIndex].content = parts;
        } else {
          processedMessages[lastUserIndex].content =
            baseText +
            (baseText ? "\n\n" : "") +
            `Attached files:\n${metaLines.join("\n")}\n\n` +
            (textExtracts.length > 0
              ? `Extracted file text:\n${textExtracts.join("\n\n")}\n\nUse this extracted text to answer the user.`
              : "Infer the file type from file name extension and MIME type where possible. For unsupported binary files, explain that textual extraction is unavailable.");
        }
      }
    }

    const lastUserMessage =
      processedMessages
        .filter((m) => m.role === "user")
        .map((m) => getTextFromUserContent(m.content))
        .pop() || "";

    const messagesForTextContext = processedMessages.map((m) => ({
      role: m.role,
      content: getTextFromUserContent(m.content),
    }));

    const taskType = analyzeTaskType(lastUserMessage);

    let dealContext: string | undefined;
    try {
      const deals = await getAllDeals();
      const dealsForContext = deals as unknown as DealForContext[];

      if (deals.length > 0) {
        const baseContext = formatContextForAI(dealsForContext);

        const resolved = resolveDealReference(messagesForTextContext, dealsForContext);
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
