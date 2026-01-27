import { NextResponse } from "next/server";
import { getUpcomingMeetings, createMeetingForDeal } from "@/app/actions/google-calendar";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dealId = searchParams.get("dealId") || undefined;

    const meetings = await getUpcomingMeetings(dealId);
    return NextResponse.json({ success: true, meetings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dealId, title, description, startTime, endTime, attendees, location } = body;

    if (!dealId || !title || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const meeting = await createMeetingForDeal(dealId, {
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      attendees,
      location,
    });

    return NextResponse.json({ success: true, meeting });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
