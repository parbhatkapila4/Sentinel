import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/audit-log";

export async function DELETE() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const userDeals = await prisma.deal.findMany({
      where: { userId },
      select: { id: true },
    });
    const dealIds = userDeals.map((d) => d.id);


    if (dealIds.length > 0) {
      await prisma.dealTimeline.deleteMany({
        where: {
          dealId: { in: dealIds },
        },
      });

      await prisma.dealEvent.deleteMany({
        where: {
          dealId: { in: dealIds },
        },
      });

      await prisma.action.deleteMany({
        where: {
          dealId: { in: dealIds },
        },
      });
    }

    await prisma.deal.deleteMany({
      where: { userId },
    });


    await prisma.chat.deleteMany({
      where: { userId },
    });

    await prisma.chatFolder.deleteMany({
      where: { userId },
    });

    await prisma.notification.deleteMany({
      where: { userId },
    });

    await prisma.userNotificationSettings.deleteMany({
      where: { userId },
    });

    await prisma.webhook.deleteMany({
      where: { userId },
    });

    await prisma.slackIntegration.deleteMany({
      where: { userId },
    });

    await prisma.teamMember.deleteMany({
      where: { userId },
    });


    await prisma.user.delete({
      where: { id: userId },
    });

    await logAuditEvent(
      userId,
      AUDIT_ACTIONS.USER_DELETED,
      "user",
      userId,
      {
        timestamp: new Date().toISOString(),
        deletedAt: new Date().toISOString(),
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
