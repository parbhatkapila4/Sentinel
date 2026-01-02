import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getAuthenticatedUserId(): Promise<string> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) {
    throw new Error("User email not found");
  }

  await prisma.user.upsert({
    where: { id: clerkUser.id },
    update: {},
    create: {
      id: clerkUser.id,
      email,
    },
  });

  return clerkUser.id;
}
