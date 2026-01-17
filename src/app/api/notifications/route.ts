import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    const recentDeals = await prisma.deal.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    const userDealIds = await prisma.deal.findMany({
      where: { userId },
      select: { id: true },
    });
    const dealIds = userDealIds.map((d) => d.id);

    const recentTimelineEvents = await prisma.dealTimeline.findMany({
      where: {
        dealId: {
          in: dealIds,
        },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const dealMap = new Map(
      await prisma.deal
        .findMany({
          where: { id: { in: dealIds } },
          select: { id: true, name: true },
        })
        .then((deals) => deals.map((d) => [d.id, d.name]))
    );

    const notifications = [];

    for (const deal of recentDeals) {
      notifications.push({
        id: `deal-${deal.id}`,
        type: "deal",
        message: `New deal '${deal.name}' added`,
        time: formatDistanceToNow(new Date(deal.createdAt), {
          addSuffix: true,
        }),
        read: false,
        dealId: deal.id,
        createdAt: deal.createdAt,
      });
    }

    for (const event of recentTimelineEvents) {
      const dealName = dealMap.get(event.dealId) || "Unknown Deal";
      let message = "";
      if (event.eventType === "stage_changed") {
        message = `Deal stage updated for '${dealName}'`;
      } else if (event.eventType === "activity") {
        message = `New activity on '${dealName}'`;
      } else {
        message = `Update on '${dealName}'`;
      }

      notifications.push({
        id: `event-${event.id}`,
        type: "update",
        message,
        time: event.createdAt
          ? formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })
          : "Recently",
        read: false,
        dealId: event.dealId,
        createdAt: event.createdAt || new Date(),
      });
    }

    notifications.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      notifications: notifications.slice(0, 10),
    });
  } catch (error) {
    console.error("Notifications error:", error);
    return NextResponse.json({ notifications: [] }, { status: 500 });
  }
}
