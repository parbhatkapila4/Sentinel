import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { format } from "date-fns";

import { getInviteByToken } from "@/app/actions/teams";
import { UnauthorizedError } from "@/lib/errors";

import { DaylightShell } from "@/components/sentinel/daylight/DaylightShell";
import {
  TeamInviteView,
  type InviteDetails,
  type InviteProblem,
} from "@/components/sentinel/daylight/teams/TeamInviteView";
import { buildShellContextForPage } from "@/components/sentinel/shell/buildContextForPage";

export const dynamic = "force-dynamic";

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  noStore();
  const { token } = await params;

  let invite: InviteDetails | null = null;
  let problem: InviteProblem | null = null;
  let signedOut = false;
  try {
    const found = await getInviteByToken(token);
    if (found) {
      invite = {
        teamName: found.teamName,
        role: found.role,
        email: found.email,
        expires: format(found.expiresAt, "EEEE, MMM d"),
      };
    } else {
      problem = "unavailable";
    }
  } catch (err) {
    if (err instanceof UnauthorizedError) signedOut = true;
    else problem = "load-failed";
  }

  if (signedOut) {
    redirect(
      "/sign-in?redirect=" + encodeURIComponent(`/settings/team/invite/${token}`)
    );
  }

  const shellContext = await buildShellContextForPage();

  return (
    <DaylightShell
      title="Team invite"
      dateLabel={format(new Date(), "EEEE, MMMM d")}
      syncTime={shellContext.syncTime}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      onboarding={shellContext.onboarding}
    >
      <TeamInviteView token={token} invite={invite} problem={problem} />
    </DaylightShell>
  );
}
