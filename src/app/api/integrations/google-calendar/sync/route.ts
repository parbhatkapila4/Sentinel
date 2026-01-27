import { NextResponse } from "next/server";
import { syncCalendarEvents } from "@/app/actions/google-calendar";

export async function POST() {
  try {
    const result = await syncCalendarEvents();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
