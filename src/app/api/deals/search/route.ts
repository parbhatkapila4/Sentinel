import { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, handleApiError } from "@/lib/api-response";
import { withRateLimit } from "@/lib/api-rate-limit";
import { trackPerformance, trackApiCall } from "@/lib/monitoring";
import { trackApiCall as trackApiMetric } from "@/lib/metrics";
import { withCache } from "@/lib/cache";

async function searchHandler(request: NextRequest) {
  const startTime = Date.now();

  try {
    const userId = await getAuthenticatedUserId();
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      const duration = Date.now() - startTime;
      trackApiCall("/api/deals/search", "GET", duration, 200);
      trackApiMetric("/api/deals/search", duration, 200);
      return successResponse({ deals: [] });
    }


    const cacheKey = `deals:search:${userId}:${query.trim().toLowerCase()}`;
    const deals = await withCache(cacheKey, 15, async () => {
      return await trackPerformance("deals.search", async () => {
        return await prisma.deal.findMany({
          where: {
            userId,
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            stage: true,
            value: true,
          },
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
