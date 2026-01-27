import { NextResponse } from "next/server";
import { syncHubSpotDeals } from "@/app/actions/hubspot";

export async function POST() {
  try {
    const result = await syncHubSpotDeals();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
