"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { createTeam } from "@/app/actions/teams";
import { PageHero, primaryButtonStyle, secondaryButtonStyle } from "../blocks";
import { Required } from "../controls";
import { Row } from "../settings/parts";
import { TeamSection } from "./parts";

export function NewTeamView() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
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
        toast.error(err instanceof Error ? err.message : "Failed to create team");
      }
    });
  }

  return (
    <>
      <PageHero
        label="New team"
        back={{ href: "/settings/team", label: "Teams" }}
        headline="Open a new"
        emphasis="team."
        clause="it only needs a name."
        deck="You are its owner from the start. Invite people from the team's page as soon as it exists."
      />
      <form className="dl-grow" aria-label="New team" onSubmit={handleSubmit}>
        <TeamSection
          id="new-team-details"
          title="Team details"
          sub="The name shows wherever the team does."
        >
          <Row
            label={
              <>
                Team name
                <Required />
              </>
            }
            htmlFor="new-team-name"
            sub="For example a region, a segment or a product line."
          >
            <input
              id="new-team-name"
              className="dl-st-field dl-st-grow"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sales · North America"
              autoComplete="off"
              autoFocus
              required
              disabled={isPending}
            />
          </Row>
          <div className="dl-form-foot" style={{ justifyContent: "flex-start" }}>
            <button
              type="submit"
              className="dl-btn-primary"
              style={primaryButtonStyle}
              disabled={isPending || !name.trim()}
            >
              {isPending ? "Creating" : "Create team"}
            </button>
            <Link href="/settings/team" className="dl-btn-secondary" style={secondaryButtonStyle}>
              Cancel
            </Link>
          </div>
        </TeamSection>
      </form>
    </>
  );
}
