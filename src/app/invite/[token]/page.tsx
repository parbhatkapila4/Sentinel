import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { acceptUserInvite } from "@/app/actions/user";
import { redirect } from "next/navigation";

import {
  InviteFrame,
  WorkspaceInvite,
  type WorkspaceInviteState,
} from "@/components/sentinel/daylight/invite/WorkspaceInvite";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const clerkUser = await currentUser();
  const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress;

  const invites = await prisma.$queryRaw<Array<{
    id: string;
    email: string;
    role: string;
    accepted: boolean;
    expiresAt: Date;
    invitedBy: string;
  }>>`
    SELECT id, email, role, accepted, "expiresAt", "invitedBy"
    FROM "UserInvite"
    WHERE token = ${token}
    LIMIT 1
  `;

  const invite = invites && invites.length > 0 ? invites[0] : null;


  let inviter: { name: string; surname: string; email: string } | null = null;
  if (invite) {
    const inviters = await prisma.$queryRaw<Array<{
      name: string;
      surname: string;
      email: string;
    }>>`
      SELECT name, surname, email
      FROM "User"
      WHERE id = ${invite.invitedBy}
      LIMIT 1
    `;
    inviter = inviters && inviters.length > 0 ? inviters[0] : null;
  }

  const state = await resolveInvite(token, invite, inviter, clerkUser, userEmail);

  return (
    <InviteFrame>
      <WorkspaceInvite state={state} />
    </InviteFrame>
  );
}

type InviteRow = {
  id: string;
  email: string;
  role: string;
  accepted: boolean;
  expiresAt: Date;
  invitedBy: string;
};

type ClerkUser = Awaited<ReturnType<typeof currentUser>>;

async function resolveInvite(
  token: string,
  invite: InviteRow | null,
  inviter: { name: string; surname: string; email: string } | null,
  clerkUser: ClerkUser,
  userEmail: string | undefined
): Promise<WorkspaceInviteState> {
  if (!invite) return { kind: "invalid" };
  if (new Date(invite.expiresAt) < new Date()) return { kind: "expired" };
  if (invite.accepted) return { kind: "accepted" };

  if (clerkUser && userEmail && userEmail.toLowerCase() === invite.email.toLowerCase()) {
    // redirect() throws, so it has to run outside the try block; inside it the
    // catch swallowed the redirect and an accepted invite stayed on this page.
    let accepted = false;
    try {
      const existingUsers = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM "User" WHERE id = ${clerkUser.id} LIMIT 1
      `;

      if (!existingUsers || existingUsers.length === 0) {
        await prisma.$executeRaw`
          INSERT INTO "User" (id, name, surname, email, password, "createdAt")
          VALUES (
            ${clerkUser.id},
            ${clerkUser.firstName || clerkUser.username || "User"},
            ${clerkUser.lastName || ""},
            ${userEmail},
            '',
            NOW()
          )
        `;
      }

      await acceptUserInvite(token);
      accepted = true;
    } catch (error) {
      console.error("Error accepting invite:", error);
    }
    if (accepted) redirect("/dashboard");
    return { kind: "failed", token };
  }

  if (clerkUser && userEmail) {
    return {
      kind: "mismatch",
      token,
      inviteEmail: invite.email,
      userEmail,
    };
  }

  const inviterName = inviter
    ? `${inviter.name} ${inviter.surname}`.trim() || inviter.email
    : "Someone";

  const roleLabel =
    invite.role === "admin"
      ? "Administrator"
      : invite.role === "manager"
        ? "Manager"
        : invite.role === "viewer"
          ? "Viewer"
          : "Member";

  return {
    kind: "open",
    token,
    inviterName,
    inviteEmail: invite.email,
    roleLabel,
    expiresLabel: new Date(invite.expiresAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  };
}
