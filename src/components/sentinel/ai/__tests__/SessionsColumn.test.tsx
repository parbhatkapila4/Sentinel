import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SessionsColumn, categorize } from "../SessionsColumn";
import type { AISession } from "../types";

afterEach(() => cleanup());

const sampleSessions: AISession[] = [
  {
    id: "s1",
    title: "Q4 forecast review",
    category: "FORECAST",
    messageCount: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "s2",
    title: "Why is Acme silent?",
    category: "RISK",
    messageCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("SessionsColumn", () => {
  it("renders the threads count and today's count in the header", () => {
    render(
      <SessionsColumn
        sessions={sampleSessions}
        groups={[{ label: "TODAY", sessions: sampleSessions }]}
        activeId={null}
        search=""
        onSearch={() => {}}
        onSelect={() => {}}
        onDelete={() => {}}
        onNewThread={() => {}}
        todayCount={2}
      />
    );
    expect(screen.getByText(/2 conversations/i)).toBeInTheDocument();
  });

  it("calls onNewThread when the begin-thread button is pressed", () => {
    const onNewThread = vi.fn();
    render(
      <SessionsColumn
        sessions={sampleSessions}
        groups={[{ label: "TODAY", sessions: sampleSessions }]}
        activeId={null}
        search=""
        onSearch={() => {}}
        onSelect={() => {}}
        onDelete={() => {}}
        onNewThread={onNewThread}
        todayCount={2}
      />
    );
    fireEvent.click(screen.getByText(/begin a new thread/i));
    expect(onNewThread).toHaveBeenCalledTimes(1);
  });

  it("shows the empty state when no sessions exist", () => {
    render(
      <SessionsColumn
        sessions={[]}
        groups={[]}
        activeId={null}
        search=""
        onSearch={() => {}}
        onSelect={() => {}}
        onDelete={() => {}}
        onNewThread={() => {}}
        todayCount={0}
      />
    );
    expect(screen.getByText(/no threads yet/i)).toBeInTheDocument();
  });
});

describe("categorize()", () => {
  it("routes risk-flavored titles to RISK", () => {
    expect(categorize("Why is the deal slipping?")).toBe("RISK");
    expect(categorize("Stage stall on Acme")).toBe("RISK");
  });

  it("routes forecast titles to FORECAST", () => {
    expect(categorize("Q4 pipeline forecast")).toBe("FORECAST");
  });

  it("routes outreach titles to OUTREACH", () => {
    expect(categorize("Draft a follow-up email")).toBe("OUTREACH");
  });

  it("falls back to GENERAL for unmatched titles", () => {
    expect(categorize("Random thought")).toBe("GENERAL");
  });
});
