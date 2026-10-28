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
import { WEBHOOK_URL_HTTPS_MESSAGE } from "@/lib/webhook-url";
import { WebhooksView } from "../WebhooksView";
import { WebhookDetailView } from "../WebhookDetailView";
import type { WebhookDetail, WebhookListItem } from "../model";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  createWebhook: vi.fn(),
  updateWebhook: vi.fn(),
  deleteWebhook: vi.fn(),
  getMyWebhooks: vi.fn(),
  getWebhookById: vi.fn(),
  testWebhook: vi.fn(),
  regenerateWebhookSecret: vi.fn(),
  revealWebhookSecret: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (message: string) => mocks.toastSuccess(message),
    error: (message: string) => mocks.toastError(message),
  },
}));

vi.mock("@/app/actions/webhooks", () => ({
  createWebhook: (...a: unknown[]) => mocks.createWebhook(...a),
  updateWebhook: (...a: unknown[]) => mocks.updateWebhook(...a),
  deleteWebhook: (...a: unknown[]) => mocks.deleteWebhook(...a),
  getMyWebhooks: (...a: unknown[]) => mocks.getMyWebhooks(...a),
  getWebhookById: (...a: unknown[]) => mocks.getWebhookById(...a),
  testWebhook: (...a: unknown[]) => mocks.testWebhook(...a),
  regenerateWebhookSecret: (...a: unknown[]) => mocks.regenerateWebhookSecret(...a),
  revealWebhookSecret: (...a: unknown[]) => mocks.revealWebhookSecret(...a),
}));

const NOW = Date.UTC(2026, 9, 27, 14, 5);
const MIN = 60_000;

function hook(overrides: Partial<WebhookListItem> = {}): WebhookListItem {
  return {
    id: "wh-1",
    name: "Production relay",
    url: "https://hooks.acme.io/sentinel/events",
    events: ["deal.created", "deal.stage_changed", "deal.at_risk"],
    isActive: true,
    createdAt: new Date(NOW - 40 * 86_400_000),
    _count: { deliveries: 128 },
    ...overrides,
  };
}

const PAUSED = hook({
  id: "wh-2",
  name: "Staging relay",
  url: "https://webhook.site/abc",
  events: ["deal.created"],
  isActive: false,
  _count: { deliveries: 1 },
});

function detail(overrides: Partial<WebhookDetail> = {}): WebhookDetail {
  return {
    ...hook(),
    deliveries: [
      { id: "d1", event: "deal.stage_changed", statusCode: 200, response: "OK", success: true, createdAt: new Date(NOW - 5 * MIN), isTest: false },
      { id: "d2", event: "deal.created", statusCode: 500, response: "Internal Server Error: upstream timed out", success: false, createdAt: new Date(NOW - 26 * 60 * MIN), isTest: false },
      { id: "d3", event: "deal.created", statusCode: 200, response: null, success: true, createdAt: new Date(NOW - 27 * 60 * MIN), isTest: true },
      { id: "d4", event: "deal.at_risk", statusCode: null, response: "connect ECONNREFUSED", success: false, createdAt: new Date(NOW - 3 * 86_400_000), isTest: false },
    ],
    ...overrides,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function renderList(webhooks: WebhookListItem[] = [hook(), PAUSED]) {
  return render(
    <div className="sentinel-daylight">
      <WebhooksView initialWebhooks={webhooks} />
    </div>
  );
}

function renderDetail(webhook: WebhookDetail = detail()) {
  return render(
    <div className="sentinel-daylight">
      <WebhookDetailView initialWebhook={webhook} nowMs={NOW} />
    </div>
  );
}

const table = () => screen.getByRole("table", { name: "Your webhooks" });
const row = (name: string) =>
  within(table())
    .getAllByRole("row")
    .find((r) => r.textContent?.includes(name))!;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getMyWebhooks.mockResolvedValue([hook(), PAUSED]);
  mocks.getWebhookById.mockResolvedValue(detail());
});

afterEach(() => {
  cleanup();
});

