"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type RefObject } from "react";
import { toast } from "sonner";
import type {
  AllIntegrationStatuses,
  IntegrationLogEntry,
} from "@/app/actions/integrations";
import { downloadDealsExport } from "@/components/export-button";
import type {
  ConnectModalKind,
  ManageModalKind,
} from "@/components/sentinel/settings/dialogs/IntegrationDialogs";
import type { NotificationSettings } from "@/components/sentinel/settings/sections/NotificationsSection";
import type { ProfileFormState } from "@/components/sentinel/settings/sections/ProfileSection";
import type { RiskSettings } from "@/components/sentinel/settings/sections/RiskSection";
import type { PaymentMethodItem } from "@/lib/payment-methods";
import { formatRelativeTime } from "@/lib/utils";
import { Track } from "../blocks";
import { Bone } from "../bone";
import { Monogram } from "../ui";
import {
  ActionButton,
  Row,
  SaveRow,
  SettingsSection,
  StatusPill,
  Switch,
  rowSubStyle,
} from "./parts";

export const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Sales Manager" },
  { value: "rep", label: "Sales Rep" },
  { value: "viewer", label: "Viewer" },
];

export function roleLabel(role: string): string {
  return ROLE_OPTIONS.find((o) => o.value === role)?.label ?? "Member";
}

function Avatar({
  initials,
  imageUrl,
  size,
}: {
  initials: string;
  imageUrl?: string | null;
  size: number;
}) {
  return (
    <span
      aria-hidden
      style={{
        position: "relative",
        display: "flex",
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        background: "var(--dl-ink)",
        color: "#FFFFFF",
        fontSize: size >= 40 ? 15 : 12,
        fontWeight: 600,
      }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        initials
      )}
    </span>
  );
}

