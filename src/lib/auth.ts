import { prisma } from "./prisma";
import { getSession } from "./session";

export async function getAuthenticatedUserId(): Promise<string> {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return session.userId;
}

export async function getAuthenticatedUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
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
