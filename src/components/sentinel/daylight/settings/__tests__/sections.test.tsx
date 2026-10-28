import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef, type ReactNode } from "react";

const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
const exportDeals = vi.hoisted(() => vi.fn());

vi.mock("sonner", () => ({ toast }));
vi.mock("@/components/export-button", () => ({ downloadDealsExport: exportDeals }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import {
  BillingSettings,
  DangerSettings,
  IntegrationSettings,
  NotificationSettingsSection,
  ProfileSettings,
  RiskSettingsSection,
  SecuritySettings,
  TeamSettings,
} from "../sections";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const PROFILE = {
  name: "Avery",
  surname: "Stone",
  email: "avery@example.com",
  company: "Northwind",
  role: "manager",
  imageUrl: "",
};

describe("ProfileSettings", () => {
  function renderProfile(dirty = false) {
    const onChange = vi.fn();
    const onSave = vi.fn();
    const onDiscard = vi.fn();
    render(
      <ProfileSettings
        profile={PROFILE}
        onChange={onChange}
        avatarPreview={null}
        fileInputRef={createRef<HTMLInputElement>()}
        onImageUpload={vi.fn()}
        initials="AS"
        dirty={dirty}
        saving={false}
        onSave={onSave}
        onDiscard={onDiscard}
      />
    );
    return { onChange, onSave, onDiscard };
  }

  it("labels the first field First name and locks the email", () => {
    renderProfile();
    expect((screen.getByLabelText("First name") as HTMLInputElement).value).toBe("Avery");
    expect((screen.getByLabelText("Email") as HTMLInputElement).readOnly).toBe(true);
    expect((screen.getByLabelText("Role") as HTMLSelectElement).value).toBe("manager");
  });

  it("only shows the save row with unsaved changes", () => {
    renderProfile(false);
    expect(screen.queryByRole("button", { name: "Save changes" })).toBeNull();
    cleanup();
    const { onSave, onDiscard } = renderProfile(true);
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    expect(onSave).toHaveBeenCalled();
    expect(onDiscard).toHaveBeenCalled();
  });

  it("passes edits up", () => {
    const { onChange } = renderProfile();
    fireEvent.change(screen.getByLabelText("Company"), { target: { value: "Acme" } });
    expect(onChange).toHaveBeenCalledWith({ ...PROFILE, company: "Acme" });
  });
});

describe("SecuritySettings", () => {
  it("opens the Clerk account panel from every row", () => {
    const open = vi.fn();
    render(<SecuritySettings twoFactorEnabled={false} onOpenUserProfile={open} />);
    fireEvent.click(screen.getByRole("button", { name: "Change" }));
    fireEvent.click(screen.getByRole("button", { name: "Enable" }));
    fireEvent.click(screen.getByRole("button", { name: "Review" }));
    expect(open).toHaveBeenCalledTimes(3);
    expect(screen.getByText("Recommended")).toBeTruthy();
  });
});

describe("NotificationSettingsSection", () => {
  it("flips each preference", () => {
    const onChange = vi.fn();
    render(
      <NotificationSettingsSection
        value={{ emailAlerts: true, riskAlerts: false, dealUpdates: false }}
        onChange={onChange}
        dirty={false}
        saving={false}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
      />
    );
    const risk = screen.getByRole("switch", { name: "Risk alerts" });
    expect(risk.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(risk);
    expect(onChange).toHaveBeenCalledWith({ emailAlerts: true, riskAlerts: true, dealUpdates: false });
    fireEvent.click(screen.getByRole("switch", { name: "Action overdue alerts" }));
    expect(onChange).toHaveBeenLastCalledWith({ emailAlerts: false, riskAlerts: false, dealUpdates: false });
  });
});

describe("RiskSettingsSection", () => {
  function renderRisk(error: string | null = null) {
    const props = {
      value: { inactivityThresholdDays: 7, enableCompetitiveSignals: true },
      onChange: vi.fn(),
      error,
      onErrorChange: vi.fn(),
      championDormancy: false,
      onChampionDormancyChange: vi.fn(),
      stageStall: true,
      onStageStallChange: vi.fn(),
      dirty: true,
      saving: false,
      onSave: vi.fn(),
      onDiscard: vi.fn(),
    };
    render(<RiskSettingsSection {...props} />);
    return props;
  }

  it("keeps all four controls, champion dormancy included", () => {
    const props = renderRisk();
    expect(screen.getByRole("switch", { name: "Champion dormancy" })).toBeTruthy();
    fireEvent.click(screen.getByRole("switch", { name: "Stage-stall detection" }));
    expect(props.onStageStallChange).toHaveBeenCalledWith(false);
  });

  it("rejects a threshold outside 1 to 30", () => {
    const props = renderRisk();
    fireEvent.change(screen.getByLabelText("Inactivity threshold"), { target: { value: "45" } });
    expect(props.onErrorChange).toHaveBeenCalledWith("Value must be between 1 and 30 days");
    expect(props.onChange).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Inactivity threshold"), { target: { value: "10" } });
    expect(props.onChange).toHaveBeenCalledWith({ inactivityThresholdDays: 10, enableCompetitiveSignals: true });
  });

  it("blocks saving while the threshold is invalid", () => {
    renderRisk("Value must be between 1 and 30 days");
    expect(screen.getByRole("alert").textContent).toBe("Value must be between 1 and 30 days");
    expect((screen.getByRole("button", { name: "Save changes" }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("IntegrationSettings", () => {
  it("offers Manage when connected and Connect otherwise", () => {
    const onConnect = vi.fn();
    const onManage = vi.fn();
    const statuses = {
      hubspot: { connected: true, lastSyncAt: null },
      salesforce: { connected: false, lastSyncAt: null },
      gmail: { connected: false, lastSyncAt: null },
      googleCalendar: { connected: true, lastSyncAt: null },
      slack: { connected: false },
    } as unknown as Parameters<typeof IntegrationSettings>[0]["statuses"];
    render(
      <IntegrationSettings
        statuses={statuses}
        loading={false}
        connectedCount={2}
        logs={[]}
        onConnect={onConnect}
        onManage={onManage}
      />
    );
    expect(screen.getByText(/2 of 5 connected/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Manage HubSpot" }));
    fireEvent.click(screen.getByRole("button", { name: "Manage Google Calendar" }));
    fireEvent.click(screen.getByRole("button", { name: "Connect Gmail" }));
    fireEvent.click(screen.getByRole("button", { name: "Connect Slack" }));
    expect(onManage.mock.calls).toEqual([["hubspot"], ["googleCalendar"]]);
    expect(onConnect.mock.calls).toEqual([["gmail"], ["slack"]]);
    expect(screen.getByRole("link", { name: "Manage webhooks" }).getAttribute("href")).toBe("/settings/webhooks");
  });
});

describe("TeamSettings", () => {
  it("shows the signed-in person and opens the invite", () => {
    const onInvite = vi.fn();
    render(
      <TeamSettings
        name="Avery Stone"
        email="avery@example.com"
        joinedLabel="Joined Oct 2026"
        role="admin"
        initials="AS"
        imageUrl={null}
        teamMembersCount={1}
        teamMemberLimit={10}
        onInvite={onInvite}
      />
    );
    expect(screen.getByText("avery@example.com · Joined Oct 2026")).toBeTruthy();
    expect(screen.getByText("Admin")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Invite member" }));
    expect(onInvite).toHaveBeenCalled();
    expect(screen.getByRole("link", { name: "Manage teams" }).getAttribute("href")).toBe("/settings/team");
  });
});

describe("BillingSettings", () => {
  const base = {
    planName: "Professional",
    planPriceDisplay: "$31",
    dealsCount: 20,
    dealLimit: 100,
    teamMembersCount: 1,
    teamMemberLimit: 10,
    apiCallsDisplay: "50,000",
    loadingPaymentMethods: false,
    onChangePlan: vi.fn(),
    onAddPaymentMethod: vi.fn(),
    onEditPaymentMethod: vi.fn(),
    onRemovePaymentMethod: vi.fn(),
    onSetDefaultPaymentMethod: vi.fn(),
    onCancelSubscription: vi.fn(),
  };

  it("lets a paid plan change or cancel and manage each card", () => {
    const card = { id: "pm1", brand: "visa", last4: "4242", expMonth: 4, expYear: 2028, isDefault: false };
    render(
      <BillingSettings
        {...base}
        isPaidPlan
        paymentMethods={[card] as unknown as Parameters<typeof BillingSettings>[0]["paymentMethods"]}
      />
    );
    expect(screen.getByText("$31 / month")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Change plan" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel subscription" }));
    fireEvent.click(screen.getByRole("button", { name: "Make default" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit card ending 4242" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove card ending 4242" }));
    expect(base.onChangePlan).toHaveBeenCalled();
    expect(base.onCancelSubscription).toHaveBeenCalled();
    expect(base.onSetDefaultPaymentMethod).toHaveBeenCalledWith("pm1");
    expect(base.onEditPaymentMethod).toHaveBeenCalledWith(card);
    expect(base.onRemovePaymentMethod).toHaveBeenCalledWith("pm1");
  });

  it("offers an upgrade on the free plan", () => {
    render(<BillingSettings {...base} isPaidPlan={false} planName="Free" paymentMethods={[]} />);
    expect(screen.getByRole("button", { name: "Upgrade to Pro" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Cancel subscription" })).toBeNull();
    expect(screen.getByText("Nothing on file yet.")).toBeTruthy();
  });
});

describe("DangerSettings", () => {
  it("exports deals and asks before deleting", async () => {
    exportDeals.mockResolvedValue(undefined);
    const onRequestDelete = vi.fn();
    const onTransfer = vi.fn();
    render(<DangerSettings onTransfer={onTransfer} onRequestDelete={onRequestDelete} />);
    fireEvent.click(screen.getByRole("button", { name: "CSV" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(exportDeals).toHaveBeenCalledWith("csv");
    fireEvent.click(screen.getByRole("button", { name: "Transfer" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete account" }));
    expect(onTransfer).toHaveBeenCalled();
    expect(onRequestDelete).toHaveBeenCalled();
  });

  it("reports a failed export", async () => {
    exportDeals.mockRejectedValue(new Error("Export failed"));
    render(<DangerSettings onTransfer={vi.fn()} onRequestDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "JSON" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Export failed"));
  });
});
