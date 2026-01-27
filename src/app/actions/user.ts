"use server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendEmail, teamInviteEmailHtml } from "@/lib/email";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export type UserProfile = {
  id: string;
  name: string;
  surname: string;
  email: string;
  company: string | null;
  role: string | null;
  imageUrl: string | null;
};

export async function updateUserProfile(data: {
  name?: string;
  surname?: string;
  email?: string;
  company?: string;
  role?: string;
  imageUrl?: string;
}) {
  const userId = await getAuthenticatedUserId();

  const updateData: {
    name?: string;
    surname?: string;
    company?: string | null;
    role?: string | null;
    imageUrl?: string | null;
  } = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.surname !== undefined) updateData.surname = data.surname;

  if (data.company !== undefined) updateData.company = data.company || null;
  if (data.role !== undefined) updateData.role = data.role || null;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || null;

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  revalidatePath("/settings");
  return { success: true };
}

type UserWithProfile = {
  id: string;
  name: string;
  surname: string;
  email: string;
  company?: string | null;
  role?: string | null;
  imageUrl?: string | null;
};

export async function getUserProfile(): Promise<UserProfile | null> {
  const userId = await getAuthenticatedUserId();

  const user = (await prisma.user.findUnique({
    where: { id: userId },
  })) as UserWithProfile | null;

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    company: user.company ?? null,
    role: user.role ?? null,
    imageUrl: user.imageUrl ?? null,
  };
}

export async function inviteUserByEmail(
  email: string,
  role: string = "member"
): Promise<{ success: true; inviteId: string }> {
  try {
    const userId = await getAuthenticatedUserId();

    const inviter = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, surname: true, email: true },
    });

    if (!inviter) {
      throw new Error("User not found");
    }

    const inviterName = `${inviter.name} ${inviter.surname}`.trim() || inviter.email;
    const inviterEmail = inviter.email;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please enter a valid email address");
    }

    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error("A user with this email already exists");
    }

    const normalizedEmail = email.toLowerCase();
    const now = new Date();

    const pendingInvites = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "UserInvite"
      WHERE email = ${normalizedEmail}
        AND accepted = false
        AND "expiresAt" > ${now}
      LIMIT 1
    `;

    if (pendingInvites && pendingInvites.length > 0) {
      throw new Error("An invitation has already been sent to this email");
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;

    const inviteResult = await prisma.$queryRaw<Array<{ id: string; token: string }>>`
      INSERT INTO "UserInvite" (id, email, role, token, "invitedBy", "expiresAt", accepted, "createdAt")
      VALUES (
        gen_random_uuid()::text,
        ${normalizedEmail},
        ${role},
        ${token},
        ${userId},
        ${expiresAt}::timestamp,
        false,
        NOW()
      )
      RETURNING id, token
    `;

    if (!inviteResult || inviteResult.length === 0) {
      throw new Error("Failed to create invitation");
    }

    const invite = inviteResult[0];

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const acceptUrl = `${appUrl}/invite/${invite.token}`;

    try {
      const html = teamInviteEmailHtml(inviterName, inviterEmail, acceptUrl, role);
      await sendEmail(email, "You're Invited to Join Sentinel", html);
    } catch (error: unknown) {
      console.error("Error sending email:", error);
      try {
        await prisma.$executeRaw`
          DELETE FROM "UserInvite" WHERE id = ${invite.id}
        `;
      } catch (deleteError) {
        console.error("Error deleting invite after email failure:", deleteError);
      }
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("RESEND_API_KEY") || errorMessage.includes("RESEND_FROM_EMAIL")) {
        throw new Error("Email service is not configured. Please contact your administrator.");
      }
      throw new Error(`Failed to send invitation email: ${errorMessage}`);
    }

    revalidatePath("/settings");
    return { success: true, inviteId: invite.id };
  } catch (error: unknown) {
    console.error("Error in inviteUserByEmail:", error);
    if (error instanceof Error && (error.message.startsWith("Please") || error.message.startsWith("A user") || error.message.startsWith("An invitation") || error.message.startsWith("Failed"))) {
      throw error;
    }
    throw new Error("An unexpected error occurred. Please try again.");
  }
}

export async function acceptUserInvite(
  token: string,
  userId: string
): Promise<{ success: true }> {
  const invites = await prisma.$queryRaw<Array<{
    id: string;
    email: string;
    accepted: boolean;
    expiresAt: Date;
  }>>`
    SELECT id, email, accepted, "expiresAt"
    FROM "UserInvite"
    WHERE token = ${token}
    LIMIT 1
  `;

  if (!invites || invites.length === 0) {
    throw new Error("Invalid invitation");
  }

  const invite = invites[0];

  if (new Date(invite.expiresAt) < new Date()) {
    throw new Error("Invitation has expired");
  }

  if (invite.accepted) {
    throw new Error("Invitation has already been accepted");
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
    throw new Error("Email mismatch");
  }

  await prisma.$executeRaw`
    UPDATE "UserInvite"
    SET accepted = true
    WHERE id = ${invite.id}
  `;

  return { success: true };
}
