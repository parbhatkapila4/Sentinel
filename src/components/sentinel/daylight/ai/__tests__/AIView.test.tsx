import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { AIView, type AIViewProps } from "../AIView";
import { AIWorkspaceProvider, type AIWorkspaceProviderProps } from "../AIWorkspaceProvider";
import { SidebarThreads } from "../threads";

const actions = vi.hoisted(() => ({
  createChat: vi.fn(),
  getChatMessages: vi.fn(),
  saveChatMessage: vi.fn(),
  updateChatTitle: vi.fn(),
  deleteChat: vi.fn(),
}));

const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));

vi.mock("@/app/actions/chats", () => actions);
vi.mock("sonner", () => ({ toast }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const NOW = new Date(2026, 9, 27, 14, 5);

const WORKSPACE: Omit<AIWorkspaceProviderProps, "children"> = {
  sessions: [
    {
      id: "s1",
      title: "Which deals should I prioritize this week?",
      updatedAt: new Date(2026, 9, 27, 9, 12).toISOString(),
      createdAt: new Date(2026, 9, 27, 9, 12).toISOString(),
      messageCount: 2,
      category: "PRIORITY",
    },
    {
      id: "s2",
      title: "Summarize the Meridian Health calls",
      updatedAt: new Date(2026, 9, 19, 10, 0).toISOString(),
      createdAt: new Date(2026, 9, 19, 10, 0).toISOString(),
      messageCount: 5,
      category: "RESEARCH",
    },
  ],
  recentAnswers: [
    { id: "q1", question: "Summarize the Meridian Health calls", when: "Oct 19 · Research", meta: "", chatId: "s2" },
  ],
  todayChatCount: 1,
  connectedSourceCount: 1,
  nowISO: NOW.toISOString(),
};

const VIEW: AIViewProps = {
  prompts: [
    {
      key: "priority",
      title: "Deal",
      emphasis: "prioritization",
      sub: "Which deals deserve your attention this week.",
      tag: "4 at risk",
      prompt: "Which deals should I prioritize this week?",
    },
  ],
  suggestions: ["Why is my top at-risk deal slipping?"],
  book: { activeDeals: 15, openValue: 2_114_000, flagged: 4, overdue: 3, likely: 1_380_000 },
  sources: [
    { key: "hubspot", name: "HubSpot", monogram: "HS", kind: "CRM", connected: true, syncedAt: NOW.toISOString() },
    { key: "gmail", name: "Gmail", monogram: "GM", kind: "Email", connected: false, syncedAt: null },
  ],
};

function renderView() {
  return render(
    <div className="sentinel-daylight">
      <AIWorkspaceProvider {...WORKSPACE}>
        <main className="dl-main">
          <AIView {...VIEW} />
        </main>
      </AIWorkspaceProvider>
    </div>
  );
}

function renderWithSidebar() {
  render(
    <div className="sentinel-daylight">
      <AIWorkspaceProvider {...WORKSPACE}>
        <aside aria-label="Primary navigation">
          <SidebarThreads />
        </aside>
        <main className="dl-main">
          <AIView {...VIEW} />
        </main>
      </AIWorkspaceProvider>
    </div>
  );
  return screen.getByRole("region", { name: "Threads" });
}

function answer(content: string) {
  return new Response(JSON.stringify({ data: { content } }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  actions.createChat.mockResolvedValue("new-chat");
  actions.getChatMessages.mockResolvedValue([]);
  actions.saveChatMessage.mockResolvedValue(undefined);
  actions.updateChatTitle.mockResolvedValue(undefined);
  actions.deleteChat.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("AIView", () => {
  it("opens on a new thread with starters and the book", () => {
    renderView();
    const convo = screen.getByRole("region", { name: "Conversation" });
    expect(within(convo).getByText("New thread")).toBeTruthy();
    expect(within(convo).getByText("4 at risk")).toBeTruthy();
    const context = screen.getByRole("complementary", { name: "Context" });
    expect(within(context).getByText("1 of 2")).toBeTruthy();
    expect(within(context).getByRole("link", { name: "Connect" }).getAttribute("href")).toBe(
      "/settings?tab=integrations"
    );
  });

  it("puts a starter prompt in the composer", () => {
    renderView();
    fireEvent.click(screen.getByRole("button", { name: /Deal prioritization/ }));
    expect((screen.getByLabelText("Ask Sentinel") as HTMLTextAreaElement).value).toBe(
      "Which deals should I prioritize this week?"
    );
  });

  it("sends a question in the chosen mode and shows the answer", async () => {
    const fetchMock = vi.fn(async () => answer("Meridian Health first."));
    vi.stubGlobal("fetch", fetchMock);
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Research" }));
    fireEvent.change(screen.getByLabelText("Ask Sentinel"), {
      target: { value: "Where should I push?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Meridian Health first.")).toBeTruthy();
    expect(actions.createChat).toHaveBeenCalledWith("Where should I push?");
    expect(actions.saveChatMessage).toHaveBeenCalledTimes(2);
    const body = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(body.mode).toBe("RESEARCH");
    const threads = screen.getByRole("complementary", { name: "Threads" });
    await waitFor(() => expect(within(threads).getByText("Where should I push?")).toBeTruthy());
  });

  it("puts the question back when the answer fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 500 })));
    vi.spyOn(console, "error").mockImplementation(() => {});
    renderView();
    fireEvent.change(screen.getByLabelText("Ask Sentinel"), { target: { value: "Hello" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect((screen.getByLabelText("Ask a follow-up") as HTMLTextAreaElement).value).toBe("Hello");
  });

  it("loads a thread when it is picked", async () => {
    actions.getChatMessages.mockResolvedValue([
      { id: "m1", role: "user", content: "Which deals first?", createdAt: NOW },
      { id: "m2", role: "assistant", content: "**Meridian Health** leads.", createdAt: NOW },
    ]);
    renderView();
    const threads = screen.getByRole("complementary", { name: "Threads" });
    fireEvent.click(within(threads).getByText("Which deals should I prioritize this week?"));
    expect(await screen.findByText("Which deals first?")).toBeTruthy();
    expect(actions.getChatMessages).toHaveBeenCalledWith("s1");
    const convo = screen.getByRole("region", { name: "Conversation" });
    expect(within(convo).getByRole("heading", { name: "Which deals should I prioritize this week?" })).toBeTruthy();
  });

  it("opens a thread from the recent answers", async () => {
    renderView();
    fireEvent.click(screen.getByRole("button", { name: /Oct 19 · Research/ }));
    await waitFor(() => expect(actions.getChatMessages).toHaveBeenCalledWith("s2"));
  });

  it("deletes a thread after confirming", async () => {
    renderView();
    fireEvent.click(
      screen.getByRole("button", { name: "Delete thread: Summarize the Meridian Health calls" })
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete thread" }));
    await waitFor(() => expect(actions.deleteChat).toHaveBeenCalledWith("s2"));
    const threads = screen.getByRole("complementary", { name: "Threads" });
    await waitFor(() =>
      expect(within(threads).queryByText("Summarize the Meridian Health calls")).toBeNull()
    );
  });
});

describe("SidebarThreads", () => {
  it("lists the threads and opens one in the conversation", async () => {
    actions.getChatMessages.mockResolvedValue([
      { id: "m1", role: "user", content: "Which deals first?", createdAt: NOW },
    ]);
    const sidebar = renderWithSidebar();
    expect(within(sidebar).getByText("Today")).toBeTruthy();
    expect(within(sidebar).getByText("Summarize the Meridian Health calls")).toBeTruthy();

    fireEvent.click(within(sidebar).getByText("Which deals should I prioritize this week?"));
    expect(await screen.findByText("Which deals first?")).toBeTruthy();
    expect(actions.getChatMessages).toHaveBeenCalledWith("s1");
    const convo = screen.getByRole("region", { name: "Conversation" });
    expect(within(convo).getByRole("heading", { name: "Which deals should I prioritize this week?" })).toBeTruthy();
    expect(
      within(sidebar).getByText("Which deals should I prioritize this week?").closest("li")?.getAttribute("aria-current")
    ).toBe("true");
  });

  it("starts a new thread from the sidebar", async () => {
    const sidebar = renderWithSidebar();
    fireEvent.click(within(sidebar).getByText("Summarize the Meridian Health calls"));
    await waitFor(() => expect(actions.getChatMessages).toHaveBeenCalledWith("s2"));
    fireEvent.click(within(sidebar).getByRole("button", { name: "New" }));
    const convo = screen.getByRole("region", { name: "Conversation" });
    await waitFor(() => expect(within(convo).getByText("New thread")).toBeTruthy());
  });

  it("filters both thread lists from the sidebar search", () => {
    const sidebar = renderWithSidebar();
    fireEvent.change(within(sidebar).getByLabelText("Search threads"), { target: { value: "meridian" } });
    expect(within(sidebar).queryByText("Which deals should I prioritize this week?")).toBeNull();
    expect(within(sidebar).getByText("Summarize the Meridian Health calls")).toBeTruthy();
    const page = screen.getByRole("complementary", { name: "Threads" });
    expect(within(page).queryByText("Which deals should I prioritize this week?")).toBeNull();

    fireEvent.change(within(sidebar).getByLabelText("Search threads"), { target: { value: "zzz" } });
    expect(within(sidebar).getByText("No threads match that search.")).toBeTruthy();
  });

  it("deletes a thread from the sidebar after confirming", async () => {
    const sidebar = renderWithSidebar();
    fireEvent.click(
      within(sidebar).getByRole("button", { name: "Delete thread: Summarize the Meridian Health calls" })
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete thread" }));
    await waitFor(() => expect(actions.deleteChat).toHaveBeenCalledWith("s2"));
    await waitFor(() =>
      expect(within(sidebar).queryByText("Summarize the Meridian Health calls")).toBeNull()
    );
    const page = screen.getByRole("complementary", { name: "Threads" });
    expect(within(page).queryByText("Summarize the Meridian Health calls")).toBeNull();
  });
});
