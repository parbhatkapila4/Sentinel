import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock, resetPrismaMock } from "@/test/mocks/prisma";
import {
  mockGetAuthenticatedUserId,
  TEST_USER_ID,
  resetAuthMock,
} from "@/test/mocks/auth";

const mockGetAuthenticatedUser = vi.fn();

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth", () => ({
  getAuthenticatedUserId: () => mockGetAuthenticatedUserId(),
  getAuthenticatedUser: () => mockGetAuthenticatedUser(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockSendEmail = vi.fn();
vi.mock("@/lib/email", () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
  teamInviteEmailHtml: () => "<html>invite</html>",
}));

import {
  createTeam,
  getMyTeams,
  getTeamById,
  getTeamMembers,
  getInviteByToken,
  inviteTeamMember,
  removeTeamMember,
  updateMemberRole,
  transferTeamOwnership,
  leaveTeam,
  deleteTeam,
} from "@/app/actions/teams";
import { generateSlug, getUserTeamRole } from "@/lib/team-utils";
import { TEAM_ROLES } from "@/lib/config";
import { UnauthorizedError } from "@/lib/errors";

beforeEach(() => {
  resetPrismaMock();
  resetAuthMock();
  mockSendEmail.mockReset();
  mockSendEmail.mockResolvedValue(undefined);
  mockGetAuthenticatedUser.mockReset();
  mockGetAuthenticatedUser.mockResolvedValue({
    id: TEST_USER_ID,
    name: "Test",
    surname: "User",
    email: "test@example.com",
    createdAt: new Date(),
  });
});

describe("generateSlug", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    const slug = generateSlug("My Team Name");
    expect(slug).toMatch(/^my-team-name-[a-z0-9]+$/);
  });

  it("strips special characters", () => {
    const slug = generateSlug("Hello! @World?");
    expect(slug).toMatch(/^hello-world-[a-z0-9]+$/);
  });

  it("returns team-{suffix} for empty or blank name", () => {
    expect(generateSlug("")).toMatch(/^team-[a-z0-9]+$/);
    expect(generateSlug("   ")).toMatch(/^team-[a-z0-9]+$/);
  });
});

describe("getUserTeamRole", () => {
  it("returns role when user is member", async () => {
    prismaMock.teamMember.findUnique.mockResolvedValue({
      id: "tm-1",
      userId: TEST_USER_ID,
      teamId: "team-1",
      role: TEAM_ROLES.ADMIN,
      createdAt: new Date(),
    } as never);

    const role = await getUserTeamRole(TEST_USER_ID, "team-1");

    expect(role).toBe(TEAM_ROLES.ADMIN);
    expect(prismaMock.teamMember.findUnique).toHaveBeenCalledWith({
      where: { userId_teamId: { userId: TEST_USER_ID, teamId: "team-1" } },
      select: { role: true },
    });
  });

  it("returns null when user is not member", async () => {
    prismaMock.teamMember.findUnique.mockResolvedValue(null);

    const role = await getUserTeamRole(TEST_USER_ID, "team-1");

    expect(role).toBeNull();
  });
});

