"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";

import { createDeal } from "@/app/actions/deals";
import { getTeamMembers } from "@/app/actions/teams";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics-client";
import { COUNTRIES } from "@/lib/countries";
import { STAGES } from "@/lib/config";

import {
  CellHead,
  PageHero,
  primaryButtonStyle,
  secondaryButtonStyle,
} from "../blocks";
import { Required, SelectField } from "../controls";
import { STAGE_STEP_COUNT, fullCurrency, stageStep } from "../format";
import { Monogram } from "../ui";
import {
  CHANNEL_CHOICES,
  EMPTY_DRAFT,
  STAGE_CHOICES,
  formatDigits,
  memberName,
  readValueInput,
  toFormData,
  validateDraft,
  type MemberOption,
  type NewDealDraft,
  type TeamOption,
} from "./model";

export interface NewDealServices {
  createDeal: (formData: FormData) => Promise<{ id: string }>;
  loadTeams: () => Promise<TeamOption[]>;
  loadMembers: (teamId: string) => Promise<MemberOption[]>;
}

async function loadMyTeams(): Promise<TeamOption[]> {
  const res = await fetch("/api/teams/me");
  if (!res.ok) return [];
  const json = await res.json();
  return ((json?.data ?? json)?.teams ?? []) as TeamOption[];
}

const DEFAULT_SERVICES: NewDealServices = {
  createDeal,
  loadTeams: loadMyTeams,
  loadMembers: getTeamMembers,
};

const FAILED = "Failed to create deal. Please try again.";

