"use client";

import {
  FormActions,
  Pill,
  SectionHeader,
  SerifEm,
  SettingRow,
  Toggle,
} from "../primitives";

export interface NotificationSettings {
  emailAlerts: boolean;
  riskAlerts: boolean;
  weeklyDigest: boolean;
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
        deck="Email, in-app, and Slack alerts. You'll always get risk flags - everything else is optional."
        rightLabel="4 CHANNELS"
        rightValue={`${activeChannels} ACTIVE`}
      />

      <SettingRow
        title={
          <>
            Email alerts <Pill>ALWAYS ON</Pill>
          </>
        }
        subtitle={
          <>
            Critical alerts - at-risk deals, lost competitive signals, and sync
            errors. <SerifEm>Can&apos;t be turned off.</SerifEm>
          </>
        }
      >
        <Toggle
          checked={value.emailAlerts}
          onChange={(v) => onChange({ ...value, emailAlerts: v })}
          ariaLabel="Email alerts"
        />
      </SettingRow>

      <SettingRow
        title="Risk alerts"
        subtitle="Get notified when a deal moves from healthy to at-risk, or when a competitor is mentioned in a call transcript."
      >
        <Toggle
          checked={value.riskAlerts}
          onChange={(v) => onChange({ ...value, riskAlerts: v })}
          ariaLabel="Risk alerts"
        />
      </SettingRow>

      <SettingRow
        title="Weekly digest"
        subtitle="A Monday morning brief - pipeline velocity, top movers, anomalies - delivered before your 9am."
      >
        <Toggle
          checked={value.weeklyDigest}
          onChange={(v) => onChange({ ...value, weeklyDigest: v })}
          ariaLabel="Weekly digest"
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
