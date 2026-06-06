import { NextResponse } from "next/server";
import { syncCalendar } from "@/app/actions/calendar";
export async function POST() {
  try {
    const result = await syncCalendar();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
