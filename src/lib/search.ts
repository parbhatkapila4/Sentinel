import { prisma } from "@/lib/prisma";
import { getUserTeamRole } from "@/lib/team-utils";
import { ForbiddenError } from "@/lib/errors";
import type { Prisma } from "@prisma/client";

export type SearchDealsOptions = {
  userId: string;
  query: string;
  limit?: number;
  fullText?: boolean;
  teamId?: string;
  includeTeamDeals?: boolean;
};

export type SearchDealResult = {
  id: string;
  name: string;
  stage: string;
  value: number;
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function searchDeals(
  options: SearchDealsOptions
): Promise<SearchDealResult[]> {
  const {
    userId,
    query,
    limit = DEFAULT_LIMIT,
    fullText = false,
    teamId,
    includeTeamDeals,
  } = options;

  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return [];
  }

  const safeLimit = Math.min(
    Math.max(1, Number(limit) || DEFAULT_LIMIT),
    MAX_LIMIT
  );

  let where: Prisma.DealWhereInput = {};

  if (teamId) {
    const role = await getUserTeamRole(userId, teamId);
    if (!role) throw new ForbiddenError("You are not a member of this team");
    where = { teamId };
  } else if (includeTeamDeals) {
    const memberships = await prisma.teamMember.findMany({
      where: { userId },
      select: { teamId: true },
    });
    const teamIds = memberships.map((m) => m.teamId);
    where = {
      OR: [
        { userId },
        ...(teamIds.length ? [{ teamId: { in: teamIds } }] : []),
      ],
    };
  } else {
    where = { userId };
  }

  const searchTerm = trimmed;
  const containsFilter = { contains: searchTerm, mode: "insensitive" as const };

  const searchCondition: Prisma.DealWhereInput = fullText
    ? {
      OR: [
        { name: containsFilter },
        { location: containsFilter },
        { stage: containsFilter },
      ],
    }
    : { name: containsFilter };

  const finalWhere: Prisma.DealWhereInput =
    Object.keys(where).length === 0
      ? searchCondition
      : { AND: [where, searchCondition] };

  const deals = await prisma.deal.findMany({
    where: finalWhere,
    take: safeLimit,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, stage: true, value: true },
  });

  return deals;
}
