import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { TeamDetailView } from "../TeamDetailView";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  removeTeamMember: vi.fn(),
  updateMemberRole: vi.fn(),
  transferTeamOwnership: vi.fn(),
  leaveTeam: vi.fn(),
  deleteTeam: vi.fn(),
  inviteTeamMember: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  toastMessage: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
  usePathname: () => "/settings/team/t1",
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/app/actions/teams", () => ({
  removeTeamMember: (...a: unknown[]) => mocks.removeTeamMember(...a),
  updateMemberRole: (...a: unknown[]) => mocks.updateMemberRole(...a),
  transferTeamOwnership: (...a: unknown[]) => mocks.transferTeamOwnership(...a),
  leaveTeam: (...a: unknown[]) => mocks.leaveTeam(...a),
  deleteTeam: (...a: unknown[]) => mocks.deleteTeam(...a),
  inviteTeamMember: (...a: unknown[]) => mocks.inviteTeamMember(...a),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (m: string) => mocks.toastSuccess(m),
    error: (m: string) => mocks.toastError(m),
    message: (m: string) => mocks.toastMessage(m),
  },
}));

const ME = "u-me";

const MEMBERS = [
  {
    id: "m-me",
    userId: ME,
    role: "owner",
    user: { id: ME, name: "Avery", surname: "Stone", email: "avery@company.com" },
  },
  {
    id: "m-maya",
    userId: "u-maya",
    role: "admin",
    user: { id: "u-maya", name: "Maya", surname: "Chen", email: "maya@company.com" },
  },
  {
    id: "m-dan",
    userId: "u-dan",
    role: "member",
    user: { id: "u-dan", name: "Daniel", surname: "Okafor", email: "daniel@company.com" },
  },
];

type Props = ComponentProps<typeof TeamDetailView>;

function renderView(overrides: Partial<Props> = {}) {
  const props: Props = {
    team: { id: "t1", name: "Revenue Desk", clause: "3 members since Aug 12." },
    myRole: "owner",
    currentUserId: ME,
    members: MEMBERS,
    invites: [
      { id: "i1", email: "jordan@company.com", role: "member", line: "Invited today · expires Nov 3" },
    ],
    ...overrides,
  };
  return render(
    <div className="sentinel-daylight">
      <main className="dl-main">
        <TeamDetailView {...props} />
      </main>
    </div>
  );
}

function openMenuFor(name: string) {
  fireEvent.click(screen.getByRole("button", { name: `More for ${name}` }));
  return screen.getByRole("menu", { name: `More for ${name}` });
}

beforeEach(() => {
  for (const fn of Object.values(mocks)) fn.mockReset();
  mocks.removeTeamMember.mockResolvedValue(undefined);
  mocks.updateMemberRole.mockResolvedValue(undefined);
  mocks.transferTeamOwnership.mockResolvedValue(undefined);
  mocks.leaveTeam.mockResolvedValue(undefined);
  mocks.deleteTeam.mockResolvedValue(undefined);
});

afterEach(() => cleanup());

