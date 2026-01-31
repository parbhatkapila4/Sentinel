import { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { bulkUpdateDeals, bulkDeleteDeals } from "@/app/actions/bulk-operations";
import { successResponse, handleApiError } from "@/lib/api-response";
import { withRateLimit } from "@/lib/api-rate-limit";
import { ValidationError } from "@/lib/errors";

const MAX_DEAL_IDS = 100;

type BulkRequestBody = {
  action: "update" | "delete";
  dealIds: string[];
  updates?: { stage?: string; assignedToId?: string | null };
};

function parseBody(body: unknown): BulkRequestBody {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body is required", {
      body: "Must be a JSON object",
    });
  }

  const obj = body as Record<string, unknown>;

  const action = obj.action;
  if (action !== "update" && action !== "delete") {
    throw new ValidationError("Invalid action", {
      action: "Must be 'update' or 'delete'",
    });
  }

  const dealIds = obj.dealIds;
  if (!Array.isArray(dealIds)) {
    throw new ValidationError("dealIds must be an array", {
      dealIds: "Expected string array",
    });
  }

  if (dealIds.length === 0) {
    throw new ValidationError("dealIds cannot be empty", {
      dealIds: "Provide at least one deal ID",
    });
  }

  if (dealIds.length > MAX_DEAL_IDS) {
    throw new ValidationError(`Cannot process more than ${MAX_DEAL_IDS} deals`, {
      dealIds: `Maximum ${MAX_DEAL_IDS} deals allowed`,
    });
  }

  const validIds = dealIds.filter((id) => typeof id === "string");
  if (validIds.length !== dealIds.length) {
    throw new ValidationError("All dealIds must be strings", {
      dealIds: "Invalid type in array",
    });
  }

  const result: BulkRequestBody = {
    action,
    dealIds: validIds,
  };

  if (action === "update") {
    const updates = obj.updates;
    if (updates && typeof updates === "object" && !Array.isArray(updates)) {
      const u = updates as Record<string, unknown>;
      const parsed: { stage?: string; assignedToId?: string | null } = {};
      if (typeof u.stage === "string") parsed.stage = u.stage;
      if (u.assignedToId === null) parsed.assignedToId = null;
      else if (typeof u.assignedToId === "string") parsed.assignedToId = u.assignedToId;
      result.updates = parsed;
    }
  }

  return result;
}

async function bulkHandler(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError("Invalid JSON body", { body: "Expected valid JSON" });
    }

    const parsed = parseBody(body);

    if (parsed.action === "update") {
      if (!parsed.updates || (!parsed.updates.stage && parsed.updates.assignedToId === undefined)) {
        throw new ValidationError("Updates required for update action", {
          updates: "Provide stage and/or assignedToId",
        });
      }
      const result = await bulkUpdateDeals(userId, parsed.dealIds, parsed.updates);
      return successResponse(result);
    }

    const result = await bulkDeleteDeals(userId, parsed.dealIds);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export const POST = withRateLimit(bulkHandler, { tier: "normal" });
