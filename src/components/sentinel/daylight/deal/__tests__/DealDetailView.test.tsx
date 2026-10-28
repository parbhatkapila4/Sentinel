import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { DealDetailView } from "../DealDetailView";
import { buildDealView, type DealDetailInput } from "../model";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  updateDealStage: vi.fn(),
  deleteDeal: vi.fn(),
  createDealEvent: vi.fn(),
  createMeetingForDeal: vi.fn(),
  generateDealSummary: vi.fn(),
  generateFollowUpEmail: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
  usePathname: () => "/deals/d1",
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/app/actions/deals", () => ({
  updateDealStage: (...args: unknown[]) => mocks.updateDealStage(...args),
  deleteDeal: (...args: unknown[]) => mocks.deleteDeal(...args),
}));
vi.mock("@/app/actions/events", () => ({
  createDealEvent: (...args: unknown[]) => mocks.createDealEvent(...args),
}));
vi.mock("@/app/actions/google-calendar", () => ({
  createMeetingForDeal: (...args: unknown[]) => mocks.createMeetingForDeal(...args),
}));
vi.mock("@/app/actions/ai", () => ({
  generateDealSummary: (...args: unknown[]) => mocks.generateDealSummary(...args),
  generateFollowUpEmail: (...args: unknown[]) => mocks.generateFollowUpEmail(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (message: string) => mocks.toastSuccess(message),
    error: (message: string) => mocks.toastError(message),
  },
}));

const NOW = new Date(2026, 9, 27, 14, 5).getTime();
const at = (month: number, day: number, hour = 10) => new Date(2026, month, day, hour);

const DEAL: DealDetailInput = {
  id: "d1",
  name: "Meridian Health",
  stage: "negotiation",
  value: 310_000,
  status: "at_risk",
  riskScore: 0.66,
  riskReasons: ["Negotiation stalled without response", "High value deal requires attention"],
  primaryRiskReason: "Negotiation stalled without response",
  recommendedAction: { label: "Nudge for response", urgency: "high" },
  riskAgeInDays: 9,
  actionDueAt: at(9, 26, 9),
  actionOverdueByDays: 1,
  isActionOverdue: true,
  lastActivityAt: at(9, 18),
  createdAt: at(7, 30, 9),
  isDemo: false,
  source: "hubspot",
  channel: "outbound",
  location: "United States",
  team: { id: "t1", name: "Revenue Desk" },
  assignedTo: { name: "Maya", surname: "Chen", email: "maya@example.com" },
  timeline: [
    { id: "1", eventType: "stage_changed", metadata: { stage: "discover" }, createdAt: at(7, 30, 9) },
    { id: "2", eventType: "stage_changed", metadata: { stage: "negotiation" }, createdAt: at(9, 6) },
    { id: "3", eventType: "event_created", metadata: { eventType: "email_received" }, createdAt: at(9, 18) },
  ],
  events: [],
};

const BRIEF = "STATUS\n\nIn Negotiation for 21 days.\n\nNEXT\n\nSend the order form.";

function renderView(deal: DealDetailInput = DEAL, props: Partial<Parameters<typeof DealDetailView>[0]> = {}) {
  const view = buildDealView({ deal, book: [], meetings: [], calendarConnected: true }, NOW);
  return render(
    <div className="sentinel-daylight">
      <main>
        <DealDetailView view={view} initialSummary={BRIEF} {...props} />
      </main>
    </div>
  );
}

beforeEach(() => {
  Object.values(mocks).forEach((m) => m.mockReset());
});

afterEach(() => cleanup());

