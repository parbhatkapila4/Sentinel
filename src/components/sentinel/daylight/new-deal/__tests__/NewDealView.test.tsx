import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { NewDealView, type NewDealServices } from "../NewDealView";
import { MAX_VALUE_MESSAGE } from "../model";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  track: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: vi.fn() }),
  usePathname: () => "/deals/new",
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("sonner", () => ({
  toast: { error: (message: string) => mocks.toastError(message), success: vi.fn() },
}));

vi.mock("@/lib/analytics-client", () => ({
  ANALYTICS_EVENTS: { DEAL_CREATED: "deal_created" },
  trackEvent: (name: string) => mocks.track(name),
}));

vi.mock("@/app/actions/deals", () => ({ createDeal: vi.fn() }));
vi.mock("@/app/actions/teams", () => ({ getTeamMembers: vi.fn() }));

const TEAMS = [{ id: "t1", name: "Revenue Desk" }];
const MEMBERS = [
  { id: "m1", userId: "u1", user: { name: "Maya", surname: "Chen", email: "maya@example.com" } },
  { id: "m2", userId: "u2", user: { name: null, surname: null, email: "sam@example.com" } },
];

function setup(overrides: Partial<NewDealServices> = {}) {
  const services: NewDealServices = {
    createDeal: vi.fn(async () => ({ id: "d42" })),
    loadTeams: vi.fn(async () => TEAMS),
    loadMembers: vi.fn(async () => MEMBERS),
    ...overrides,
  };
  render(<NewDealView services={services} />);
  return services;
}

const nameField = () => screen.getByRole("textbox", { name: "Deal name" });
const valueField = () => screen.getByRole("textbox", { name: "Value in US dollars" });
const submit = () => fireEvent.click(screen.getByRole("button", { name: "Create deal" }));
const errorText = () => screen.getByRole("alert").textContent;

function sent(services: NewDealServices): Record<string, string> {
  const formData = vi.mocked(services.createDeal).mock.calls[0][0];
  return Object.fromEntries(formData.entries()) as Record<string, string>;
}

beforeEach(() => {
  mocks.push.mockReset();
  mocks.track.mockReset();
  mocks.toastError.mockReset();
});

afterEach(() => cleanup());

