"use client";

import { useState } from "react";
import { createMeetingForDeal } from "@/app/actions/google-calendar";
import { primaryButtonStyle, secondaryButtonStyle } from "../blocks";
import { Required } from "../controls";
import { LightDialog } from "../LightDialog";
import { toMeetingView, type MeetingView } from "./model";

interface MeetingForm {
  title: string;
  date: string;
  start: string;
  end: string;
  attendees: string;
  location: string;
  agenda: string;
}

const EMPTY: MeetingForm = {
  title: "",
  date: "",
  start: "",
  end: "",
  attendees: "",
  location: "",
  agenda: "",
};

export function checkMeeting(form: MeetingForm): { error: string | null; missing: Array<keyof MeetingForm> } {
  const missing = (["title", "date", "start", "end"] as const).filter((k) => !form[k].trim());
  if (missing.length > 0) {
    return { error: "Fill in the title, date, start and end.", missing: [...missing] };
  }
  const start = new Date(`${form.date}T${form.start}`);
  const end = new Date(`${form.date}T${form.end}`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: "Check the date and times.", missing: ["date", "start", "end"] };
  }
  if (end.getTime() <= start.getTime()) {
    return { error: "The meeting has to end after it starts.", missing: ["end"] };
  }
  return { error: null, missing: [] };
}

export function MeetingDialog({
  host,
  returnFocus,
  dealId,
  dealName,
  onAdded,
  onClose,
}: {
  host: Element;
  returnFocus: HTMLElement | null;
  dealId: string;
  dealName: string;
  onAdded: (meeting: MeetingView) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<MeetingForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<Array<keyof MeetingForm>>([]);

  const field = (key: keyof MeetingForm) => ({
    value: form[key],
    onChange: (e: { target: { value: string } }) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      if (invalid.includes(key)) setInvalid((list) => list.filter((k) => k !== key));
    },
    disabled: saving,
    "aria-invalid": invalid.includes(key) || undefined,
  });

  async function submit() {
    const check = checkMeeting(form);
    if (check.error) {
      setError(check.error);
      setInvalid(check.missing);
      return;
    }
    setSaving(true);
    setError(null);
    const attendees = form.attendees
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    try {
      const created = await createMeetingForDeal(dealId, {
        title: form.title.trim(),
        description: form.agenda.trim() || undefined,
        startTime: new Date(`${form.date}T${form.start}`),
        endTime: new Date(`${form.date}T${form.end}`),
        attendees: attendees.length > 0 ? attendees : undefined,
        location: form.location.trim() || undefined,
      });
      onAdded(
        toMeetingView({
          id: created.id,
          title: created.title,
          description: form.agenda.trim() || null,
          startTime: created.startTime,
          endTime: created.endTime,
          attendees,
          location: form.location.trim() || null,
          meetingLink: null,
        })
      );
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "The meeting could not be saved.");
      setSaving(false);
    }
  }

  return (
    <LightDialog
      host={host}
      kicker="Add meeting"
      title={dealName}
      maxWidth={560}
      closeButton
      busy={saving}
      returnFocus={returnFocus}
      onSubmit={() => void submit()}
      onClose={onClose}
    >
      <div className="dl-fields">
        <label>
          <b>
            Title
            <Required />
          </b>
          <input className="dl-st-field" placeholder="Discovery call, pricing review" aria-required {...field("title")} />
        </label>
        <div className="dl-fields-3">
          <label>
            <b>
              Date
              <Required />
            </b>
            <input className="dl-st-field" type="date" aria-required {...field("date")} />
          </label>
          <label>
            <b>
              Start
              <Required />
            </b>
            <input className="dl-st-field" type="time" aria-required {...field("start")} />
          </label>
          <label>
            <b>
              End
              <Required />
            </b>
            <input className="dl-st-field" type="time" aria-required {...field("end")} />
          </label>
        </div>
        <label>
          <b>Attendees</b>
          <input className="dl-st-field" placeholder="Email addresses, separated by commas" {...field("attendees")} />
        </label>
        <label>
          <b>Location</b>
          <input className="dl-st-field" placeholder="Zoom, office, phone" {...field("location")} />
        </label>
        <label>
          <b>Agenda</b>
          <textarea className="dl-st-field" rows={3} placeholder="What you want to cover" {...field("agenda")} />
        </label>
      </div>
      <p className="dl-dialog-note">Saved to this deal in Sentinel. It does not add an event to Google Calendar.</p>
      {error && (
        <p role="alert" style={{ marginTop: 10, fontSize: 13.5, fontWeight: 500, color: "var(--dl-signal-d)" }}>
          {error}
        </p>
      )}
      <div className="dl-dialog-foot">
        <span className="dl-spacer" />
        <button type="button" onClick={onClose} disabled={saving} className="dl-btn-secondary" style={secondaryButtonStyle}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          aria-busy={saving || undefined}
          className="dl-btn-primary"
          style={{ ...primaryButtonStyle, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? "Adding" : "Add meeting"}
        </button>
      </div>
    </LightDialog>
  );
}
