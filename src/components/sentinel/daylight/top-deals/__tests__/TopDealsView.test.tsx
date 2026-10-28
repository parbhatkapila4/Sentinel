import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { NOW, sampleBook } from "../../__tests__/sample-book";
import { TopDealsView } from "../TopDealsView";
import { deriveTopDeals } from "../derive";

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
        <TopDealsView
          dataError={options.dataError ?? false}
          nowMs={NOW}
          {...deriveTopDeals(deals, NOW)}
        />
      </main>
    </div>
  );
}

afterEach(cleanup);

describe("TopDealsView", () => {
  it("leads with the risk in the top ten", () => {
    renderView();
    const hero = screen.getByRole("region", { name: "Summary" });
    expect(within(hero).getByText("3 of the top 10 at risk")).toBeTruthy();
    expect(within(hero).getByText("20 deals worth $2.62M, biggest first.")).toBeTruthy();
    expect(within(hero).getByRole("link", { name: "Open pipeline" }).getAttribute("href")).toBe("/deals");
    expect(within(hero).getByRole("link", { name: "New deal" }).getAttribute("href")).toBe("/deals/new");
  });

  it("shows the four key numbers", () => {
    renderView();
    const numbers = screen.getByRole("region", { name: "Key numbers" });
    expect(within(numbers).getByText("Keystone Energy · 15.6% of the book")).toBeTruthy();
    expect(within(numbers).getByText("$745K exposed")).toBeTruthy();
    expect(within(numbers).getByText("20 deals · 15 open")).toBeTruthy();
  });

  it("ranks every deal and marks where the top ten ends", () => {
    renderView();
    const table = screen.getByRole("table", { name: "Deals ranked by value" });
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(21);
    expect(within(rows[1]).getByRole("link", { name: "Keystone Energy" }).getAttribute("href")).toBe("/deals/d15");
    expect(within(table).getByText(/Top 10 · \$2\.04M · 77\.9% of the book/)).toBeTruthy();
    expect(within(rows[2]).getByText("1 day overdue")).toBeTruthy();
  });

  it("lists the high-risk deals in the top ten", () => {
    renderView();
    const risk = screen.getByRole("region", { name: "Concentration and risk" });
    expect(within(risk).getByText("Vertex Robotics")).toBeTruthy();
    expect(within(risk).getByText("7 of 10")).toBeTruthy();
    expect(within(risk).getByText("3 of 10")).toBeTruthy();
  });

  it("only lists open deals as the oldest in the top ten", () => {
    renderView();
    const notes = screen.getByRole("region", { name: "Desk notes" });
    expect(within(notes).getByText("Meridian Health")).toBeTruthy();
    expect(within(notes).queryByText("Apex Ventures")).toBeNull();
  });

  it("shows a getting-started state with no deals", () => {
    renderView({ empty: true });
    expect(screen.getByText("Getting started")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("to rank.");
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("says when the deals could not load", () => {
    renderView({ dataError: true });
    expect(screen.getByRole("alert").textContent).toContain("Data temporarily unavailable");
    expect(screen.getByText("Data unavailable")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("did not load.");
  });
});
