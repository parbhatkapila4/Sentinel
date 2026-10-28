import Anthropic from "@anthropic-ai/sdk";
import { AI_MODEL } from "./config";
import { AppError } from "./errors";
import { retryWithBackoff } from "./retry";
import { withCircuitBreaker } from "./circuit-breaker";

export type TaskType =
  | "embedding_search"
  | "financial_reasoning"
  | "deal_specific"
  | "code_sql_generation"
  | "planning_multimodal"
  | "general";

type Effort = NonNullable<Anthropic.Beta.BetaOutputConfig["effort"]>;
type ClaudeMessage = Anthropic.Beta.BetaMessageParam;
type UserContentBlock = Anthropic.Beta.BetaTextBlockParam | Anthropic.Beta.BetaImageBlockParam;
type ImageMediaType = Anthropic.Beta.BetaBase64ImageSource["media_type"];

const CIRCUIT_BREAKER_NAME = "anthropic";

const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 5,
  timeout: 30000,
} as const;
const MAX_TOKENS = 16_000;
const REQUEST_TIMEOUT_MS = 90_000;
const REFUSAL_FALLBACK_BETA = "server-side-fallback-2026-07-01";

const SUPPORTED_IMAGE_TYPES = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const UNAVAILABLE_MESSAGE =
  "AI assistant is temporarily unavailable. Please try again.";
const RETRYABLE_CODES = new Set(["AI_BUSY", "AI_UNAVAILABLE"]);
const OUTAGE_CODES = new Set(["AI_BUSY", "AI_UNAVAILABLE", "AI_TIMEOUT"]);

export function analyzeTaskType(query: string): TaskType {
  const lowerQuery = query.toLowerCase();

  if (
    lowerQuery.includes("search") ||
    lowerQuery.includes("find") ||
    lowerQuery.includes("similar") ||
    lowerQuery.includes("match") ||
    lowerQuery.includes("embedding") ||
    lowerQuery.includes("semantic")
  ) {
    return "embedding_search";
  }

  const dealPipelineTerms = [
    "revenue",
    "pipeline",
    "deal",
    "value",
    "risk",
    "forecast",
    "summary",
    "analyze",
    "insight",
    "financial",
    "sales",
    "profit",
    "loss",
    "budget",
    "attention",
    "stalled",
    "negotiation",
    "performance",
    "compare",
    "month",
    "probability",
    "outlook",
    "status",
    "chances",
  ];
  if (dealPipelineTerms.some((t) => lowerQuery.includes(t))) {
    const dealSpecificPatterns = [
      /\b(tell me about|how is|what about|info on|details on|update on)\s+(the\s+)?[\w\s]+/i,
      /\b(the\s+)?[\w]+\s+deal\b/i,
      /\bdeal\s+(with|for|named?|called?)\s+[\w\s]+/i,
      /\b(write|draft|generate|compose)\s+(a\s+)?(follow-up\s+)?email\s+for\b/i,
      /\bfollow-up\s+email\s+for\s+/i,
      /\b(win\s+probability|probability|outlook|forecast|prediction|status|risk|chances?)\s+(for|of|on)\s+[\w\s]+/i,
      /\bhow\s+likely\s+(is|are|will)\s+[\w\s]+\s+(to\s+)?(close|win|convert)/i,
      /\b(will|can)\s+(we\s+)?(close|win)\s+[\w\s]+/i,
      /\b[\w]+('s|s')\s+(win\s+probability|status|risk|outlook|forecast)/i,
    ];
    if (dealSpecificPatterns.some((p) => p.test(lowerQuery))) {
      return "deal_specific";
    }
    return "financial_reasoning";
  }

  const strongCodeSignals = [
    "sql",
    "query",
    "function",
    "script",
    "programming",
    "database",
    "select * from",
    "javascript",
    "typescript",
    "python",
    "stored procedure",
    "schema",
  ];
  if (strongCodeSignals.some((s) => lowerQuery.includes(s))) {
    return "code_sql_generation";
  }
  const codeishVerbs = /\b(create|update|delete|insert)\b/i;
  const codeyContext =
    /\b(table|row|column|index|migration|seed|view|join|where clause|stored proc|cte|primary key|foreign key|null|not null|drop|alter)\b/i;
  if (codeishVerbs.test(lowerQuery) && codeyContext.test(lowerQuery)) {
    return "code_sql_generation";
  }
  if (/\bcode\b/.test(lowerQuery) && !/\bdiscount\s+code\b/.test(lowerQuery)) {
    return "code_sql_generation";
  }

  if (
    lowerQuery.includes("plan") ||
    lowerQuery.includes("strategy") ||
    lowerQuery.includes("roadmap") ||
    lowerQuery.includes("timeline") ||
    lowerQuery.includes("multimodal") ||
    lowerQuery.includes("image") ||
    lowerQuery.includes("visual") ||
    lowerQuery.includes("chart") ||
    lowerQuery.includes("graph")
  ) {
    return "planning_multimodal";
  }

  return "general";
}

