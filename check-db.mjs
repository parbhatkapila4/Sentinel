import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
const url = new URL(process.env.DATABASE_URL);
url.searchParams.set("pgbouncer", "true");
url.searchParams.set("connection_limit", "1");

const prisma = new PrismaClient({
  datasources: { db: { url: url.toString() } },
});

try {
  const userCount = await prisma.user.count();
  const hubspotCount = await prisma.hubSpotIntegration.count();
  const salesforceCount = await prisma.salesforceIntegration.count();
  const gmailCount = await prisma.gmailIntegration.count();
  const calendarCount = await prisma.googleCalendarIntegration.count();

  console.log("=== ROW COUNTS ===");
  console.log("Users:", userCount);
  console.log("HubSpot:", hubspotCount);
  console.log("Salesforce:", salesforceCount);
  console.log("Gmail:", gmailCount);
  console.log("Google Calendar:", calendarCount);

  if (salesforceCount > 0) {
    const rows = await prisma.salesforceIntegration.findMany({
      select: {
        id: true,
        userId: true,
        authMethod: true,
        instanceUrl: true,
        isActive: true,
        scopes: true,
        accessTokenExpiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "asc" },
    });
    console.log("\n=== SALESFORCE ROWS ===");
    console.log(JSON.stringify(rows, null, 2));
  } else {
    console.log("\nNo Salesforce integrations found.");
  }
} catch (err) {
  console.error("ERROR:", err.message);
} finally {
  await prisma.$disconnect();
}
