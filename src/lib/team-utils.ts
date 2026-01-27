import { prisma } from "@/lib/prisma";

export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return base ? `${base}-${suffix}` : `team-${suffix}`;
}

export async function getUserTeamRole(
  userId: string,
  teamId: string
): Promise<string | null> {
  const m = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId, teamId } },
    select: { role: true },
  });
  return m?.role ?? null;
}
