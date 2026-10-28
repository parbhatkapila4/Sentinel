import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { daylightFontClass } from "../fonts";
import { HeroLink, PageHero, Pill, metaTextStyle } from "../blocks";
import { Row, SettingsSection } from "../settings/parts";
import { SignOutAction } from "./SignOutAction";

export type WorkspaceInviteState =
  | { kind: "invalid" }
  | { kind: "expired" }
  | { kind: "accepted" }
  | { kind: "failed"; token: string }
  | {
      kind: "mismatch";
      token: string;
      inviteEmail: string;
      userEmail: string;
    }
  | {
      kind: "open";
      token: string;
      inviterName: string;
      inviteEmail: string;
      roleLabel: string;
      expiresLabel: string;
    };

export function invitePath(token: string): string {
  return `/invite/${encodeURIComponent(token)}`;
}

export function inviteSignInHref(token: string): string {
  return `/sign-in?redirect=${encodeURIComponent(invitePath(token))}`;
}

export function withArticle(noun: string): string {
  return /^[aeiou]/i.test(noun) ? `an ${noun}` : `a ${noun}`;
}

export function InviteFrame({ children }: { children: ReactNode }) {
  return (
    <div className={`sentinel-daylight ${daylightFontClass}`}>
      <div className="flex min-h-screen flex-col">
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            minHeight: 61,
            padding: "0 var(--dl-gutter)",
            borderBottom: "1px solid var(--dl-divider)",
          }}
        >
          <Link
            href="/"
            aria-label="Sentinel home"
            style={{
              fontFamily: "var(--dl-font-serif)",
              fontStyle: "italic",
              fontSize: 27,
              letterSpacing: "-0.01em",
              color: "var(--dl-ink)",
            }}
          >
            Sentinel<span style={{ color: "var(--dl-signal)" }}>.</span>
          </Link>
          <span style={{ marginLeft: "auto", fontSize: 14, color: "var(--dl-muted)" }}>
            Workspace invite
          </span>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="dl-main w-full flex-1"
          style={{ outline: "none" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

const kickerStyle = (tone: "alert" | "good"): CSSProperties => ({
  fontFamily: "var(--dl-font-mono)",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: tone === "good" ? "var(--dl-green-text)" : "var(--dl-signal-d)",
});

function InviteNotice({
  kicker,
  tone = "alert",
  title,
  emphasis,
  body,
  actions,
}: {
  kicker: string;
  tone?: "alert" | "good";
  title: string;
  emphasis: string;
  body: ReactNode;
  actions: ReactNode;
}) {
  return (
    <section className="dl-empty dl-grow" aria-label={kicker}>
      <div style={kickerStyle(tone)}>{kicker}</div>
      <h2 style={{ marginTop: 14 }}>
        {title} <em>{emphasis}</em>
      </h2>
      <p style={{ overflowWrap: "anywhere" }}>{body}</p>
      <div className="dl-hero-actions">{actions}</div>
    </section>
  );
}

const dashboardLink = (tone: "primary" | "secondary") => (
  <HeroLink href="/dashboard" tone={tone}>
    Go to dashboard
  </HeroLink>
);

const valueStyle: CSSProperties = { ...metaTextStyle, overflowWrap: "anywhere" };

export function WorkspaceInvite({ state }: { state: WorkspaceInviteState }) {
  switch (state.kind) {
    case "invalid":
      return (
        <InviteNotice
          kicker="Invite not found"
          title="This link does not"
          emphasis="work."
          body="The invitation is invalid or has been removed. Ask the person who invited you to send a new one."
          actions={dashboardLink("primary")}
        />
      );
    case "expired":
      return (
        <InviteNotice
          kicker="Invite expired"
          title="This invite has"
          emphasis="expired."
          body="Invitations stop working after their expiry date. Ask the person who invited you to send a new one."
          actions={dashboardLink("primary")}
        />
      );
    case "accepted":
      return (
        <InviteNotice
          kicker="Already accepted"
          tone="good"
          title="This invite is already"
          emphasis="accepted."
          body="It has been used, so there is nothing left to do here."
          actions={dashboardLink("primary")}
        />
      );
    case "failed":
      return (
        <InviteNotice
          kicker="Not accepted"
          title="We could not accept the"
          emphasis="invite."
          body="Something went wrong while accepting it. Your invite is still open, so try again in a moment."
          actions={
            <HeroLink href={invitePath(state.token)} tone="primary">
              Try again
            </HeroLink>
          }
        />
      );
    case "mismatch":
      return (
        <InviteNotice
          kicker="Different account"
          title="This invite is for another"
          emphasis="address."
          body={
            <>
              It was sent to <b style={{ color: "var(--dl-ink)" }}>{state.inviteEmail}</b>,
              but you are signed in as{" "}
              <b style={{ color: "var(--dl-ink)" }}>{state.userEmail}</b>. Sign out and sign
              in with {state.inviteEmail}, or ask for an invite to this address.
            </>
          }
          actions={
            <>
              <SignOutAction returnTo={invitePath(state.token)} />
              {dashboardLink("secondary")}
            </>
          }
        />
      );
    case "open":
      return (
        <>
          <PageHero
            label="Invite"
            chip={{ label: "Workspace invite", tone: "good" }}
            headline="You're invited to"
            emphasis="Sentinel."
            clause={`join as ${withArticle(state.roleLabel.toLowerCase())}.`}
            deck={`${state.inviterName} invited you. Sign in with ${state.inviteEmail} and the invite is accepted for you.`}
            actions={
              <HeroLink href={inviteSignInHref(state.token)} tone="primary">
                Sign in to accept
              </HeroLink>
            }
          />
          <div className="dl-grow">
            <SettingsSection
              id="invite-details"
              title="Invite details"
              sub="Check these before you accept."
            >
              <Row label="Invited by" inline>
                <span style={{ ...valueStyle, fontWeight: 600, color: "var(--dl-ink)" }}>
                  {state.inviterName}
                </span>
              </Row>
              <Row label="Sent to" sub="It only works for this address." inline>
                <span style={valueStyle}>{state.inviteEmail}</span>
              </Row>
              <Row label="Your role" sub="Set by whoever invited you." inline>
                <Pill>{state.roleLabel}</Pill>
              </Row>
              <Row label="Expires" inline>
                <span style={valueStyle}>{state.expiresLabel}</span>
              </Row>
            </SettingsSection>
          </div>
        </>
      );
  }
}