describe("webhooks list", () => {
  it("shows each webhook's status, events and deliveries, with no arrow links", () => {
    renderList();
    const live = row("Production relay");
    expect(within(live).getByText("hooks.acme.io")).toBeInTheDocument();
    expect(within(live).getAllByText("Live").length).toBeGreaterThan(0);
    expect(within(live).getByText("3 events")).toBeInTheDocument();
    expect(within(live).getByText("128")).toBeInTheDocument();
    expect(within(live).getByRole("link", { name: "Open" })).toHaveAttribute(
      "href",
      "/settings/webhooks/wh-1"
    );
    expect(within(live).getByRole("link", { name: /Production relay/ })).toHaveAttribute(
      "href",
      "/settings/webhooks/wh-1"
    );
    expect(document.body.textContent).not.toMatch(/[\u2190-\u21ff\u2794-\u27bf]/);
  });

  it("spells the delivery count properly", () => {
    renderList();
    expect(row("Production relay").textContent).toContain("128 deliveries");
    expect(row("Staging relay").textContent).toContain("1 delivery");
    expect(document.body.textContent).not.toContain("DELIVERY");
    expect(document.body.textContent).not.toContain("·S");
  });

  it("does not offer a test send for a paused webhook", () => {
    renderList();
    expect(within(row("Production relay")).getByRole("button", { name: /^Send test/ })).toBeEnabled();
    expect(within(row("Staging relay")).getByRole("button", { name: /^Send test/ })).toBeDisabled();
  });

  it("asks first, shows the delete as busy, then drops the row", async () => {
    const pending = deferred<void>();
    mocks.deleteWebhook.mockReturnValue(pending.promise);
    mocks.getMyWebhooks.mockResolvedValue([PAUSED]);
    renderList();

    fireEvent.click(screen.getByRole("button", { name: "Delete Production relay" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Production relay")).toBeInTheDocument();
    expect(mocks.deleteWebhook).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole("button", { name: "Delete webhook" }));
    expect(mocks.deleteWebhook).toHaveBeenCalledWith("wh-1");
    expect(within(dialog).getByRole("button", { name: "Deleting" })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Delete Production relay" })).toBeDisabled();

    pending.resolve();
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.queryByText("Production relay")).toBeNull();
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Webhook deleted");
    expect(mocks.getMyWebhooks).toHaveBeenCalled();
    expect(screen.getByText("1 webhook")).toBeInTheDocument();
  });

  it("keeps the dialog open with the reason when the delete fails", async () => {
    mocks.deleteWebhook.mockRejectedValue(new Error("Webhook is locked"));
    renderList();

    fireEvent.click(screen.getByRole("button", { name: "Delete Production relay" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Delete webhook" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Webhook is locked");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(row("Production relay")).toBeDefined();
  });

  it("keeps the add form on the page and checks the URL before saving", async () => {
    mocks.createWebhook.mockResolvedValue({ id: "wh-3" });
    renderList();
    const form = screen.getByRole("region", { name: "Add a webhook" });

    fireEvent.change(within(form).getByLabelText(/^Name/), { target: { value: "Ops feed" } });
    fireEvent.change(within(form).getByLabelText(/^Endpoint URL/), {
      target: { value: "http://ops.example.com/hook" },
    });
    fireEvent.click(within(form).getByLabelText("Deal at risk"));
    fireEvent.click(within(form).getByLabelText("Deal created"));
    fireEvent.click(within(form).getByRole("button", { name: "Create webhook" }));
    expect(mocks.toastError).toHaveBeenCalledWith(WEBHOOK_URL_HTTPS_MESSAGE);
    expect(mocks.createWebhook).not.toHaveBeenCalled();

    fireEvent.change(within(form).getByLabelText(/^Endpoint URL/), {
      target: { value: "https://ops.example.com/hook" },
    });
    fireEvent.click(within(form).getByRole("button", { name: "Create webhook" }));

    await waitFor(() =>
      expect(mocks.createWebhook).toHaveBeenCalledWith({
        name: "Ops feed",
        url: "https://ops.example.com/hook",
        events: ["deal.created", "deal.at_risk"],
      })
    );
    await waitFor(() => expect(mocks.getMyWebhooks).toHaveBeenCalled());
    expect(within(form).getByLabelText(/^Name/)).toHaveValue("");
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Webhook created");
  });

  it("asks for at least one event", () => {
    renderList();
    const form = screen.getByRole("region", { name: "Add a webhook" });
    fireEvent.change(within(form).getByLabelText(/^Name/), { target: { value: "Ops feed" } });
    fireEvent.change(within(form).getByLabelText(/^Endpoint URL/), {
      target: { value: "https://ops.example.com/hook" },
    });
    fireEvent.click(within(form).getByRole("button", { name: "Create webhook" }));
    expect(mocks.toastError).toHaveBeenCalledWith("Select at least one event");
    expect(mocks.createWebhook).not.toHaveBeenCalled();
  });

  it("shows the empty state with the form under it", () => {
    renderList([]);
    expect(screen.getByText("No webhooks yet")).toBeInTheDocument();
    expect(screen.getByText(/The line is/)).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByRole("link", { name: "New webhook" })).toBeNull();
    expect(screen.getByRole("region", { name: "Add a webhook" })).toBeInTheDocument();
  });
});

describe("webhook detail", () => {
  it("keeps the secret off the page until Reveal", async () => {
    mocks.revealWebhookSecret.mockResolvedValue("4f0c-signing-secret");
    renderDetail();

    expect(document.body.textContent).not.toContain("4f0c-signing-secret");
    fireEvent.click(screen.getByRole("button", { name: "Reveal" }));
    expect(await screen.findByText("4f0c-signing-secret")).toBeInTheDocument();
    expect(mocks.revealWebhookSecret).toHaveBeenCalledWith("wh-1");

    fireEvent.click(screen.getByRole("button", { name: "Hide" }));
    expect(screen.queryByText("4f0c-signing-secret")).toBeNull();
  });

  it("regenerates only after asking, then shows the new secret", async () => {
    mocks.regenerateWebhookSecret.mockResolvedValue("new-secret-value");
    renderDetail();

    fireEvent.click(screen.getByRole("button", { name: "Regenerate" }));
    const dialog = screen.getByRole("dialog");
    expect(mocks.regenerateWebhookSecret).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: "Regenerate secret" }));

    expect(await screen.findByText("new-secret-value")).toBeInTheDocument();
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Secret regenerated");
  });

  it("names test sends and shows failures plainly", () => {
    renderDetail();
    const deliveries = screen.getByRole("table", { name: "Recent deliveries" });
    const rows = within(deliveries).getAllByRole("row").slice(1);
    expect(rows.map((r) => within(r).getAllByRole("cell")[1].textContent)).toEqual([
      "Stage changed",
      "Deal created",
      "Test delivery",
      "Deal at risk",
    ]);
    expect(rows.map((r) => within(r).getAllByRole("cell")[0].textContent)).toEqual([
      "200",
      "500",
      "200",
      "Failed",
    ]);
    expect(rows.map((r) => within(r).getAllByRole("cell")[3].textContent)).toEqual([
      "5 minutes ago",
      "Yesterday",
      "Yesterday",
      "3 days ago",
    ]);
    expect(screen.getByText("3 events, 128 deliveries.")).toBeInTheDocument();
  });

  it("does not offer a test send while paused", () => {
    renderDetail(detail({ isActive: false }));
    expect(screen.getByRole("button", { name: "Send test" })).toBeDisabled();
    expect(screen.getAllByText("Paused").length).toBeGreaterThan(0);
  });

  it("shows the delete as busy, then returns to the list", async () => {
    const pending = deferred<void>();
    mocks.deleteWebhook.mockReturnValue(pending.promise);
    renderDetail();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete webhook" }));
    expect(within(dialog).getByRole("button", { name: "Deleting" })).toBeDisabled();
    expect(mocks.push).not.toHaveBeenCalled();

    pending.resolve();
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/settings/webhooks"));
  });

  it("edits in place with the Active switch", async () => {
    mocks.updateWebhook.mockResolvedValue({ count: 1 });
    mocks.getWebhookById.mockResolvedValue(detail({ isActive: false }));
    renderDetail();

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const active = screen.getByRole("switch", { name: "Active" });
    expect(active).toHaveAttribute("aria-checked", "true");
    fireEvent.click(active);
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() =>
      expect(mocks.updateWebhook).toHaveBeenCalledWith("wh-1", {
        name: "Production relay",
        url: "https://hooks.acme.io/sentinel/events",
        events: ["deal.created", "deal.stage_changed", "deal.at_risk"],
        isActive: false,
      })
    );
    await waitFor(() => expect(screen.queryByRole("switch")).toBeNull());
    expect(screen.getAllByText("Paused").length).toBeGreaterThan(0);
  });
});