function getSystemPrompt(taskType: TaskType): string | null {
  switch (taskType) {
    case "financial_reasoning":
      return `You are an expert sales pipeline analyst for Sentinel, a revenue intelligence platform. Use the PIPELINE OVERVIEW, URGENT ATTENTION, STAGE DISTRIBUTION, and RECENT ACTIVITY context provided in the conversation to give accurate, data-driven answers.

Focus on:
- Pipeline value, deal progression, and stage distribution
- Risk analysis, at-risk deals, and overdue actions
- Revenue forecasting and trends
- Specific, actionable recommendations (e.g. which deals to follow up on, why pipeline health is changing)

Example good responses:
- "You have 3 overdue actions. Prioritize [Deal X] - follow-up overdue by 5 days."
- "Pipeline health is declining: 2 fewer new deals this week. Focus on top-of-funnel."
- "Your negotiation stage has 5 deals ($200K). [Deal A] has been stuck 14 days - recommend a check-in."`;

    case "deal_specific":
      return `You are an expert sales advisor for Sentinel. The user is asking about one or more specific deals. Use the "SPECIFIC DEAL(S) USER ASKED ABOUT" context (including timeline when provided) to answer precisely.

Do the following:
- Summarize the deal(s): value, stage, status, risk, last activity
- Explain why it's at risk or stalled if applicable
- Recommend concrete next steps (e.g. send follow-up, schedule call, escalate)
- Reference timeline events when relevant (e.g. "No activity since X")`;

    case "code_sql_generation":
      return `You are an expert database and code assistant. Generate accurate SQL queries for PostgreSQL and clean, efficient code. Always:
- Use proper SQL syntax for PostgreSQL
- Include proper error handling
- Write well-documented, maintainable code
- Consider performance and security best practices`;

    case "planning_multimodal":
      return `You are a strategic planning assistant. Help users create comprehensive plans, roadmaps, and strategies. Provide structured, actionable plans with clear timelines and milestones.`;

    case "embedding_search":
      return `You are a semantic search and matching assistant. Help users find similar content, match documents, and perform semantic searches.`;

    default:
      return null;
  }
}

export type AIMode = "RESEARCH" | "DRAFT" | "FAST";

const ACCURACY_RULES = `

ACCURACY RULES - NON-NEGOTIABLE. THESE OVERRIDE EVERY OTHER INSTRUCTION:
1. Every fact you state (deal names, values, stages, dates, counts, percentages, risk scores, locations, activity, owners) must come from the DEAL & PIPELINE CONTEXT in this conversation. Never invent. Never estimate. Never approximate ("about", "roughly", "around") unless the user explicitly asks for a rough figure.
2. Quote numbers exactly as they appear in the context. Do not round. Do not extrapolate.
3. If something the user asks about is NOT in the context, say so plainly: "I don't have that in the data I can see" or "That isn't in your pipeline context." Then either ask the user to clarify or stop. Do not guess.
4. Never invent industry benchmarks, statistics, competitor names, or external facts. If you must reference something outside the user's data, attribute it generically ("commonly observed in SaaS pipelines") or omit it.
5. When drafting deliverables (emails, briefs, summaries, scripts), use bracketed placeholders like [Customer name] or [Specific value] for anything you cannot confirm from the context. Do not fabricate details to make a draft feel complete.
6. It is always better to say "I don't know" than to provide a confident-sounding answer that may be wrong. The user will trust an honest "I don't know" more than a polished bluff.
7. If you catch yourself about to assert something you can't verify, stop and rephrase as a question or a placeholder.`;

const DEFAULT_EFFORT: Effort = "medium";

const MODE_OVERRIDES: Record<AIMode, { effort: Effort; promptSuffix: string }> = {
  RESEARCH: {
    effort: "high",
    promptSuffix:
      "\n\nMODE - RESEARCH. The user wants a thoughtful read, not a one-liner. When the question merits it, walk through the evidence: cite specific deal data, and surface what's surprising or non-obvious. Avoid filler phrases ('great question', 'let me help'). Lead with the answer, support it with evidence FROM THE PROVIDED CONTEXT - never from memory or speculation.",
  },
  DRAFT: {
    effort: "medium",
    promptSuffix:
      "\n\nMODE - DRAFT. The user wants a polished deliverable: an email, a follow-up note, a brief, a script, talking points. Lead with the deliverable itself. Skip preamble. If the user hasn't said what to draft, ask one focused question and stop. For any deal-specific detail you cannot confirm from the context, use a bracketed placeholder like [Customer name] - never invent.",
  },
  FAST: {
    effort: "low",
    promptSuffix:
      "\n\nMODE - FAST. Be terse. Aim for one or two sentences. Drop the preamble. Drop the wrap-up. If the question genuinely needs more, give the minimum extra that earns its keep. Brevity never excuses making things up - if the data isn't there, the right answer is 'I don't have that.'",
  },
};

