export const dynamic = "force-dynamic";

const HEALTH_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Content-Type": "text/plain; charset=utf-8",
} as const;

export async function GET(): Promise<Response> {
  return new Response("ok", { status: 200, headers: HEALTH_HEADERS });
}

export async function HEAD(): Promise<Response> {
  // Same status and headers as GET, no body - what a HEAD probe expects.
  return new Response(null, { status: 200, headers: HEALTH_HEADERS });
}
