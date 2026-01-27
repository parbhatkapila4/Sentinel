import { getAllDeals } from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const deals = await getAllDeals();

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

    return successResponse({ alerts });
  } catch (error) {
    return handleApiError(error);
  }
}
