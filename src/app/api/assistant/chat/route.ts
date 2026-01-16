import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { routeToAI, analyzeTaskType } from "@/lib/ai-router";
import { getAllDeals } from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";

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

export async function POST(request: NextRequest) {
  try {
    console.log("=== Chat API Request Started ===");

    const userId = await getAuthenticatedUserId();
    console.log("User authenticated:", userId);

    let body: RequestBody;
    try {
      const contentType = request.headers.get("content-type");
      console.log("Content-Type:", contentType);

      if (!contentType || !contentType.includes("application/json")) {
        console.error("Invalid Content-Type:", contentType);
        return NextResponse.json(
          { error: "Content-Type must be application/json" },
          { status: 400 }
        );
      }

      console.log("Parsing request body...");
      body = (await request.json()) as RequestBody;
      console.log("Request body parsed successfully");
      console.log("Body keys:", Object.keys(body));
      console.log("Messages count:", body?.messages?.length);
      console.log("Attachments count:", body?.attachments?.length || 0);
    } catch (parseError) {
      console.error("=== Failed to parse request body ===");
      console.error("Error:", parseError);
      const errorMsg =
        parseError instanceof Error ? parseError.message : String(parseError);
      console.error("Error message:", errorMsg);
      console.error(
        "Error stack:",
        parseError instanceof Error ? parseError.stack : "No stack"
      );

      if (
        errorMsg.includes("too large") ||
        errorMsg.includes("size") ||
        errorMsg.includes("limit") ||
        errorMsg.includes("413")
      ) {
        return NextResponse.json(
          {
            error:
              "Request body is too large. Maximum file size for attachments is 10MB. Please select smaller files.",
            details:
              "The request body exceeds the maximum allowed size. We only store file metadata, not the actual file content.",
          },
          { status: 413 }
        );
      }

      return NextResponse.json(
        {
          error:
            "Invalid request body format. Please check the console for details.",
          details:
            process.env.NODE_ENV === "development"
              ? errorMsg
              : "Request body could not be parsed",
        },
        { status: 400 }
      );
    }

    const messages = body?.messages;
    const attachments = body?.attachments;

    console.log("Validating messages...");
    if (!messages) {
      console.error("Messages are missing");
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(messages)) {
      console.error("Messages is not an array:", typeof messages);
      return NextResponse.json(
        { error: "Messages must be an array" },
        { status: 400 }
      );
    }

    if (messages.length === 0) {
      console.error("Messages array is empty");
      return NextResponse.json(
        { error: "At least one message is required" },
        { status: 400 }
      );
    }

    console.log("Messages validation passed");

    console.log("Processing messages...");
    let processedMessages: Message[];
    try {
      processedMessages = messages.map((msg: Message, index: number) => {
        if (!msg || typeof msg !== "object") {
          throw new Error(
            `Invalid message at index ${index}: must be an object`
          );
        }
        if (!msg.role || typeof msg.role !== "string") {
          throw new Error(
            `Invalid message at index ${index}: 'role' is required and must be a string`
          );
        }
        const content =
          msg.content === null || msg.content === undefined
            ? ""
            : String(msg.content);

        return {
          role: String(msg.role),
          content: content,
        };
      });
      console.log("Messages processed successfully");
    } catch (msgError) {
      console.error("Error processing messages:", msgError);
      throw msgError;
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
      } catch (attachmentError) {
        console.error("Error processing attachments:", attachmentError);
      }
    }

    const lastUserMessage =
      processedMessages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .pop() || "";

    const taskType = analyzeTaskType(lastUserMessage);

    let enhancedMessages = [...processedMessages];
    if (taskType === "financial_reasoning") {
      try {
        const deals = await getAllDeals();
        const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
        const totalDeals = deals.length;
        const highRiskDeals = deals.filter(
          (d) => formatRiskLevel(d.riskScore) === "High"
        ).length;
        const stageDistribution = deals.reduce((acc, deal) => {
          acc[deal.stage] = (acc[deal.stage] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const contextMessage = `Context about the user's sales pipeline:
- Total Pipeline Value: $${totalValue.toLocaleString()}
- Total Deals: ${totalDeals}
- High Risk Deals: ${highRiskDeals}
- Stage Distribution: ${JSON.stringify(stageDistribution)}
- Recent deals: ${deals
          .slice(0, 5)
          .map(
            (d) =>
              `${d.name} (${
                d.stage
              }, $${d.value.toLocaleString()}, ${formatRiskLevel(
                d.riskScore
              )} risk)`
          )
          .join(", ")}

Use this context to provide accurate, data-driven insights about their pipeline, deals, revenue, and risk.`;

        enhancedMessages = [
          ...processedMessages.slice(0, -1),
          {
            role: "system",
            content: contextMessage,
          },
          processedMessages[processedMessages.length - 1],
        ];
      } catch (error) {
        console.error("Error fetching deals for context:", error);
      }
    }

    const aiMessages = enhancedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let content;
    try {
      content = await routeToAI(aiMessages, lastUserMessage);
    } catch (aiError) {
      console.error("routeToAI error:", aiError);
      throw aiError;
    }

    return NextResponse.json({
      content,
      taskType,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );

    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    let statusCode = 500;
    if (
      errorMessage.includes("Invalid") ||
      errorMessage.includes("required") ||
      errorMessage.includes("must be")
    ) {
      statusCode = 400;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : String(error)
            : undefined,
      },
      { status: statusCode }
    );
  }
}
