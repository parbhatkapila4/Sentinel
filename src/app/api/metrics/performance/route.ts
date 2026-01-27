import { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { getMetricsSummary } from "@/lib/metrics";
import { successResponse, handleApiError } from "@/lib/api-response";
import { redis } from "@/lib/redis";

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by Next.js route signature
export async function GET(request: NextRequest) {
  try {
    await getAuthenticatedUserId();

    if (!redis) {
      return successResponse({
        message: "Redis not configured - metrics unavailable",
        metrics: {
          dealMetrics: { created: 0, updated: 0, deleted: 0 },
          apiMetrics: { totalCalls: 0, averageResponseTime: 0, errorRate: 0 },
          userMetrics: { activeUsers: 0, totalUsers: 0 },
        },
      });
    }

    const redisClient = redis;

    try {
      const summary = await getMetricsSummary();

      const slowApiCalls = (await redisClient.get("metric:api.calls.slow")) || 0;
      const slowQueries = (await redisClient.get("metric:slow_database_query")) || 0;

      const endpoints = [
        "/api/deals/search",
        "/api/insights/chat",
        "/api/alerts",
        "/api/notifications",
      ];

      const endpointMetrics = await Promise.all(
        endpoints.map(async (endpoint) => {
          try {
            const endpointTag = JSON.stringify({ endpoint });
            const calls = await redisClient.get(`metric:api.calls.by_endpoint:${endpointTag}`);
            const errors = await redisClient.get(`metric:api.calls.errors_by_endpoint:${endpointTag}`);
            const slow = await redisClient.get(`metric:api.calls.slow:${endpointTag}`);

            return {
              endpoint,
              calls: calls ? parseInt(calls.toString(), 10) : 0,
              errors: errors ? parseInt(errors.toString(), 10) : 0,
              slow: slow ? parseInt(slow.toString(), 10) : 0,
            };
          } catch {
            return {
              endpoint,
              calls: 0,
              errors: 0,
              slow: 0,
            };
          }
        })
      );

      const slowestEndpoints = endpointMetrics
        .filter((m) => m.slow > 0)
        .sort((a, b) => b.slow - a.slow)
        .slice(0, 5);

      return successResponse({
        summary,
        performance: {
          slowApiCalls: parseInt(slowApiCalls.toString(), 10),
          slowQueries: parseInt(slowQueries.toString(), 10),
          endpointMetrics,
          slowestEndpoints,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        console.error("[Metrics] Failed to fetch performance metrics:", error);
      }
      return successResponse({
        message: "Failed to fetch metrics",
        metrics: {
          dealMetrics: { created: 0, updated: 0, deleted: 0 },
          apiMetrics: { totalCalls: 0, averageResponseTime: 0, errorRate: 0 },
          userMetrics: { activeUsers: 0, totalUsers: 0 },
        },
      });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