export function ProfileSettings({
  profile,
  onChange,
  avatarPreview,
  fileInputRef,
  onImageUpload,
  initials,
  dirty,
  saving,
  onSave,
  onDiscard,
}: {
  profile: ProfileFormState;
  onChange: (next: ProfileFormState) => void;
  avatarPreview: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  initials: string;
  dirty: boolean;
  saving: boolean;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
}) {
  return (
    <SettingsSection id="settings-profile" title="Profile" sub="How you appear to your team.">
      <Row label="Photo" sub="Shown beside your name across Sentinel.">
        <Avatar initials={initials} imageUrl={avatarPreview} size={44} />
        <ActionButton onClick={() => fileInputRef.current?.click()}>Upload photo</ActionButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          hidden
        />
      </Row>
      <Row label="First name" htmlFor="st-first">
        <input
          id="st-first"
          className="dl-st-field dl-st-grow"
          value={profile.name}
          onChange={(e) => onChange({ ...profile, name: e.target.value })}
          placeholder="Enter your first name"
        />
      </Row>
      <Row label="Surname" htmlFor="st-last" sub="Optional.">
        <input
          id="st-last"
          className="dl-st-field dl-st-grow"
          value={profile.surname}
          onChange={(e) => onChange({ ...profile, surname: e.target.value })}
          placeholder="Enter your surname"
        />
      </Row>
      <Row label="Email" htmlFor="st-email" sub="Managed by your sign-in, change it there.">
        <input
          id="st-email"
          type="email"
          className="dl-st-field dl-st-grow"
          value={profile.email}
          readOnly
          placeholder="you@company.com"
        />
      </Row>
      <Row label="Company" htmlFor="st-company">
        <input
          id="st-company"
          className="dl-st-field dl-st-grow"
          value={profile.company}
          onChange={(e) => onChange({ ...profile, company: e.target.value })}
          placeholder="Enter company name"
        />
      </Row>
      <Row label="Role" htmlFor="st-role">
        <span className="dl-st-grow" style={{ position: "relative" }}>
          <select
            id="st-role"
            className="dl-st-field"
            value={profile.role}
            onChange={(e) => onChange({ ...profile, role: e.target.value })}
            style={{ appearance: "none", paddingRight: 32, cursor: "pointer" }}
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 24 24"
            width={14}
            height={14}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            style={{
              position: "absolute",
              right: 11,
              top: 11,
              color: "var(--dl-muted)",
              pointerEvents: "none",
            }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </Row>
      <SaveRow dirty={dirty} saving={saving} onSave={() => void onSave()} onDiscard={onDiscard} />
    </SettingsSection>
  );
}

export function SecuritySettings({
  twoFactorEnabled,
  onOpenUserProfile,
}: {
  twoFactorEnabled: boolean;
  onOpenUserProfile: () => void;
}) {
  return (
    <SettingsSection id="settings-security" title="Security" sub="Sign-in is handled by Clerk.">
      <Row inline label="Password" sub="Managed by Clerk. Rotate it every 90 days.">
        <StatusPill>Managed by Clerk</StatusPill>
        <ActionButton onClick={onOpenUserProfile}>Change</ActionButton>
      </Row>
      <Row inline label="Two-step verification" sub="A code from your phone at every new sign-in.">
        {twoFactorEnabled ? (
          <StatusPill tone="good">Enabled</StatusPill>
        ) : (
          <>
            <StatusPill>Not enabled</StatusPill>
            <StatusPill tone="warn">Recommended</StatusPill>
          </>
        )}
        <ActionButton tone={twoFactorEnabled ? "secondary" : "primary"} onClick={onOpenUserProfile}>
          {twoFactorEnabled ? "Manage" : "Enable"}
        </ActionButton>
      </Row>
      <Row inline label="Active sessions" sub="Every device signed in to this account.">
        <ActionButton onClick={onOpenUserProfile}>Review</ActionButton>
      </Row>
    </SettingsSection>
  );
}

export function NotificationSettingsSection({
  value,
  onChange,
  dirty,
  saving,
  onSave,
  onDiscard,
}: {
  value: NotificationSettings;
  onChange: (next: NotificationSettings) => void;
  dirty: boolean;
  saving: boolean;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
}) {
  return (
    <SettingsSection
      id="settings-notifications"
      title="Notifications"
      sub="What Sentinel tells you about, by email."
    >
      <Row
        inline
        label="Risk alerts"
        sub="When a deal turns at risk, or a competitor comes up in a thread or note."
      >
        <Switch
          checked={value.riskAlerts}
          onChange={(v) => onChange({ ...value, riskAlerts: v })}
          label="Risk alerts"
        />
      </Row>
      <Row inline label="Deal updates" sub="Every stage change. Can be noisy on a large book.">
        <Switch
          checked={value.dealUpdates}
          onChange={(v) => onChange({ ...value, dealUpdates: v })}
          label="Deal updates"
        />
      </Row>
      <Row inline label="Action overdue" sub="When a next step passes its due date.">
        <Switch
          checked={value.emailAlerts}
          onChange={(v) => onChange({ ...value, emailAlerts: v })}
          label="Action overdue alerts"
        />
      </Row>
      <SaveRow dirty={dirty} saving={saving} onSave={() => void onSave()} onDiscard={onDiscard} />
    </SettingsSection>
  );
}

export function RiskSettingsSection({
  value,
  onChange,
  error,
  onErrorChange,
  championDormancy,
  onChampionDormancyChange,
  stageStall,
  onStageStallChange,
  dirty,
  saving,
  onSave,
  onDiscard,
}: {
  value: RiskSettings;
  onChange: (next: RiskSettings) => void;
  error: string | null;
  onErrorChange: (next: string | null) => void;
  championDormancy: boolean;
  onChampionDormancyChange: (next: boolean) => void;
  stageStall: boolean;
  onStageStallChange: (next: boolean) => void;
  dirty: boolean;
  saving: boolean;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
}) {
  return (
    <SettingsSection
      id="settings-risk"
      title="Risk analysis"
      sub="How each deal's risk score is worked out."
    >
      <Row
        inline
        label="Inactivity threshold"
        htmlFor="st-idle"
        sub={
          error ? (
            <span role="alert" style={{ color: "var(--dl-signal-d)" }}>
              {error}
            </span>
          ) : (
            "Days without activity before the score climbs. From 1 to 30, 7 by default."
          )
        }
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 36,
            padding: "0 10px 0 4px",
            border: `1px solid ${error ? "var(--dl-signal)" : "var(--dl-border)"}`,
            borderRadius: 9,
            background: "var(--dl-panel)",
            boxShadow: "var(--dl-shadow)",
          }}
        >
          <input
            id="st-idle"
            type="number"
            min={1}
            max={30}
            inputMode="numeric"
            aria-invalid={Boolean(error) || undefined}
            value={value.inactivityThresholdDays}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                onChange({ ...value, inactivityThresholdDays: 7 });
                onErrorChange(null);
                return;
              }
              const n = parseInt(raw, 10);
              if (isNaN(n)) {
                onErrorChange("Please enter a valid number");
                return;
              }
              if (n < 1 || n > 30) {
                onErrorChange("Value must be between 1 and 30 days");
                return;
              }
              onChange({ ...value, inactivityThresholdDays: n });
              onErrorChange(null);
            }}
            onBlur={(e) => {
              const n = parseInt(e.target.value, 10);
              if (isNaN(n) || n < 1) onChange({ ...value, inactivityThresholdDays: 1 });
              else if (n > 30) onChange({ ...value, inactivityThresholdDays: 30 });
              if (!isNaN(n) && n >= 1 && n <= 30) onErrorChange(null);
            }}
            style={{
              width: 44,
              minHeight: 0,
              border: 0,
              background: "none",
              outline: "none",
              textAlign: "right",
              fontSize: 13.5,
              fontWeight: 600,
              color: "var(--dl-ink)",
            }}
          />
          <span style={{ fontSize: 13.5, color: "var(--dl-muted)" }}>days</span>
        </span>
      </Row>
      <Row
        inline
        label="Competitive signals"
        sub="Flag a deal when a competitor's name shows up in email, Slack or notes."
      >
        <Switch
          checked={value.enableCompetitiveSignals}
          onChange={(v) => onChange({ ...value, enableCompetitiveSignals: v })}
          label="Competitive signals"
        />
      </Row>
      <Row
        inline
        label={
          <>
            Champion dormancy <StatusPill>Beta</StatusPill>
          </>
        }
        sub="Flag a deal when the customer has not replied by email in 14 days or more."
      >
        <Switch checked={championDormancy} onChange={onChampionDormancyChange} label="Champion dormancy" />
      </Row>
      <Row
        inline
        label="Stage-stall detection"
        sub="Flag a deal that sits in one stage twice as long as usual."
      >
        <Switch checked={stageStall} onChange={onStageStallChange} label="Stage-stall detection" />
      </Row>
      <SaveRow
        dirty={dirty}
        saving={saving}
        saveDisabled={Boolean(error)}
        onSave={() => void onSave()}
        onDiscard={onDiscard}
      />
    </SettingsSection>
  );
}

