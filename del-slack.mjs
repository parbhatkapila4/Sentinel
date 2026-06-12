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
  const result = await prisma.slackEventsSubscription.deleteMany({
    where: { id: "sub_d7_manual_1779125500" },
  });
  console.log("Deleted Slack rows:", result.count);
} catch (err) {
  console.error("ERROR:", err.message);
} finally {
  await prisma.$disconnect();
}
