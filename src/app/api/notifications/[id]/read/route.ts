import { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { markAsRead } from "@/lib/notifications";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId();
    const { id } = await params;
    await markAsRead(id, userId);
    return successResponse({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
