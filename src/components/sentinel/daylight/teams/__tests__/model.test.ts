import { describe, expect, it } from "vitest";
import {
  heroClause,
  inviteLine,
  invitePhrase,
  membersSub,
  personInitials,
  personName,
  seatChip,
  sortByRole,
  teamCountChip,
} from "../model";

const NOW = new Date(2026, 9, 27, 14, 5);

describe("team labels", () => {
  it("names the viewer's seat", () => {
    expect(seatChip("owner")).toBe("You own this team");
    expect(seatChip("admin")).toBe("You are an admin");
    expect(seatChip("member")).toBe("You are a member");
    expect(seatChip("viewer")).toBe("You are a viewer");
  });

  it("counts teams for the chip", () => {
    expect(teamCountChip(0)).toBe("No teams yet");
    expect(teamCountChip(1)).toBe("1 team");
    expect(teamCountChip(2)).toBe("2 teams");
  });

  it("says who can do what on the members list", () => {
    expect(membersSub("owner", 4)).toBe(
      "4 people. Admins can remove members; only you can change roles."
    );
    expect(membersSub("admin", 1)).toBe(
      "1 person. You can remove members; only the owner can change roles."
    );
    expect(membersSub("viewer", 4)).toBe("4 people.");
  });

  it("dates the team without the year when it is this year", () => {
    expect(heroClause(4, new Date(2026, 7, 12), NOW)).toBe("4 members since Aug 12.");
    expect(heroClause(1, new Date(2025, 11, 2), NOW)).toBe("1 member since Dec 2, 2025.");
  });

  it("describes a pending invite", () => {
    expect(inviteLine(new Date(2026, 9, 27, 9), new Date(2026, 10, 3), NOW)).toBe(
      "Invited today · expires Nov 3"
    );
    expect(inviteLine(new Date(2026, 9, 26, 9), new Date(2026, 10, 2), NOW)).toBe(
      "Invited yesterday · expires Nov 2"
    );
    expect(inviteLine(new Date(2026, 9, 24), new Date(2026, 9, 31), NOW)).toBe(
      "Invited Oct 24 · expires Oct 31"
    );
  });

  it("uses an article that fits the role", () => {
    expect(invitePhrase("admin")).toBe("an admin");
    expect(invitePhrase("member")).toBe("a member");
    expect(invitePhrase("viewer")).toBe("a viewer");
  });
});

describe("people", () => {
  it("falls back to the email when there is no name", () => {
    expect(personName({ name: "Maya", surname: "Chen", email: "m@x.io" })).toBe("Maya Chen");
    expect(personName({ name: null, surname: null, email: "m@x.io" })).toBe("m@x.io");
    expect(personInitials({ name: "Maya", surname: "Chen", email: "m@x.io" })).toBe("MC");
    expect(personInitials({ name: "Maya Rose", surname: null, email: "m@x.io" })).toBe("MR");
    expect(personInitials({ name: "", surname: "", email: "jordan@x.io" })).toBe("J");
  });

  it("puts the owner first, then admins, members and viewers", () => {
    const sorted = sortByRole([
      { id: "v", role: "viewer" },
      { id: "m", role: "member" },
      { id: "o", role: "owner" },
      { id: "a", role: "admin" },
    ]);
    expect(sorted.map((m) => m.id)).toEqual(["o", "a", "m", "v"]);
  });
});
