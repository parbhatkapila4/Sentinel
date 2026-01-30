
import { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/errors";
import { consumeUserEvents } from "@/lib/realtime";
import type { RealtimeEvent } from "@/lib/realtime";

const POLL_MS = 2000;
const HEARTBEAT_MS = 30000;

function encodeSSE(data: unknown): string {
  const line =
    typeof data === "string" ? data : JSON.stringify(data);
  return `data: ${line}\n\n`;
}

function encodeHeartbeat(): string {
  return `: heartbeat\n\n`;
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "test") {
    return new Response(null, { status: 200 });
  }

  let userId: string;
  try {
    userId = await getAuthenticatedUserId();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    throw err;
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let lastHeartbeat = Date.now();

      const send = (text: string) => {
        try {
          controller.enqueue(encoder.encode(text));
        } catch {
        }
      };

      while (!request.signal.aborted) {
        const now = Date.now();

        const events = await consumeUserEvents(userId);
        for (const event of events) {
          send(encodeSSE(event as RealtimeEvent));
        }

        if (now - lastHeartbeat >= HEARTBEAT_MS) {
          send(encodeHeartbeat());
          lastHeartbeat = now;
        }

        const deadline = Date.now() + Math.min(POLL_MS, HEARTBEAT_MS - (now - lastHeartbeat));
        while (Date.now() < deadline && !request.signal.aborted) {
          await new Promise((r) => setTimeout(r, 500));
        }
      }

      try {
        controller.close();
      } catch {
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
