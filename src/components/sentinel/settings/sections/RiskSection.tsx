"use client";

import {
  EditorialInput,
  Field,
  FormActions,
  Pill,
  SectionHeader,
  SerifEm,
  SettingRow,
  Toggle,
} from "../primitives";

export interface RiskSettings {
  inactivityThresholdDays: number;
  enableCompetitiveSignals: boolean;
}

export function RiskSection({
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
    <section
      id="settings-risk"
      style={{ marginBottom: 48, scrollMarginTop: 64 }}
    >
      <SectionHeader
        eyebrow="§ 03 - RISK ANALYSIS"
        headline={
          <>
            How Sentinel{" "}
            <i style={{ fontStyle: "italic", color: "var(--signal)" }}>sees</i>{" "}
            trouble.
          </>
        }
        deck="The thresholds and heuristics that decide when a deal earns a risk flag. Tune these to match your sales cycle."
        rightLabel="THRESHOLD"
        rightValue={`${value.inactivityThresholdDays}D`}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "24px 28px",
          marginBottom: 28,
        }}
      >
        <Field
          label="Inactivity threshold"
          note="in days · range 1–30"
          full
          foot={
            error ? (
              <span style={{ color: "var(--wine)" }}>{error}</span>
            ) : (
              <>
                Number of days without activity before a deal is flagged at
                risk. <SerifEm>Default: 7 days.</SerifEm> Most B2B cycles work
                well at 7–10.
              </>
            )
          }
        >
          <EditorialInput
            type="number"
            min={1}
            max={30}
            value={value.inactivityThresholdDays}
            invalid={Boolean(error)}
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
              if (isNaN(n) || n < 1)
                onChange({ ...value, inactivityThresholdDays: 1 });
              else if (n > 30)
                onChange({ ...value, inactivityThresholdDays: 30 });
              if (!isNaN(n) && n >= 1 && n <= 30) onErrorChange(null);
            }}
          />
        </Field>
      </div>

      <SettingRow
        title="Competitive signals detection"
        subtitle="Automatically flag deals when a competitor is mentioned in call transcripts, email threads, or deal timeline notes."
      >
        <Toggle
          checked={value.enableCompetitiveSignals}
          onChange={(v) => onChange({ ...value, enableCompetitiveSignals: v })}
          ariaLabel="Competitive signals"
        />
      </SettingRow>

      <SettingRow
        title={
          <>
            Champion dormancy <Pill tone="muted">BETA</Pill>
          </>
        }
        subtitle="Flag deals when no inbound email has been received from the customer in 14+ days. Based on the email_received signals on the deal timeline."
      >
        <Toggle
          checked={championDormancy}
          onChange={onChampionDormancyChange}
          ariaLabel="Champion dormancy"
        />
      </SettingRow>

      <SettingRow
        title="Stage-stall detection"
        subtitle="Flag deals that have been in the same stage longer than 2× the average for that stage."
        last
      >
        <Toggle
          checked={stageStall}
          onChange={onStageStallChange}
          ariaLabel="Stage-stall detection"
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
