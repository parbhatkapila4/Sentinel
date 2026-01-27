import { getMyTeams } from "@/app/actions/teams";
import { successResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const teams = await getMyTeams();
    return successResponse({ teams });
  } catch (error) {
    return handleApiError(error);
  }
}
