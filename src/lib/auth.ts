import { prisma } from "./prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { UnauthorizedError } from "./errors";

export async function getAuthenticatedUserId(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new UnauthorizedError();
  }

  try {
    const clerkUser = await currentUser();

    if (clerkUser) {

      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          name: clerkUser.firstName || clerkUser.username || "User",
          surname: clerkUser.lastName || "",
          email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
          password: "",
        },
      });
    }
  } catch (error) {
    console.error("Error ensuring user exists:", error);
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
      const user = await prisma.user.upsert({
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
      });

      return user;
    }
  } catch (error) {
    console.error("Error in getAuthenticatedUser:", error);
    return null;
  }

  return null;
}
