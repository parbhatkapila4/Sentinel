import { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { getMetricsSummary } from "@/lib/business-metrics";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.ANALYTICS_API_KEY;
    const headerKey = request.headers.get("x-api-key") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (apiKey && apiKey.length > 0) {
      if (headerKey !== apiKey) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      await getAuthenticatedUserId();
    }

    const summary = await getMetricsSummary();
    return successResponse({ summary, timestamp: new Date().toISOString() });
  } catch (error) {
    return handleApiError(error);
  }
}
