"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { createTeam } from "@/app/actions/teams";
import {
  EditorialButton,
  EditorialInput,
  Field,
} from "@/components/sentinel/settings/primitives";

export function NewTeamClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter a team name");
      return;
    }
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("name", trimmed);
        const team = await createTeam(formData);
        toast.success("Team created");
        router.push(`/settings/team/${team.id}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to create team";
        toast.error(msg);
      }
    });
  }

  return (
    <>
      <section
        style={{
          padding: "48px 32px 40px",
          borderBottom: "1px solid var(--rule)",
          display: "grid",
          gridTemplateColumns: "minmax(140px, 160px) minmax(0, 1fr)",
          gap: 48,
        }}
      >
        <div
          style={{
            borderRight: "1px solid var(--rule)",
            paddingRight: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ fontFamily: "var(--font-mono-jb)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--cream-3)" }}>
            Section -
          </div>
          <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 60, lineHeight: 0.85, color: "var(--cream)", letterSpacing: "-0.04em" }}>
            § 05.n
          </div>
          <div style={{ fontFamily: "var(--font-mono-jb)", fontSize: 11, color: "var(--cream-2)", letterSpacing: "0.06em", lineHeight: 1.6, textTransform: "uppercase" }}>
            <strong style={{ color: "var(--cream)", fontWeight: 500 }}>NEW · TEAM</strong>
            <br />
            OPENING A DESK
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Link
            href="/settings/team"
            className="sentinel-link-signal"
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            ← Back to roster
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 54,
              fontWeight: 400,
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              color: "var(--cream)",
              margin: 0,
            }}
          >
            Open a new{" "}
            <em style={{ fontStyle: "italic", color: "var(--signal)", fontFamily: "var(--font-serif)" }}>
              desk.
            </em>
          </h1>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 17,
              lineHeight: 1.45,
              color: "var(--cream-2)",
              maxWidth: 560,
              margin: 0,
            }}
          >
            Give it a name. You can invite the rest once the room is set.
          </p>
        </div>
      </section>

      <section style={{ padding: "48px 32px 80px", maxWidth: 720, margin: "0 auto" }}>
        <form
          onSubmit={handleSubmit}
          style={{
            border: "1px solid var(--rule)",
            background: "var(--ink-02)",
            padding: "32px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.18em",
              color: "var(--cream-3)",
              textTransform: "uppercase",
              paddingBottom: 14,
              borderBottom: "1px solid var(--rule)",
            }}
          >
            § - TEAM DETAILS
          </div>

          <Field label="Team name" note="REQUIRED">
            <EditorialInput
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sales · North America"
              autoFocus
              disabled={isPending}
            />
          </Field>

          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 14,
              lineHeight: 1.5,
              color: "var(--cream-3)",
              margin: 0,
            }}
          >
            The name appears everywhere the team does. You can change it later.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              paddingTop: 20,
              borderTop: "1px solid var(--rule)",
              flexWrap: "wrap",
            }}
          >
            <EditorialButton
              type="submit"
              variant="primary"
              disabled={isPending || !name.trim()}
            >
              {isPending ? "Creating…" : "Create team"}
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
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </>
  );
}
