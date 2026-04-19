import { NextRequest, NextResponse } from "next/server";
import { getMetricsSummary } from "@/lib/metrics";
import { requireCronBearerAuth } from "@/lib/cron-auth";

export async function GET(request: NextRequest) {
  const authError = requireCronBearerAuth(request);
  if (authError) return authError;

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
