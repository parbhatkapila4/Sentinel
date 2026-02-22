import {
  AI_CONFIG,
  AI_EMBEDDING_SEARCH_CHAT_MODEL,
} from "./config";
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

export interface ModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  provider: "openrouter" | "anthropic" | "google";
}

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

  if (
    lowerQuery.includes("code") ||
    lowerQuery.includes("sql") ||
    lowerQuery.includes("query") ||
    lowerQuery.includes("function") ||
    lowerQuery.includes("script") ||
    lowerQuery.includes("programming") ||
    lowerQuery.includes("database") ||
    lowerQuery.includes("select") ||
    lowerQuery.includes("create") ||
    lowerQuery.includes("update") ||
    lowerQuery.includes("delete") ||
    lowerQuery.includes("javascript") ||
    lowerQuery.includes("typescript") ||
    lowerQuery.includes("python")
  ) {
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

export function getModelConfig(taskType: TaskType): ModelConfig {
  const base =
    taskType in AI_CONFIG
      ? AI_CONFIG[taskType as keyof typeof AI_CONFIG]
      : AI_CONFIG.general;
  if (taskType === "deal_specific") {
    return { ...(AI_CONFIG.financial_reasoning ?? base) };
  }
  return { ...base };
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
- "You have 3 overdue actions. Prioritize [Deal X] — follow-up overdue by 5 days."
- "Pipeline health is declining: 2 fewer new deals this week. Focus on top-of-funnel."
- "Your negotiation stage has 5 deals ($200K). [Deal A] has been stuck 14 days — recommend a check-in."`;

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

export interface RouteToAIOptions {
  dealContext?: string;
}

export async function routeToAI(
  messages: Array<{ role: string; content: string }>,
  query: string,
  options?: RouteToAIOptions
): Promise<string> {
  const taskType = analyzeTaskType(query);
  const modelConfig = getModelConfig(taskType);
  let systemPrompt = getSystemPrompt(taskType);
  const dealContext = options?.dealContext;

  if (dealContext) {
    const contextBlock = `\n\n---\nDEAL & PIPELINE CONTEXT (use this for accurate, data-driven answers):\n${dealContext}`;
    systemPrompt = systemPrompt
      ? systemPrompt + contextBlock
      : `You are a helpful assistant for Sentinel, a revenue intelligence platform. Use the following context when relevant to the user's question.${contextBlock}`;
  }

  if (taskType === "embedding_search") {
    modelConfig.model = AI_EMBEDDING_SEARCH_CHAT_MODEL;
  }

  const openRouterApiKey = process.env.OPENROUTER_API_KEY;

  if (!openRouterApiKey) {
    console.error("OPENROUTER_API_KEY is not set in environment variables");
    throw new AppError(
      "AI assistant is not configured for this environment. Please set OPENROUTER_API_KEY in your deployment settings.",
      { statusCode: 503, code: "SERVICE_UNAVAILABLE" }
    );
  }

  const formattedMessages = systemPrompt
    ? [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ]
    : messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

  const OPENROUTER_TIMEOUT_MS = 50_000;

  try {
    return await withCircuitBreaker("openrouter", () =>
      retryWithBackoff(
        async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);
          try {
            const response = await fetch(
              "https://openrouter.ai/api/v1/chat/completions",
              {
                method: "POST",
                signal: controller.signal,
                headers: {
                  Authorization: `Bearer ${openRouterApiKey}`,
                  "Content-Type": "application/json",
                  "HTTP-Referer":
                    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                  "X-Title": "Sentinel",
                },
                body: JSON.stringify({
                  model: modelConfig.model,
                  messages: formattedMessages,
                  temperature: modelConfig.temperature,
                  max_tokens: modelConfig.maxTokens,
                }),
              }
            );
            clearTimeout(timeoutId);

            if (!response.ok) {
              const errorData = await response.text();
              console.error("OpenRouter API error:", {
                status: response.status,
                statusText: response.statusText,
                error: errorData,
              });
              const status = response.status;
              const message =
                status === 401
                  ? "AI service configuration issue. Please check your provider settings."
                  : status === 429
                    ? "AI service is busy. Please try again in a moment."
                    : status >= 500
                      ? "AI service is temporarily unavailable. Please try again in a moment."
                      : "AI assistant is temporarily unavailable. Please try again.";
              throw new AppError(message, {
                statusCode: 503,
                code: "SERVICE_UNAVAILABLE",
              });
            }

            const data = await response.json();

            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
              console.error("Invalid OpenRouter response:", data);
              throw new AppError(
                "AI assistant is temporarily unavailable. Please try again.",
                { statusCode: 503, code: "SERVICE_UNAVAILABLE" }
              );
            }

            return data.choices[0].message.content;
          } finally {
            clearTimeout(timeoutId);
          }
        },
        { maxRetries: 2, isIdempotent: true }
      )
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    if (error instanceof Error) {
      const isTimeout = error.name === "AbortError" || error.message.includes("aborted");
      console.error("routeToAI fetch error:", error.message, isTimeout ? "(timeout)" : "");
      throw new AppError(
        isTimeout
          ? "The AI service took too long to respond. Please try again."
          : "AI assistant is temporarily unavailable. Please try again.",
        { statusCode: 503, code: "SERVICE_UNAVAILABLE" }
      );
    }
    throw new AppError(
      "AI assistant is temporarily unavailable. Please try again.",
      { statusCode: 503, code: "SERVICE_UNAVAILABLE" }
    );
  }
}

export async function callOpenRouterForGeneration(
  systemPrompt: string,
  userMessage: string,
  options?: { model?: string; temperature?: number; maxTokens?: number }
): Promise<string> {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterApiKey) {
    throw new AppError(
      "AI assistant is not configured for this environment. Please set OPENROUTER_API_KEY in your deployment settings.",
      { statusCode: 503, code: "SERVICE_UNAVAILABLE" }
    );
  }
  const model = options?.model ?? AI_CONFIG.financial_reasoning.model;
  const temperature = options?.temperature ?? 0.3;
  const maxTokens = options?.maxTokens ?? 2000;

  return withCircuitBreaker("openrouter", () =>
    retryWithBackoff(
      async () => {
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${openRouterApiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer":
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
              "X-Title": "Sentinel",
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
              ],
              temperature,
              max_tokens: maxTokens,
            }),
          }
        );

        if (!response.ok) {
          const err = await response.text();
          console.error("OpenRouter generation error:", response.status, err);
          const status = response.status;
          const message =
            status === 401
              ? "AI service configuration issue. Please check your provider settings."
              : status === 429
                ? "AI service is busy. Please try again in a moment."
                : status >= 500
                  ? "AI service is temporarily unavailable. Please try again in a moment."
                  : "AI assistant is temporarily unavailable. Please try again.";
          throw new AppError(message, {
            statusCode: 503,
            code: "SERVICE_UNAVAILABLE",
          });
        }

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = data.choices?.[0]?.message?.content;
        if (typeof content !== "string") {
          throw new AppError(
            "AI assistant is temporarily unavailable. Please try again.",
            { statusCode: 503, code: "SERVICE_UNAVAILABLE" }
          );
        }
        return content;
      },
      { maxRetries: 2, isIdempotent: true }
    )
  );
}
