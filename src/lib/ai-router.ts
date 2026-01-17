export type TaskType =
  | "embedding_search"
  | "financial_reasoning"
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

  if (
    lowerQuery.includes("revenue") ||
    lowerQuery.includes("pipeline") ||
    lowerQuery.includes("deal") ||
    lowerQuery.includes("value") ||
    lowerQuery.includes("risk") ||
    lowerQuery.includes("forecast") ||
    lowerQuery.includes("summary") ||
    lowerQuery.includes("analyze") ||
    lowerQuery.includes("insight") ||
    lowerQuery.includes("financial") ||
    lowerQuery.includes("sales") ||
    lowerQuery.includes("profit") ||
    lowerQuery.includes("loss") ||
    lowerQuery.includes("budget")
  ) {
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
  switch (taskType) {
    case "embedding_search":
      return {
        model: "text-embedding-3-large",
        temperature: 0.1,
        maxTokens: 1000,
        provider: "openrouter",
      };

    case "financial_reasoning":
      return {
        model: "anthropic/claude-3.5-sonnet",
        temperature: 0.3,
        maxTokens: 2000,
        provider: "openrouter",
      };

    case "code_sql_generation":
      return {
        model: "openai/gpt-4o",
        temperature: 0.2,
        maxTokens: 2000,
        provider: "openrouter",
      };

    case "planning_multimodal":
      return {
        model: "google/gemini-pro",
        temperature: 0.4,
        maxTokens: 2000,
        provider: "openrouter",
      };

    default:
      return {
        model: "openai/gpt-4-turbo",
        temperature: 0.7,
        maxTokens: 1000,
        provider: "openrouter",
      };
  }
}

function getSystemPrompt(taskType: TaskType): string | null {
  switch (taskType) {
    case "financial_reasoning":
      return `You are an expert sales pipeline analyst for Revenue Sentinel. You help users analyze their sales pipeline, deals, revenue forecasts, and risk assessments. Provide clear, actionable insights based on the data. Focus on:
- Pipeline value and deal progression
- Risk analysis and deal health
- Revenue forecasting and trends
- Actionable recommendations for improving deal outcomes`;

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

export async function routeToAI(
  messages: Array<{ role: string; content: string }>,
  query: string
): Promise<string> {
  const taskType = analyzeTaskType(query);
  const modelConfig = getModelConfig(taskType);
  const systemPrompt = getSystemPrompt(taskType);

  if (taskType === "embedding_search") {
    modelConfig.model = "openai/gpt-4-turbo";
  }

  const openRouterApiKey = process.env.OPENROUTER_API_KEY;

  if (!openRouterApiKey) {
    console.error("OPENROUTER_API_KEY is not set in environment variables");
    throw new Error("AI service is not configured. Please contact support.");
  }

  const formattedMessages = systemPrompt
    ? [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ]
    : messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "Revenue Sentinel",
        },
        body: JSON.stringify({
          model: modelConfig.model,
          messages: formattedMessages,
          temperature: modelConfig.temperature,
          max_tokens: modelConfig.maxTokens,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(
        `AI service error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Invalid OpenRouter response:", data);
      throw new Error("Invalid response from AI service");
    }

    return data.choices[0].message.content;
  } catch (error) {
    if (error instanceof Error) {
      console.error("routeToAI fetch error:", error.message);
      throw error;
    }
    throw new Error("Unknown error occurred while calling AI service");
  }
}