describe("createTeam", () => {
  it("creates team with slug and owner membership, revalidates paths", async () => {
    prismaMock.team.findUnique.mockResolvedValue(null);
    const created = {
      id: "team-new",
      name: "Acme Corp",
      slug: "acme-corp-abc123",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prismaMock.team.create.mockResolvedValue(created as never);

    const formData = new FormData();
    formData.set("name", "Acme Corp");

    const result = await createTeam(formData);

    expect(prismaMock.team.create).toHaveBeenCalledWith({
      data: {
        name: "Acme Corp",
        slug: expect.stringMatching(/^acme-corp-[a-z0-9]+$/),
        members: {
          create: { userId: TEST_USER_ID, role: TEAM_ROLES.OWNER },
        },
      },
    });
    expect(result).toMatchObject({
      id: "team-new",
      name: "Acme Corp",
      slug: "acme-corp-abc123",
    });
    const { revalidatePath } = await import("next/cache");
    expect(revalidatePath).toHaveBeenCalledWith("/teams");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("throws ValidationError when name is missing", async () => {
    const formData = new FormData();
    formData.set("name", "   ");

    await expect(createTeam(formData)).rejects.toThrow("Team name is required");
    expect(prismaMock.team.create).not.toHaveBeenCalled();
  });

  it("throws ValidationError when name is empty", async () => {
    const formData = new FormData();

    await expect(createTeam(formData)).rejects.toThrow("Team name is required");
    expect(prismaMock.team.create).not.toHaveBeenCalled();
  });
});

describe("getMyTeams", () => {
  it("returns teams where user is member with memberCount and myRole", async () => {
    const memberships = [
      {
        id: "tm-1",
        userId: TEST_USER_ID,
        teamId: "team-1",
        role: TEAM_ROLES.OWNER,
        createdAt: new Date(),
        team: {
          id: "team-1",
          name: "Team A",
          slug: "team-a-x",
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { members: 3 },
        },
      },
    ];
    prismaMock.teamMember.findMany.mockResolvedValue(memberships as never);

    const result = await getMyTeams();

    expect(prismaMock.teamMember.findMany).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID },
      orderBy: { createdAt: "asc" },
      include: {
        team: { include: { _count: { select: { members: true } } } },
      },
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "team-1",
      name: "Team A",
      slug: "team-a-x",
      memberCount: 3,
      myRole: TEAM_ROLES.OWNER,
    });
  });

  it("returns empty array when user has no teams", async () => {
    prismaMock.teamMember.findMany.mockResolvedValue([] as never);

    const result = await getMyTeams();

    expect(result).toEqual([]);
  });

  it("lists teams oldest membership first, as the teams page says", async () => {
    prismaMock.teamMember.findMany.mockResolvedValue([] as never);

    await getMyTeams();

    const args = prismaMock.teamMember.findMany.mock.calls[0]?.[0] as {
      orderBy?: unknown;
    };
    expect(args.orderBy).toEqual({ createdAt: "asc" });
  });
});

describe("getTeamById", () => {
  it("returns team with members when user is member", async () => {
    prismaMock.teamMember.findUnique.mockResolvedValue({
      id: "tm-1",
      role: TEAM_ROLES.MEMBER,
    } as never);
    const team = {
      id: "team-1",
      name: "Team A",
      slug: "team-a",
      createdAt: new Date(),
      updatedAt: new Date(),
      members: [
        {
          id: "tm-1",
          userId: TEST_USER_ID,
          role: TEAM_ROLES.OWNER,
          createdAt: new Date(),
          user: {
            id: TEST_USER_ID,
            name: "Test",
            surname: "User",
            email: "test@example.com",
          },
        },
      ],
    };
    prismaMock.team.findUnique.mockResolvedValue(team as never);

    const result = await getTeamById("team-1");

    expect(result).toMatchObject({
      id: "team-1",
      name: "Team A",
      slug: "team-a",
    });
    expect(result.members).toHaveLength(1);
    expect(result.members[0].role).toBe(TEAM_ROLES.OWNER);
  });

  it("throws NotFoundError when team does not exist", async () => {
    prismaMock.teamMember.findUnique.mockResolvedValue({
      role: TEAM_ROLES.MEMBER,
    } as never);
    prismaMock.team.findUnique.mockResolvedValue(null);

    await expect(getTeamById("nonexistent")).rejects.toThrow("Team not found");
  });

  it("throws ForbiddenError when user is not a member", async () => {
    prismaMock.teamMember.findUnique.mockResolvedValue(null);

    await expect(getTeamById("team-1")).rejects.toThrow(
      "You are not a member of this team",
    );
    expect(prismaMock.team.findUnique).not.toHaveBeenCalled();
  });
});

describe("getTeamMembers", () => {
  it("returns members ordered by role when user is member", async () => {
    prismaMock.teamMember.findUnique.mockResolvedValue({
      role: TEAM_ROLES.ADMIN,
    } as never);
    const members = [
      {
        id: "tm-1",
        userId: "u1",
        role: TEAM_ROLES.VIEWER,
        createdAt: new Date(),
        user: { id: "u1", name: "A", surname: "B", email: "a@b.com" },
      },
      {
        id: "tm-2",
        userId: "u2",
        role: TEAM_ROLES.OWNER,
        createdAt: new Date(),
        user: { id: "u2", name: "C", surname: "D", email: "c@d.com" },
      },
    ];
    prismaMock.teamMember.findMany.mockResolvedValue(members as never);

    const result = await getTeamMembers("team-1");

    expect(prismaMock.teamMember.findMany).toHaveBeenCalledWith({
      where: { teamId: "team-1" },
      include: {
        user: { select: { id: true, name: true, surname: true, email: true } },
      },
    });
    expect(result).toHaveLength(2);
    expect(result[0].role).toBe(TEAM_ROLES.OWNER);
    expect(result[1].role).toBe(TEAM_ROLES.VIEWER);
  });

  it("throws ForbiddenError when user is not a member", async () => {
    prismaMock.teamMember.findUnique.mockResolvedValue(null);

    await expect(getTeamMembers("team-1")).rejects.toThrow(
      "You are not a member of this team",
    );
    expect(prismaMock.teamMember.findMany).not.toHaveBeenCalled();
  });
});

