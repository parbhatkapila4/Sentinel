import { getAuthenticatedUserId } from "@/lib/auth";
import { markAllAsRead } from "@/lib/notifications";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function POST() {
  try {
    const userId = await getAuthenticatedUserId();
    await markAllAsRead(userId);
    return successResponse({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
