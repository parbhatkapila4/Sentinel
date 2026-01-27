import { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { getUserNotifications, getUnreadCount } from "@/lib/notifications";
import { successResponse, handleApiError } from "@/lib/api-response";
import { withRateLimit } from "@/lib/api-rate-limit";
import { trackPerformance, trackApiCall } from "@/lib/monitoring";
import { trackApiCall as trackApiMetric } from "@/lib/metrics";
import { withApiContext } from "@/lib/api-middleware";
import { withErrorContext } from "@/lib/error-context";

async function notificationsHandler(request: NextRequest, context?: { requestId: string }) {
  const startTime = Date.now();
  const requestId = context?.requestId || "unknown";

  try {
    const userId = await getAuthenticatedUserId();

    await withErrorContext(
      { userId, requestId, actionType: "get_notifications" },
      async () => {

      }
    );

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const skip = searchParams.get("skip");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const { notifications, unreadCount } = await trackPerformance("notifications.get", async () => {
      const notifications = await getUserNotifications(userId, {
        limit: limit ? Math.min(100, parseInt(limit, 10) || 20) : 20,
        skip: skip ? Math.max(0, parseInt(skip, 10)) : undefined,
        unreadOnly,
      });
      const unreadCount = await getUnreadCount(userId);
      return { notifications, unreadCount };
    });

    const duration = Date.now() - startTime;
    trackApiCall("/api/notifications", "GET", duration, 200);
    trackApiMetric("/api/notifications", duration, 200);
    return successResponse({ notifications, unreadCount });
  } catch (error) {
    const duration = Date.now() - startTime;
    const statusCode =
      error instanceof Error && "statusCode" in error
        ? (error as Error & { statusCode: number }).statusCode
        : 500;
    trackApiCall("/api/notifications", "GET", duration, statusCode);
    trackApiMetric("/api/notifications", duration, statusCode);
    return handleApiError(error, requestId);
  }
}

export const GET = withRateLimit(withApiContext(notificationsHandler), { tier: "normal" });
