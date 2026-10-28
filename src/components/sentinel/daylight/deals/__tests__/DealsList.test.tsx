import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ComponentProps, ReactNode } from "react";
import { DealsList } from "../DealsList";
import type { DealRow } from "../model";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  deleteDeal: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  query: { value: "" },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
  usePathname: () => "/deals",
  useSearchParams: () => new URLSearchParams(mocks.query.value),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/app/actions/deals", () => ({
  deleteDeal: (id: string) => mocks.deleteDeal(id),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (message: string) => mocks.toastSuccess(message),
    error: (message: string) => mocks.toastError(message),
  },
}));

const NOW = Date.UTC(2026, 9, 9, 9, 42);
const DAY = 86_400_000;

function deal(overrides: Partial<DealRow> & Pick<DealRow, "id" | "name">): DealRow {
  return {
    value: 50_000,
    stage: "proposal",
    status: "active",
    riskScore: 0.2,
    riskReason: null,
    location: "Canada",
    owner: "Maya Chen",
    action: null,
    actionDueAt: null,
    overdueDays: null,
    lastActivityAt: NOW - 2 * DAY,
    isDemo: false,
    ...overrides,
  };
}

const DEALS: DealRow[] = [
  deal({
    id: "q",
    name: "Quantum Industries",
    value: 250_000,
    status: "at_risk",
    riskScore: 0.71,
    action: "Schedule a pricing review",
    actionDueAt: NOW - 3 * DAY,
    overdueDays: 2,
  }),
  deal({ id: "t", name: "TechStart Inc", value: 45_000, riskScore: 0.52 }),
  deal({ id: "n", name: "Nexus Partners", value: 55_000, owner: null }),
];

type Props = ComponentProps<typeof DealsList>;

function renderList(overrides: Partial<Props> = {}) {
  const props: Props = {
    deals: DEALS,
    filter: "all",
    scope: "my",
    search: "",
    counts: { all: 3, active: 2, "at-risk": 1, closed: 0 },
    totalInScope: 3,
    unavailable: false,
    nowMs: NOW,
    ...overrides,
  };
  const view = render(
    <div className="sentinel-daylight">
      <DealsList {...props} />
    </div>
  );
  return {
    ...view,
    rerenderWith: (next: Partial<Props>) =>
      view.rerender(
        <div className="sentinel-daylight">
          <DealsList {...props} {...next} />
        </div>
      ),
  };
}

const table = () => screen.getByRole("table", { name: "Deals" });
const rowBox = (name: string) =>
  within(table()).getByRole("checkbox", { name: `Select ${name}` });
const bulkBar = () => screen.queryByRole("toolbar");
const tab = (name: RegExp) =>
  within(screen.getByRole("group", { name: "Filter deals" })).getByRole("button", {
    name,
  });

