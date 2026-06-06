import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const canonical = new Set([
  "discover",
  "qualify",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
]);

async function main() {
  const rows = await prisma.deal.findMany({
    select: { stage: true },
    distinct: ["stage"],
  });

  const nonCanonical = rows
    .map((r) => r.stage)
    .filter((stage) => !canonical.has(stage));

  if (nonCanonical.length > 0) {
    console.error(
      `[verify-canonical-stages] Found non-canonical stage values: ${nonCanonical.join(", ")}`
    );
    process.exit(1);
  }

  console.log("[verify-canonical-stages] OK: all stage values are canonical");
}

main()
  .catch((error) => {
    console.error("[verify-canonical-stages] Failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
