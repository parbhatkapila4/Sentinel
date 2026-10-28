import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SectionNav } from "../SectionNav";
import { SETTINGS_SECTIONS } from "../model";

const VIEW = 900;
const tops = new Map<string, number>();

function mountSections() {
  const main = document.createElement("main");
  for (const s of SETTINGS_SECTIONS) {
    const el = document.createElement("section");
    el.id = s.id;
    main.appendChild(el);
  }
  document.body.appendChild(main);
}

function place(positions: Record<string, number>) {
  tops.clear();
  for (const [id, top] of Object.entries(positions)) tops.set(`settings-${id}`, top);
}

function setScroll(scrollY: number, scrollHeight: number) {
  Object.defineProperty(window, "scrollY", { value: scrollY, configurable: true });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: scrollHeight,
    configurable: true,
  });
}

function scroll() {
  act(() => {
    window.dispatchEvent(new Event("scroll"));
    vi.advanceTimersByTime(20);
  });
}

function current(): string | null {
  return (
    screen
      .getByRole("navigation", { name: "Settings sections" })
      .querySelector('[aria-current="true"]')?.textContent ?? null
  );
}

const MID_PAGE = {
  profile: -2600,
  security: -2200,
  notifications: -1800,
  risk: -1400,
  integrations: -1000,
  team: 100,
  billing: 500,
  danger: 820,
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    function (this: Element) {
      const top = tops.get(this.id) ?? 0;
      return { top, bottom: top + 300, left: 0, right: 0, width: 0, height: 300, x: 0, y: top, toJSON: () => ({}) };
    }
  );
  Object.defineProperty(window, "innerHeight", { value: VIEW, configurable: true });
  setScroll(0, 4000);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  tops.clear();
  document.body.innerHTML = "";
});

describe("SectionNav", () => {
  it("uses the sidebar list class only in the sidebar", () => {
    const { unmount } = render(<SectionNav placement="sidebar" />);
    expect(screen.getByRole("navigation", { name: "Settings sections" })).toHaveClass("dl-side-sub");
    unmount();
    render(<SectionNav />);
    expect(screen.getByRole("navigation", { name: "Settings sections" })).toHaveClass("dl-st-nav");
  });

  it("tracks sections that mount after the nav", () => {
    render(<SectionNav placement="sidebar" />);
    scroll();
    expect(current()).toBe("Profile");

    mountSections();
    place(MID_PAGE);
    setScroll(2400, 4000);
    scroll();
    expect(current()).toBe("Team");
  });

  it("keeps a clicked section active until its scroll settles", () => {
    mountSections();
    place(MID_PAGE);
    setScroll(2400, 4000);
    render(<SectionNav placement="sidebar" />);
    scroll();
    expect(current()).toBe("Team");

    fireEvent.click(screen.getByRole("link", { name: "Billing" }));
    expect(current()).toBe("Billing");
    scroll();
    scroll();
    expect(current()).toBe("Billing");

    act(() => {
      vi.advanceTimersByTime(200);
    });
    scroll();
    expect(current()).toBe("Team");
  });

  it("marks the last section on screen at the end of the page", () => {
    mountSections();
    place({ ...MID_PAGE, team: -300, billing: 200, danger: 640 });
    setScroll(3100, 4000);
    render(<SectionNav placement="sidebar" />);
    scroll();
    expect(current()).toBe("Danger zone");
  });
});
