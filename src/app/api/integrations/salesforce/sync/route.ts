import { NextRequest } from "next/server";
import { syncSalesforceDeals } from "@/app/actions/salesforce";
import { successResponse, handleApiError } from "@/lib/api-response";
import { withApiContext } from "@/lib/api-middleware";
import { getAuthenticatedUserId } from "@/lib/auth";
import { withErrorContext } from "@/lib/error-context";
import { logInfo } from "@/lib/logger";

async function syncHandler(request: NextRequest, context?: { requestId: string }) {
  const requestId = context?.requestId || "unknown";

  try {
    const userId = await getAuthenticatedUserId();

    await withErrorContext(
      { userId, requestId, actionType: "sync_salesforce" },
      async () => {
        logInfo("Starting Salesforce sync", {
          userId,
          requestId,
        });
      }
    );

    const result = await syncSalesforceDeals();

    logInfo("Salesforce sync completed", {
      userId,
      requestId,
      synced: result.synced,
      created: result.created,
      updated: result.updated,
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error, requestId);
  }
}

export const POST = withApiContext(syncHandler);
