"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUserId, getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
  ConflictError,
  UnauthorizedError,
} from "@/lib/errors";
import { TEAM_ROLES } from "@/lib/config";
import { generateSlug, getUserTeamRole } from "@/lib/team-utils";
import { enforceTeamMemberLimit } from "@/lib/plan-enforcement";
import { incrementUsage } from "@/lib/plans";

const ROLE_ORDER: Record<string, number> = {
  [TEAM_ROLES.OWNER]: 0,
  [TEAM_ROLES.ADMIN]: 1,
  [TEAM_ROLES.MEMBER]: 2,
  [TEAM_ROLES.VIEWER]: 3,
};

function requireMember(role: string | null): asserts role is string {
  if (!role) throw new ForbiddenError("You are not a member of this team");
}

function requireOwnerOrAdmin(role: string | null): void {
  if (!role) throw new ForbiddenError("You are not a member of this team");
  if (role !== TEAM_ROLES.OWNER && role !== TEAM_ROLES.ADMIN) {
    throw new ForbiddenError("Only owners and admins can perform this action");
  }
}

function requireOwner(role: string | null): void {
  if (!role) throw new ForbiddenError("You are not a member of this team");
  if (role !== TEAM_ROLES.OWNER) {
    throw new ForbiddenError("Only the owner can perform this action");
  }
}

export async function createTeam(formData: FormData) {
  const userId = await getAuthenticatedUserId();

  const name = (formData.get("name") as string)?.trim();
  if (!name) {
    throw new ValidationError("Team name is required", { name: "Required" });
  }

  let slug = generateSlug(name);
  let existing = await prisma.team.findUnique({ where: { slug } });
  while (existing) {
    slug = generateSlug(name);
    existing = await prisma.team.findUnique({ where: { slug } });
  }

  const team = await prisma.team.create({
    data: {
      name,
      slug,
      members: {
        create: {
          userId,
          role: TEAM_ROLES.OWNER,
        },
      },
    },
  });

  revalidatePath("/teams");
  revalidatePath("/settings/team");
  revalidatePath("/dashboard");

  return {
    id: team.id,
    name: team.name,
    slug: team.slug,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  };
}

export async function getMyTeams() {
  const userId = await getAuthenticatedUserId();

  const memberships = await prisma.teamMember.findMany({
    where: { userId },
    include: {
      team: {
        include: {
          _count: { select: { members: true } },
        },
      },
    },
  });

  return memberships.map((m) => ({
    id: m.team.id,
    name: m.team.name,
    slug: m.team.slug,
    createdAt: m.team.createdAt,
    updatedAt: m.team.updatedAt,
    memberCount: m.team._count.members,
    myRole: m.role,
  }));
}

export async function getTeamById(teamId: string) {
  const userId = await getAuthenticatedUserId();
  const role = await getUserTeamRole(userId, teamId);
  requireMember(role);

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, surname: true, email: true } } },
      },
    },
  });

  if (!team) throw new NotFoundError("Team");

  const members = [...team.members].sort(
    (a, b) => (ROLE_ORDER[a.role] ?? 99) - (ROLE_ORDER[b.role] ?? 99)
  );

  return {
    id: team.id,
    name: team.name,
    slug: team.slug,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
    myRole: role,
    members: members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      createdAt: m.createdAt,
      user: m.user,
    })),
  };
}

export async function getInviteByToken(token: string) {
  const invite = await prisma.teamInvite.findUnique({
    where: { token },
    include: { team: { select: { id: true, name: true } } },
  });
  if (!invite) return null;
  if (invite.expiresAt < new Date()) return null;
  return {
    teamId: invite.teamId,
    teamName: invite.team.name,
    role: invite.role,
    email: invite.email,
    expiresAt: invite.expiresAt,
  };
}

export async function getTeamInvites(teamId: string) {
  const userId = await getAuthenticatedUserId();
  const role = await getUserTeamRole(userId, teamId);
  requireOwnerOrAdmin(role);

  const invites = await prisma.teamInvite.findMany({
    where: { teamId, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  return invites.map((inv) => ({
    id: inv.id,
    email: inv.email,
    role: inv.role,
    expiresAt: inv.expiresAt,
    createdAt: inv.createdAt,
  }));
}

export async function getTeamMembers(teamId: string) {
  const userId = await getAuthenticatedUserId();
  const role = await getUserTeamRole(userId, teamId);
  requireMember(role);

  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: {
      user: { select: { id: true, name: true, surname: true, email: true } },
    },
  });

  members.sort((a, b) => (ROLE_ORDER[a.role] ?? 99) - (ROLE_ORDER[b.role] ?? 99));

  return members.map((m) => ({
    id: m.id,
    userId: m.userId,
    role: m.role,
    createdAt: m.createdAt,
    user: m.user,
  }));
}

export async function inviteTeamMember(
  teamId: string,
  email: string,
  role: string
) {
  const userId = await getAuthenticatedUserId();
  const myRole = await getUserTeamRole(userId, teamId);
  requireOwnerOrAdmin(myRole);

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw new NotFoundError("Team");

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new ValidationError("Email is required", { email: "Required" });
  }

  const invitee = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (invitee) {
    const existing = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId: invitee.id, teamId } },
    });
    if (existing) {
      throw new ConflictError("User is already a member of this team");
    }
  }

  const validRoles: string[] = [
    TEAM_ROLES.ADMIN,
    TEAM_ROLES.MEMBER,
    TEAM_ROLES.VIEWER,
  ];
  const validRole = validRoles.includes(role) ? role : TEAM_ROLES.MEMBER;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invite = await prisma.teamInvite.create({
    data: {
      teamId,
      email: normalizedEmail,
      role: validRole,
      expiresAt,
    },
  });

  revalidatePath(`/teams/${teamId}`);
  revalidatePath(`/settings/team/${teamId}`);

  return {
    id: invite.id,
    teamId: invite.teamId,
    email: invite.email,
    role: invite.role,
    token: invite.token,
    expiresAt: invite.expiresAt,
    createdAt: invite.createdAt,
  };
}

