import { isValidElement, type ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  currentUser: vi.fn(),
  queryRaw: vi.fn(),
  executeRaw: vi.fn(),
  acceptUserInvite: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { digest: `NEXT_REDIRECT;replace;${url}` });
  }),
}));

vi.mock("@clerk/nextjs/server", () => ({ currentUser: mocks.currentUser }));
vi.mock("@clerk/nextjs", () => ({ SignOutButton: ({ children }: { children: unknown }) => children }));
vi.mock("@/lib/prisma", () => ({
  prisma: { $queryRaw: mocks.queryRaw, $executeRaw: mocks.executeRaw },
}));
vi.mock("@/app/actions/user", () => ({ acceptUserInvite: mocks.acceptUserInvite }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/components/sentinel/daylight/fonts", () => ({ daylightFontClass: "" }));

import InvitePage from "@/app/invite/[token]/page";
import {
  inviteSignInHref,
  withArticle,
  type WorkspaceInviteState,
} from "../WorkspaceInvite";

const FUTURE = new Date(Date.now() + 3 * 86_400_000);
const PAST = new Date(Date.now() - 86_400_000);

function inviteRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "inv1",
    email: "invitee@example.com",
    role: "member",
    accepted: false,
    expiresAt: FUTURE,
    invitedBy: "u-owner",
    ...overrides,
  };
}

const INVITER = { name: "Maya", surname: "Chen", email: "maya@example.com" };

function signedInAs(email: string) {
  mocks.currentUser.mockResolvedValue({
    id: "u-me",
    firstName: "Sam",
    lastName: "Lee",
    username: null,
    emailAddresses: [{ emailAddress: email }],
  });
}

async function stateFor(token = "tok_1"): Promise<WorkspaceInviteState> {
  const page = (await InvitePage({ params: Promise.resolve({ token }) })) as ReactElement<{
    children: ReactElement<{ state: WorkspaceInviteState }>;
  }>;
  expect(isValidElement(page)).toBe(true);
  return page.props.children.props.state;
}

describe("workspace invite page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.queryRaw.mockReset();
    mocks.currentUser.mockResolvedValue(null);
    mocks.executeRaw.mockResolvedValue(1);
    mocks.acceptUserInvite.mockResolvedValue({ success: true });
  });

  it("leaves the page for the dashboard once the invite is accepted", async () => {
    signedInAs("Invitee@Example.com");
    mocks.queryRaw
      .mockResolvedValueOnce([inviteRow()])
      .mockResolvedValueOnce([INVITER])
      .mockResolvedValueOnce([{ id: "u-me" }]);

    await expect(stateFor()).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.acceptUserInvite).toHaveBeenCalledWith("tok_1");
    expect(mocks.redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("says so when accepting fails instead of showing the invite again", async () => {
    signedInAs("invitee@example.com");
    mocks.queryRaw
      .mockResolvedValueOnce([inviteRow()])
      .mockResolvedValueOnce([INVITER])
      .mockResolvedValueOnce([{ id: "u-me" }]);
    mocks.acceptUserInvite.mockRejectedValueOnce(new Error("db down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await stateFor()).toEqual({ kind: "failed", token: "tok_1" });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("shows the open invite to a signed-out visitor", async () => {
    mocks.queryRaw.mockResolvedValueOnce([inviteRow({ role: "admin" })]).mockResolvedValueOnce([INVITER]);

    const state = await stateFor();
    expect(state).toMatchObject({
      kind: "open",
      inviterName: "Maya Chen",
      inviteEmail: "invitee@example.com",
      roleLabel: "Administrator",
    });
    expect(mocks.acceptUserInvite).not.toHaveBeenCalled();
  });

  it("asks a different account to sign out", async () => {
    signedInAs("someone@else.com");
    mocks.queryRaw.mockResolvedValueOnce([inviteRow()]).mockResolvedValueOnce([INVITER]);

    expect(await stateFor()).toEqual({
      kind: "mismatch",
      token: "tok_1",
      inviteEmail: "invitee@example.com",
      userEmail: "someone@else.com",
    });
  });

  it.each([
    ["invalid", []],
    ["expired", [inviteRow({ expiresAt: PAST })]],
    ["accepted", [inviteRow({ accepted: true })]],
  ])("reports a %s invite", async (kind, rows) => {
    mocks.queryRaw.mockResolvedValueOnce(rows).mockResolvedValueOnce([INVITER]);
    expect((await stateFor()).kind).toBe(kind);
  });
});

describe("invite links", () => {
  it("brings the visitor back to the invite after signing in", () => {
    expect(inviteSignInHref("tok 1")).toBe("/sign-in?redirect=%2Finvite%2Ftok%25201");
  });

  it("picks the article for the role", () => {
    expect(withArticle("administrator")).toBe("an administrator");
    expect(withArticle("member")).toBe("a member");
  });
});
