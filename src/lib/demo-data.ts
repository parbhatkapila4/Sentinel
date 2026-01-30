import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

const DEMO_COMPANIES = [
  { name: "Acme Corporation", value: 75000, stage: "negotiation", daysAgo: 2 },
  { name: "TechStart Inc", value: 45000, stage: "proposal", daysAgo: 8 },
  { name: "Global Systems Ltd", value: 120000, stage: "qualify", daysAgo: 1 },
  { name: "Pinnacle Solutions", value: 35000, stage: "discover", daysAgo: 15 },
  { name: "Horizon Dynamics", value: 95000, stage: "negotiation", daysAgo: 5 },
  { name: "Quantum Industries", value: 250000, stage: "proposal", daysAgo: 12 },
  { name: "Nexus Partners", value: 55000, stage: "qualify", daysAgo: 3 },
  { name: "Apex Ventures", value: 180000, stage: "closed_won", daysAgo: 0 },
];

const LOCATIONS = [
  "United States",
  "United Kingdom",
  "Germany",
  "Canada",
  "Australia",
  "Singapore",
];

const TIMELINE_EVENTS: { eventType: "email_sent" | "email_received" | "meeting_held"; note: string }[] = [
  { eventType: "email_sent", note: "Sent initial proposal deck" },
  { eventType: "meeting_held", note: "Discovery call completed" },
  { eventType: "email_sent", note: "Follow-up on pricing discussion" },
  { eventType: "meeting_held", note: "Technical demo with engineering team" },
  { eventType: "email_received", note: "Stakeholder expressed interest in Q1 rollout" },
  { eventType: "email_sent", note: "Budget approved, pending legal review" },
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

export async function seedDemoDataForUser(userId: string): Promise<void> {
  const hasReal = await hasRealDeals(userId);
  if (hasReal) {
    await removeDemoDataForUser(userId);
    return;
  }

  const didSeed = await prisma.$transaction(async (tx) => {
    const existingDeals = await tx.deal.count({
      where: { userId },
    });

    if (existingDeals > 0) {
      return false;
    }

    const now = new Date();

    for (const company of DEMO_COMPANIES) {
      const createdAt = subtractDays(
        now,
        company.daysAgo + Math.floor(Math.random() * 30) + 10
      );

      const deal = await tx.deal.create({
        data: {
          name: company.name,
          value: company.value,
          stage: company.stage,
          location: getRandomItem(LOCATIONS),
          userId,
          isDemo: true,
          createdAt,
        },
      });

      await tx.dealTimeline.create({
        data: {
          dealId: deal.id,
          eventType: "stage_changed",
          metadata: { stage: company.stage } as Prisma.InputJsonValue,
          createdAt,
        },
      });

      const eventCount = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < eventCount; i++) {
        const ev = getRandomItem(TIMELINE_EVENTS);
        const eventDate = subtractDays(
          now,
          company.daysAgo + i * 2 + Math.floor(Math.random() * 3)
        );

        await tx.dealTimeline.create({
          data: {
            dealId: deal.id,
            eventType: "event_created",
            metadata: {
              eventType: ev.eventType,
              note: ev.note,
            } as Prisma.InputJsonValue,
            createdAt: eventDate,
          },
        });
      }
    }
    return true;
  });

  if (didSeed) {
    console.log(`[Demo] Seeded ${DEMO_COMPANIES.length} demo deals for user ${userId}`);
  }
}

export async function removeDemoDataForUser(userId: string): Promise<number> {
  const demoDeals = await prisma.deal.findMany({
    where: { userId, isDemo: true },
    select: { id: true },
  });

  const dealIds = demoDeals.map((d) => d.id);

  if (dealIds.length === 0) {
    return 0;
  }

  await prisma.dealTimeline.deleteMany({
    where: { dealId: { in: dealIds } },
  });

  await prisma.dealEvent.deleteMany({
    where: { dealId: { in: dealIds } },
  });

  await prisma.action.deleteMany({
    where: { dealId: { in: dealIds } },
  });

  const result = await prisma.deal.deleteMany({
    where: { userId, isDemo: true },
  });

  console.log(`[Demo] Removed ${result.count} demo deals for user ${userId}`);

  return result.count;
}

export async function hasDemoData(userId: string): Promise<boolean> {
  const count = await prisma.deal.count({
    where: { userId, isDemo: true },
  });
  return count > 0;
}

export async function hasRealDeals(userId: string): Promise<boolean> {
  const count = await prisma.deal.count({
    where: { userId, isDemo: false },
  });
  return count > 0;
}
