import { NextResponse } from "next/server";
import { syncSalesforceDeals } from "@/app/actions/salesforce";

export async function POST() {
  try {
    const result = await syncSalesforceDeals();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
