import { prisma } from "@/lib/prisma";
import { CANONICAL_STAGES } from "@/lib/config";

export const LEGACY_STAGE_ALIASES: Record<string, string> = {
  Discovery: "discover",
  Qualification: "qualify",
  Proposal: "proposal",
  Negotiation: "negotiation",
  "Closed Won": "closed_won",
  "Closed Lost": "closed_lost",
};

export function getCanonicalStageSet(): Set<string> {
  return new Set(CANONICAL_STAGES);
}

export async function countNonCanonicalDealStages(): Promise<number> {
  const rows = await prisma.deal.findMany({
    select: { stage: true },
    distinct: ["stage"],
  });
  const canonical = getCanonicalStageSet();
  return rows.filter((row) => !canonical.has(row.stage)).length;
}
