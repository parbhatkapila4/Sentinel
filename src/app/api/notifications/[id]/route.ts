import { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { deleteNotification } from "@/lib/notifications";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId();
    const { id } = await params;
    await deleteNotification(id, userId);
    return successResponse({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
