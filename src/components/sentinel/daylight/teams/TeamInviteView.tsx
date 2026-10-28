"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { acceptInvite } from "@/app/actions/teams";
import {
  DataErrorBanner,
  HeroLink,
  PageHero,
  Pill,
  metaTextStyle,
  primaryButtonStyle,
} from "../blocks";
import { Row } from "../settings/parts";
import { invitePhrase, roleLabel } from "./model";
import { TeamSection, metaStrongStyle } from "./parts";

export interface InviteDetails {
  teamName: string;
  role: string;
  email: string;
  expires: string;
}

export type InviteProblem = "unavailable" | "load-failed";

export function TeamInviteView({
  token,
  invite,
  problem,
}: {
  token: string;
  invite: InviteDetails | null;
  problem: InviteProblem | null;
}) {
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setAccepting(true);
    setError(null);
    try {
      const team = await acceptInvite(token);
      toast.success(`You joined ${team.name}`);
      router.push(`/settings/team/${team.id}`);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error && err.message ? err.message : "Failed to accept invite";
      setError(msg);
      toast.error(msg);
    } finally {
      setAccepting(false);
    }
  }

  if (!invite) {
    const failed = problem === "load-failed";
    return (
      <PageHero
        label="Invite"
        back={{ href: "/settings/team", label: "Teams" }}
        chip={{ label: "Invite unavailable", tone: "alert" }}
        headline={failed ? "The invite did not" : "This invite has"}
        emphasis={failed ? "load." : "expired."}
        clause={failed ? "nothing on the team has changed." : "or the link is no longer valid."}
        deck={
          failed
            ? "Reload the page in a moment to try again."
            : "Invites work for 7 days, and only until someone accepts them. Ask whoever invited you to send a new one."
        }
        actions={
          <HeroLink href="/settings/team" tone="secondary">
            Go to your teams
          </HeroLink>
        }
      />
    );
  }

  const as = invitePhrase(invite.role);

  return (
    <>
      <PageHero
        label="Invite"
        chip={{ label: "Team invite", tone: "good" }}
        headline="You're invited to"
        emphasis={`${invite.teamName}.`}
        clause={`join as ${as}.`}
        deck={`Accepting adds you to ${invite.teamName} as ${as}. You can leave the team at any time from its page.`}
        actions={
          <>
            <button
              type="button"
              onClick={handleAccept}
              disabled={accepting}
              className="dl-btn-primary"
              style={primaryButtonStyle}
            >
              {accepting ? "Joining" : "Accept invite"}
            </button>
            <HeroLink href="/settings/team" tone="secondary">
              Not now
            </HeroLink>
          </>
        }
      />
      {error && <DataErrorBanner>{error}</DataErrorBanner>}
      <TeamSection
        id="invite-details"
        title="Invite details"
        sub="Check these before you accept."
        grow
      >
        <Row inline label="Team">
          <span style={metaStrongStyle}>{invite.teamName}</span>
        </Row>
        <Row inline label="Your role" sub="Set by whoever invited you.">
          <Pill>{roleLabel(invite.role)}</Pill>
        </Row>
        <Row inline label="Sent to" sub="It only works for this address.">
          <span style={metaTextStyle}>{invite.email}</span>
        </Row>
        <Row inline label="Expires">
          <span style={metaTextStyle}>{invite.expires}</span>
        </Row>
      </TeamSection>
    </>
  );
}
