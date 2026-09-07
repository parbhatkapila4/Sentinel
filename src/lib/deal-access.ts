import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { TEAM_ROLES } from "@/lib/config";
import { getUserTeamRole } from "@/lib/team-utils";

export interface TeamMembershipSummary {
  teamId: string;
  role: string;
}

export interface DealOwnershipFields {
  userId: string;
  teamId: string | null;
}

export async function getTeamMemberships(
  userId: string
): Promise<TeamMembershipSummary[]> {
  const rows = await prisma.teamMember.findMany({
    where: { userId },
    select: { teamId: true, role: true },
  });
  return rows ?? [];
}

export function readableTeamIds(memberships: TeamMembershipSummary[]): string[] {
  return memberships.map((m) => m.teamId);
}

export function editableTeamIds(memberships: TeamMembershipSummary[]): string[] {
  return memberships
    .filter((m) => m.role !== TEAM_ROLES.VIEWER)
    .map((m) => m.teamId);
}

export function adminTeamIds(memberships: TeamMembershipSummary[]): string[] {
  return memberships
    .filter((m) => m.role === TEAM_ROLES.OWNER || m.role === TEAM_ROLES.ADMIN)
    .map((m) => m.teamId);
}

export function dealScopeWhere(
  userId: string,
  teamIds: string[]
): Prisma.DealWhereInput {
  if (teamIds.length === 0) return { userId };
  return { OR: [{ userId }, { teamId: { in: teamIds } }] };
}

export function isDealEditable(
  userId: string,
  deal: DealOwnershipFields,
  memberships: TeamMembershipSummary[]
): boolean {
  if (deal.userId === userId) return true;
  if (!deal.teamId) return false;
  const membership = memberships.find((m) => m.teamId === deal.teamId);
  return membership !== undefined && membership.role !== TEAM_ROLES.VIEWER;
}

export function isDealTeamAdmin(
  deal: DealOwnershipFields,
  memberships: TeamMembershipSummary[]
): boolean {
  if (!deal.teamId) return false;
  const membership = memberships.find((m) => m.teamId === deal.teamId);
  return (
    membership?.role === TEAM_ROLES.OWNER || membership?.role === TEAM_ROLES.ADMIN
  );
}

export async function canUserAccessDeal(
  userId: string,
  deal: DealOwnershipFields
): Promise<boolean> {
  if (deal.userId === userId) return true;
  if (!deal.teamId) return false;
  const role = await getUserTeamRole(userId, deal.teamId);
  return role !== null;
}

export async function canUserEditDeal(
  userId: string,
  deal: DealOwnershipFields
): Promise<boolean> {
  if (deal.userId === userId) return true;
  if (!deal.teamId) return false;
  const role = await getUserTeamRole(userId, deal.teamId);
  if (!role) return false;
  return role !== TEAM_ROLES.VIEWER;
}
