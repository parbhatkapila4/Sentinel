import { NextRequest } from "next/server";
import { withErrorContext } from "./error-context";
import { logInfo, logError } from "./logger";

function generateRequestId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  } catch {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

function getRequestId(request: NextRequest): string {
  const headerId = request.headers.get("x-request-id");
  if (headerId) {
    return headerId;
  }
  return generateRequestId();
}

async function getUserIdFromRequest(request: NextRequest): Promise<string | undefined> {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      return undefined;
    }
  } catch {
  }
  return undefined;
}

export function withApiContext<T>(
  handler: (request: NextRequest, context?: { requestId: string }) => Promise<T>,
  options?: {
    logRequest?: boolean;
    logResponse?: boolean;
  }
) {
  return async (request: NextRequest): Promise<T> => {
    const requestId = getRequestId(request);
    const startTime = Date.now();
    const method = request.method;
    const url = request.url;

    const logRequest = options?.logRequest !== false;
    const logResponse = options?.logResponse !== false;

    try {
      return await withErrorContext(
        { requestId },
        async () => {
          if (logRequest) {
            logInfo("API request started", {
              requestId,
              method,
              url,
            });
          }

          const result = await handler(request, { requestId });

          if (logResponse) {
            const duration = Date.now() - startTime;
            logInfo("API request completed", {
              requestId,
              method,
              url,
              duration,
              statusCode: 200,
            });
          }

          return result;
        }
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      logError("API request failed", error, {
        requestId,
        method,
        url,
        duration,
      });
      throw error;
    }
  };
}