interface IntegrationDef {
  key: string;
  name: string;
  monogram: string;
  kind: string;
  connect: NonNullable<ConnectModalKind>;
  manage: NonNullable<ManageModalKind>;
  status: (s: AllIntegrationStatuses | null) => { connected: boolean; lastSyncAt?: Date | string | null };
}

const INTEGRATIONS: IntegrationDef[] = [
  {
    key: "hubspot",
    name: "HubSpot",
    monogram: "HS",
    kind: "CRM",
    connect: "hubspot",
    manage: "hubspot",
    status: (s) => ({ connected: Boolean(s?.hubspot?.connected), lastSyncAt: s?.hubspot?.lastSyncAt }),
  },
  {
    key: "salesforce",
    name: "Salesforce",
    monogram: "SF",
    kind: "CRM",
    connect: "salesforce",
    manage: "salesforce",
    status: (s) => ({ connected: Boolean(s?.salesforce?.connected), lastSyncAt: s?.salesforce?.lastSyncAt }),
  },
  {
    key: "gmail",
    name: "Gmail",
    monogram: "GM",
    kind: "Email",
    connect: "gmail",
    manage: "gmail",
    status: (s) => ({ connected: Boolean(s?.gmail?.connected), lastSyncAt: s?.gmail?.lastSyncAt }),
  },
  {
    key: "calendar",
    name: "Google Calendar",
    monogram: "GC",
    kind: "Meetings",
    connect: "google_calendar",
    manage: "googleCalendar",
    status: (s) => ({
      connected: Boolean(s?.googleCalendar?.connected),
      lastSyncAt: s?.googleCalendar?.lastSyncAt,
    }),
  },
  {
    key: "slack",
    name: "Slack",
    monogram: "SL",
    kind: "Alerts to a channel",
    connect: "slack",
    manage: "slack",
    status: (s) => ({ connected: Boolean(s?.slack?.connected) }),
  },
];