describe("DealDetailView", () => {
  it("shows the next step for an at-risk deal", () => {
    renderView();
    const panel = screen.getByRole("region", { name: "Next step and risk" });
    expect(within(panel).getByText("Nudge for response")).toBeInTheDocument();
    expect(within(panel).getByText("1 day overdue")).toBeInTheDocument();
    expect(within(panel).getByText("1 day late")).toBeInTheDocument();
    expect(within(panel).getByText("High urgency")).toBeInTheDocument();
    expect(within(panel).getByText("Negotiation stalled without response")).toBeInTheDocument();
  });

  it("reports a failed activity log instead of failing silently", async () => {
    mocks.createDealEvent.mockRejectedValue(new Error("Deal not found"));
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Email sent" }));
    await waitFor(() =>
      expect(mocks.toastError).toHaveBeenCalledWith('Could not log "Email sent": Deal not found')
    );
    expect(mocks.createDealEvent).toHaveBeenCalledWith("d1", "email_sent", {});
    expect(mocks.refresh).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Email sent" })).not.toBeDisabled();
  });

  it("refreshes the page after an activity is logged", async () => {
    mocks.createDealEvent.mockResolvedValue({ success: true });
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Meeting held" }));
    await waitFor(() => expect(mocks.refresh).toHaveBeenCalled());
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  it("names stages in the activity list instead of showing raw values", () => {
    renderView({
      ...DEAL,
      timeline: [
        ...DEAL.timeline,
        { id: "4", eventType: "stage_changed", metadata: { stage: "closed_won" }, createdAt: at(9, 26) },
      ],
    });
    const activity = screen.getByRole("region", { name: "Activity" });
    expect(within(activity).getByText("Moved to Closed won")).toBeInTheDocument();
    expect(within(activity).getByText("Added in Discovery")).toBeInTheDocument();
    expect(activity.textContent).not.toMatch(/closed_won|negotiation\b/);
  });

  it("puts the stage back and says so when a stage change fails", async () => {
    mocks.updateDealStage.mockRejectedValue(new Error("You cannot edit this deal"));
    renderView();
    const select = screen.getByLabelText("Stage") as HTMLSelectElement;
    expect(select.value).toBe("negotiation");
    fireEvent.change(select, { target: { value: "proposal" } });
    await waitFor(() =>
      expect(mocks.toastError).toHaveBeenCalledWith("The stage did not change: You cannot edit this deal")
    );
    expect(select.value).toBe("negotiation");
    expect(mocks.updateDealStage).toHaveBeenCalledWith("d1", "proposal");
  });

  it("deletes only after DELETE is typed, then goes to all deals", async () => {
    mocks.deleteDeal.mockResolvedValue({ success: true });
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Delete deal" }));
    const dialog = screen.getByRole("dialog");
    const confirm = within(dialog).getByRole("button", { name: "Delete deal" });
    expect(confirm).toBeDisabled();
    fireEvent.change(within(dialog).getByPlaceholderText("DELETE"), { target: { value: "DELETE" } });
    fireEvent.click(confirm);
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/deals"));
    expect(mocks.deleteDeal).toHaveBeenCalledWith("d1");
  });

  it("has no delete for a demo deal", () => {
    renderView({ ...DEAL, isDemo: true });
    expect(screen.queryByRole("button", { name: "Delete deal" })).toBeNull();
  });

  it("writes the summary on load and offers a retry when it fails", async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error("Sentinel AI is busy")).mockResolvedValueOnce(BRIEF);
    renderView(DEAL, { initialSummary: undefined, loadSummary: load });
    expect(await screen.findByText("Sentinel AI is busy")).toBeInTheDocument();
    expect(load).toHaveBeenCalledWith("d1");
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("Send the order form.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Next" })).toBeInTheDocument();
    expect(mocks.generateDealSummary).not.toHaveBeenCalled();
  });

  it("does not call Sentinel AI when a brief is passed in", () => {
    renderView();
    expect(screen.getByText("In Negotiation for 21 days.")).toBeInTheDocument();
    expect(mocks.generateDealSummary).not.toHaveBeenCalled();
  });

  it("checks the meeting form, then adds the meeting to the list", async () => {
    mocks.createMeetingForDeal.mockImplementation(async (_id: string, details: { title: string; startTime: Date; endTime: Date }) => ({
      id: "m1",
      title: details.title,
      startTime: details.startTime,
      endTime: details.endTime,
    }));
    renderView();
    fireEvent.click(screen.getAllByRole("button", { name: "Add meeting" })[0]);
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Add meeting" }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Fill in the title, date, start and end.");
    expect(mocks.createMeetingForDeal).not.toHaveBeenCalled();

    const inputs = dialog.querySelectorAll("input");
    fireEvent.change(inputs[0], { target: { value: "Pricing review" } });
    fireEvent.change(inputs[1], { target: { value: "2099-10-29" } });
    fireEvent.change(inputs[2], { target: { value: "15:00" } });
    fireEvent.change(inputs[3], { target: { value: "14:00" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Add meeting" }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("The meeting has to end after it starts.");

    fireEvent.change(inputs[3], { target: { value: "16:00" } });
    fireEvent.change(inputs[5], { target: { value: "Zoom" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Add meeting" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(mocks.createMeetingForDeal).toHaveBeenCalledWith(
      "d1",
      expect.objectContaining({ title: "Pricing review", location: "Zoom" })
    );
    const meetings = screen.getByRole("region", { name: "Meetings" });
    expect(within(meetings).getByText("Pricing review")).toBeInTheDocument();
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Meeting added");
  });

  it("only drafts a follow-up email when asked", async () => {
    mocks.generateFollowUpEmail.mockResolvedValue({
      subject: "Order form",
      body: "Hi there",
      suggestedSendTime: new Date(),
    });
    renderView();
    fireEvent.click(screen.getByRole("button", { name: "Draft follow-up" }));
    const dialog = screen.getByRole("dialog");
    expect(mocks.generateFollowUpEmail).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: "Draft email" }));
    expect(await within(dialog).findByDisplayValue("Order form")).toBeInTheDocument();
    expect(mocks.generateFollowUpEmail).toHaveBeenCalledWith("d1", "professional", { logToTimeline: true });

    fireEvent.click(within(dialog).getByRole("button", { name: "Friendly" }));
    await waitFor(() =>
      expect(mocks.generateFollowUpEmail).toHaveBeenLastCalledWith("d1", "friendly", { logToTimeline: false })
    );
  });
});
