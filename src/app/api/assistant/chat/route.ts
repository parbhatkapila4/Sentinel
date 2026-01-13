import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { routeToAI, analyzeTaskType } from "@/lib/ai-router";
import { getAllDeals } from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const lastUserMessage =
      messages.filter((m: { role: string }) => m.role === "user").pop()
        ?.content || "";

    const taskType = analyzeTaskType(lastUserMessage);

    let enhancedMessages = [...messages];
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
          ...messages.slice(0, -1),
          {
            role: "system",
            content: contextMessage,
          },
          messages[messages.length - 1],
        ];
      } catch (error) {
        console.error("Error fetching deals for context:", error);
      }
    }

    const content = await routeToAI(enhancedMessages, lastUserMessage);

    return NextResponse.json({
      content,
      taskType,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
