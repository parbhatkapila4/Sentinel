import { PrismaClient } from "@prisma/client";

function resolveScriptDbUrl() {
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

const tableName = process.argv[2];
const columnsArg = process.argv[3];

if (!tableName || !columnsArg) {
  console.error(
    "Usage: node scripts/verify-integration-schema.mjs <TableName> <col1,col2,...>"
  );
  process.exit(1);
}

const columns = columnsArg
  .split(",")
  .map((c) => c.trim())
  .filter(Boolean);

if (columns.length === 0) {
  console.error("No column names parsed from second arg.");
  process.exit(1);
}

const dbUrl = resolveScriptDbUrl();
const prisma = new PrismaClient(
  dbUrl ? { datasources: { db: { url: dbUrl } } } : {}
);

try {
  const rows = await prisma.$queryRawUnsafe(
    `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = $1
      AND column_name = ANY($2)
    ORDER BY column_name
    `,
    tableName,
    columns
  );

  console.log(`=== ${tableName} - ${columns.length} column(s) ===`);
  console.log(JSON.stringify(rows, null, 2));

  if (Array.isArray(rows) && rows.length < columns.length) {
    const found = new Set(rows.map((r) => r.column_name));
    const missing = columns.filter((c) => !found.has(c));
    console.error(`\nMISSING columns: ${missing.join(", ")}`);
    process.exit(2);
  }
} finally {
  await prisma.$disconnect();
}
