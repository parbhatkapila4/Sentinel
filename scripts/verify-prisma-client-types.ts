import { PrismaClient } from "@prisma/client";

function resolveScriptDbUrl(): string | undefined {
  const direct = process.env.DIRECT_URL?.trim();
  if (direct) return direct;
  const fallback = process.env.DATABASE_URL;
  if (!fallback) return undefined;
  try {
    const url = new URL(fallback);
    if (!url.searchParams.has("pgbouncer")) {
      url.searchParams.set("pgbouncer", "true");
    }
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "1");
    }
    return url.toString();
  } catch {
    return fallback;
  }
}

interface MinimalModelDelegate {
  findFirst: (args: { select: Record<string, true> }) => Promise<unknown>;
}

async function main(): Promise<void> {
  const modelName = process.argv[2];
  const fieldsArg = process.argv[3];

  if (!modelName || !fieldsArg) {
    console.error(
      "Usage: npx tsx scripts/verify-prisma-client-types.ts <ModelName> <field1,field2,...>"
    );
    process.exit(1);
  }

  const fields = fieldsArg
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  if (fields.length === 0) {
    console.error("No field names parsed from second arg.");
    process.exit(1);
  }

  const clientKey = modelName.charAt(0).toLowerCase() + modelName.slice(1);

  const dbUrl = resolveScriptDbUrl();
  const prisma = dbUrl
    ? new PrismaClient({ datasources: { db: { url: dbUrl } } })
    : new PrismaClient();
  const delegate = (prisma as unknown as Record<string, MinimalModelDelegate>)[
    clientKey
  ];

  if (!delegate || typeof delegate.findFirst !== "function") {
    console.error(
      `Prisma client has no delegate '${clientKey}'. Did 'prisma generate' run after the migration? Or is '${modelName}' the right PascalCase model name?`
    );
    await prisma.$disconnect();
    process.exit(2);
  }

  const select = Object.fromEntries(fields.map((f) => [f, true as const]));

  try {
    const row = await delegate.findFirst({ select });
    console.log(
      `${modelName}.findFirst({ select: ${fields.join(", ")} }) →`
    );
    console.log(JSON.stringify(row, null, 2));
  } catch (error) {
    console.error("Prisma query rejected the select:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(3);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
