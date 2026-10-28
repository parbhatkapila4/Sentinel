"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createDealEvent } from "@/app/actions/events";
import {
  BigFigure,
  CellHead,
  KeyValue,
  Pill,
  Square,
  TIER_COLOR,
  Track,
  dangerButtonStyle,
  secondaryButtonStyle,
  smallButtonStyle,
  subStyle,
  unitStyle,
} from "../blocks";
import { plural } from "../book";
import {
  ACTIVITY_COLOR,
  TRACK_COLOR,
  type ActivityEntry,
  type ForecastView,
  type MeetingView,
  type NextStepView,
  type StepReason,
} from "./model";

export const smallSecondary: CSSProperties = { ...secondaryButtonStyle, ...smallButtonStyle };

const strongStyle: CSSProperties = { fontWeight: 600, color: "var(--dl-ink)" };

function Reasons({ reasons, empty }: { reasons: StepReason[]; empty: string }) {
  if (reasons.length === 0) {
    return <p style={{ ...subStyle, marginTop: 6 }}>{empty}</p>;
  }
  return (
    <ul className="dl-dd-reasons" style={{ marginTop: 6 }}>
      {reasons.map((r) => (
        <li key={r.text}>
          <Square color={TIER_COLOR[r.tier]} />
          {r.text}
        </li>
      ))}
    </ul>
  );
}

function RiskColumn({ step, title }: { step: Extract<NextStepView, { riskNote: string }>; title: string }) {
  return (
    <div>
      <div className="dl-dd-label">{title}</div>
      <Reasons reasons={step.reasons} empty="No risk signals right now." />
      <Track
        percent={step.riskPercent}
        color={TRACK_COLOR[step.riskTier]}
        label={`Risk ${step.riskPercent}%`}
        style={{ marginTop: 14 }}
      />
      <p style={{ ...subStyle, marginTop: 6 }}>{step.riskNote}</p>
    </div>
  );
}

export function NextStepSection({ step }: { step: NextStepView }) {
  if (step.kind === "closed") {
    const won = step.outcome === "won";
    return (
      <section className="dl-dd-sec" aria-label="Next step">
        <CellHead
          title="Next step"
          pill={<Pill tone={won ? "good" : "neutral"}>{won ? "Won" : "Lost"}</Pill>}
        />
        <div className="dl-dd-split">
          <div>
            <div className="dl-dd-label">Outcome</div>
            <p className="dl-dd-action">{won ? "Closed won" : "Closed lost"}</p>
            <p className="dl-dd-due">
              Nothing is due on a closed deal. Move it back to an open stage above if the talks restart.
            </p>
          </div>
          <div>
            <div className="dl-dd-label">Time to close</div>
            <p className="dl-dd-action">{step.cycle}</p>
            <p className="dl-dd-due">{step.range}</p>
          </div>
        </div>
      </section>
    );
  }

  if (step.kind === "steady") {
    return (
      <section className="dl-dd-sec" aria-label="Next step and risk">
        <CellHead title="Next step" pill={<Pill tone="good">On track</Pill>} />
        <div className="dl-dd-split">
          <div>
            <div className="dl-dd-label">Status</div>
            <p className="dl-dd-action">Nothing is due</p>
            <p className="dl-dd-due">
              Activity is within the expected range. Sentinel flags the deal here if it goes quiet.
            </p>
            {step.suggestion && (
              <>
                <div className="dl-dd-label" style={{ marginTop: 16 }}>
                  Sentinel suggests
                </div>
                <p className="dl-dd-due" style={{ marginTop: 4 }}>
                  <b style={strongStyle}>{step.suggestion}</b>
                </p>
              </>
            )}
          </div>
          <RiskColumn step={step} title="What to watch" />
        </div>
      </section>
    );
  }

  return (
    <section className="dl-dd-sec" aria-label="Next step and risk">
      <CellHead
        title="Next step"
        pill={step.pill ? <Pill tone={step.pill.tone}>{step.pill.label}</Pill> : undefined}
      />
      <div className="dl-dd-split">
        <div>
          <div className="dl-dd-label">Sentinel recommends</div>
          <p className="dl-dd-action">{step.action}</p>
          <p className="dl-dd-due">
            {step.due ? (
              <>
                {step.due.text}
                {step.due.late && (
                  <>
                    {" · "}
                    <span style={{ color: "var(--dl-signal-d)" }}>{step.due.late}</span>
                  </>
                )}
              </>
            ) : (
              "Sentinel has not set a due date for this step."
            )}
          </p>
          {step.urgency && (
            <>
              <div className="dl-dd-label" style={{ marginTop: 16 }}>
                Urgency
              </div>
              <div style={{ display: "flex", marginTop: 6 }}>
                <Pill tone={step.urgency.tone}>{step.urgency.label}</Pill>
              </div>
            </>
          )}
        </div>
        <RiskColumn step={step} title="Why it is at risk" />
      </div>
    </section>
  );
}

