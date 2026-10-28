import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { NOW, sampleBook } from "../../__tests__/sample-book";
import { ReportsView } from "../ReportsView";
import { deriveReports } from "../derive";

const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));

vi.mock("sonner", () => ({ toast }));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function renderView(options: { empty?: boolean; dataError?: boolean } = {}) {
  const deals = options.empty || options.dataError ? [] : sampleBook();
  return render(
    <div className="sentinel-daylight">
      <main className="dl-main">
        <ReportsView dataError={options.dataError ?? false} nowMs={NOW} {...deriveReports(deals, NOW)} />
      </main>
    </div>
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  toast.error.mockReset();
});

describe("ReportsView", () => {
  it("leads with the week's wins", () => {
    renderView();
    const hero = screen.getByRole("region", { name: "Summary" });
    expect(within(hero).getByText("1 deal won this week")).toBeTruthy();
    expect(within(hero).getByText("20 deals worth $2.62M, as of today.")).toBeTruthy();
    expect(within(hero).getByRole("button", { name: "Export PDF" })).toBeTruthy();
  });

  it("tabulates every stage with a total", () => {
    renderView();
    const table = screen.getByRole("table", { name: "Pipeline by stage" });
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(8);
    expect(within(rows[5]).getByText("Closed")).toBeTruthy();
    expect(within(rows[7]).getByText("All stages")).toBeTruthy();
  });

  it("groups the registry by stage", () => {
    renderView();
    const registry = screen.getByRole("table", { name: "Deal registry" });
    const groups = within(registry).getAllByRole("rowgroup");
    expect(groups.map((g) => g.getAttribute("aria-label"))).toEqual([
      "Negotiation",
      "Proposal",
      "Qualify",
      "Discover",
      "Closed won",
      "Closed lost",
    ]);
    expect(within(groups[4]).getByText("Closed 12 days ago")).toBeTruthy();
  });

  it("tells the user when the PDF export fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 500 })));
    vi.spyOn(console, "error").mockImplementation(() => {});
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Export PDF" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: "Export PDF" })).toBeTruthy();
  });

  it("falls back to an empty state", () => {
    renderView({ empty: true });
    expect(screen.getByRole("status").textContent).toContain("to report.");
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("says when the deals could not load", () => {
    renderView({ dataError: true });
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("did not load.");
  });
});