export function NewDealView({
  services: overrides,
  initialDraft,
}: {
  services?: Partial<NewDealServices>;
  initialDraft?: Partial<NewDealDraft>;
}) {
  const router = useRouter();
  const [services] = useState(() => ({ ...DEFAULT_SERVICES, ...overrides }));
  const [draft, setDraft] = useState<NewDealDraft>(() => ({
    ...EMPTY_DRAFT,
    ...initialDraft,
  }));
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let live = true;
    services
      .loadTeams()
      .then((list) => live && setTeams(list))
      .catch(() => live && setTeams([]));
    return () => {
      live = false;
    };
  }, [services]);

  useEffect(() => {
    if (!draft.teamId) return;
    let live = true;
    services
      .loadMembers(draft.teamId)
      .then((list) => live && setMembers(list))
      .catch(() => live && setMembers([]));
    return () => {
      live = false;
    };
  }, [draft.teamId, services]);

  const update = <K extends keyof NewDealDraft>(key: K, value: NewDealDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const onTeamChange = (teamId: string) => {
    setMembers([]);
    setDraft((d) => ({ ...d, teamId, assignedToId: "" }));
  };

  const onValueChange = (input: string) => {
    const read = readValueInput(input);
    if (!read) return;
    if ("error" in read) {
      setError(read.error);
      return;
    }
    setError((prev) => (prev.startsWith("Max deal value is $") ? "" : prev));
    update("value", read.digits);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const problem = validateDraft(draft);
    if (problem) {
      setError(problem);
      return;
    }
    const formData = toFormData(draft);
    startTransition(async () => {
      try {
        const deal = await services.createDeal(formData);
        trackEvent(ANALYTICS_EVENTS.DEAL_CREATED);
        router.push(deal?.id ? `/deals/${deal.id}` : "/deals");
      } catch (err) {
        const msg = err instanceof Error && err.message ? err.message : FAILED;
        setError(msg);
        toast.error(msg);
      }
    });
  };

  const team = teams.find((t) => t.id === draft.teamId) ?? null;
  const stage = STAGE_CHOICES.find((s) => s.value === draft.stage) ?? null;
  const channel = CHANNEL_CHOICES.find((c) => c.value === draft.channel) ?? null;
  const errorId = error ? "deal-error" : undefined;

  return (
    <>
      <PageHero
        label="New deal"
        back={{ href: "/deals", label: "All deals" }}
        headline="A new entry in the"
        emphasis="book."
        clause="a name, a stage and a value."
        deck="Those three are all a deal needs. Everything else is optional, and you can log activity on the deal's page once it exists."
      />

      <form
        className="dl-grid dl-grow dl-nd"
        aria-label="New deal"
        onSubmit={onSubmit}
        noValidate
      >
        <div className="dl-two-thirds dl-dd-col">
          <FormSection title="The deal" sub="Name it the way your team says it.">
            <div className="dl-form-row is-2">
              <label>
                <b>
                  Deal name
                  <Required />
                </b>
                <input
                  className="dl-st-field"
                  name="deal-name"
                  type="text"
                  value={draft.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Acme Corp · Enterprise license"
                  aria-label="Deal name"
                  aria-required="true"
                  aria-describedby={errorId}
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                  autoFocus
                />
              </label>
              <label>
                <b>
                  Value
                  <span className="dl-req">Required, USD</span>
                </b>
                <span className="dl-prefix">
                  <span aria-hidden>$</span>
                  <input
                    className="dl-st-field"
                    name="deal-value"
                    type="text"
                    inputMode="numeric"
                    value={formatDigits(draft.value)}
                    onChange={(e) => onValueChange(e.target.value)}
                    placeholder="0"
                    aria-label="Value in US dollars"
                    aria-required="true"
                    aria-describedby={errorId ? `deal-value-note ${errorId}` : "deal-value-note"}
                    autoComplete="off"
                  />
                </span>
                <small id="deal-value-note">Up to $20,000,000,000.</small>
              </label>
            </div>
          </FormSection>

          <FormSection
            title="Stage"
            required
            sub="Where the deal stands today."
          >
            <div className="dl-dd-body">
              <div
                className="dl-options"
                role="radiogroup"
                aria-label="Stage"
                aria-required="true"
              >
                {STAGE_CHOICES.map((s) => (
                  <label key={s.value} className="dl-option">
                    <input
                      type="radio"
                      name="stage"
                      value={s.value}
                      checked={draft.stage === s.value}
                      onChange={() => update("stage", s.value)}
                    />
                    <span>
                      <b>{s.label}</b>
                      <small>{s.description}</small>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Channel"
            sub="How the deal found you. Used for attribution."
          >
            <div className="dl-dd-body">
              <div className="dl-options" role="radiogroup" aria-label="Channel">
                {CHANNEL_CHOICES.map((c) => (
                  <label key={c.value} className="dl-option">
                    <input
                      type="radio"
                      name="channel"
                      value={c.value}
                      checked={draft.channel === c.value}
                      onChange={() => update("channel", c.value)}
                    />
                    <span>
                      <b>{c.label}</b>
                      <small>{c.description}</small>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Optional"
            sub={
              teams.length > 0
                ? "Location, and who on your team owns it."
                : "Where the deal is based."
            }
          >
            <div className="dl-form-row is-3">
              <label>
                <b>Location</b>
                <SelectField
                  name="location"
                  value={draft.location}
                  onChange={(e) => update("location", e.target.value)}
                >
                  <option value="">Select a country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </SelectField>
              </label>
              {teams.length > 0 && (
                <label>
                  <b>Team</b>
                  <SelectField
                    name="team"
                    value={draft.teamId}
                    onChange={(e) => onTeamChange(e.target.value)}
                  >
                    <option value="">Personal</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </SelectField>
                </label>
              )}
              {draft.teamId && members.length > 0 && (
                <label>
                  <b>Assign to</b>
                  <SelectField
                    name="assignee"
                    value={draft.assignedToId}
                    onChange={(e) => update("assignedToId", e.target.value)}
                    aria-label="Assign to"
                    aria-describedby="deal-assignee-note"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.userId}>
                        {memberName(m)}
                      </option>
                    ))}
                  </SelectField>
                  <small id="deal-assignee-note">Shown once a team is picked.</small>
                </label>
              )}
            </div>
          </FormSection>

          {error && (
            <div
              id="deal-error"
              role="alert"
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                padding: "12px var(--dl-gutter)",
                borderTop: "1px solid var(--dl-row)",
                background: "var(--dl-signal-tint)",
                color: "var(--dl-signal-d)",
                fontSize: 13.5,
                fontWeight: 500,
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "relative",
                  top: -1,
                  width: 7,
                  height: 7,
                  flexShrink: 0,
                  borderRadius: "50%",
                  background: "var(--dl-signal)",
                }}
              />
              {error}
            </div>
          )}

          <div className="dl-form-foot" style={{ justifyContent: "flex-start" }}>
            <button
              type="submit"
              disabled={isPending}
              aria-busy={isPending || undefined}
              className="dl-btn-primary"
              style={primaryButtonStyle}
            >
              {isPending ? "Creating deal" : "Create deal"}
            </button>
            <Link href="/deals" className="dl-btn-secondary" style={secondaryButtonStyle}>
              Cancel
            </Link>
          </div>
        </div>

        <aside className="dl-third dl-dd-col" aria-label="Preview">
          <section className="dl-dd-sec">
            <CellHead title="Preview" sub="How it reads in your deals" />
            <div className="dl-dd-body">
              <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                <Monogram name={draft.name} label={draft.name.trim() ? undefined : ""} />
                <div style={{ minWidth: 0 }}>
                  <b
                    style={{
                      ...ellipsis,
                      display: "block",
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      color: draft.name.trim() ? undefined : "var(--dl-unit)",
                    }}
                  >
                    {draft.name.trim() || "Deal name"}
                  </b>
                  <small
                    style={{
                      ...ellipsis,
                      display: "block",
                      fontSize: 12.5,
                      color: "var(--dl-muted)",
                    }}
                  >
                    {team?.name ?? "Personal"} · {channel?.label}
                  </small>
                </div>
              </div>
              <PreviewRow label="Stage" valueSize={14} style={{ marginTop: 14 }}>
                {stage ? stage.label : <NotSet />}
              </PreviewRow>
              <PreviewSteps stage={draft.stage} />
              <PreviewRow label="Value">
                {draft.value && parseInt(draft.value, 10) > 0 ? (
                  fullCurrency(parseInt(draft.value, 10))
                ) : (
                  <NotSet />
                )}
              </PreviewRow>
            </div>
          </section>
          <section className="dl-dd-sec dl-grow">
            <div className="dl-dd-body" style={{ paddingTop: 18 }}>
              <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--dl-muted)" }}>
                After you create it you go straight to the deal&apos;s page, where
                Sentinel shows its risk and you can log emails and meetings.
              </p>
            </div>
          </section>
        </aside>
      </form>
    </>
  );
}

