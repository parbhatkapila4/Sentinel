
export interface GoogleCalendarValidationResult {
  valid: boolean;
  error?: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  location?: string;
  hangoutLink?: string;
  htmlLink?: string;
}

export interface CreateEventParams {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees?: Array<{ email: string }>;
  location?: string;
}

const GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

export async function validateGoogleCalendarCredentials(
  apiKey: string,
  calendarId: string
): Promise<GoogleCalendarValidationResult> {
  try {
    const encodedCalendarId = encodeURIComponent(calendarId);
    const response = await fetch(
      `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodedCalendarId}?key=${apiKey}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      return { valid: true };
    }

    if (response.status === 401 || response.status === 403) {
      const error = await response.json().catch(() => ({}));
      if (error.error?.message?.includes("API key")) {
        return { valid: false, error: "Invalid API key - please check your credentials" };
      }
      return { valid: false, error: "Permission denied - ensure the calendar is public or use OAuth" };
    }

    if (response.status === 404) {
      return { valid: false, error: "Calendar not found - please check the Calendar ID" };
    }

    if (response.status === 429) {
      return { valid: false, error: "Rate limit exceeded - please try again in a few minutes" };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      valid: false,
      error: errorData.error?.message || `Connection failed with status ${response.status}`
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return { valid: false, error: "Could not connect to Google Calendar - please check your network connection" };
    }
    return { valid: false, error: `Connection error: ${String(error)}` };
  }
}

export async function fetchCalendarEvents(
  apiKey: string,
  calendarId: string,
  timeMin: Date,
  timeMax: Date
): Promise<GoogleCalendarEvent[]> {
  const encodedCalendarId = encodeURIComponent(calendarId);
  const params = new URLSearchParams({
    key: apiKey,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "100",
  });

  const response = await fetch(
    `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodedCalendarId}/events?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Failed to fetch events: ${response.status}`);
  }

  const data = await response.json();
  return data.items || [];
}

export async function createCalendarEvent(
  accessToken: string,
  calendarId: string,
  event: CreateEventParams
): Promise<GoogleCalendarEvent> {
  const encodedCalendarId = encodeURIComponent(calendarId);

  const response = await fetch(
    `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodedCalendarId}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Failed to create event: ${response.status}`);
  }

  return response.json();
}

export async function updateCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  updates: Partial<CreateEventParams>
): Promise<GoogleCalendarEvent> {
  const encodedCalendarId = encodeURIComponent(calendarId);
  const encodedEventId = encodeURIComponent(eventId);

  const response = await fetch(
    `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodedCalendarId}/events/${encodedEventId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Failed to update event: ${response.status}`);
  }

  return response.json();
}

export async function deleteCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<void> {
  const encodedCalendarId = encodeURIComponent(calendarId);
  const encodedEventId = encodeURIComponent(eventId);

  const response = await fetch(
    `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodedCalendarId}/events/${encodedEventId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok && response.status !== 204) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Failed to delete event: ${response.status}`);
  }
}

export function mapCalendarEventToMeeting(
  event: GoogleCalendarEvent,
  userId: string
): {
  userId: string;
  externalId: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  location: string | null;
  meetingLink: string | null;
  source: string;
} {
  const startTime = event.start.dateTime
    ? new Date(event.start.dateTime)
    : event.start.date
      ? new Date(event.start.date)
      : new Date();

  const endTime = event.end.dateTime
    ? new Date(event.end.dateTime)
    : event.end.date
      ? new Date(event.end.date)
      : new Date(startTime.getTime() + 60 * 60 * 1000);

  const attendees = event.attendees
    ? event.attendees.map((a) => a.email)
    : [];

  return {
    userId,
    externalId: event.id,
    title: event.summary || "Untitled Meeting",
    description: event.description || null,
    startTime,
    endTime,
    attendees,
    location: event.location || null,
    meetingLink: event.hangoutLink || event.htmlLink || null,
    source: "google_calendar",
  };
}

export function findPotentialDealMatch(
  meeting: {
    title: string;
    description: string | null;
    attendees: string[];
  },
  deals: Array<{
    id: string;
    name: string;
    location?: string | null;
  }>
): string | null {
  for (const deal of deals) {
    const dealNameLower = deal.name.toLowerCase();
    const titleLower = meeting.title.toLowerCase();
    const descLower = (meeting.description || "").toLowerCase();

    if (titleLower.includes(dealNameLower) || dealNameLower.includes(titleLower)) {
      return deal.id;
    }

    if (descLower.includes(dealNameLower)) {
      return deal.id;
    }

    if (deal.location) {
      const dealDomain = deal.location.toLowerCase().replace(/^www\./, "");
      for (const attendee of meeting.attendees) {
        const attendeeDomain = attendee.split("@")[1]?.toLowerCase();
        if (attendeeDomain && dealDomain.includes(attendeeDomain)) {
          return deal.id;
        }
      }
    }
  }

  return null;
}
