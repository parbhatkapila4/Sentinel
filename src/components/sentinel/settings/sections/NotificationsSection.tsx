"use client";

import {
  FormActions,
  SectionHeader,
  SerifEm,
  SettingRow,
  Toggle,
} from "../primitives";

export interface NotificationSettings {
  emailAlerts: boolean;
  riskAlerts: boolean;
  dealUpdates: boolean;
}

export function NotificationsSection({
  value,
  onChange,
  activeChannels,
  dirty,
  saving,
  onSave,
  onDiscard,
}: {
  value: NotificationSettings;
  onChange: (next: NotificationSettings) => void;
  activeChannels: number;
  dirty: boolean;
  saving: boolean;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
}) {
  return (
    <section
      id="settings-notifications"
      style={{ marginBottom: 48, scrollMarginTop: 64 }}
    >
      <SectionHeader
        eyebrow="§ 02 - NOTIFICATIONS"
        headline={
          <>
            When Sentinel should{" "}
            <i style={{ fontStyle: "italic", color: "var(--signal)" }}>
              interrupt.
            </i>
          </>
        }
        deck="Choose which email alerts Sentinel sends you. Every one of these is a preference you can switch on or off at any time."
        rightLabel="3 ALERT TYPES"
        rightValue={`${activeChannels} ON`}
      />

      <SettingRow
        title="Action overdue"
        subtitle={
          <>
            Email me when a recommended action passes its due date and the deal
            still needs a follow-up.
          </>
        }
      >
        <Toggle
          checked={value.emailAlerts}
          onChange={(v) => onChange({ ...value, emailAlerts: v })}
          ariaLabel="Action overdue alerts"
        />
      </SettingRow>

      <SettingRow
        title="Risk alerts"
        subtitle="Get notified when a deal moves from healthy to at-risk, or when a competitor keyword appears in an email thread, Slack message, or timeline note."
      >
        <Toggle
          checked={value.riskAlerts}
          onChange={(v) => onChange({ ...value, riskAlerts: v })}
          ariaLabel="Risk alerts"
        />
      </SettingRow>

      <SettingRow
        title="Deal updates"
        subtitle={
          <>
            Notifications every time a deal stage changes.{" "}
            <SerifEm>Can be noisy on a large book.</SerifEm>
          </>
        }
        last
      >
        <Toggle
          checked={value.dealUpdates}
          onChange={(v) => onChange({ ...value, dealUpdates: v })}
          ariaLabel="Deal updates"
        />
      </SettingRow>

      <div style={{ marginTop: 28 }}>
        <FormActions
          dirty={dirty}
          saving={saving}
          onSave={onSave}
          onDiscard={onDiscard}
        />
      </div>
    </section>
  );
}
