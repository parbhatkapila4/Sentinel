import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { NewTeamView } from "../NewTeamView";
import { TeamInviteView } from "../TeamInviteView";
import { TeamsListView } from "../TeamsListView";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  createTeam: vi.fn(),
  acceptInvite: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
  usePathname: () => "/settings/team",
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/app/actions/teams", () => ({
  createTeam: (...a: unknown[]) => mocks.createTeam(...a),
  acceptInvite: (...a: unknown[]) => mocks.acceptInvite(...a),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (m: string) => mocks.toastSuccess(m),
    error: (m: string) => mocks.toastError(m),
  },
}));

beforeEach(() => {
  for (const fn of Object.values(mocks)) fn.mockReset();
});

afterEach(() => cleanup());

describe("TeamsListView", () => {
  const TEAMS = [
    { id: "t1", name: "Revenue Desk", memberCount: 4, myRole: "owner", createdAt: new Date(2026, 7, 12) },
    { id: "t2", name: "EMEA Partnerships", memberCount: 1, myRole: "admin", createdAt: new Date(2026, 8, 3) },
  ];

  it("lists the teams in the order given, with role, size and date", () => {
    render(<TeamsListView teams={TEAMS} />);
    expect(screen.getByText("2 teams")).toBeTruthy();
    const rows = screen.getAllByRole("row").slice(1);
    expect(rows.map((r) => r.querySelector("b")?.textContent)).toEqual([
      "Revenue Desk",
      "EMEA Partnerships",
    ]);
    expect(screen.getByText("Aug 12, 2026")).toBeTruthy();
    expect(screen.getAllByText("1 member").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Open Revenue Desk" }).getAttribute("href")).toBe(
      "/settings/team/t1"
    );
  });

  it("offers one way to create a team when there are none", () => {
    render(<TeamsListView teams={[]} />);
    expect(screen.getByText("No teams yet")).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /team/i }).map((a) => a.textContent)).toEqual([
      "New team",
    ]);
  });
});

describe("NewTeamView", () => {
  it("does not promise the name can be changed later", () => {
    const { container } = render(<NewTeamView />);
    expect(container.textContent).not.toMatch(/change it later/i);
    expect(screen.getByText("The name shows wherever the team does.")).toBeTruthy();
  });

  it("creates the team and opens its page", async () => {
    mocks.createTeam.mockResolvedValueOnce({ id: "t9", name: "Sales North" });
    render(<NewTeamView />);
    const create = screen.getByRole("button", { name: "Create team" }) as HTMLButtonElement;
    expect(create.disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(/Team name/), { target: { value: "  Sales North " } });
    fireEvent.click(create);
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/settings/team/t9"));
    const form = mocks.createTeam.mock.calls[0][0] as FormData;
    expect(form.get("name")).toBe("Sales North");
  });
});

describe("TeamInviteView", () => {
  const INVITE = {
    teamName: "Revenue Desk",
    role: "admin",
    email: "you@company.com",
    expires: "Tuesday, Nov 3",
  };

  it("says what accepting does and offers Not now instead of Decline", () => {
    render(<TeamInviteView token="tok" invite={INVITE} problem={null} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "You're invited to Revenue Desk."
    );
    expect(screen.getByText("join as an admin.")).toBeTruthy();
    expect(
      screen.getByText(
        "Accepting adds you to Revenue Desk as an admin. You can leave the team at any time from its page."
      )
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: "Not now" }).getAttribute("href")).toBe("/settings/team");
    expect(screen.queryByText(/decline/i)).toBeNull();
    expect(screen.getByText("Set by whoever invited you.")).toBeTruthy();
    expect(screen.getByText("Tuesday, Nov 3")).toBeTruthy();
  });

  it("joins the team and opens its page", async () => {
    mocks.acceptInvite.mockResolvedValueOnce({ id: "t1", name: "Revenue Desk" });
    render(<TeamInviteView token="tok" invite={INVITE} problem={null} />);
    fireEvent.click(screen.getByRole("button", { name: "Accept invite" }));
    await waitFor(() => expect(mocks.acceptInvite).toHaveBeenCalledWith("tok"));
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/settings/team/t1"));
  });

  it("shows why the invite could not be accepted", async () => {
    mocks.acceptInvite.mockRejectedValueOnce(
      new Error("This invite was sent to a different email address")
    );
    render(<TeamInviteView token="tok" invite={INVITE} problem={null} />);
    fireEvent.click(screen.getByRole("button", { name: "Accept invite" }));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "This invite was sent to a different email address"
    );
  });

  it("explains an expired or unknown invite", () => {
    render(<TeamInviteView token="tok" invite={null} problem="unavailable" />);
    expect(screen.getByText("Invite unavailable")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("This invite has expired.");
    expect(screen.queryByRole("button", { name: "Accept invite" })).toBeNull();
  });
});
