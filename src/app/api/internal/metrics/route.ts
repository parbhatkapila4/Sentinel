import { NextRequest, NextResponse } from "next/server";
import { getMetricsSummary } from "@/lib/metrics";

/**
 * Read-only metrics endpoint for monitoring (Grafana, Datadog, health dashboards).
 * Protected by CRON_SECRET; returns 503 when secret is not configured.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.trim() === "") {
    return NextResponse.json(
      { error: "Metrics endpoint is disabled" },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await getMetricsSummary();
    return NextResponse.json(summary, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to collect metrics" },
      { status: 503 }
    );
  }
}
