import { PrismaClient, Prisma } from "@prisma/client";
import { trackDatabaseQuery } from "./monitoring";
import { normalizeSupabasePoolerDatabaseUrl } from "./prisma-database-url";
import { logError, logWarn, logInfo } from "./logger";

if (!process.env.DATABASE_URL) {
  logError("DATABASE_URL environment variable is not set");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const resolvedDatabaseUrl =
  normalizeSupabasePoolerDatabaseUrl(process.env.DATABASE_URL) ??
  process.env.DATABASE_URL;

const PRISMA_LOG = [
  { emit: "event", level: "query" },
  { emit: "stdout", level: "error" },
  ...(process.env.NODE_ENV === "development"
    ? [{ emit: "stdout", level: "warn" }]
    : []),
] as const;

type PrismaWithEvents = PrismaClient<{
  log: [{ emit: "event"; level: "query" }];
}>;

let prismaInstance: PrismaClient;

try {
  const clientOptions: Prisma.PrismaClientOptions = {
    log: PRISMA_LOG as unknown as Prisma.PrismaClientOptions["log"],
  };

  if (resolvedDatabaseUrl) {
    clientOptions.datasources = { db: { url: resolvedDatabaseUrl } };
  }

  prismaInstance =
    globalForPrisma.prisma ?? new PrismaClient(clientOptions);

  if (
    (process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_SENTRY_ENABLE_PERFORMANCE !== "false") &&
    typeof prismaInstance.$on === "function"
  ) {
    try {
      const eventClient = prismaInstance as unknown as PrismaWithEvents;

      eventClient.$on("query", (e: Prisma.QueryEvent) => {
        const duration = e.duration;
        const query = e.query;
        if (typeof duration !== "number" || typeof query !== "string") return;

        trackDatabaseQuery(query.substring(0, 100), duration);

        if (process.env.NODE_ENV === "development" && duration > 100) {
          const queryType = query.trim().substring(0, 6).toUpperCase();
          const modelMatch =
            query.match(/FROM\s+"?(\w+)"?/i) ||
            query.match(/INTO\s+"?(\w+)"?/i) ||
            query.match(/UPDATE\s+"?(\w+)"?/i);
          const model = modelMatch ? modelMatch[1] : "unknown";

          logInfo("Slow Prisma query", {
            queryType,
            model,
            durationMs: duration,
          });
        }
      });
    } catch (error) {
      logWarn("Failed to set up Prisma query tracking", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
} catch (error) {
  logError("Failed to create Prisma Client", error);
  throw new Error(
    "Prisma Client initialization failed. Please run 'npm run db:generate' to regenerate the Prisma client."
  );
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaInstance;
}

export const prisma = prismaInstance;