const LOG_BUTTONS = [
  { type: "email_received", label: "Email received" },
  { type: "email_sent", label: "Email sent" },
  { type: "meeting_held", label: "Meeting held" },
] as const;

type LogType = (typeof LOG_BUTTONS)[number]["type"];

export function ActivitySection({
  dealId,
  entries,
}: {
  dealId: string;
  entries: ActivityEntry[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState<LogType | null>(null);

  async function log(type: LogType, label: string) {
    setPending(type);
    try {
      await createDealEvent(dealId, type, {});
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? `Could not log "${label}": ${err.message}`
          : `Could not log "${label}". Try again.`
      );
    } finally {
      setPending(null);
    }
  }

  return (
    <section className="dl-dd-sec dl-grow" aria-label="Activity">
      <CellHead
        title="Activity"
        sub={plural(entries.length, "entry", "entries")}
        right={
          <div className="dl-dd-log" role="group" aria-label="Log activity">
            {LOG_BUTTONS.map((b) => (
              <button
                key={b.type}
                type="button"
                onClick={() => log(b.type, b.label)}
                disabled={pending !== null}
                aria-busy={pending === b.type || undefined}
                className="dl-btn-secondary"
                style={{
                  ...smallSecondary,
                  opacity: pending !== null && pending !== b.type ? 0.55 : 1,
                  cursor: pending !== null ? "not-allowed" : "pointer",
                }}
              >
                {pending === b.type ? "Logging" : b.label}
              </button>
            ))}
          </div>
        }
      />
      <ol className="dl-dd-body dl-dd-tl">
        {entries.map((e) => (
          <li key={e.id}>
            <span className="dl-dd-what">
              <Square color={ACTIVITY_COLOR[e.tone]} />
              <span>
                <b>{e.title}</b>
                {e.detail && <> · {e.detail}</>}
              </span>
            </span>
            <time dateTime={new Date(e.at).toISOString()}>{e.when}</time>
          </li>
        ))}
      </ol>
    </section>
  );
}

function SimilarList({ similar }: { similar: NonNullable<ForecastView["similar"]> }) {
  return (
    <>
      <div className="dl-dd-label" style={{ marginTop: 14 }}>
        {similar.summary}
      </div>
      <ul className="dl-dd-similar" style={{ marginTop: 6 }}>
        {similar.rows.map((r) => (
          <li key={r.id}>
            <Link href={`/deals/${r.id}`} className="dl-link" title={r.name}>
              {r.name}
            </Link>
            <Pill tone={r.outcome === "won" ? "good" : "neutral"}>
              {r.outcome === "won" ? "Won" : "Lost"}
            </Pill>
            <span>{r.days}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

export function ForecastSection({ forecast }: { forecast: ForecastView }) {
  if (forecast.kind === "closed") {
    return (
      <section className="dl-dd-sec" aria-label="Forecast">
        <CellHead title="Forecast" pill={<Pill>Closed</Pill>} />
        <div className="dl-dd-body">
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--dl-text-2)" }}>
            The forecast stops once a deal closes. This one closed {forecast.outcome} after{" "}
            {forecast.cycle}.
          </p>
          {forecast.similar && <SimilarList similar={forecast.similar} />}
          {forecast.emptyNote && (
            <p style={{ ...subStyle, marginTop: 14 }}>{forecast.emptyNote}</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="dl-dd-sec" aria-label="Forecast">
      <CellHead
        title="Forecast"
        pill={<Pill tone={forecast.trend.tone}>{forecast.trend.label}</Pill>}
      />
      <div className="dl-dd-body">
        <div className="dl-dd-label">Chance to win</div>
        <div style={{ marginTop: 2 }}>
          <BigFigure>
            {forecast.chance}
            <span style={unitStyle}>%</span>
          </BigFigure>
        </div>
        <Track
          percent={forecast.chance}
          label={`Chance to win ${forecast.chance}%`}
          style={{ marginTop: 8 }}
        />
        <div style={{ marginTop: 14 }}>
          <KeyValue label="Expected to close in">{forecast.closeIn}</KeyValue>
          <KeyValue label="Confidence">{forecast.confidence}</KeyValue>
        </div>
        {forecast.factors.length > 0 && (
          <>
            <div className="dl-dd-label" style={{ marginTop: 14 }}>
              What moves it
            </div>
            <ul className="dl-dd-reasons" style={{ marginTop: 6 }}>
              {forecast.factors.map((f) => (
                <li key={f.text}>
                  <Square color={TIER_COLOR[f.tier]} />
                  {f.text}
                </li>
              ))}
            </ul>
          </>
        )}
        {forecast.similar && <SimilarList similar={forecast.similar} />}
        {forecast.emptyNote && (
          <p style={{ ...subStyle, marginTop: 14 }}>{forecast.emptyNote}</p>
        )}
      </div>
    </section>
  );
}

export function MeetingsSection({
  meetings,
  calendarConnected,
  onAdd,
}: {
  meetings: MeetingView[];
  calendarConnected: boolean;
  onAdd: (trigger: HTMLElement) => void;
}) {
  return (
    <section className="dl-dd-sec" aria-label="Meetings">
      <CellHead
        title="Meetings"
        sub="Upcoming"
        right={
          <button
            type="button"
            onClick={(e) => onAdd(e.currentTarget)}
            className="dl-btn-secondary"
            style={smallSecondary}
          >
            Add meeting
          </button>
        }
      />
      <div className="dl-dd-body">
        {meetings.length === 0 ? (
          <p
            style={{
              padding: "12px 0 0",
              borderTop: "1px solid var(--dl-row)",
              fontSize: 13.5,
              color: "var(--dl-muted)",
            }}
          >
            No upcoming meetings for this deal.
          </p>
        ) : (
          meetings.map((m) => (
            <div key={m.id} className="dl-dd-meet">
              <div className="dl-dd-date">
                <small>{m.month}</small>
                <b>{m.day}</b>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ overflowWrap: "anywhere" }}>{m.title}</p>
                <small>{m.when}</small>
                {m.people && <small style={{ overflowWrap: "anywhere" }}>{m.people}</small>}
                {m.note && <small style={{ overflowWrap: "anywhere" }}>{m.note}</small>}
              </div>
              {m.link ? (
                <a
                  href={m.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dl-btn-secondary"
                  style={smallSecondary}
                >
                  Join
                </a>
              ) : (
                <span />
              )}
            </div>
          ))
        )}
        {!calendarConnected && (
          <p style={{ ...subStyle, marginTop: 12, lineHeight: 1.5 }}>
            Meetings from Google Calendar show up here once it is connected in{" "}
            <Link
              href="/settings?tab=integrations"
              className="dl-link"
              style={{ color: "var(--dl-ink)", textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              Settings
            </Link>
            .
          </p>
        )}
      </div>
    </section>
  );
}

export function DetailsSection({
  details,
  grow,
}: {
  details: Array<{ label: string; value: string }>;
  grow: boolean;
}) {
  return (
    <section className={grow ? "dl-dd-sec dl-grow" : "dl-dd-sec"} aria-label="Details">
      <CellHead title="Details" />
      <div className="dl-dd-body">
        {details.map((d) => (
          <KeyValue key={d.label} label={d.label}>
            {d.value}
          </KeyValue>
        ))}
      </div>
    </section>
  );
}

export function DeleteSection({ onDelete }: { onDelete: (trigger: HTMLElement) => void }) {
  return (
    <section className="dl-dd-sec dl-grow" aria-label="Delete">
      <div
        className="dl-dd-body"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          paddingTop: 18,
        }}
      >
        <div>
          <b style={{ display: "block", fontSize: 14, fontWeight: 500 }}>Delete this deal</b>
          <small style={{ ...subStyle, display: "block" }}>Its history and events go with it.</small>
        </div>
        <button
          type="button"
          onClick={(e) => onDelete(e.currentTarget)}
          className="dl-btn-secondary"
          style={{ ...dangerButtonStyle, ...smallButtonStyle }}
        >
          Delete deal
        </button>
      </div>
    </section>
  );
}
