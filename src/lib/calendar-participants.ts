import { normalizeContactEmail } from "./contact-utils";

export interface GoogleCalendarEventAttendee {
  email?: string;
  displayName?: string;
  responseStatus?: string;
  organizer?: boolean;
  self?: boolean;
}

export interface GoogleCalendarEvent {
  id?: string;
  summary?: string;
  organizer?: { email?: string; displayName?: string; self?: boolean };
  attendees?: GoogleCalendarEventAttendee[];
}

export interface CalendarParticipants {
  all: string[];
  attendees: string[];
  organizer: string | null;
}

export function extractCalendarParticipants(
  event: GoogleCalendarEvent
): CalendarParticipants {
  const organizerRaw = event.organizer?.email;
  const organizer = normalizeContactEmail(organizerRaw);

  const attendeesSet = new Set<string>();
  const attendees: string[] = [];
  for (const attendee of event.attendees ?? []) {
    const normalized = normalizeContactEmail(attendee?.email);
    if (!normalized) continue;
    if (attendeesSet.has(normalized)) continue;
    attendeesSet.add(normalized);
    attendees.push(normalized);
  }

  const seen = new Set<string>();
  const all: string[] = [];
  const append = (value: string | null) => {
    if (!value) return;
    if (seen.has(value)) return;
    seen.add(value);
    all.push(value);
  };
  append(organizer);
  for (const a of attendees) append(a);

  return { all, attendees, organizer };
}
