import { PrismaClient } from "@prisma/client";
import { trackDatabaseQuery } from "./monitoring";
import { normalizeSupabasePoolerDatabaseUrl } from "./prisma-database-url";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set!");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient;

const resolvedDatabaseUrl =
  normalizeSupabasePoolerDatabaseUrl(process.env.DATABASE_URL) ??
  process.env.DATABASE_URL;

try {
  const clientOptions: ConstructorParameters<typeof PrismaClient>[0] = {
    log:
      process.env.NODE_ENV === "development"
        ? [
            { emit: "event", level: "query" },
            { emit: "stdout", level: "error" },
            { emit: "stdout", level: "warn" },
          ]
        : [{ emit: "stdout", level: "error" }],
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

      // @ts-expect-error - query event type narrows to never with conditional log config
      prismaInstance.$on("query", (e: { duration?: number; query?: string }) => {
        if (e.duration && e.query) {
          const duration = e.duration;
          const query = e.query;

          trackDatabaseQuery(query.substring(0, 100), duration);

          if (process.env.NODE_ENV === "development" && duration > 100) {
            const queryType = query.trim().substring(0, 6).toUpperCase();
            const modelMatch = query.match(/FROM\s+"?(\w+)"?/i) || query.match(/INTO\s+"?(\w+)"?/i) || query.match(/UPDATE\s+"?(\w+)"?/i);
            const model = modelMatch ? modelMatch[1] : "unknown";

            console.log(
              `[Prisma] Slow query: ${queryType} on ${model} took ${duration}ms`
            );
          }
        }
      });
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        console.warn("[Prisma] Failed to set up query tracking:", error);
      }
    }
  }
} catch (error) {
  console.error("Failed to create Prisma Client:", error);
  throw new Error(
    "Prisma Client initialization failed. Please run 'npm run db:generate' to regenerate the Prisma client."
  );
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaInstance;
}

export const prisma = prismaInstance;