export function isAIMode(value: unknown): value is AIMode {
  return value === "RESEARCH" || value === "DRAFT" || value === "FAST";
}

export interface RouteToAIOptions {
  dealContext?: string;
  mode?: AIMode;
}

export type ChatCompletionContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type ChatMessageContent = string | ChatCompletionContentPart[];

function textOf(content: ChatMessageContent): string {
  if (typeof content === "string") return content;
  return content
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("\n");
}

function toImageBlock(url: string): Anthropic.Beta.BetaImageBlockParam | null {
  const dataUrl = /^data:([^;,]+);base64,([\s\S]+)$/.exec(url);
  if (dataUrl) {
    const declared = dataUrl[1].toLowerCase();
    const mediaType = declared === "image/jpg" ? "image/jpeg" : declared;
    if (!SUPPORTED_IMAGE_TYPES.has(mediaType)) return null;
    return {
      type: "image",
      source: {
        type: "base64",
        media_type: mediaType as ImageMediaType,
        data: dataUrl[2],
      },
    };
  }
  if (/^https?:\/\//i.test(url)) {
    return { type: "image", source: { type: "url", url } };
  }
  return null;
}

function toUserContent(content: ChatMessageContent): string | UserContentBlock[] {
  if (typeof content === "string") return content;
  const blocks: UserContentBlock[] = [];
  let unreadable = 0;
  for (const part of content) {
    if (part.type === "text") {
      if (part.text.trim()) blocks.push({ type: "text", text: part.text });
      continue;
    }
    const image = toImageBlock(part.image_url.url);
    if (image) blocks.push(image);
    else unreadable++;
  }
  if (unreadable > 0) {
    blocks.push({
      type: "text",
      text: `(${unreadable} attached image${unreadable === 1 ? "" : "s"} could not be opened: only JPEG, PNG, GIF and WebP images can be read.)`,
    });
  }
  return blocks;
}

function isEmpty(content: string | UserContentBlock[]): boolean {
  return typeof content === "string" ? content.trim() === "" : content.length === 0;
}

export function toClaudeMessages(
  messages: Array<{ role: string; content: ChatMessageContent }>
): ClaudeMessage[] {
  const converted: ClaudeMessage[] = [];
  for (const m of messages) {
    if (m.role === "user") {
      const content = toUserContent(m.content);
      if (!isEmpty(content)) converted.push({ role: "user", content });
    } else if (m.role === "assistant" && converted.length > 0) {
      const text = textOf(m.content);
      if (text.trim()) converted.push({ role: "assistant", content: text });
    }
  }
  while (converted.length > 0 && converted[converted.length - 1].role !== "user") {
    converted.pop();
  }
  return converted;
}

function getApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set in environment variables");
    throw new AppError(
      "AI assistant is not configured for this environment. Please set ANTHROPIC_API_KEY in your deployment settings.",
      { statusCode: 503, code: "AI_NOT_CONFIGURED" }
    );
  }
  return apiKey;
}

function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Anthropic.APIConnectionTimeoutError) {
    return new AppError(
      "The AI service took too long to respond. Please try again.",
      { statusCode: 503, code: "AI_TIMEOUT" }
    );
  }
  if (error instanceof Anthropic.APIConnectionError) {
    console.error("Anthropic connection error:", error.message);
    return new AppError(UNAVAILABLE_MESSAGE, { statusCode: 503, code: "AI_UNAVAILABLE" });
  }
  if (error instanceof Anthropic.APIError) {
    const status = error.status ?? 0;
    console.error("Anthropic API error:", {
      status,
      type: error.type,
      message: error.message,
      requestId: error.requestID,
      model: AI_MODEL,
    });
    if (status === 402 || error.type === "billing_error") {
      console.error(
        "Anthropic billing error: the account is out of credit or has no payment method. Check the Anthropic Console billing page."
      );
      return new AppError(UNAVAILABLE_MESSAGE, { statusCode: 503, code: "AI_BILLING" });
    }
    if (status === 401 || status === 403) {
      return new AppError(
        "AI service configuration issue. Please check your provider settings.",
        { statusCode: 503, code: "AI_NOT_CONFIGURED" }
      );
    }
    if (status === 404) {
      return new AppError(
        `AI model "${AI_MODEL}" is not available to this Anthropic account.`,
        { statusCode: 502, code: "UPSTREAM_MODEL_NOT_FOUND" }
      );
    }
    if (status === 429) {
      return new AppError("AI service is busy. Please try again in a moment.", {
        statusCode: 503,
        code: "AI_BUSY",
      });
    }
    if (status >= 500) {
      return new AppError(
        "AI service is temporarily unavailable. Please try again in a moment.",
        { statusCode: 503, code: "AI_UNAVAILABLE" }
      );
    }
    return new AppError(UNAVAILABLE_MESSAGE, { statusCode: 502, code: "AI_REQUEST_REJECTED" });
  }
  console.error("Unexpected AI error:", error);
  return new AppError(UNAVAILABLE_MESSAGE, { statusCode: 503, code: "AI_UNAVAILABLE" });
}

