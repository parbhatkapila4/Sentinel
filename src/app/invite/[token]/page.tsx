import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { acceptUserInvite } from "@/app/actions/user";
import { redirect } from "next/navigation";
import Link from "next/link";

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

  if (!invite) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0f] p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Invalid Invitation</h1>
            <p className="text-white/60">This invitation link is invalid or has been removed.</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 rounded-xl text-sm font-medium text-white bg-[#8b1a1a] hover:bg-[#6b0f0f] transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (new Date(invite.expiresAt) < new Date()) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0f] p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Invitation Expired</h1>
            <p className="text-white/60">This invitation has expired. Please ask for a new invitation.</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 rounded-xl text-sm font-medium text-white bg-[#8b1a1a] hover:bg-[#6b0f0f] transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (invite.accepted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0f] p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Already Accepted</h1>
            <p className="text-white/60">This invitation has already been accepted.</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 rounded-xl text-sm font-medium text-white bg-[#8b1a1a] hover:bg-[#6b0f0f] transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const inviterName = inviter
    ? `${inviter.name} ${inviter.surname}`.trim() || inviter.email
    : "Someone";
  const roleLabel = invite.role === "admin" ? "Administrator" : invite.role === "manager" ? "Manager" : invite.role === "viewer" ? "Viewer" : "Member";

  if (clerkUser && userEmail && userEmail.toLowerCase() === invite.email.toLowerCase()) {
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

      await acceptUserInvite(token, clerkUser.id);
      redirect("/dashboard");
    } catch (error) {
      console.error("Error accepting invite:", error);
    }
  }

  if (clerkUser && userEmail && userEmail.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0f] p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Email Mismatch</h1>
            <p className="text-white/60 mb-4">
              This invitation was sent to <strong className="text-white">{invite.email}</strong>, but you&apos;re signed in as <strong className="text-white">{userEmail}</strong>.
            </p>
            <p className="text-white/40 text-sm mb-6">
              Please sign out and sign in with the correct email address, or ask for a new invitation.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl text-sm font-medium text-white/60 bg-white/5 hover:bg-white/10 transition-colors"
            >
              Go to Dashboard
            </Link>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl text-sm font-medium text-white bg-[#8b1a1a] hover:bg-[#6b0f0f] transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const signUpUrl = `/sign-up?email=${encodeURIComponent(invite.email)}&token=${encodeURIComponent(token)}`;
  const signInUrl = `/sign-in?email=${encodeURIComponent(invite.email)}&token=${encodeURIComponent(token)}`;
  const expirationDate = new Date(invite.expiresAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0f] p-4">
      <div className="max-w-md w-full">
        <div
          className="rounded-2xl p-8"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#8b1a1a]/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">You&apos;re Invited!</h1>
            <p className="text-white/60">
              <strong className="text-white">{inviterName}</strong> has invited you to join <strong className="text-white">Sentinel</strong>
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="p-4 rounded-xl bg-white/2 border border-white/5">
              <p className="text-xs text-white/40 mb-1">Email</p>
              <p className="text-sm font-medium text-white">{invite.email}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/2 border border-white/5">
              <p className="text-xs text-white/40 mb-1">Role</p>
              <p className="text-sm font-medium text-white">{roleLabel}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/2 border border-white/5">
              <p className="text-xs text-white/40 mb-1">Expires</p>
              <p className="text-sm font-medium text-white">{expirationDate}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href={signUpUrl}
              className="block w-full px-6 py-4 rounded-xl text-sm font-semibold text-white bg-[#8b1a1a] hover:bg-[#6b0f0f] transition-colors text-center"
            >
              Create Account & Accept
            </Link>
            <Link
              href={signInUrl}
              className="block w-full px-6 py-4 rounded-xl text-sm font-medium text-white/60 bg-white/5 hover:bg-white/10 transition-colors text-center"
            >
              Sign In & Accept
            </Link>
          </div>

          <p className="text-xs text-white/30 text-center mt-6">
            By accepting, you&apos;ll be able to track deals, collaborate with your team, and get AI-powered insights.
          </p>
        </div>
      </div>
    </div>
  );
}
