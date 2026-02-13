import { prisma } from "./prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { UnauthorizedError } from "./errors";
import { logError, logWarn } from "./logger";
import { isConnectionPoolExhausted, isDatabaseUnavailable, withDbRetry } from "./db-connection-helper";

const userCache = new Map<string, { timestamp: number }>();
const CACHE_TTL = 60000;

function isCached(userId: string): boolean {
  const cached = userCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return true;
  }
  return false;
}

function setCached(userId: string): void {
  userCache.set(userId, { timestamp: Date.now() });
  if (userCache.size > 1000) {
    const now = Date.now();
    for (const [key, value] of userCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        userCache.delete(key);
      }
    }
  }
}

export async function getAuthenticatedUserId(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new UnauthorizedError();
  }

  if (isCached(userId)) {
    return userId;
  }

  try {
    const clerkUser = await currentUser();

    if (clerkUser) {
      const existingUser = await withDbRetry(
        () =>
          prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
          }),
        2,
        100
      );

      if (!existingUser) {
        await withDbRetry(
          () =>
            prisma.user.upsert({
              where: { id: userId },
              update: {},
              create: {
                id: userId,
                name: clerkUser.firstName || clerkUser.username || "User",
                surname: clerkUser.lastName || "",
                email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
                password: "",
              },
            }),
          2,
          100
        );
      }

      setCached(userId);
    }
  } catch (error) {
    if (isConnectionPoolExhausted(error)) {
      logWarn("Database connection pool exhausted, skipping user verification", {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      setCached(userId);
    } else if (isDatabaseUnavailable(error)) {
      logWarn("Database unavailable (e.g. tenant not found), skipping user verification", {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      setCached(userId);
    } else {
      logError("Error ensuring user exists", error, { userId });
    }
  }

  return userId;
}

export async function getAuthenticatedUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  try {
    const clerkUser = await currentUser();

    if (clerkUser) {
      let user = await withDbRetry(
        () =>
          prisma.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              name: true,
              surname: true,
              email: true,
              createdAt: true,
            },
          }),
        2,
        100
      );

      if (!user) {
        user = await withDbRetry(
          () =>
            prisma.user.upsert({
              where: { id: userId },
              update: {},
              create: {
                id: userId,
                name: clerkUser.firstName || clerkUser.username || "User",
                surname: clerkUser.lastName || "",
                email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
                password: "",
              },
              select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                createdAt: true,
              },
            }),
          2,
          100
        );
      }

      return user;
    }
  } catch (error) {
    if (isConnectionPoolExhausted(error) || isDatabaseUnavailable(error)) {
      logWarn("Database unavailable in getAuthenticatedUser", {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
    } else {
      logError("Error in getAuthenticatedUser", error, { userId });
    }
    return null;
  }

  return null;
}
