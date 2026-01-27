import { getAuthenticatedUserId } from "@/lib/auth";
import { getUserNotifications, getUnreadCount } from "@/lib/notifications";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const skip = searchParams.get("skip");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const notifications = await getUserNotifications(userId, {
      limit: limit ? Math.min(100, parseInt(limit, 10) || 20) : 20,
      skip: skip ? Math.max(0, parseInt(skip, 10)) : undefined,
      unreadOnly,
    });
    const unreadCount = await getUnreadCount(userId);

    return successResponse({ notifications, unreadCount });
  } catch (error) {
    return handleApiError(error);
  }
}
