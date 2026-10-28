import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { AnalyticsView } from "../AnalyticsView";
import { deriveAnalytics, type AnalyticsDeal } from "../derive";
import type { AnalyticsRange } from "../model";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  query: { value: "" },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: vi.fn() }),
  usePathname: () => "/analytics",
  useSearchParams: () => new URLSearchParams(mocks.query.value),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const DAY = 86_400_000;
const NOW = new Date(2026, 9, 10, 9, 42).getTime();

function deal(
  id: string,
  name: string,
  value: number,
  stage: string,
  status: string,
  riskScore: number,
  urgency: string | null,
  createdDaysAgo: number
): AnalyticsDeal {
  return {
    id,
    name,
    value,
    stage,
    status,
    riskScore,
    urgency,
    action: urgency === "high" ? `Call ${name}` : null,
    location: "Canada",
    createdAt: NOW - createdDaysAgo * DAY - 3_600_000,
  };
}

const BOOK: AnalyticsDeal[] = [
  deal("1", "Pinnacle Solutions", 35_000, "discover", "at_risk", 0.82, "high", 40),
  deal("2", "Quantum Industries", 250_000, "proposal", "at_risk", 0.71, "high", 34),
  deal("3", "TechStart Inc", 45_000, "proposal", "active", 0.52, "medium", 25),
  deal("5", "Nexus Partners", 55_000, "qualify", "active", 0.28, null, 5),
  deal("8", "Apex Ventures", 180_000, "closed_won", "closed", 0, null, 75),
];

function renderView(
  range: AnalyticsRange = "all",
  options: { book?: AnalyticsDeal[]; dataError?: boolean } = {}
) {
  const book = options.book ?? BOOK;
  return render(
    <div className="sentinel-daylight">
      <AnalyticsView
        range={range}
        dataError={options.dataError ?? false}
        hasAnyDeals={book.length > 0}
        {...deriveAnalytics(book, range, NOW)}
      />
    </div>
  );
}

const rangeTab = (name: RegExp) =>
  within(screen.getByRole("group", { name: "Date range" })).getByRole("button", {
    name,
  });

beforeEach(() => {
  mocks.query.value = "";
  vi.clearAllMocks();
});

afterEach(() => cleanup());

describe("AnalyticsView", () => {
  it("leads with the headline, the scope and the six numbers", () => {
    renderView();
    expect(
      screen.getByRole("heading", { name: "Read the desk's appetite." })
    ).toBeInTheDocument();
    expect(screen.getByText("five deals worth $565K, all time.")).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Summary" })).getByText(
        "2 need action"
      )
    ).toBeInTheDocument();

    const numbers = screen.getByRole("region", { name: "Key numbers" });
    for (const label of [
      "Pipeline",
      "Average deal",
      "Win rate",
      "Active deals",
      "Risk index",
      "Needs action",
    ]) {
      expect(within(numbers).getByText(label)).toBeInTheDocument();
    }
    expect(within(numbers).getByText("1 won · 0 lost")).toBeInTheDocument();
    expect(within(numbers).getByText("2 high risk")).toBeInTheDocument();
  });

  it("charts every stage, with Discover counted under its real name", () => {
    renderView();
    const chart = screen.getByRole("table", { name: "Value and average age by stage" });
    const rows = within(chart).getAllByRole("row");
    expect(rows).toHaveLength(6);
    expect(within(rows[1]).getByText("Discover")).toBeInTheDocument();
    expect(within(rows[1]).getByText("$35,000")).toBeInTheDocument();
    expect(within(rows[3]).getByText("$295,000")).toBeInTheDocument();
    expect(within(rows[5]).getByText("Closed")).toBeInTheDocument();
  });

  it("splits the book by risk and lists who needs a second look", () => {
    renderView();
    const tiers = screen.getByRole("table", { name: "Risk tiers" });
    expect(within(tiers).getByText("2 need action")).toBeInTheDocument();
    expect(within(tiers).getByText("$285K")).toBeInTheDocument();

    const look = screen.getByRole("region", { name: "Needs a second look" });
    const links = within(look).getAllByRole("link", { name: "Pinnacle Solutions" });
    expect(links[0]).toHaveAttribute("href", "/deals/1");
    expect(within(look).getAllByText("Call Pinnacle Solutions").length).toBeGreaterThan(0);

    const healthy = screen.getByRole("region", { name: "Healthiest deals" });
    expect(within(healthy).getAllByText("Apex Ventures").length).toBeGreaterThan(0);
  });

  it("can select 30 days and puts it in the URL", () => {
    renderView();
    fireEvent.click(rangeTab(/^30 days/));
    expect(mocks.push).toHaveBeenCalledWith("/analytics?range=30d");
  });

  it("drops the param for all time and keeps unrelated ones", () => {
    mocks.query.value = "range=30d&team=t1";
    renderView("30d");
    expect(rangeTab(/^30 days/)).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(rangeTab(/^All time/));
    expect(mocks.push).toHaveBeenCalledWith("/analytics?team=t1");
  });

  it("does nothing when the current range is pressed again", () => {
    renderView("7d");
    fireEvent.click(rangeTab(/^7 days/));
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("shows the change against the period before for a dated range", () => {
    renderView("30d");
    const numbers = screen.getByRole("region", { name: "Key numbers" });
    expect(within(numbers).getAllByText("vs the 30 days before").length).toBe(2);
    expect(
      screen.getByText("Deals created in the last 30 days, compared with the 30 days before")
    ).toBeInTheDocument();
  });

  it("offers wider ranges when the range holds no deals", () => {
    const older = BOOK.map((d) => ({ ...d, createdAt: d.createdAt - 10 * DAY }));
    renderView("7d", { book: older });
    expect(screen.getByRole("heading", { name: "No deals to measure." })).toBeInTheDocument();
    expect(screen.getAllByText("Nothing in this range").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Show 30 days" })).toHaveAttribute(
      "href",
      "/analytics?range=30d"
    );
    expect(screen.getByRole("link", { name: "Show all time" })).toHaveAttribute(
      "href",
      "/analytics"
    );
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("invites the first deal when the book is empty", () => {
    renderView("all", { book: [] });
    expect(screen.getByText("Getting started")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Connect a CRM" })).toHaveAttribute(
      "href",
      "/settings?tab=integrations"
    );
    expect(screen.queryByRole("link", { name: "Show all time" })).toBeNull();
  });

  it("does not call the book empty when it failed to load", () => {
    renderView("all", { book: [], dataError: true });
    expect(screen.getByRole("alert")).toHaveTextContent("Data temporarily unavailable");
    expect(screen.getByText("Analytics unavailable")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Deals did not load." })).toBeInTheDocument();
    expect(
      screen.getByText("The zeros above are placeholders, not your real totals.")
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "No deals to measure." })).toBeNull();
    expect(screen.queryByText("How this page fills")).toBeNull();
    expect(screen.queryByRole("link", { name: "Connect a CRM" })).toBeNull();
  });
});
