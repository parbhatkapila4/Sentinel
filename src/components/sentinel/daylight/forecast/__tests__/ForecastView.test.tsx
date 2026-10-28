import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { NOW, sampleBook } from "../../__tests__/sample-book";
import { ForecastView } from "../ForecastView";
import { deriveForecast } from "../derive";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function renderView(options: { empty?: boolean; dataError?: boolean } = {}) {
  const deals = options.empty || options.dataError ? [] : sampleBook();
  return render(
    <div className="sentinel-daylight">
      <main className="dl-main">
        <ForecastView dataError={options.dataError ?? false} {...deriveForecast(deals, NOW)} />
      </main>
    </div>
  );
}

describe("ForecastView", () => {
  it("leads with the most likely figure", () => {
    renderView();
    const hero = screen.getByRole("region", { name: "Summary" });
    expect(within(hero).getByText("$780K sits in high-risk deals")).toBeTruthy();
    expect(within(hero).getByText("$1.38M most likely, from $2.11M open.")).toBeTruthy();
  });

  it("explains how a deal's chance is counted", () => {
    renderView();
    const range = screen.getByRole("region", { name: "Forecast range" });
    expect(within(range).getByText("Starts at your win rate")).toBeTruthy();
    expect(within(range).getByText("60%")).toBeTruthy();
    expect(within(range).getByText("Idle more than 21 days")).toBeTruthy();
    expect(within(range).getByRole("img", { name: /most likely \$1\.38M, best \$1\.81M/ })).toBeTruthy();
  });

  it("tabulates the open stages with a total row", () => {
    renderView();
    const table = screen.getByRole("table", { name: "Forecast by stage" });
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(6);
    expect(within(rows[1]).getByText("Discover")).toBeTruthy();
    expect(within(rows[5]).getByText("All open")).toBeTruthy();
    expect(within(rows[5]).getByText("$1.38M")).toBeTruthy();
  });

  it("shows only the open stages on the board", () => {
    renderView();
    const board = screen.getByRole("region", { name: "The board" });
    const columns = within(board).getAllByRole("heading", { level: 2 });
    expect(columns.map((h) => h.textContent)).toEqual([
      "Discover",
      "Qualify",
      "Proposal",
      "Negotiation",
    ]);
    const negotiation = within(board).getByRole("list", { name: "Negotiation deals" });
    expect(within(negotiation).getByText("1 day overdue")).toBeTruthy();
    expect(within(board).queryByText("Apex Ventures")).toBeNull();
  });

  it("falls back to an empty state", () => {
    renderView({ empty: true });
    expect(screen.getByRole("status").textContent).toContain("to forecast.");
    expect(screen.queryByRole("region", { name: "The board" })).toBeNull();
  });

  it("says when the deals could not load", () => {
    renderView({ dataError: true });
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("did not load.");
  });
});
