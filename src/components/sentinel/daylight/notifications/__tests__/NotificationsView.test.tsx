import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NotificationRow } from "../model";
import { NotificationsView, type NotificationsViewProps } from "../NotificationsView";

const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
vi.mock("sonner", () => ({ toast }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const NOW = new Date(2026, 9, 27, 14, 5);

function row(id: string, over: Partial<NotificationRow>): NotificationRow {
  return {
    id,
    type: "deal_at_risk",
    title: "Deal at Risk: Meridian Health",
    message: "Negotiation stalled without response",
    dealId: `d-${id}`,
    teamId: null,
    read: false,
    emailSent: false,
    createdAt: new Date(2026, 9, 27, 13, 42).toISOString(),
    ...over,
  };
}

const PROPS: NotificationsViewProps = {
  initialItems: [
    row("1", {}),
    row("2", {
      type: "action_overdue",
      title: "Action Overdue: Pinnacle Solutions",
      message: "Re-engage the champion is 6 days overdue",
      createdAt: new Date(2026, 9, 27, 9, 10).toISOString(),
    }),
    row("3", {
      type: "stage_changed",
      title: "Deal Stage Changed: Horizon Labs",
      message: "Moved from proposal to negotiation",
      read: true,
      createdAt: new Date(2026, 9, 26, 11, 0).toISOString(),
    }),
    row("4", {
      type: "system",
      title: "Your weekly digest is ready",
      message: "Nine deals moved this week",
      dealId: null,
      read: true,
      createdAt: new Date(2026, 9, 18, 9, 0).toISOString(),
    }),
  ],
  initialUnread: 2,
  initialHasMore: false,
  totalCount: 4,
  todayCount: 2,
  pageSize: 25,
  nowISO: NOW.toISOString(),
};

describe("NotificationsView", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    fetchMock.mockReset();
    toast.error.mockReset();
    toast.success.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("leads with what is waiting", () => {
    render(<NotificationsView {...PROPS} />);
    expect(screen.getByText("2 unread")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("2 pending items.");
    expect(screen.getByText("risk flags and overdue actions.")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Notification settings" }).getAttribute("href")
    ).toBe("/settings#settings-notifications");
  });

  it("counts unread, read, today and what is showing", () => {
    render(<NotificationsView {...PROPS} />);
    const counts = screen.getByRole("region", { name: "Counts" });
    const tile = (label: string) =>
      within(counts).getByText(label).parentElement?.querySelector(".dl-kpi-value")?.textContent;
    expect(tile("Unread")).toBe("2");
    expect(tile("Read")).toBe("2");
    expect(tile("Today")).toBe("2");
    expect(tile("Showing")).toBe("4");
    expect(screen.getByText("4 shown")).toBeTruthy();
  });

  it("groups rows by day and reads them in sentence case", () => {
    render(<NotificationsView {...PROPS} />);
    const today = screen.getByRole("list", { name: "Today" });
    expect(within(today).getAllByRole("listitem")).toHaveLength(2);
    expect(within(today).getByText("Deal at risk: Meridian Health")).toBeTruthy();
    expect(within(today).getByText("13:42")).toBeTruthy();
    const yesterday = screen.getByRole("list", { name: "Yesterday" });
    expect(within(yesterday).getByText("Moved from Proposal to Negotiation.")).toBeTruthy();
    expect(screen.getByRole("list", { name: "Last week" })).toBeTruthy();
  });

  it("offers mark read on unread rows and opens the deal", () => {
    render(<NotificationsView {...PROPS} />);
    expect(screen.getAllByRole("button", { name: "Mark read" })).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: "Open deal: Meridian Health" }).getAttribute("href")
    ).toBe("/deals/d-1");
    expect(screen.queryByRole("link", { name: /Your weekly digest/ })).toBeNull();
  });

  it("marks a row read and lowers the counts", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));
    render(<NotificationsView {...PROPS} />);
    fireEvent.click(screen.getAllByRole("button", { name: "Mark read" })[0]);

    await waitFor(() => expect(screen.getByText("1 unread")).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledWith("/api/notifications/1/read", { method: "POST" });
    expect(screen.getAllByRole("button", { name: "Mark read" })).toHaveLength(1);
  });

  it("deletes a row from its trash button", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));
    render(<NotificationsView {...PROPS} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Delete: Stage changed: Horizon Labs" })
    );

    await waitFor(() => expect(screen.queryByText("Stage changed: Horizon Labs")).toBeNull());
    expect(fetchMock).toHaveBeenCalledWith("/api/notifications/3", { method: "DELETE" });
  });

  it("filters the loaded rows by search and offers to clear it", () => {
    render(<NotificationsView {...PROPS} />);
    const search = screen.getByRole("searchbox", { name: "Search notifications" });
    fireEvent.change(search, { target: { value: "pinnacle" } });
    expect(screen.getByText("1 shown")).toBeTruthy();

    fireEvent.change(search, { target: { value: "zebra" } });
    const empty = screen.getByRole("status");
    expect(within(empty).getByRole("heading", { name: "No matches." })).toBeTruthy();
    fireEvent.click(within(empty).getByRole("button", { name: "Clear search" }));
    expect(screen.getByText("4 shown")).toBeTruthy();
  });

  it("shows the calm empty state when there is nothing at all", () => {
    render(
      <NotificationsView
        {...PROPS}
        initialItems={[]}
        initialUnread={0}
        totalCount={0}
        todayCount={0}
      />
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("The book is clean.");
    expect(screen.getByRole("heading", { name: "You're all caught up." })).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "Mark all read" }) as HTMLButtonElement).disabled
    ).toBe(true);
  });

  it("switches to the Unread tab with the server's unread list", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: { notifications: [PROPS.initialItems[0], PROPS.initialItems[1]], unreadCount: 2 },
        }),
        { status: 200 }
      )
    );
    render(<NotificationsView {...PROPS} />);
    const unreadTab = screen.getByRole("button", { name: /Unread/ });
    expect(within(unreadTab).getByText("2")).toBeTruthy();
    fireEvent.click(unreadTab);

    await waitFor(() => expect(screen.getByText("2 shown")).toBeTruthy());
    expect(unreadTab.getAttribute("aria-pressed")).toBe("true");
  });
});