function hasCode(error: unknown, codes: Set<string>): boolean {
  return error instanceof AppError && codes.has(error.code);
}

function getRetryConfig() {
  return process.env.NODE_ENV === "production"
    ? { maxRetries: 4, initialDelay: 2000, multiplier: 2 }
    : { maxRetries: 2 };
}

interface ClaudeRequest {
  system: string;
  messages: ClaudeMessage[];
  effort: Effort;
}

type ClaudeOutcome =
  | { message: Anthropic.Beta.BetaMessage }
  | { error: AppError };

async function askClaude(request: ClaudeRequest): Promise<string> {
  const apiKey = getApiKey();
  const outcome = await withCircuitBreaker<ClaudeOutcome>(
    CIRCUIT_BREAKER_NAME,
    () =>
      retryWithBackoff<ClaudeOutcome>(
        async () => {
          const client = new Anthropic({
            apiKey,
            maxRetries: 0,
            timeout: REQUEST_TIMEOUT_MS,
          });
          try {
            const message = await client.beta.messages.create({
              model: AI_MODEL,
              max_tokens: MAX_TOKENS,
              system: request.system,
              messages: request.messages,
              output_config: { effort: request.effort },
              betas: [REFUSAL_FALLBACK_BETA],
              fallbacks: "default",
            });
            return { message };
          } catch (error) {
            const appError = toAppError(error);
            if (hasCode(appError, OUTAGE_CODES)) throw appError;
            return { error: appError };
          }
        },
        {
          ...getRetryConfig(),
          shouldRetry: (error) => hasCode(error, RETRYABLE_CODES),
        }
      ),
    CIRCUIT_BREAKER_CONFIG
  );

  if ("error" in outcome) throw outcome.error;
  return readReply(outcome.message);
}

function readReply(message: Anthropic.Beta.BetaMessage): string {
  if (message.stop_reason === "refusal") {
    throw new AppError(
      "Sentinel AI can't help with that request. Try rephrasing it.",
      { statusCode: 422, code: "AI_REFUSED" }
    );
  }
  let start = 0;
  message.content.forEach((block, index) => {
    if (block.type === "fallback") start = index + 1;
  });
  const text = message.content
    .slice(start)
    .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  if (!text) {
    console.error("Claude returned no text", { stopReason: message.stop_reason });
    throw new AppError(UNAVAILABLE_MESSAGE, { statusCode: 502, code: "AI_EMPTY_RESPONSE" });
  }
  return text;
}

export async function routeToAI(
  messages: Array<{ role: string; content: ChatMessageContent }>,
  query: string,
  options?: RouteToAIOptions
): Promise<string> {
  const taskType = analyzeTaskType(query);
  let systemPrompt = getSystemPrompt(taskType);
  const dealContext = options?.dealContext;

  if (dealContext) {
    const contextBlock = `\n\n---\nDEAL & PIPELINE CONTEXT (use this for accurate, data-driven answers):\n${dealContext}`;
    systemPrompt = systemPrompt
      ? systemPrompt + contextBlock
      : `You are a helpful assistant for Sentinel, a revenue intelligence platform. Use the following context when relevant to the user's question.${contextBlock}`;
  }

  let effort = DEFAULT_EFFORT;
  const mode = options?.mode;
  if (mode) {
    const override = MODE_OVERRIDES[mode];
    const defaultSystem =
      "You are a helpful assistant for Sentinel, a revenue intelligence platform.";
    systemPrompt = (systemPrompt ?? defaultSystem) + override.promptSuffix;
    effort = override.effort;
  }

  const baselineSystem =
    "You are a helpful assistant for Sentinel, a revenue intelligence platform that surfaces a user's own deal pipeline.";
  systemPrompt = (systemPrompt ?? baselineSystem) + ACCURACY_RULES;

  const claudeMessages = toClaudeMessages(messages);
  if (claudeMessages.length === 0) {
    throw new AppError("There is no question to answer.", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  }

  return askClaude({ system: systemPrompt, messages: claudeMessages, effort });
}

export async function callClaudeForGeneration(
  systemPrompt: string,
  userMessage: string,
  options?: { effort?: Effort }
): Promise<string> {
  return askClaude({
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
    effort: options?.effort ?? DEFAULT_EFFORT,
  });
}
