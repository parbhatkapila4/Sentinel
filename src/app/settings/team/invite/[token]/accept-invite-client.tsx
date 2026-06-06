"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { acceptInvite, getInviteByToken } from "@/app/actions/teams";
import { TEAM_ROLES } from "@/lib/config";
import { EditorialButton } from "@/components/sentinel/settings/primitives";

const ROLE_LABELS: Record<string, string> = {
  [TEAM_ROLES.OWNER]: "Owner",
  [TEAM_ROLES.ADMIN]: "Admin",
  [TEAM_ROLES.MEMBER]: "Member",
  [TEAM_ROLES.VIEWER]: "Viewer",
};

export function AcceptInviteClient() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const [invite, setInvite] = useState<
    Awaited<ReturnType<typeof getInviteByToken>>
  >(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid invite link");
      setLoading(false);
      return;
    }
    getInviteByToken(token)
      .then((data) => {
        setInvite(data);
        if (!data) setError("This invite has expired or is invalid.");
      })
      .catch(() => setError("Failed to load invite"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAccept() {
    if (!token) return;
    setAccepting(true);
    setError(null);
    try {
      const team = await acceptInvite(token);
      toast.success(`You joined ${team.name}`);
      router.push(`/settings/team/${team.id}`);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to accept invite";
      setError(msg);
      toast.error(msg);
    } finally {
      setAccepting(false);
    }
  }

  return (
    <section
      style={{
        minHeight: "calc(100vh - 240px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
      }}
    >
      <article
        style={{
          width: "100%",
          maxWidth: 520,
          border: "1px solid var(--rule)",
          background: "var(--ink-02)",
          padding: "48px 40px",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--cream-3)",
                marginBottom: 14,
              }}
            >
              § - READING THE LETTER
            </div>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 20,
                color: "var(--cream-2)",
                margin: 0,
              }}
            >
              One moment…
            </p>
          </div>
        ) : error || !invite ? (
          <>
            <div
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--wine)",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              § † - INVITE VOID
            </div>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 40,
                fontWeight: 400,
                color: "var(--cream)",
                margin: "0 0 14px",
                letterSpacing: "-0.02em",
                textAlign: "center",
                lineHeight: 1.05,
              }}
            >
              This letter has{" "}
              <em style={{ fontStyle: "italic", color: "var(--wine)" }}>
                expired.
              </em>
            </h2>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 15,
                color: "var(--cream-2)",
                margin: "0 0 28px",
                textAlign: "center",
              }}
            >
              {error ?? "This invite is no longer valid."}
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Link
                href="/settings/team"
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "10px 20px",
                  border: "1px solid var(--rule-strong)",
                  color: "var(--cream-2)",
                  textDecoration: "none",
                }}
              >
                Back to the roster
              </Link>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--signal)",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              § 05 - A LETTER FOR YOU
            </div>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 44,
                fontWeight: 400,
                color: "var(--cream)",
                margin: "0 0 14px",
                letterSpacing: "-0.03em",
                textAlign: "center",
                lineHeight: 1.0,
              }}
            >
              You are{" "}
              <em style={{ fontStyle: "italic", color: "var(--signal)" }}>
                invited.
              </em>
            </h2>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 17,
                color: "var(--cream-2)",
                margin: "0 0 8px",
                textAlign: "center",
                lineHeight: 1.45,
              }}
            >
              Join{" "}
              <strong
                style={{ fontStyle: "normal", color: "var(--cream)", fontWeight: 500 }}
              >
                {invite.teamName}
              </strong>{" "}
              as{" "}
              <strong
                style={{ fontStyle: "normal", color: "var(--cream)", fontWeight: 500 }}
              >
                {ROLE_LABELS[invite.role] ?? invite.role}
              </strong>
              .
            </p>
            <p
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--cream-3)",
                textAlign: "center",
                margin: "0 0 32px",
              }}
            >
              SENT TO {invite.email.toUpperCase()}
            </p>
            {error && (
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 14,
                  color: "var(--wine)",
                  textAlign: "center",
                  margin: "0 0 20px",
                }}
              >
                {error}
              </p>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 12,
                paddingTop: 20,
                borderTop: "1px solid var(--rule)",
                flexWrap: "wrap",
              }}
            >
              <EditorialButton
                type="button"
                onClick={handleAccept}
                disabled={accepting}
                variant="primary"
              >
                {accepting ? "Joining…" : "Accept invite"}
              </EditorialButton>
              <Link
                href="/settings/team"
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "9px 18px",
                  border: "1px solid var(--rule-strong)",
                  color: "var(--cream-2)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Decline
              </Link>
            </div>
          </>
        )}
      </article>
    </section>
  );
}
