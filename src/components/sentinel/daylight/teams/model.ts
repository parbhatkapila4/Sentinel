import { format, isSameDay, isSameYear, subDays } from "date-fns";
import { TEAM_ROLES } from "@/lib/config";


export const ROLE_LABELS: Record<string, string> = {
  [TEAM_ROLES.OWNER]: "Owner",
  [TEAM_ROLES.ADMIN]: "Admin",
  [TEAM_ROLES.MEMBER]: "Member",
  [TEAM_ROLES.VIEWER]: "Viewer",
};

export const ASSIGNABLE_ROLES: string[] = [
  TEAM_ROLES.ADMIN,
  TEAM_ROLES.MEMBER,
  TEAM_ROLES.VIEWER,
];

const ROLE_RANK: Record<string, number> = {
  [TEAM_ROLES.OWNER]: 0,
  [TEAM_ROLES.ADMIN]: 1,
  [TEAM_ROLES.MEMBER]: 2,
  [TEAM_ROLES.VIEWER]: 3,
};

export function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role.charAt(0).toUpperCase() + role.slice(1);
}

function roleNoun(role: string): string {
  const label = roleLabel(role).toLowerCase();
  return /^[aeiou]/.test(label) ? `an ${label}` : `a ${label}`;
}

export function isOwner(role: string): boolean {
  return role === TEAM_ROLES.OWNER;
}

export function isOwnerOrAdmin(role: string): boolean {
  return role === TEAM_ROLES.OWNER || role === TEAM_ROLES.ADMIN;
}

export function teamCountChip(count: number): string {
  if (count === 0) return "No teams yet";
  return `${count} ${count === 1 ? "team" : "teams"}`;
}

export function memberCount(count: number): string {
  return `${count} ${count === 1 ? "member" : "members"}`;
}

export function seatChip(role: string): string {
  return isOwner(role) ? "You own this team" : `You are ${roleNoun(role)}`;
}

export function shortDate(date: Date, now: Date): string {
  return format(date, isSameYear(date, now) ? "MMM d" : "MMM d, yyyy");
}

export function fullDate(date: Date): string {
  return format(date, "MMM d, yyyy");
}

export function heroClause(count: number, createdAt: Date, now: Date): string {
  return `${memberCount(count)} since ${shortDate(createdAt, now)}.`;
}

export function heroDeck(role: string): string {
  if (isOwner(role)) {
    return "Change roles, invite people and decide who stays. Only the owner can hand the team to someone else or delete it.";
  }
  if (role === TEAM_ROLES.ADMIN) {
    return "Invite people and decide who stays. Only the owner can change roles, hand the team to someone else or delete it.";
  }
  return "You can see who is on this team. Ask an admin or the owner to invite people or change roles.";
}

export function membersSub(role: string, count: number): string {
  const people = count === 1 ? "1 person." : `${count} people.`;
  if (isOwner(role)) {
    return `${people} Admins can remove members; only you can change roles.`;
  }
  if (role === TEAM_ROLES.ADMIN) {
    return `${people} You can remove members; only the owner can change roles.`;
  }
  return people;
}

export function inviteLine(createdAt: Date, expiresAt: Date, now: Date): string {
  const invited = isSameDay(createdAt, now)
    ? "Invited today"
    : isSameDay(createdAt, subDays(now, 1))
      ? "Invited yesterday"
      : `Invited ${shortDate(createdAt, now)}`;
  return `${invited} · expires ${shortDate(expiresAt, now)}`;
}

export interface PersonLike {
  name: string | null;
  surname: string | null;
  email: string;
}

export function personName(user: PersonLike): string {
  return [user.name, user.surname].filter(Boolean).join(" ").trim() || user.email;
}

export function personInitials(user: PersonLike): string {
  const name = (user.name ?? "").trim();
  const surname = (user.surname ?? "").trim();
  if (name && surname) return `${name[0]}${surname[0]}`.toUpperCase();
  if (name) {
    const words = name.split(/\s+/);
    return (words.length > 1 ? `${words[0][0]}${words[1][0]}` : name.slice(0, 2)).toUpperCase();
  }
  return emailInitial(user.email);
}

export function emailInitial(email: string): string {
  return (email.trim()[0] ?? "?").toUpperCase();
}

export function sortByRole<T extends { role: string }>(members: T[]): T[] {
  return [...members].sort(
    (a, b) => (ROLE_RANK[a.role] ?? 9) - (ROLE_RANK[b.role] ?? 9)
  );
}

export function invitePhrase(role: string): string {
  return roleNoun(role);
}