export async function acceptInvite(token: string) {
  const user = await getAuthenticatedUser();
  if (!user) throw new UnauthorizedError();

  const invite = await prisma.teamInvite.findUnique({
    where: { token },
    include: { team: true },
  });

  if (!invite) throw new NotFoundError("Invite");
  if (invite.expiresAt < new Date()) {
    throw new ValidationError("This invite has expired");
  }

  const userEmail = (user.email ?? "").trim().toLowerCase();
  if (userEmail !== invite.email) {
    throw new ForbiddenError("This invite was sent to a different email address");
  }

  await enforceTeamMemberLimit(user.id, invite.teamId);

  await prisma.$transaction([
    prisma.teamMember.create({
      data: {
        userId: user.id,
        teamId: invite.teamId,
        role: invite.role,
      },
    }),
    prisma.teamInvite.delete({ where: { id: invite.id } }),
  ]);

  await incrementUsage(user.id, "teamMembers", 1);

  revalidatePath("/teams");
  revalidatePath("/settings/team");
  revalidatePath(`/teams/${invite.teamId}`);
  revalidatePath(`/settings/team/${invite.teamId}`);

  return {
    id: invite.team.id,
    name: invite.team.name,
    slug: invite.team.slug,
    createdAt: invite.team.createdAt,
    updatedAt: invite.team.updatedAt,
  };
}

export async function removeTeamMember(teamId: string, memberId: string) {
  const userId = await getAuthenticatedUserId();
  const myRole = await getUserTeamRole(userId, teamId);
  requireOwnerOrAdmin(myRole);

  const target = await prisma.teamMember.findFirst({
    where: { id: memberId, teamId },
    include: { user: { select: { id: true } } },
  });

  if (!target) throw new NotFoundError("Team member");
  if (target.role === TEAM_ROLES.OWNER) {
    throw new ForbiddenError("Cannot remove the team owner");
  }
  if (target.userId === userId && myRole === TEAM_ROLES.OWNER) {
    throw new ForbiddenError("Use Leave team instead of removing yourself");
  }

  await prisma.teamMember.delete({ where: { id: memberId } });

  revalidatePath(`/teams/${teamId}`);
  revalidatePath(`/settings/team/${teamId}`);
  revalidatePath("/teams");
}

export async function updateMemberRole(
  teamId: string,
  memberId: string,
  newRole: string
) {
  const userId = await getAuthenticatedUserId();
  const myRole = await getUserTeamRole(userId, teamId);
  requireOwner(myRole);

  const target = await prisma.teamMember.findFirst({
    where: { id: memberId, teamId },
  });

  if (!target) throw new NotFoundError("Team member");
  if (target.role === TEAM_ROLES.OWNER) {
    throw new ForbiddenError("Cannot change the owner's role");
  }

  const validRoles: string[] = [
    TEAM_ROLES.ADMIN,
    TEAM_ROLES.MEMBER,
    TEAM_ROLES.VIEWER,
  ];
  const validRole = validRoles.includes(newRole) ? newRole : TEAM_ROLES.MEMBER;

  await prisma.teamMember.update({
    where: { id: memberId },
    data: { role: validRole },
  });

  revalidatePath(`/teams/${teamId}`);
  revalidatePath(`/settings/team/${teamId}`);
  revalidatePath("/teams");
}

export async function leaveTeam(teamId: string) {
  const userId = await getAuthenticatedUserId();
  const role = await getUserTeamRole(userId, teamId);
  requireMember(role);

  if (role === TEAM_ROLES.OWNER) {
    throw new ForbiddenError("Owner must transfer ownership or delete the team");
  }

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId, teamId } },
  });
  if (!membership) throw new NotFoundError("Team membership");

  await prisma.teamMember.delete({ where: { id: membership.id } });

  revalidatePath("/teams");
  revalidatePath("/settings/team");
  revalidatePath(`/teams/${teamId}`);
  revalidatePath(`/settings/team/${teamId}`);
  revalidatePath("/dashboard");
}

export async function deleteTeam(teamId: string) {
  const userId = await getAuthenticatedUserId();
  const role = await getUserTeamRole(userId, teamId);
  requireOwner(role);

  await prisma.deal.updateMany({
    where: { teamId },
    data: { teamId: null },
  });

  await prisma.team.delete({ where: { id: teamId } });

  revalidatePath("/teams");
  revalidatePath("/settings/team");
  revalidatePath("/dashboard");
}