describe("NewDealView", () => {
  it("asks for a name, a stage and a value, in that order, before saving", async () => {
    const services = setup();

    submit();
    expect(errorText()).toBe("Please enter a deal name");

    fireEvent.change(nameField(), { target: { value: "Acme Corp" } });
    submit();
    expect(errorText()).toBe("Please select a stage");

    fireEvent.click(screen.getByRole("radio", { name: /Proposal/ }));
    submit();
    expect(errorText()).toBe("Please enter a valid deal value");

    fireEvent.change(valueField(), { target: { value: "0" } });
    submit();
    expect(errorText()).toBe("Please enter a valid deal value");

    expect(services.createDeal).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("keeps only digits in the value and shows thousands separators", () => {
    setup();
    fireEvent.change(valueField(), { target: { value: "1250000" } });
    expect(valueField()).toHaveValue("1,250,000");

    fireEvent.change(valueField(), { target: { value: "1,250,000x" } });
    expect(valueField()).toHaveValue("1,250,000");
  });

  it("refuses a value over 20 billion and keeps the last one", () => {
    setup();
    fireEvent.change(valueField(), { target: { value: "125000" } });
    fireEvent.change(valueField(), { target: { value: "25,000,000,000" } });
    expect(valueField()).toHaveValue("125,000");
    expect(errorText()).toBe(MAX_VALUE_MESSAGE);

    fireEvent.change(valueField(), { target: { value: "12500" } });
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("creates the deal from every field and opens its page", async () => {
    const services = setup();
    await screen.findByRole("combobox", { name: "Team" });

    fireEvent.change(nameField(), { target: { value: "  Acme Corp  " } });
    fireEvent.change(valueField(), { target: { value: "125000" } });
    fireEvent.click(screen.getByRole("radio", { name: /Negotiation/ }));
    fireEvent.click(screen.getByRole("radio", { name: /Outbound/ }));
    fireEvent.change(screen.getByRole("combobox", { name: "Location" }), {
      target: { value: "Canada" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Team" }), {
      target: { value: "t1" },
    });
    const assignee = await screen.findByRole("combobox", { name: "Assign to" });
    expect(within(assignee).getByRole("option", { name: "Maya Chen" })).toBeInTheDocument();
    expect(within(assignee).getByRole("option", { name: "sam@example.com" })).toBeInTheDocument();
    fireEvent.change(assignee, { target: { value: "u1" } });

    submit();

    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/deals/d42"));
    expect(services.loadMembers).toHaveBeenCalledWith("t1");
    expect(sent(services)).toEqual({
      name: "Acme Corp",
      stage: "negotiation",
      value: "125000",
      channel: "outbound",
      location: "Canada",
      teamId: "t1",
      assignedToId: "u1",
    });
    expect(mocks.track).toHaveBeenCalledWith("deal_created");
  });

  it("sends only what was filled in, with the channel defaulting to direct", async () => {
    const services = setup({ loadTeams: vi.fn(async () => []) });

    fireEvent.change(nameField(), { target: { value: "Northwind" } });
    fireEvent.change(valueField(), { target: { value: "9000" } });
    fireEvent.click(screen.getByRole("radio", { name: /Discovery/ }));
    submit();

    await waitFor(() => expect(services.createDeal).toHaveBeenCalledTimes(1));
    expect(sent(services)).toEqual({
      name: "Northwind",
      stage: "discover",
      value: "9000",
      channel: "direct",
    });
  });

  it("shows the reason and stays on the page when saving fails", async () => {
    const reason = 'A deal named "Acme Corp" already exists. Please choose a different name.';
    const services = setup({ createDeal: vi.fn(async () => Promise.reject(new Error(reason))) });

    fireEvent.change(nameField(), { target: { value: "Acme Corp" } });
    fireEvent.change(valueField(), { target: { value: "5000" } });
    fireEvent.click(screen.getByRole("radio", { name: /Proposal/ }));
    submit();

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(reason));
    expect(services.createDeal).toHaveBeenCalledTimes(1);
    expect(mocks.toastError).toHaveBeenCalledWith(reason);
    expect(mocks.push).not.toHaveBeenCalled();
    expect(mocks.track).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Create deal" })).toBeEnabled()
    );
  });

  it("drops the assignee when the team changes back to personal", async () => {
    const services = setup();
    const team = await screen.findByRole("combobox", { name: "Team" });
    fireEvent.change(team, { target: { value: "t1" } });
    fireEvent.change(await screen.findByRole("combobox", { name: "Assign to" }), {
      target: { value: "u2" },
    });
    fireEvent.change(team, { target: { value: "" } });
    expect(screen.queryByRole("combobox", { name: "Assign to" })).toBeNull();

    fireEvent.change(nameField(), { target: { value: "Orbit Freight" } });
    fireEvent.change(valueField(), { target: { value: "70000" } });
    fireEvent.click(screen.getByRole("radio", { name: /Qualification/ }));
    submit();

    await waitFor(() => expect(services.createDeal).toHaveBeenCalledTimes(1));
    expect(sent(services)).not.toHaveProperty("teamId");
    expect(sent(services)).not.toHaveProperty("assignedToId");
  });

  it("leaves out the team fields for someone with no teams", async () => {
    const services = setup({ loadTeams: vi.fn(async () => []) });
    await waitFor(() => expect(services.loadTeams).toHaveBeenCalled());
    expect(screen.queryByRole("combobox", { name: "Team" })).toBeNull();
    expect(screen.getByText("Where the deal is based.")).toBeInTheDocument();
  });

  it("previews the deal as it is typed", async () => {
    setup();
    const preview = screen.getByRole("complementary", { name: "Preview" });
    expect(within(preview).getByText("Deal name")).toBeInTheDocument();
    expect(within(preview).getAllByText("Not set")).toHaveLength(2);

    fireEvent.change(nameField(), { target: { value: "Acme Corp" } });
    fireEvent.change(valueField(), { target: { value: "125000" } });
    fireEvent.click(screen.getByRole("radio", { name: /Closed won/ }));
    fireEvent.change(await screen.findByRole("combobox", { name: "Team" }), {
      target: { value: "t1" },
    });

    expect(within(preview).getByText("Acme Corp")).toBeInTheDocument();
    expect(within(preview).getByText("Revenue Desk · Direct")).toBeInTheDocument();
    expect(within(preview).getByText("Closed won")).toBeInTheDocument();
    expect(within(preview).getByText("$125,000")).toBeInTheDocument();
  });
});