describe("TeamDetailView, owner", () => {
  it("shows the team, its members and the owner's controls", () => {
    renderView();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Revenue Desk.");
    expect(screen.getByText("You own this team")).toBeTruthy();
    expect(screen.getByText("3 people. Admins can remove members; only you can change roles.")).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Role for Maya Chen" })).toBeTruthy();
    expect(screen.queryByRole("combobox", { name: "Role for Avery Stone" })).toBeNull();
    expect(screen.getByText("Invited today · expires Nov 3")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Delete team" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Leave team" })).toBeNull();
  });

  it("opens the delete confirmation over the window, not inside the page body", () => {
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Delete team" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog.closest("main")).toBeNull();
    expect(dialog.closest(".sentinel-daylight")).not.toBeNull();
    expect((dialog.parentElement as HTMLElement).style.position).toBe("fixed");
  });

  it("starts the delete confirmation empty every time it opens", () => {
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Delete team" }));
    fireEvent.change(screen.getByPlaceholderText("DELETE"), { target: { value: "DEL" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Delete team" }));
    expect((screen.getByPlaceholderText("DELETE") as HTMLInputElement).value).toBe("");
  });

  it("deletes the team only after DELETE is typed", async () => {
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Delete team" }));
    const dialog = screen.getByRole("dialog");
    const confirm = within(dialog).getByRole("button", { name: "Delete team" });
    expect((confirm as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(screen.getByPlaceholderText("DELETE"), { target: { value: "DELETE" } });
    fireEvent.click(confirm);
    await waitFor(() => expect(mocks.deleteTeam).toHaveBeenCalledWith("t1"));
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/settings/team"));
  });

  it("asks before removing a member", async () => {
    renderView();
    const menu = openMenuFor("Daniel Okafor");
    fireEvent.click(within(menu).getByRole("menuitem", { name: "Remove from team" }));
    expect(mocks.removeTeamMember).not.toHaveBeenCalled();

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Remove Daniel Okafor?")).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Remove from team" }));
    await waitFor(() => expect(mocks.removeTeamMember).toHaveBeenCalledWith("t1", "m-dan"));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("keeps the dialog open with the reason when removing fails", async () => {
    mocks.removeTeamMember.mockRejectedValueOnce(new Error("Cannot remove the team owner"));
    renderView();
    fireEvent.click(within(openMenuFor("Daniel Okafor")).getByRole("menuitem", { name: "Remove from team" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Remove from team" }));
    await waitFor(() =>
      expect(within(screen.getByRole("dialog")).getByRole("alert").textContent).toBe(
        "Cannot remove the team owner"
      )
    );
  });

  it("asks in the page before making someone the owner", async () => {
    const confirmSpy = vi.spyOn(window, "confirm");
    renderView();
    fireEvent.click(within(openMenuFor("Maya Chen")).getByRole("menuitem", { name: "Make owner" }));
    expect(mocks.transferTeamOwnership).not.toHaveBeenCalled();
    expect(confirmSpy).not.toHaveBeenCalled();

    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Make owner" }));
    await waitFor(() => expect(mocks.transferTeamOwnership).toHaveBeenCalledWith("t1", "u-maya"));
    confirmSpy.mockRestore();
  });

  it("changes a role from the select and puts it back when the change fails", async () => {
    mocks.updateMemberRole.mockRejectedValueOnce(new Error("Only the owner can perform this action"));
    renderView();
    const select = screen.getByRole("combobox", { name: "Role for Daniel Okafor" }) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "viewer" } });
    expect(mocks.updateMemberRole).toHaveBeenCalledWith("t1", "m-dan", "viewer");
    await waitFor(() =>
      expect(mocks.toastError).toHaveBeenCalledWith("Only the owner can perform this action")
    );
    expect(select.value).toBe("member");
  });

  it("shows the link to share when the invite email could not be sent", async () => {
    mocks.inviteTeamMember.mockResolvedValueOnce({
      emailSent: false,
      inviteUrl: "https://sentinels.in/settings/team/invite/tok",
    });
    renderView();
    fireEvent.change(screen.getByPlaceholderText("colleague@company.com"), {
      target: { value: " Jordan@Company.com " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send invite" }));
    await waitFor(() =>
      expect(mocks.inviteTeamMember).toHaveBeenCalledWith("t1", "jordan@company.com", "member")
    );
    const notice = await screen.findByRole("status");
    expect(within(notice).getByText("The email could not be sent")).toBeTruthy();
    expect(within(notice).getByText("https://sentinels.in/settings/team/invite/tok")).toBeTruthy();
    fireEvent.click(within(notice).getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("The email could not be sent")).toBeNull();
  });
});

describe("TeamDetailView, other seats", () => {
  it("lets a member see the team and leave it, nothing else", () => {
    renderView({ myRole: "member", currentUserId: "u-dan", invites: [] });
    expect(screen.getByText("You are a member")).toBeTruthy();
    expect(screen.getByText("3 people.")).toBeTruthy();
    expect(screen.queryAllByRole("combobox")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: /More for/ })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Invite people" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Invite people" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Delete team" })).toBeNull();
  });

  it("asks before leaving the team", async () => {
    renderView({ myRole: "member", currentUserId: "u-dan", invites: [] });
    fireEvent.click(screen.getByRole("button", { name: "Leave team" }));
    expect(mocks.leaveTeam).not.toHaveBeenCalled();

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Leave Revenue Desk?")).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "Leave team" }));
    await waitFor(() => expect(mocks.leaveTeam).toHaveBeenCalledWith("t1"));
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/settings/team"));
  });

  it("gives an admin removal but not roles or ownership", () => {
    renderView({ myRole: "admin", currentUserId: "u-maya" });
    expect(screen.getByText("You are an admin")).toBeTruthy();
    expect(screen.queryAllByRole("combobox", { name: /Role for/ })).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "More for Avery Stone" })).toBeNull();
    expect(screen.queryByRole("button", { name: "More for Maya Chen" })).toBeNull();

    const menu = openMenuFor("Daniel Okafor");
    expect(within(menu).queryByRole("menuitem", { name: "Make owner" })).toBeNull();
    expect(within(menu).getByRole("menuitem", { name: "Remove from team" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Invite people" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Leave team" })).toBeTruthy();
  });
});