describe("getInviteByToken", () => {
  it("rejects a signed-out caller without reading the invite", async () => {
    mockGetAuthenticatedUserId.mockRejectedValue(new UnauthorizedError());

    await expect(getInviteByToken("invite-token")).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
    expect(prismaMock.teamInvite.findUnique).not.toHaveBeenCalled();
  });
});

describe("inviteTeamMember", () => {
  it("throws ForbiddenError when user is not owner or admin", async () => {
    prismaMock.teamMember.findUnique.mockResolvedValue({
      role: TEAM_ROLES.MEMBER,
    } as never);

    await expect(
      inviteTeamMember("team-1", "new@example.com", TEAM_ROLES.MEMBER),
    ).rejects.toThrow("Only owners and admins can perform this action");
    expect(prismaMock.teamInvite.create).not.toHaveBeenCalled();
  });

  it("throws ForbiddenError when user is not a member", async () => {
    prismaMock.teamMember.findUnique.mockResolvedValue(null);

    await expect(
      inviteTeamMember("team-1", "new@example.com", TEAM_ROLES.MEMBER),
    ).rejects.toThrow("You are not a member of this team");
  });
});

describe("inviteTeamMember actually delivers the invite", () => {
  function arrangeOwnerInvitingNewPerson() {
    prismaMock.teamMember.findUnique
      .mockResolvedValueOnce({ role: TEAM_ROLES.OWNER } as never)
      .mockResolvedValueOnce(null as never);
    prismaMock.team.findUnique.mockResolvedValue({
      id: "team-1",
      name: "Revenue",
    } as never);
    prismaMock.user.findUnique.mockResolvedValue(null as never);
    prismaMock.teamInvite.create.mockResolvedValue({
      id: "inv-1",
      teamId: "team-1",
      email: "new@example.com",
      role: TEAM_ROLES.MEMBER,
      token: "tok-abc",
      expiresAt: new Date("2099-01-01"),
      createdAt: new Date("2026-01-01"),
    } as never);
  }

  it("sends the invitation email to the invitee", async () => {
    arrangeOwnerInvitingNewPerson();

    const result = await inviteTeamMember(
      "team-1",
      "new@example.com",
      TEAM_ROLES.MEMBER,
    );

    expect(
      mockSendEmail,
      "inviteTeamMember must send the invitation - creating the row alone " +
        "leaves the invitee with nothing while the UI claims it was sent.",
    ).toHaveBeenCalledTimes(1);

    const [to, subject, html] = mockSendEmail.mock.calls[0];
    expect(to).toBe("new@example.com");
    expect(String(subject)).toContain("Revenue");
    expect(String(html).length).toBeGreaterThan(0);
    expect(result.emailSent).toBe(true);
  });

  it("points the invite link at the team accept route", async () => {
    arrangeOwnerInvitingNewPerson();

    const result = await inviteTeamMember(
      "team-1",
      "new@example.com",
      TEAM_ROLES.MEMBER,
    );

    expect(result.inviteUrl).toContain("/settings/team/invite/tok-abc");
  });

  it("keeps the invite and returns a shareable link when email fails", async () => {
    arrangeOwnerInvitingNewPerson();
    mockSendEmail.mockRejectedValue(new Error("RESEND_API_KEY not configured"));

    const result = await inviteTeamMember(
      "team-1",
      "new@example.com",
      TEAM_ROLES.MEMBER,
    );
    expect(result.emailSent).toBe(false);
    expect(result.inviteUrl).toContain("/settings/team/invite/tok-abc");
    expect(prismaMock.teamInvite.delete).not.toHaveBeenCalled();
  });
});