const ellipsis = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;

function FormSection({
  title,
  sub,
  required = false,
  children,
}: {
  title: string;
  sub: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="dl-dd-sec" aria-label={title}>
      <div style={{ padding: "22px var(--dl-gutter) 12px" }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>
          {title}
          {required && <Required />}
        </h2>
        <p style={{ marginTop: 2, fontSize: 13, color: "var(--dl-muted)" }}>{sub}</p>
      </div>
      {children}
    </section>
  );
}

function PreviewRow({
  label,
  valueSize = 15,
  style,
  children,
}: {
  label: string;
  valueSize?: number;
  style?: React.CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 16,
        padding: "11px 0",
        borderTop: "1px solid var(--dl-row)",
        fontSize: 13.5,
        color: "var(--dl-text-2)",
        ...style,
      }}
    >
      <span>{label}</span>
      <b
        style={{
          ...ellipsis,
          minWidth: 0,
          fontSize: valueSize,
          fontWeight: 600,
          color: "var(--dl-ink)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {children}
      </b>
    </div>
  );
}

function NotSet() {
  return <span style={{ fontWeight: 500, color: "var(--dl-unit)" }}>Not set</span>;
}

function PreviewSteps({ stage }: { stage: string }) {
  const step = stageStep(stage);
  const closedColor =
    stage === STAGES.CLOSED_WON
      ? "var(--dl-green)"
      : stage === STAGES.CLOSED_LOST
        ? "var(--dl-guide)"
        : null;
  return (
    <div aria-hidden style={{ display: "flex", gap: 3, margin: "2px 0 6px" }}>
      {Array.from({ length: STAGE_STEP_COUNT }, (_, i) => (
        <span
          key={i}
          style={{
            width: 18,
            height: 3,
            borderRadius: 2,
            background:
              closedColor ??
              (step !== null && i < step ? "var(--dl-ink)" : "var(--dl-seg)"),
          }}
        />
      ))}
    </div>
  );
}
