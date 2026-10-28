import Link from "next/link";
import type { CSSProperties } from "react";
import {
  CellHead,
  HeroLink,
  PageHero,
  Pill,
  PlusIcon,
  metaTextStyle,
  secondaryButtonStyle,
  smallButtonStyle,
  tableRowStyle,
} from "../blocks";
import { Monogram, tableHeadStyle } from "../ui";
import { fullDate, memberCount, roleLabel, teamCountChip } from "./model";

export interface TeamListRow {
  id: string;
  name: string;
  memberCount: number;
  myRole: string;
  createdAt: Date;
}

const TEAM_COLUMNS = {
  "--cols": "minmax(0, 1fr) 140px 140px 150px 92px",
  "--cols-n": "minmax(0, 1fr) 70px",
} as CSSProperties;

function TeamRow({ team, last }: { team: TeamListRow; last: boolean }) {
  const href = `/settings/team/${team.id}`;
  return (
    <div
      role="row"
      className="dl-row dl-table-grid"
      style={{ ...tableRowStyle, borderBottom: last ? 0 : tableRowStyle.borderBottom }}
    >
      <div role="cell" style={{ minWidth: 0 }}>
        <Link href={href} className="dl-person">
          <Monogram name={team.name} />
          <div>
            <b>{team.name}</b>
            <small className="dl-narrow-only">
              {roleLabel(team.myRole)} · {memberCount(team.memberCount)}
            </small>
          </div>
        </Link>
      </div>
      <span role="cell" className="dl-c-wide">
        <Pill>{roleLabel(team.myRole)}</Pill>
      </span>
      <span role="cell" className="dl-c-wide" style={metaTextStyle}>
        {memberCount(team.memberCount)}
      </span>
      <span role="cell" className="dl-c-wide" style={metaTextStyle}>
        {fullDate(team.createdAt)}
      </span>
      <span role="cell" style={{ justifySelf: "end" }}>
        <Link
          href={href}
          aria-label={`Open ${team.name}`}
          className="dl-btn-secondary"
          style={{ ...secondaryButtonStyle, ...smallButtonStyle }}
        >
          Open
        </Link>
      </span>
    </div>
  );
}

export function TeamsListView({ teams }: { teams: TeamListRow[] }) {
  return (
    <>
      <PageHero
        label="Teams"
        back={{ href: "/settings", label: "Settings" }}
        chip={{ label: teamCountChip(teams.length), tone: "neutral" }}
        headline="The"
        emphasis="roster."
        clause="every team you belong to."
        deck="Create a team, invite people by email and choose what each person can do on it."
        actions={
          <HeroLink href="/settings/team/new" tone="primary" icon={<PlusIcon />}>
            New team
          </HeroLink>
        }
      />
      {teams.length === 0 ? (
        <section className="dl-empty dl-grow" aria-label="Your teams">
          <h2>
            No teams <em>yet.</em>
          </h2>
          <p>
            A team is you plus the people you invite. Create one with New team,
            then send invites from its page.
          </p>
        </section>
      ) : (
        <section className="dl-grow" aria-label="Your teams">
          <CellHead title="Your teams" sub="Oldest membership first" />
          <div role="table" aria-label="Your teams" className="dl-table" style={TEAM_COLUMNS}>
            <div role="row" className="dl-table-grid" style={tableHeadStyle}>
              <span role="columnheader">Team</span>
              <span role="columnheader" className="dl-c-wide">
                Your role
              </span>
              <span role="columnheader" className="dl-c-wide">
                Members
              </span>
              <span role="columnheader" className="dl-c-wide">
                Created
              </span>
              <span role="columnheader" style={{ justifySelf: "end" }}>
                <span className="sr-only">Open</span>
              </span>
            </div>
            <div role="rowgroup">
              {teams.map((team, i) => (
                <TeamRow key={team.id} team={team} last={i === teams.length - 1} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
