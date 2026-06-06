"use client";

import type { AllIntegrationStatuses } from "@/app/actions/integrations";
import { formatRelativeTime } from "@/lib/utils";
import {
  EditorialButton,
  EditorialInput,
  EditorialModal,
  Field,
  ModalActions,
  SerifEm,
  SettingRow,
  Toggle,
} from "../primitives";

export type ConnectModalKind =
  | "salesforce"
  | "hubspot"
  | "google_calendar"
  | "gmail"
  | null;

export type ManageModalKind =
  | "salesforce"
  | "hubspot"
  | "googleCalendar"
  | "gmail"
  | null;

export interface SalesforceConnectForm {
  instanceUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

export function ConnectSalesforceDialog({
  form,
  onFormChange,
  connecting,
  onClose,
  onSubmit,
}: {
  form: SalesforceConnectForm;
  onFormChange: (next: SalesforceConnectForm) => void;
  connecting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <EditorialModal
      onClose={onClose}
      title="Connect Salesforce."
      subtitle="Sync your opportunities and contacts."
    >
      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <Field
          label="Instance URL"
          foot={
            <>
              Your Salesforce org URL, e.g.{" "}
              <code>https://yourcompany.salesforce.com</code>
            </>
          }
        >
          <EditorialInput
            type="url"
            value={form.instanceUrl}
            onChange={(e) =>
              onFormChange({ ...form, instanceUrl: e.target.value })
            }
            placeholder="https://yourcompany.salesforce.com"
            required
          />
        </Field>
        <Field
          label="Consumer Key (Client ID)"
          foot={
            <>
              From your Salesforce External Client App{" "}
              <SerifEm>›</SerifEm> Settings <SerifEm>›</SerifEm> Consumer Key
              and Secret.
            </>
          }
        >
          <EditorialInput
            type="text"
            value={form.consumerKey}
            onChange={(e) =>
              onFormChange({ ...form, consumerKey: e.target.value })
            }
            placeholder="3MVG9..."
            required
          />
        </Field>
        <Field
          label="Consumer Secret (Client Secret)"
          foot="Treated as a password — encrypted at rest and only used to mint short-lived access tokens."
        >
          <EditorialInput
            type="password"
            value={form.consumerSecret}
            onChange={(e) =>
              onFormChange({ ...form, consumerSecret: e.target.value })
            }
            placeholder="Enter your Consumer Secret"
            required
          />
        </Field>
        <ModalActions>
          <EditorialButton type="button" onClick={onClose}>
            Cancel
          </EditorialButton>
          <EditorialButton
            type="submit"
            variant="primary"
            disabled={connecting}
          >
            {connecting ? "Connecting…" : "Connect ⏎"}
          </EditorialButton>
        </ModalActions>
      </form>
    </EditorialModal>
  );
}

export function ConnectHubSpotDialog({
  apiKey,
  onApiKeyChange,
  connecting,
  onClose,
  onSubmit,
}: {
  apiKey: string;
  onApiKeyChange: (next: string) => void;
  connecting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <EditorialModal
      onClose={onClose}
      title="Connect HubSpot."
      subtitle="Import your CRM deals and contacts."
    >
      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <Field
          label="Private app access token"
          foot={
            <a
              href="https://developers.hubspot.com/docs/api/private-apps"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--signal)" }}
            >
              Create a private app in HubSpot →
            </a>
          }
        >
          <EditorialInput
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            required
          />
        </Field>
        <ModalActions>
          <EditorialButton type="button" onClick={onClose}>
            Cancel
          </EditorialButton>
          <EditorialButton
            type="submit"
            variant="primary"
            disabled={connecting}
          >
            {connecting ? "Connecting…" : "Connect ⏎"}
          </EditorialButton>
        </ModalActions>
      </form>
    </EditorialModal>
  );
}

export function ConnectGoogleCalendarDialog({
  form,
  onFormChange,
  connecting,
  onClose,
  onSubmit,
}: {
  form: { apiKey: string; calendarId: string };
  onFormChange: (next: { apiKey: string; calendarId: string }) => void;
  connecting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <EditorialModal
      onClose={onClose}
      title="Connect Google Calendar."
      subtitle="Sync meetings and schedule events."
    >
      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <Field
          label="API key"
          foot={
            <>
              Create in Google Cloud Console → APIs &amp; Services →
              Credentials. Enable <SerifEm>Google Calendar API</SerifEm>.
            </>
          }
        >
          <EditorialInput
            type="password"
            value={form.apiKey}
            onChange={(e) => onFormChange({ ...form, apiKey: e.target.value })}
            placeholder="AIzaSy…"
            required
          />
        </Field>
        <Field
          label="Calendar ID"
          foot={
            <>
              Use a <SerifEm>public</SerifEm> calendar&apos;s ID. API keys
              cannot access primary or private calendars.
            </>
          }
        >
          <EditorialInput
            type="text"
            value={form.calendarId}
            onChange={(e) =>
              onFormChange({ ...form, calendarId: e.target.value })
            }
            placeholder="e.g. xxx@group.calendar.google.com"
            required
          />
        </Field>
        <ModalActions>
          <EditorialButton type="button" onClick={onClose}>
            Cancel
          </EditorialButton>
          <EditorialButton
            type="submit"
            variant="primary"
            disabled={connecting}
          >
            {connecting ? "Connecting…" : "Connect ⏎"}
          </EditorialButton>
        </ModalActions>
      </form>
    </EditorialModal>
  );
}

