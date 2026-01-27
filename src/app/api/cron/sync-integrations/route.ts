import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncSalesforceDealsForUser } from "@/app/actions/salesforce";
import { syncHubSpotDealsForUser } from "@/app/actions/hubspot";
import { syncCalendarEventsForUser } from "@/app/actions/google-calendar";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface SyncError {
  integration: string;
  userId: string;
  error: string;
}

interface SyncResults {
  salesforce: number;
  hubspot: number;
  calendar: number;
  errors: SyncError[];
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results: SyncResults = {
      salesforce: 0,
      hubspot: 0,
      calendar: 0,
      errors: [],
    };

    const salesforceIntegrations = await db.salesforceIntegration.findMany({
      where: { isActive: true, syncEnabled: true },
      select: { userId: true },
    });

    const hubspotIntegrations = await db.hubSpotIntegration.findMany({
      where: { isActive: true, syncEnabled: true },
      select: { userId: true },
    });

    const calendarIntegrations = await db.googleCalendarIntegration.findMany({
      where: { isActive: true, syncEnabled: true },
      select: { userId: true },
    });

    for (const integration of salesforceIntegrations) {
      try {
        const result = await syncSalesforceDealsForUser(integration.userId);
        if (result.success) {
          results.salesforce++;
        }
      } catch (error) {
        results.errors.push({
          integration: "salesforce",
          userId: integration.userId,
          error: String(error),
        });
      }
    }

    for (const integration of hubspotIntegrations) {
      try {
        const result = await syncHubSpotDealsForUser(integration.userId);
        if (result.success) {
          results.hubspot++;
        }
      } catch (error) {
        results.errors.push({
          integration: "hubspot",
          userId: integration.userId,
          error: String(error),
        });
      }
    }

    for (const integration of calendarIntegrations) {
      try {
        const result = await syncCalendarEventsForUser(integration.userId);
        if (result.success) {
          results.calendar++;
        }
      } catch (error) {
        results.errors.push({
          integration: "calendar",
          userId: integration.userId,
          error: String(error),
        });
      }
    }

    console.log("Integration sync cron completed:", {
      timestamp: new Date().toISOString(),
      salesforce: results.salesforce,
      hubspot: results.hubspot,
      calendar: results.calendar,
      errorCount: results.errors.length,
    });

    return NextResponse.json({
      success: true,
      results: {
        salesforce: {
          synced: results.salesforce,
          total: salesforceIntegrations.length,
        },
        hubspot: {
          synced: results.hubspot,
          total: hubspotIntegrations.length,
        },
        calendar: {
          synced: results.calendar,
          total: calendarIntegrations.length,
        },
        errors: results.errors.length,
      },
    });
  } catch (error) {
    console.error("Integration sync cron failed:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
