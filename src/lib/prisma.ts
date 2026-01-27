import { PrismaClient } from "@prisma/client";

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set!");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient;

try {
  prismaInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
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