function mockBulk(data: Record<string, unknown>, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: async () => (ok ? { data } : data),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  mocks.query.value = "";
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("DealsList layout", () => {
  it("lists every deal once per layout and lets the stylesheet show only one", () => {
    renderList();
    expect(within(table()).getAllByRole("row")).toHaveLength(DEALS.length + 1);

    const cards = document.querySelector<HTMLElement>(".dl-deals-cards");
    expect(cards?.querySelectorAll("li")).toHaveLength(DEALS.length);

    expect(table().style.display).toBe("");
    expect(cards?.style.display).toBe("");

    const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).toMatch(
      /@container dl-main \(max-width: 719\.98px\) \{\s*\.sentinel-daylight \.dl-deals-table \{\s*display: none !important;/
    );
    expect(css).toMatch(
      /@container dl-main \(min-width: 720px\) \{\s*\.sentinel-daylight \.dl-deals-cards \{\s*display: none !important;/
    );
  });

  it("stretches the list so its footer strip sits at the bottom of the window", () => {
    renderList();
    expect(screen.getByRole("region", { name: "Deals list" })).toHaveClass("dl-fill");
    expect(table()).toHaveClass("dl-fill");
    expect(document.querySelector(".dl-deals-cards")).toHaveClass("dl-fill");
    expect(document.querySelector(".dl-deal-rows")).not.toBeNull();
    expect(document.querySelector(".dl-deal-rest")).not.toBeNull();
  });

  it("shows risk, owner, next action and value for a row", () => {
    renderList();
    const row = within(table()).getAllByRole("row")[1];
    expect(within(row).getByRole("link", { name: "Quantum Industries" })).toHaveAttribute(
      "href",
      "/deals/q"
    );
    expect(within(row).getByText("High")).toBeInTheDocument();
    expect(within(row).getByText("0.71")).toBeInTheDocument();
    expect(within(row).getByText("Schedule a pricing review")).toBeInTheDocument();
    expect(within(row).getByText("Overdue by 2 days")).toBeInTheDocument();
    expect(within(row).getByText("$250,000")).toBeInTheDocument();
    expect(within(table()).getByText("Unassigned")).toBeInTheDocument();
  });

  it("totals the rows on show", () => {
    renderList();
    expect(screen.getByText(/Showing 3 of 3/)).toBeInTheDocument();
    expect(screen.getByText("$350,000")).toBeInTheDocument();
    expect(screen.getByText("on the book")).toBeInTheDocument();
  });
});

describe("DealsList selection", () => {
  it("shows the action bar with the count and value of the selection", () => {
    renderList();
    expect(bulkBar()).toBeNull();

    fireEvent.click(rowBox("Quantum Industries"));
    fireEvent.click(rowBox("TechStart Inc"));

    const bar = screen.getByRole("toolbar");
    expect(within(bar).getByText("2 selected")).toBeInTheDocument();
    expect(within(bar).getByText("$295,000")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(bulkBar()).toBeNull();
  });

  it("selects and clears every real deal from the header box", () => {
    renderList();
    const all = screen.getByRole("checkbox", { name: "Select all deals" });
    fireEvent.click(all);
    expect(within(screen.getByRole("toolbar")).getByText("3 selected")).toBeInTheDocument();
    fireEvent.click(all);
    expect(bulkBar()).toBeNull();
  });

  it("keeps demo deals out of the selection", () => {
    renderList({
      deals: DEALS.map((d) => ({ ...d, isDemo: true })),
    });
    expect(rowBox("Quantum Industries")).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Select all deals" })).toBeDisabled();
    expect(within(table()).getAllByText("Demo")).toHaveLength(DEALS.length);
  });

  it("drops a selected deal that is no longer listed", () => {
    const view = renderList();
    fireEvent.click(rowBox("Quantum Industries"));
    fireEvent.click(rowBox("TechStart Inc"));
    view.rerenderWith({ deals: DEALS.slice(1) });
    expect(within(screen.getByRole("toolbar")).getByText("1 selected")).toBeInTheDocument();
  });
});

describe("DealsList filters", () => {
  it("puts the chosen tab in the URL and clears the selection", () => {
    renderList();
    fireEvent.click(rowBox("Quantum Industries"));
    fireEvent.click(tab(/^At risk/));
    expect(mocks.push).toHaveBeenCalledWith("/deals?filter=at-risk");
    expect(bulkBar()).toBeNull();
  });

  it("removes the param again for the default tab and scope", () => {
    mocks.query.value = "filter=active&scope=all&team=t1";
    const view = renderList({ filter: "active", scope: "all" });
    fireEvent.click(tab(/^All/));
    expect(mocks.push).toHaveBeenLastCalledWith("/deals?scope=all&team=t1");

    mocks.query.value = "scope=all&team=t1";
    view.rerenderWith({ filter: "all", scope: "all" });
    fireEvent.click(screen.getByRole("button", { name: "My deals" }));
    expect(mocks.push).toHaveBeenLastCalledWith("/deals?team=t1");
  });

  it("does not navigate when the view is already the one asked for", () => {
    renderList();
    fireEvent.click(tab(/^All/));
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("waits for typing to pause before searching", () => {
    vi.useFakeTimers();
    renderList();
    const field = screen.getByRole("searchbox", { name: "Filter the list" });
    fireEvent.change(field, { target: { value: " ac" } });
    fireEvent.change(field, { target: { value: " acme " } });
    act(() => {
      vi.advanceTimersByTime(279);
    });
    expect(mocks.push).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(mocks.push).toHaveBeenCalledTimes(1);
    expect(mocks.push).toHaveBeenCalledWith("/deals?search=acme");
  });

  it("carries unsent typing along when a tab is pressed", () => {
    vi.useFakeTimers();
    renderList();
    fireEvent.change(screen.getByRole("searchbox", { name: "Filter the list" }), {
      target: { value: "acme" },
    });
    fireEvent.click(tab(/^Active/));
    expect(mocks.push).toHaveBeenCalledWith("/deals?filter=active&search=acme");
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(mocks.push).toHaveBeenCalledTimes(1);
  });

  it("takes on a search that arrives from elsewhere", () => {
    const view = renderList();
    const field = screen.getByRole("searchbox", { name: "Filter the list" });
    expect(field).toHaveValue("");
    view.rerenderWith({ search: "quantum" });
    expect(field).toHaveValue("quantum");
  });
});

describe("DealsList bulk actions", () => {
  it("moves the selection to a stage through the bulk endpoint", async () => {
    const fetchMock = mockBulk({ updated: 2, failed: 0 });
    renderList();
    fireEvent.click(rowBox("Quantum Industries"));
    fireEvent.click(rowBox("TechStart Inc"));
    fireEvent.click(screen.getByRole("button", { name: "Move to stage" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /^Negotiation/ }));

    await waitFor(() => expect(mocks.refresh).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/deals/bulk",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          action: "update",
          dealIds: ["q", "t"],
          updates: { stage: "negotiation" },
        }),
      })
    );
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Updated 2 deals to Negotiation");
    expect(bulkBar()).toBeNull();
  });

  it("reports a failed move and keeps the selection", async () => {
    mockBulk({ error: "Not allowed" }, false);
    renderList();
    fireEvent.click(rowBox("Quantum Industries"));
    fireEvent.click(screen.getByRole("button", { name: "Move to stage" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /^Proposal/ }));

    await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith("Not allowed"));
    expect(mocks.refresh).not.toHaveBeenCalled();
    expect(within(screen.getByRole("toolbar")).getByText("1 selected")).toBeInTheDocument();
  });

  it("asks before deleting the selection", async () => {
    const fetchMock = mockBulk({ deleted: 1, failed: 0 });
    renderList();
    fireEvent.click(rowBox("TechStart Inc"));
    fireEvent.click(within(screen.getByRole("toolbar")).getByRole("button", { name: "Delete" }));
    expect(fetchMock).not.toHaveBeenCalled();

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Delete 1 deal?" })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete 1 deal" }));

    await waitFor(() => expect(mocks.refresh).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/deals/bulk",
      expect.objectContaining({
        body: JSON.stringify({ action: "delete", dealIds: ["t"] }),
      })
    );
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Deleted 1 deal");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("cancelling the dialog deletes nothing", () => {
    const fetchMock = mockBulk({ deleted: 1, failed: 0 });
    renderList();
    fireEvent.click(rowBox("TechStart Inc"));
    fireEvent.click(within(screen.getByRole("toolbar")).getByRole("button", { name: "Delete" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("DealsList row menu", () => {
  it("deletes one deal only after DELETE is typed", async () => {
    mocks.deleteDeal.mockResolvedValue(undefined);
    renderList();
    fireEvent.click(screen.getByRole("button", { name: "More actions for Quantum Industries" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete deal" }));

    const dialog = screen.getByRole("dialog");
    const confirm = within(dialog).getByRole("button", { name: "Delete deal" });
    expect(confirm).toBeDisabled();
    fireEvent.change(within(dialog).getByRole("textbox"), { target: { value: "delete" } });
    expect(confirm).toBeDisabled();
    fireEvent.change(within(dialog).getByRole("textbox"), { target: { value: "DELETE" } });
    expect(confirm).toBeEnabled();
    fireEvent.click(confirm);

    await waitFor(() => expect(mocks.refresh).toHaveBeenCalledTimes(1));
    expect(mocks.deleteDeal).toHaveBeenCalledWith("q");
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Deleted Quantum Industries");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("keeps the dialog open with the reason when the delete fails", async () => {
    mocks.deleteDeal.mockRejectedValue(new Error("You cannot delete this deal"));
    renderList();
    fireEvent.click(screen.getByRole("button", { name: "More actions for Quantum Industries" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete deal" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByRole("textbox"), { target: { value: "DELETE" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete deal" }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "You cannot delete this deal"
    );
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it("offers no delete for a demo deal", () => {
    renderList({ deals: [{ ...DEALS[0], isDemo: true }] });
    fireEvent.click(screen.getByRole("button", { name: "More actions for Quantum Industries" }));
    expect(screen.getByRole("menuitem", { name: "View deal" })).toHaveAttribute(
      "href",
      "/deals/q"
    );
    expect(screen.queryByRole("menuitem", { name: "Delete deal" })).toBeNull();
  });
});

describe("DealsList empty states", () => {
  it("invites the first deal when the book is empty", () => {
    renderList({
      deals: [],
      totalInScope: 0,
      counts: { all: 0, active: 0, "at-risk": 0, closed: 0 },
    });
    expect(screen.getByRole("heading", { name: "No deals to read." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Connect a CRM" })).toHaveAttribute(
      "href",
      "/settings?tab=integrations"
    );
    expect(screen.getByRole("link", { name: "Add a deal" })).toHaveAttribute(
      "href",
      "/deals/new"
    );
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("does not call the book empty when it failed to load", () => {
    renderList({
      deals: [],
      totalInScope: 0,
      unavailable: true,
      counts: { all: 0, active: 0, "at-risk": 0, closed: 0 },
    });
    expect(screen.getByText("List unavailable")).toBeInTheDocument();
    expect(screen.queryByText("Nothing on the book yet")).toBeNull();
    expect(screen.queryByRole("link", { name: "Connect a CRM" })).toBeNull();
  });

  it("offers a way back when the filters match nothing", () => {
    mocks.query.value = "filter=closed&search=zzz";
    renderList({
      deals: [],
      filter: "closed",
      search: "zzz",
      counts: { all: 0, active: 0, "at-risk": 0, closed: 0 },
    });
    expect(screen.getByRole("heading", { name: "No deals match." })).toBeInTheDocument();
    expect(screen.getByText(/Showing 0 of 3/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show all deals" }));
    expect(mocks.push).toHaveBeenCalledWith("/deals");
  });
});