describe("removeTeamMember", () => {
  it("throws ForbiddenError when trying to remove owner", async () => {
    prismaMock.teamMember.findUnique.mockResolvedValue({
      role: TEAM_ROLES.ADMIN,
    } as never);
    prismaMock.teamMember.findFirst.mockResolvedValue({
      id: "tm-owner",
      userId: "owner-id",
      role: TEAM_ROLES.OWNER,
      user: { id: "owner-id" },
    } as never);

    await expect(removeTeamMember("team-1", "tm-owner")).rejects.toThrow(
      "Cannot remove the team owner",
    );
    expect(prismaMock.teamMember.delete).not.toHaveBeenCalled();
  });
});

describe("updateMemberRole", () => {
  it("throws ForbiddenError when user is not owner", async () => {
    prismaMock.teamMember.findUnique.mockResolvedValue({
      role: TEAM_ROLES.ADMIN,
    } as never);

    await expect(
      updateMemberRole("team-1", "tm-1", TEAM_ROLES.MEMBER),
    ).rejects.toThrow("Only the owner can perform this action");
    expect(prismaMock.teamMember.update).not.toHaveBeenCalled();
  });

  it("throws ForbiddenError when changing owner role", async () => {
    prismaMock.teamMember.findUnique.mockResolvedValue({
      role: TEAM_ROLES.OWNER,
    } as never);
    prismaMock.teamMember.findFirst.mockResolvedValue({
      id: "tm-owner",
      role: TEAM_ROLES.OWNER,
    } as never);

    await expect(
      updateMemberRole("team-1", "tm-owner", TEAM_ROLES.ADMIN),
    ).rejects.toThrow("Cannot change the owner's role");
  });
});

describe("transferTeamOwnership", () => {
  it("throws ForbiddenError when caller is not the owner", async () => {
    prismaMock.teamMember.findUnique.mockResolvedValue({
      role: TEAM_ROLES.ADMIN,
    } as never);

    await expect(transferTeamOwnership("team-1", "other-user")).rejects.toThrow(
      "Only the owner can perform this action",
    );
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects transferring to yourself", async () => {
    prismaMock.teamMember.findUnique.mockResolvedValue({
      role: TEAM_ROLES.OWNER,
    } as never);

    await expect(transferTeamOwnership("team-1", TEST_USER_ID)).rejects.toThrow(
      "You already own this team",
    );
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when the target is not a team member", async () => {
    prismaMock.teamMember.findUnique
      .mockResolvedValueOnce({ role: TEAM_ROLES.OWNER } as never)
      .mockResolvedValueOnce(null as never);

    await expect(transferTeamOwnership("team-1", "stranger")).rejects.toThrow(
      "Team member",
    );
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("promotes the target and demotes the caller in one transaction", async () => {
    prismaMock.teamMember.findUnique
      .mockResolvedValueOnce({ role: TEAM_ROLES.OWNER } as never)
      .mockResolvedValueOnce({
        id: "tm-target",
        role: TEAM_ROLES.MEMBER,
      } as never)
      .mockResolvedValueOnce({
        id: "tm-current",
        role: TEAM_ROLES.OWNER,
      } as never);

    await transferTeamOwnership("team-1", "new-owner");
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.teamMember.update).toHaveBeenCalledWith({
      where: { id: "tm-target" },
      data: { role: TEAM_ROLES.OWNER },
    });
    expect(prismaMock.teamMember.update).toHaveBeenCalledWith({
      where: { id: "tm-current" },
      data: { role: TEAM_ROLES.ADMIN },
    });
  });
});

describe("leaveTeam", () => {
  it("throws ForbiddenError when user is owner", async () => {
    prismaMock.teamMember.findUnique.mockResolvedValue({
      role: TEAM_ROLES.OWNER,
    } as never);
    await expect(leaveTeam("team-1")).rejects.toThrow(
      "Transfer ownership to another member first, or delete the team.",
    );
    expect(prismaMock.teamMember.delete).not.toHaveBeenCalled();
  });
});

describe("deleteTeam", () => {
  it("throws ForbiddenError when user is not owner", async () => {
    prismaMock.teamMember.findUnique.mockResolvedValue({
      role: TEAM_ROLES.ADMIN,
    } as never);

    await expect(deleteTeam("team-1")).rejects.toThrow(
      "Only the owner can perform this action",
    );
    expect(prismaMock.team.delete).not.toHaveBeenCalled();
  });
});
