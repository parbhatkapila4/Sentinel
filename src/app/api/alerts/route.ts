import { NextRequest } from "next/server";
import { getAllDeals } from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";
import { successResponse, handleApiError } from "@/lib/api-response";
import { withRateLimit } from "@/lib/api-rate-limit";
import { trackPerformance, trackApiCall } from "@/lib/monitoring";
import { trackApiCall as trackApiMetric } from "@/lib/metrics";

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by withRateLimit
async function alertsHandler(request: NextRequest) {
  const startTime = Date.now();

  try {
    const deals = await trackPerformance("alerts.getDeals", async () => {
      return await getAllDeals();
    });

    const atRiskDeals = deals
      .filter((deal) => {
        const riskLevel = formatRiskLevel(deal.riskScore);
        return riskLevel === "High" || riskLevel === "Medium";
      })
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    const alerts = atRiskDeals.map((deal) => {
      const riskLevel = formatRiskLevel(deal.riskScore);
      let message = "";

      if (deal.primaryRiskReason) {
        message = `${deal.name} - ${deal.primaryRiskReason}`;
      } else if (deal.isActionOverdue && deal.actionOverdueByDays) {
        message = `${deal.name} - Action overdue by ${deal.actionOverdueByDays
          } day${deal.actionOverdueByDays > 1 ? "s" : ""}`;
      } else if (deal.riskAgeInDays && deal.riskAgeInDays > 0) {
        message = `${deal.name} - No activity in ${deal.riskAgeInDays} day${deal.riskAgeInDays > 1 ? "s" : ""
          }`;
      } else {
        message = `${deal.name} - High risk detected`;
      }

      return {
        id: deal.id,
        type: riskLevel === "High" ? "high" : "medium",
        message,
        dealId: deal.id,
        riskScore: deal.riskScore,
        dealName: deal.name,
      };
    });

    const duration = Date.now() - startTime;
    trackApiCall("/api/alerts", "GET", duration, 200);
    trackApiMetric("/api/alerts", duration, 200);
    return successResponse({ alerts });
  } catch (error) {
    const duration = Date.now() - startTime;
    const statusCode =
      error instanceof Error && "statusCode" in error
        ? (error as Error & { statusCode: number }).statusCode
        : 500;
    trackApiCall("/api/alerts", "GET", duration, statusCode);
    trackApiMetric("/api/alerts", duration, statusCode);
    return handleApiError(error);
  }
}

export const GET = withRateLimit(alertsHandler, { tier: "normal" });