const LOG_COLOR: Record<string, string> = {
  success: "var(--dl-green)",
  failed: "var(--dl-signal)",
};

export function IntegrationSettings({
  statuses,
  loading,
  connectedCount,
  logs,
  onConnect,
  onManage,
}: {
  statuses: AllIntegrationStatuses | null;
  loading: boolean;
  connectedCount: number;
  logs: IntegrationLogEntry[];
  onConnect: (kind: NonNullable<ConnectModalKind>) => void;
  onManage: (kind: NonNullable<ManageModalKind>) => void;
}) {
  return (
    <SettingsSection
      id="settings-integrations"
      title="Integrations"
      sub={
        loading
          ? "Sentinel reads your CRM, email and calendar and never writes back to them."
          : `${connectedCount} of ${INTEGRATIONS.length} connected. Sentinel reads your CRM, email and calendar and never writes back to them.`
      }
    >
      {loading
        ? INTEGRATIONS.map((def) => (
            <div key={def.key} className="dl-st-row dl-st-inline" aria-hidden>
              <span style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <Bone w={32} h={32} r={9} />
                <span style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <Bone w={96} h={11} />
                  <Bone w={130} h={8} />
                </span>
              </span>
              <Bone w={72} h={30} r={8} />
            </div>
          ))
        : INTEGRATIONS.map((def) => {
            const status = def.status(statuses);
            const synced = status.lastSyncAt ? formatRelativeTime(status.lastSyncAt) : null;
            return (
              <div key={def.key} className="dl-st-row dl-st-inline">
                <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                  <Monogram name={def.name} label={def.monogram} />
                  <div style={{ minWidth: 0 }}>
                    <b style={{ display: "block", fontSize: 14, fontWeight: 600 }}>{def.name}</b>
                    <small style={{ ...rowSubStyle, marginTop: 0 }}>
                      {def.kind} ·{" "}
                      {status.connected
                        ? synced
                          ? `synced ${synced}`
                          : "connected"
                        : "not connected"}
                    </small>
                  </div>
                </div>
                <div className="dl-st-ctl dl-st-end">
                  {status.connected ? (
                    <>
                      <StatusPill tone="good">Connected</StatusPill>
                      <ActionButton onClick={() => onManage(def.manage)} label={`Manage ${def.name}`}>
                        Manage
                      </ActionButton>
                    </>
                  ) : (
                    <ActionButton tone="primary" onClick={() => onConnect(def.connect)} label={`Connect ${def.name}`}>
                      Connect
                    </ActionButton>
                  )}
                </div>
              </div>
            );
          })}
      <Row inline label="Webhooks" sub="Send deal events to your own tools.">
        <Link
          href="/settings/webhooks"
          className="dl-link dl-tap"
          style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13.5, fontWeight: 500, color: "var(--dl-ink)" }}
        >
          Manage webhooks
        </Link>
      </Row>
      {logs.length > 0 && (
        <div style={{ padding: "6px var(--dl-gutter) 16px", borderTop: "1px solid var(--dl-row)" }}>
          <p
            style={{
              padding: "10px 0 6px",
              fontFamily: "var(--dl-font-mono)",
              fontSize: 10.5,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "var(--dl-muted)",
            }}
          >
            Recent sync activity
          </p>
          <ul aria-label="Recent sync activity">
            {logs.map((log) => (
              <li
                key={log.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 0",
                  borderTop: "1px solid var(--dl-row)",
                  fontSize: 13,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 7,
                    height: 7,
                    flexShrink: 0,
                    borderRadius: "50%",
                    background: LOG_COLOR[log.status] ?? "var(--dl-guide)",
                  }}
                />
                <span style={{ flexShrink: 0, minWidth: 96, color: "var(--dl-text-2)", textTransform: "capitalize" }}>
                  {log.integration.replace(/_/g, " ")}
                </span>
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {log.message || log.action.replace(/_/g, " ")}
                </span>
                <span style={{ flexShrink: 0, fontSize: 12, color: "var(--dl-muted)" }}>
                  {formatRelativeTime(log.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SettingsSection>
  );
}

export function TeamSettings({
  name,
  email,
  joinedLabel,
  role,
  initials,
  imageUrl,
  teamMembersCount,
  teamMemberLimit,
  onInvite,
}: {
  name: string;
  email: string;
  joinedLabel: string;
  role: string;
  initials: string;
  imageUrl: string | null;
  teamMembersCount: number;
  teamMemberLimit: number;
  onInvite: () => void;
}) {
  return (
    <SettingsSection
      id="settings-team"
      title="Team"
      sub={`Who can see this workspace · ${teamMembersCount} of ${teamMemberLimit} ${teamMemberLimit === 1 ? "seat" : "seats"} in use.`}
    >
      <div className="dl-st-row dl-st-inline">
        <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
          <Avatar initials={initials} imageUrl={imageUrl} size={32} />
          <div style={{ minWidth: 0 }}>
            <b style={{ display: "block", fontSize: 14, fontWeight: 600 }}>{name || "You"}</b>
            <small style={{ ...rowSubStyle, marginTop: 0 }}>
              {[email || "No email on file", joinedLabel].filter(Boolean).join(" · ")}
            </small>
          </div>
        </div>
        <div className="dl-st-ctl dl-st-end">
          <StatusPill>{roleLabel(role)}</StatusPill>
        </div>
      </div>
      <Row label="Invite a teammate" sub="They join with the role you pick." end>
        <ActionButton onClick={onInvite}>
          <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Invite member
        </ActionButton>
        <Link
          href="/settings/team"
          className="dl-link dl-tap"
          style={{ fontSize: 13.5, fontWeight: 500, color: "var(--dl-ink)" }}
        >
          Manage teams
        </Link>
      </Row>
    </SettingsSection>
  );
}

function usagePercent(used: number | null, limit: number): number {
  if (used === null || limit <= 0) return 0;
  return Math.min(100, (used / limit) * 100);
}

function brandLabel(brand: string): string {
  const key = brand.toLowerCase();
  if (key.startsWith("visa")) return "Visa";
  if (key.startsWith("master")) return "Mastercard";
  if (key.startsWith("amex") || key.includes("express")) return "Amex";
  if (key.startsWith("disc")) return "Discover";
  if (key.includes("paypal")) return "PayPal";
  return brand.charAt(0).toUpperCase() + brand.slice(1);
}

export function BillingSettings({
  planName,
  planPriceDisplay,
  isPaidPlan,
  dealsCount,
  dealLimit,
  teamMembersCount,
  teamMemberLimit,
  apiCallsDisplay,
  paymentMethods,
  loadingPaymentMethods,
  onChangePlan,
  onAddPaymentMethod,
  onEditPaymentMethod,
  onRemovePaymentMethod,
  onSetDefaultPaymentMethod,
  onCancelSubscription,
}: {
  planName: string;
  planPriceDisplay: string;
  isPaidPlan: boolean;
  dealsCount: number | null;
  dealLimit: number;
  teamMembersCount: number;
  teamMemberLimit: number;
  apiCallsDisplay: string;
  paymentMethods: PaymentMethodItem[];
  loadingPaymentMethods: boolean;
  onChangePlan: () => void;
  onAddPaymentMethod: () => void;
  onEditPaymentMethod: (pm: PaymentMethodItem) => void;
  onRemovePaymentMethod: (id: string) => void;
  onSetDefaultPaymentMethod: (id: string) => void;
  onCancelSubscription: () => void;
}) {
  const price = isPaidPlan ? `${planPriceDisplay} / month` : "Free";
  return (
    <SettingsSection
      id="settings-billing"
      title="Billing"
      sub={isPaidPlan ? `${planName} · ${planPriceDisplay} a month, billed monthly.` : `${planName} plan · no card needed.`}
    >
      <Row inline label="Plan" sub={isPaidPlan ? `${planName}, renews monthly.` : "Upgrade for more deals, seats and integrations."}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{price}</span>
        {isPaidPlan ? (
          <>
            <ActionButton onClick={onChangePlan}>Change plan</ActionButton>
            <ActionButton onClick={onCancelSubscription}>Cancel subscription</ActionButton>
          </>
        ) : (
          <ActionButton tone="primary" onClick={onChangePlan}>
            Upgrade to Pro
          </ActionButton>
        )}
      </Row>
      <Row
        label="Deals"
        sub={
          dealLimit > 0
            ? dealsCount === null
              ? "Usage unavailable right now"
              : `${dealsCount} of ${dealLimit}`
            : "Unlimited"
        }
      >
        <Track
          percent={usagePercent(dealsCount, dealLimit)}
          label={`${dealsCount ?? 0} of ${dealLimit} deals used`}
          style={{ flex: "1 1 auto" }}
        />
      </Row>
      <Row label="Team members" sub={`${teamMembersCount} of ${teamMemberLimit}`}>
        <Track
          percent={usagePercent(teamMembersCount, teamMemberLimit)}
          label={`${teamMembersCount} of ${teamMemberLimit} seats used`}
          style={{ flex: "1 1 auto" }}
        />
      </Row>
      <Row inline label="API calls" sub="Usage is not tracked yet.">
        <span style={{ fontSize: 13, color: "var(--dl-text-2)" }}>{apiCallsDisplay} a month included</span>
      </Row>
      <Row
        inline
        label="Payment methods"
        sub={
          loadingPaymentMethods
            ? "Loading"
            : paymentMethods.length === 0
              ? "Nothing on file yet."
              : `${paymentMethods.length} on file. Charged on the same day each month.`
        }
      >
        <ActionButton onClick={onAddPaymentMethod}>Add method</ActionButton>
      </Row>
      {loadingPaymentMethods ? (
        <div className="dl-st-row dl-st-inline" aria-hidden>
          <Bone w={160} h={11} />
          <Bone w={120} h={30} r={8} />
        </div>
      ) : (
        paymentMethods.map((pm) => (
          <div key={pm.id} className="dl-st-row dl-st-inline">
            <div style={{ minWidth: 0 }}>
              <b style={{ display: "block", fontSize: 14, fontWeight: 600 }}>
                {brandLabel(pm.brand)} ending {pm.last4}
              </b>
              <small style={{ ...rowSubStyle, marginTop: 0 }}>
                Expires {String(pm.expMonth).padStart(2, "0")}/{pm.expYear}
              </small>
            </div>
            <div className="dl-st-ctl dl-st-end">
              {pm.isDefault ? (
                <StatusPill>Default</StatusPill>
              ) : (
                <ActionButton onClick={() => onSetDefaultPaymentMethod(pm.id)}>Make default</ActionButton>
              )}
              <ActionButton onClick={() => onEditPaymentMethod(pm)} label={`Edit card ending ${pm.last4}`}>
                Edit
              </ActionButton>
              <ActionButton tone="danger" onClick={() => onRemovePaymentMethod(pm.id)} label={`Remove card ending ${pm.last4}`}>
                Remove
              </ActionButton>
            </div>
          </div>
        ))
      )}
    </SettingsSection>
  );
}

type ExportFormat = "csv" | "json";

export function DangerSettings({
  onTransfer,
  onRequestDelete,
}: {
  onTransfer: () => void;
  onRequestDelete: () => void;
}) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  const exportDeals = async (format: ExportFormat) => {
    setExporting(format);
    try {
      await downloadDealsExport(format);
      toast.success(`Exported your deals as ${format.toUpperCase()}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export deals");
    } finally {
      setExporting(null);
    }
  };

  return (
    <SettingsSection
      id="settings-danger"
      title="Danger zone"
      sub="Permanent changes to your account."
      danger
    >
      <Row
        inline
        label="Export your deals"
        sub="Every deal as CSV or JSON: name, stage, value, owner, risk and activity dates."
      >
        <ActionButton onClick={() => void exportDeals("csv")} busy={exporting === "csv"} disabled={exporting !== null}>
          {exporting === "csv" ? "Exporting" : "CSV"}
        </ActionButton>
        <ActionButton onClick={() => void exportDeals("json")} busy={exporting === "json"} disabled={exporting !== null}>
          {exporting === "json" ? "Exporting" : "JSON"}
        </ActionButton>
      </Row>
      <Row
        inline
        label="Transfer team ownership"
        sub="Hand a team to another member from that team's page."
      >
        <ActionButton onClick={onTransfer}>Transfer</ActionButton>
      </Row>
      <Row
        inline
        label="Delete account"
        sub="Removes your workspace and every deal. This cannot be undone."
      >
        <ActionButton tone="danger" onClick={onRequestDelete}>
          Delete account
        </ActionButton>
      </Row>
    </SettingsSection>
  );
}
