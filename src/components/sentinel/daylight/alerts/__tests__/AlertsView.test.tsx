import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { NOW, sampleBook } from "../../__tests__/sample-book";
import { AlertsView } from "../AlertsView";
import { deriveAlerts } from "../derive";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const QUEUE = {
  urgent: ["d02", "d01", "d03"],
  important: ["d04", "d05"],
  safe: ["d10", "d07", "d12", "d13", "d11"],
};

function renderView(options: { empty?: boolean; dataError?: boolean } = {}) {
  const deals = options.empty || options.dataError ? [] : sampleBook();
  return render(
    <div className="sentinel-daylight">
      <main className="dl-main">
        <AlertsView
          dataError={options.dataError ?? false}
          {...deriveAlerts(deals, options.empty || options.dataError ? { urgent: [], important: [], safe: [] } : QUEUE, NOW)}
        />
      </main>
    </div>
  );
}

afterEach(cleanup);

describe("AlertsView", () => {
  it("leads with what is overdue", () => {
    renderView();
    const hero = screen.getByRole("region", { name: "Summary" });
    expect(within(hero).getByText("3 actions overdue")).toBeTruthy();
    expect(within(hero).getByText("four high-risk deals worth $780K.")).toBeTruthy();
    expect(within(hero).getByRole("link", { name: "Open at-risk deals" }).getAttribute("href")).toBe("/deals?filter=at-risk");
    expect(within(hero).getByRole("link", { name: "Risk settings" }).getAttribute("href")).toBe("/settings#settings-risk");
  });

  it("averages risk over the open deals", () => {
    renderView();
    const numbers = screen.getByRole("region", { name: "Key numbers" });
    expect(within(numbers).getByText("across 15 open deals")).toBeTruthy();
    expect(within(numbers).getByText("$595K · 3 days late on average")).toBeTruthy();
  });

  it("lays out the three queues", () => {
    renderView();
    const queue = screen.getByRole("region", { name: "Action queue" });
    const urgent = within(queue).getByRole("list", { name: "Urgent deals" });
    expect(within(urgent).getAllByRole("listitem")).toHaveLength(3);
    expect(within(urgent).getByText("6 days overdue")).toBeTruthy();
    const important = within(queue).getByRole("list", { name: "Important deals" });
    expect(within(important).getByText(/due in 2 days/)).toBeTruthy();
    expect(within(queue).getByRole("link", { name: "Open all" }).getAttribute("href")).toBe("/deals?filter=active");
  });

  it("explains the four signals", () => {
    renderView();
    const signals = screen.getByRole("region", { name: "What makes a deal risky" });
    expect(within(signals).getByText("2 of 4 high-risk deals")).toBeTruthy();
  });

  it("falls back to an empty state", () => {
    renderView({ empty: true });
    expect(screen.getByRole("status").textContent).toContain("to watch.");
    expect(screen.queryByRole("region", { name: "Action queue" })).toBeNull();
  });

  it("says when the deals could not load", () => {
    renderView({ dataError: true });
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("did not load.");
  });
});
