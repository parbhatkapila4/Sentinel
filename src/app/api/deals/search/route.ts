import { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/api-response";
import { withRateLimit } from "@/lib/api-rate-limit";
import { trackPerformance, trackApiCall } from "@/lib/monitoring";
import { trackApiCall as trackApiMetric } from "@/lib/metrics";
import { withCache } from "@/lib/cache";
import { searchDeals } from "@/lib/search";

async function searchHandler(request: NextRequest) {
  const startTime = Date.now();

  try {
    const userId = await getAuthenticatedUserId();
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const limitParam = searchParams.get("limit");
    const fullText = searchParams.get("fullText") === "true";
    const teamId = searchParams.get("teamId") ?? undefined;
    const includeTeamDeals = searchParams.get("includeTeamDeals") === "true";

    if (!query || query.trim().length === 0) {
      const duration = Date.now() - startTime;
      trackApiCall("/api/deals/search", "GET", duration, 200);
      trackApiMetric("/api/deals/search", duration, 200);
      return successResponse({ deals: [] });
    }

    const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10) || 20)) : 20;
    const cacheKey = `deals:search:${userId}:${query.trim().toLowerCase()}:${limit}:${fullText}:${teamId ?? ""}:${includeTeamDeals}`;

    const deals = await withCache(cacheKey, 15, async () => {
      return await trackPerformance("deals.search", async () => {
        return await searchDeals({
          userId,
          query,
          limit,
          fullText,
          teamId,
          includeTeamDeals: includeTeamDeals || undefined,
        });
      });
    });

    const duration = Date.now() - startTime;
    trackApiCall("/api/deals/search", "GET", duration, 200);
    trackApiMetric("/api/deals/search", duration, 200);
    return successResponse({ deals });
  } catch (error) {
    const duration = Date.now() - startTime;
    const statusCode =
      error instanceof Error && "statusCode" in error
        ? (error as Error & { statusCode: number }).statusCode
        : 500;
    trackApiCall("/api/deals/search", "GET", duration, statusCode);
    trackApiMetric("/api/deals/search", duration, statusCode);
    return handleApiError(error);
  }
}

export const GET = withRateLimit(searchHandler, { tier: "normal" });