export function ConnectGmailDialog({
  onClose,
  onContinue,
}: {
  onClose: () => void;
  onContinue: () => void;
}) {
  return (
    <EditorialModal
      onClose={onClose}
      title="Connect Gmail."
      subtitle="OAuth-based, read-only inbox sync."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 13, color: "var(--cream-2)", lineHeight: 1.5 }}>
          We use Google OAuth and request read-only Gmail access for
          thread-level signal extraction and sentiment scoring.
        </div>
        <ModalActions>
          <EditorialButton type="button" onClick={onClose}>
            Cancel
          </EditorialButton>
          <EditorialButton type="button" variant="primary" onClick={onContinue}>
            Continue with Google →
          </EditorialButton>
        </ModalActions>
      </div>
    </EditorialModal>
  );
}

const MANAGE_TITLE: Record<NonNullable<ManageModalKind>, string> = {
  salesforce: "Salesforce.",
  hubspot: "HubSpot.",
  googleCalendar: "Google Calendar.",
  gmail: "Gmail.",
};

const PROVIDERS_WITH_TOTAL_SYNCED = new Set<NonNullable<ManageModalKind>>([
  "salesforce",
  "hubspot",
  "gmail",
]);

const PROVIDERS_WITH_CONTACT_SYNC = new Set<NonNullable<ManageModalKind>>([
  "hubspot",
  "salesforce",
]);

type ProviderStatus = {
  lastSyncAt: Date | null;
  lastSyncStatus: string | null;
  syncEnabled: boolean;
  totalSynced?: number;
  lastContactsSyncedAt?: Date | null;
  totalContactsSynced?: number;
};

function mostRecentDate(a: Date | null, b: Date | null): Date | null {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

function readProviderStatus(
  kind: NonNullable<ManageModalKind>,
  statuses: AllIntegrationStatuses | null
): ProviderStatus | null {
  if (!statuses) return null;
  switch (kind) {
    case "salesforce":
      return statuses.salesforce;
    case "hubspot":
      return statuses.hubspot;
    case "googleCalendar":
      return statuses.googleCalendar;
    case "gmail":
      return statuses.gmail;
  }
}

export function ManageIntegrationDialog({
  kind,
  statuses,
  syncingIntegration,
  onToggleAutoSync,
  onSync,
  onDisconnect,
  onClose,
}: {
  kind: NonNullable<ManageModalKind>;
  statuses: AllIntegrationStatuses | null;
  syncingIntegration: string | null;
  onToggleAutoSync: (kind: NonNullable<ManageModalKind>) => void;
  onSync: (kind: NonNullable<ManageModalKind>) => void;
  onDisconnect: (kind: NonNullable<ManageModalKind>) => void;
  onClose: () => void;
}) {
  const status = readProviderStatus(kind, statuses);
  const showTotalSynced = PROVIDERS_WITH_TOTAL_SYNCED.has(kind);

  const hasContactSync = PROVIDERS_WITH_CONTACT_SYNC.has(kind);

  const lastSyncTimestamp = hasContactSync
    ? mostRecentDate(
      status?.lastSyncAt ?? null,
      status?.lastContactsSyncedAt ?? null
    )
    : status?.lastSyncAt ?? null;

  const rows: Array<{ k: string; v: string }> = [
    { k: "LAST SYNC", v: formatRelativeTime(lastSyncTimestamp) || "NEVER" },
  ];

  if (hasContactSync) {
    const deals = status?.totalSynced ?? 0;
    const contacts = status?.totalContactsSynced ?? 0;
    rows.push({ k: "DEALS SYNCED", v: `${deals} ${deals === 1 ? "deal" : "deals"}` });
    rows.push({ k: "CONTACTS SYNCED", v: `${contacts} ${contacts === 1 ? "contact" : "contacts"}` });
  } else if (showTotalSynced) {
    rows.push({ k: "TOTAL SYNCED", v: `${status?.totalSynced ?? 0} ITEMS` });
  }

  rows.push({ k: "STATUS", v: (status?.lastSyncStatus ?? "READY").toString().toUpperCase() });

  const isSyncing = syncingIntegration === kind;

  return (
    <EditorialModal
      onClose={onClose}
      title={MANAGE_TITLE[kind]}
      subtitle={
        <span
          style={{
            color: "var(--ivy)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            className="sentinel-ivy-ping"
            style={{
              width: 6,
              height: 6,
              background: "var(--ivy)",
              borderRadius: "50%",
              display: "inline-block",
            }}
          />
          Connected
        </span>
      }
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {rows.map((row) => (
          <div
            key={row.k}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 14px",
              background: "var(--ink-03)",
              border: "1px solid var(--rule)",
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10.5,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            <span style={{ color: "var(--cream-3)" }}>{row.k}</span>
            <span style={{ color: "var(--cream)" }}>{row.v}</span>
          </div>
        ))}
      </div>

      <SettingRow
        title="Auto-sync"
        subtitle="Automatically sync data on a regular schedule."
        last
      >
        <Toggle
          checked={status?.syncEnabled ?? false}
          onChange={() => onToggleAutoSync(kind)}
          ariaLabel="Auto-sync"
        />
      </SettingRow>

      <ModalActions>
        <EditorialButton
          type="button"
          variant="danger"
          onClick={() => onDisconnect(kind)}
        >
          Disconnect
        </EditorialButton>
        <EditorialButton
          type="button"
          variant="primary"
          onClick={() => onSync(kind)}
          disabled={isSyncing}
        >
          {isSyncing ? "Syncing…" : "Sync now ⏎"}
        </EditorialButton>
      </ModalActions>
    </EditorialModal>
  );
}
