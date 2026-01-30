import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { headers } from "next/headers";

export const AUDIT_ACTIONS = {
  USER_DELETED: "user.deleted",
  USER_UPDATED: "user.updated",

  TEAM_MEMBER_ADDED: "team.member_added",
  TEAM_MEMBER_REMOVED: "team.member_removed",
  TEAM_MEMBER_ROLE_UPDATED: "team.member_role_updated",
  TEAM_CREATED: "team.created",
  TEAM_DELETED: "team.deleted",

  INTEGRATION_CONNECTED: "integration.connected",
  INTEGRATION_DISCONNECTED: "integration.disconnected",
  INTEGRATION_UPDATED: "integration.updated",

  WEBHOOK_CREATED: "webhook.created",
  WEBHOOK_UPDATED: "webhook.updated",
  WEBHOOK_DELETED: "webhook.deleted",
  WEBHOOK_SECRET_REGENERATED: "webhook.secret_regenerated",

  DEAL_VALUE_CHANGED: "deal.value_changed",
  DEAL_STAGE_CHANGED: "deal.stage_changed",
  DEAL_DELETED: "deal.deleted",
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];


export async function logAuditEvent(
  userId: string,
  action: AuditAction | string,
  resource: string,
  resourceId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    try {
      const headersList = await headers();
      ipAddress =
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headersList.get("x-real-ip") ||
        null;
      userAgent = headersList.get("user-agent") || null;
    } catch {
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId: resourceId || null,
        metadata: metadata != null ? (metadata as Prisma.InputJsonValue) : undefined,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to log audit event:", error);
    }
  }
}


export async function getAuditLogs(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  try {
    return await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        action: true,
        resource: true,
        resourceId: true,
        metadata: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error("Failed to get audit logs:", error);
    return [];
  }
}

export async function getResourceAuditLogs(
  resource: string,
  resourceId: string,
  limit: number = 50
) {
  try {
    return await prisma.auditLog.findMany({
      where: {
        resource,
        resourceId,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        userId: true,
        action: true,
        metadata: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error("Failed to get resource audit logs:", error);
    return [];
  }
}
