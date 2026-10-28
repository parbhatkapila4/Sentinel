import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ReactNode } from "react";
import { DealsPanel } from "../DealsPanel";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

afterEach(() => cleanup());

const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

function rule(selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) return "";
  return css.slice(start, css.indexOf("}", start));
}

describe("light pages reach the bottom of the window", () => {
  it("lays the page body out as a column so a section can take the spare height", () => {
    const main = rule(".sentinel-daylight .dl-main");
    expect(main).toContain("display: flex;");
    expect(main).toContain("flex-direction: column;");
  });

  it("keeps the two classes that absorb the spare height", () => {
    expect(css).toMatch(
      /\.sentinel-daylight \.dl-grow,\s*\.sentinel-daylight \.dl-fill \{\s*flex-grow: 1;/
    );
    expect(css).toMatch(
      /\}\s*\.sentinel-daylight \.dl-fill \{\s*display: flex;\s*flex-direction: column;/
    );
  });

  it("lets list rows stretch only up to the shared limit", () => {
    expect(rule(".sentinel-daylight .dl-deal-rows > *")).toContain(
      "max-height: var(--dl-row-max);"
    );
    expect(css).toMatch(/--dl-row-max: \d+px;/);
  });

  it("makes the dashboard's last row the one that grows", () => {
    const { container } = render(
      <DealsPanel
        topDeals={[]}
        meetings={[]}
        calendarConnected={false}
        now={new Date(2026, 9, 9, 9, 42)}
      />
    );
    expect(container.firstElementChild).toHaveClass("dl-grid", "dl-grow");
  });
});
