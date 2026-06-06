import Link from "next/link";
import { format, isToday, isTomorrow } from "date-fns";

interface MeetingItem {
  id: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  location?: string | null;
  meetingLink?: string | null;
  attendees?: string[];
  associatedDealName?: string | null;
}

interface MeetingsListProps {
  meetings: MeetingItem[];
  calendarConnected: boolean;
}

function pillFor(d: Date): { label: string; color: string } | null {
  if (isToday(d)) return { label: "TODAY", color: "var(--signal)" };
  if (isTomorrow(d)) return { label: "TMR", color: "var(--copper)" };
  return null;
}

function durationMin(start: Date, end?: Date): number | null {
  if (!end) return null;
  const diff = (end.getTime() - start.getTime()) / 60000;
  return Math.max(0, Math.round(diff));
}

function buildSampleMeetings(): MeetingItem[] {
  const now = new Date();
  const at = (dayOffset: number, hour: number, minute: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  return [
    {
      id: "sample-1",
      title: "Discovery call",
      startTime: at(0, 10, 0),
      endTime: at(0, 10, 30),
      meetingLink: "https://meet.example.com/sample-1",
      attendees: ["sample-a", "sample-b", "sample-c"],
      associatedDealName: "Acme Retail",
    },
    {
      id: "sample-2",
      title: "Pricing review",
      startTime: at(0, 15, 30),
      endTime: at(0, 16, 15),
      meetingLink: "https://meet.example.com/sample-2",
      attendees: ["sample-a", "sample-b", "sample-c", "sample-d", "sample-e"],
      associatedDealName: "Northwind Logistics",
    },
    {
      id: "sample-3",
      title: "Technical deep-dive",
      startTime: at(1, 9, 0),
      endTime: at(1, 10, 0),
      meetingLink: "https://meet.example.com/sample-3",
      attendees: ["sample-a", "sample-b", "sample-c", "sample-d"],
      associatedDealName: "Contoso Energy",
    },
    {
      id: "sample-4",
      title: "Exec debrief",
      startTime: at(1, 14, 0),
      endTime: at(1, 14, 30),
      location: "Conference room B",
      attendees: ["sample-a", "sample-b"],
      associatedDealName: "Fabrikam Health",
    },
    {
      id: "sample-5",
      title: "Kickoff",
      startTime: at(2, 11, 0),
      endTime: at(2, 11, 30),
      meetingLink: "https://meet.example.com/sample-5",
      attendees: [
        "sample-a",
        "sample-b",
        "sample-c",
        "sample-d",
        "sample-e",
        "sample-f",
      ],
      associatedDealName: "Initech",
    },
    {
      id: "sample-6",
      title: "Quarterly review",
      startTime: at(3, 16, 0),
      endTime: at(3, 16, 45),
      meetingLink: "https://meet.example.com/sample-6",
      attendees: ["sample-a", "sample-b", "sample-c"],
      associatedDealName: "Globex",
    },
  ];
}

export function MeetingsList({ meetings, calendarConnected }: MeetingsListProps) {
  const isSample = !calendarConnected && meetings.length === 0;
  const displayMeetings = isSample ? buildSampleMeetings() : meetings;

  const subtitle = calendarConnected
    ? "GOOGLE CALENDAR · LIVE"
    : isSample
      ? "SAMPLE AGENDA · CONNECT TO GO LIVE"
      : "CALENDAR NOT CONNECTED";

  return (
    <div>
      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 26,
          color: "var(--cream)",
          marginBottom: 6,
          letterSpacing: "-0.01em",
        }}
      >
        Upcoming{" "}
        <em
          style={{
            fontStyle: "italic",
            color: "var(--signal)",
            fontFamily: "var(--font-serif)",
          }}
        >
          meetings
        </em>
      </h3>
      <p
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.14em",
          color: isSample ? "var(--copper)" : "var(--cream-4)",
          textTransform: "uppercase",
          marginBottom: 18,
        }}
      >
        {subtitle}
      </p>

      {displayMeetings.length === 0 ? (
        <p
          style={{
            fontSize: 13,
            color: "var(--cream-4)",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
          }}
        >
          No meetings scheduled.
        </p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            opacity: isSample ? 0.85 : 1,
          }}
        >
          {displayMeetings.slice(0, 6).map((m, i) => {
            const pill = pillFor(m.startTime);
            const min = durationMin(m.startTime, m.endTime);
            return (
              <li
                key={m.id}
                className="anim-rise grid"
                style={{
                  animationDelay: `${100 + i * 60}ms`,
                  gridTemplateColumns: "60px 1fr",
                  gap: 16,
                  padding: "16px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--rule)",
                }}
              >
                <div className="flex flex-col" style={{ gap: 6 }}>
                  <span
                    className="tabular"
                    style={{
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 13,
                      letterSpacing: "0.06em",
                      color: "var(--cream)",
                    }}
                  >
                    {format(m.startTime, "HH:mm")}
                  </span>
                  {pill && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 9,
                        letterSpacing: "0.16em",
                        color: pill.color,
                        border: `1px solid ${pill.color}`,
                        padding: "2px 5px",
                        textAlign: "center",
                      }}
                    >
                      {pill.label}
                    </span>
                  )}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-geist-sans)",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--cream)",
                      lineHeight: 1.3,
                    }}
                  >
                    {m.title}
                    {m.associatedDealName && (
                      <em
                        style={{
                          fontStyle: "italic",
                          color: "var(--cream-2)",
                          fontFamily: "var(--font-serif)",
                          fontWeight: 400,
                          fontSize: 14,
                          marginLeft: 6,
                        }}
                      >
                        with {m.associatedDealName}
                      </em>
                    )}
                  </div>
                  <div
                    className="flex flex-wrap"
                    style={{
                      marginTop: 4,
                      gap: 10,
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 9.5,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--cream-3)",
                    }}
                  >
                    <span>{m.meetingLink ? "VIDEO" : m.location ?? "IN PERSON"}</span>
                    {min !== null && <span>· {min} MIN</span>}
                    {m.attendees && m.attendees.length > 0 && (
                      <span>· {m.attendees.length} ATTENDING</span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {isSample && (
        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid var(--rule)",
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--cream-3)",
          }}
        >
          This is a preview.{" "}
          <Link
            href="/settings"
            style={{
              color: "var(--signal)",
              textDecoration: "none",
              borderBottom: "1px solid var(--signal)",
              paddingBottom: 1,
            }}
          >
            Connect Google Calendar ›
          </Link>
        </div>
      )}
    </div>
  );
}
