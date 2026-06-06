"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { toast } from "sonner";
import {
  getUpcomingMeetings,
  getGoogleCalendarStatus,
  createMeetingForDeal,
} from "@/app/actions/google-calendar";
import { formatDate, formatTime } from "@/lib/utils";
import { getFocusableElements, trapFocus } from "@/lib/a11y";

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  location: string | null;
  meetingLink: string | null;
  dealId: string | null;
}

interface DealMeetingsProps {
  dealId: string;
  dealName: string;
}

const META_LABEL: React.CSSProperties = {
  fontFamily: "var(--font-mono-jb)",
  fontSize: 10,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--cream-3)",
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  fontFamily: "var(--font-mono-jb)",
  fontSize: 13,
  letterSpacing: "0.04em",
  padding: "11px 14px",
  background: "var(--ink-02)",
  border: "1px solid var(--rule-strong)",
  color: "var(--cream)",
  outline: "none",
};

const TEXTAREA_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  fontFamily: "var(--font-serif)",
  fontSize: 15,
  lineHeight: 1.6,
  letterSpacing: 0,
  padding: "14px 16px",
  resize: "vertical",
  minHeight: 96,
};

const GHOST_BUTTON: React.CSSProperties = {
  fontFamily: "var(--font-mono-jb)",
  fontSize: 10.5,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  padding: "9px 16px",
  border: "1px solid var(--rule-strong)",
  background: "transparent",
  color: "var(--cream-2)",
  cursor: "pointer",
};

const PRIMARY_BUTTON: React.CSSProperties = {
  fontFamily: "var(--font-mono-jb)",
  fontSize: 10.5,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  padding: "9px 18px",
  border: "1px solid var(--signal)",
  background: "var(--signal)",
  color: "var(--ink)",
  cursor: "pointer",
  fontWeight: 600,
};

export function DealMeetings({ dealId, dealName }: DealMeetingsProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    attendees: "",
    location: "",
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    async function loadMeetings() {
      try {
        const status = await getGoogleCalendarStatus();
        setCalendarConnected(status.connected);
        if (status.connected) {
          const dealMeetings = await getUpcomingMeetings(dealId);
          setMeetings(dealMeetings);
        }
      } catch (error) {
        console.error("Failed to load meetings:", error);
      } finally {
        setLoadingMeetings(false);
      }
    }
    loadMeetings();
  }, [dealId]);

  const closeScheduleModal = useCallback(() => {
    if (isCreating) return;
    setShowScheduleModal(false);
    triggerRef.current?.focus();
  }, [isCreating]);

  useEffect(() => {
    if (!showScheduleModal || !dialogRef.current) return;
    const first = getFocusableElements(dialogRef.current)[0];
    first?.focus();
  }, [showScheduleModal]);

  useEffect(() => {
    if (!showScheduleModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeScheduleModal();
        return;
      }
      if (dialogRef.current && trapFocus(e, dialogRef.current)) {
        e.stopPropagation();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showScheduleModal, closeScheduleModal]);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newMeeting.title ||
      !newMeeting.date ||
      !newMeeting.startTime ||
      !newMeeting.endTime
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      const startDateTime = new Date(`${newMeeting.date}T${newMeeting.startTime}`);
      const endDateTime = new Date(`${newMeeting.date}T${newMeeting.endTime}`);

      const meeting = await createMeetingForDeal(dealId, {
        title: newMeeting.title,
        description: newMeeting.description || undefined,
        startTime: startDateTime,
        endTime: endDateTime,
        attendees: newMeeting.attendees
          ? newMeeting.attendees.split(",").map((a) => a.trim())
          : undefined,
        location: newMeeting.location || undefined,
      });

      setMeetings((prev) =>
        [
          ...prev,
          {
            ...meeting,
            description: null,
            attendees: [],
            location: null,
            meetingLink: null,
            dealId,
          },
        ].sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
      );
      setShowScheduleModal(false);
      setNewMeeting({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        attendees: "",
        location: "",
      });
      toast.success("Meeting scheduled");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to schedule meeting"
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <section
        style={{
          border: "1px solid var(--rule)",
          background: "var(--ink-02)",
          padding: "28px 26px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 24,
            paddingBottom: 14,
            borderBottom: "1px solid var(--rule)",
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <span style={META_LABEL}>§ ☖ - MEETINGS</span>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 26,
                fontWeight: 400,
                color: "var(--cream)",
                letterSpacing: "-0.02em",
                margin: "6px 0 0",
              }}
            >
              The{" "}
              <em style={{ fontStyle: "italic", color: "var(--signal)" }}>
                agenda
              </em>
              .
            </h2>
          </div>
          {calendarConnected && (
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setShowScheduleModal(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "8px 16px",
                border: "1px solid var(--signal)",
                background: "transparent",
                color: "var(--signal)",
                cursor: "pointer",
              }}
            >
              <svg
                aria-hidden
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>Schedule</span>
            </button>
          )}
        </div>

        {!calendarConnected ? (
          <div
            style={{
              padding: "36px 0 30px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span
              style={{
                ...META_LABEL,
                color: "var(--copper)",
              }}
            >
              CALENDAR NOT CONNECTED
            </span>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 16,
                lineHeight: 1.55,
                color: "var(--cream-2)",
                margin: 0,
                maxWidth: 440,
              }}
            >
              Connect Google Calendar to pull upcoming meetings for this deal
              and schedule new ones without leaving Sentinel.
            </p>
            <Link
              href="/settings"
              style={{
                ...GHOST_BUTTON,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                marginTop: 4,
              }}
            >
              Connect in settings
              <span aria-hidden style={{ color: "var(--signal)" }}>
                →
              </span>
            </Link>
          </div>
        ) : loadingMeetings ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  padding: "18px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--rule)",
                }}
              >
                <div
                  style={{
                    height: 14,
                    width: "40%",
                    background: "var(--rule)",
                    opacity: 0.6,
                    marginBottom: 10,
                  }}
                />
                <div
                  style={{
                    height: 10,
                    width: "60%",
                    background: "var(--rule)",
                    opacity: 0.35,
                  }}
                />
              </div>
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <p
            style={{
              padding: "30px 0",
              textAlign: "center",
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 15,
              color: "var(--cream-3)",
              margin: 0,
            }}
          >
            No upcoming meetings on the books for this deal.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {meetings.map((meeting, i) => (
              <li
                key={meeting.id}
                style={{
                  display: "flex",
                  gap: 20,
                  alignItems: "flex-start",
                  padding: "18px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--rule)",
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 72,
                    paddingTop: 2,
                  }}
                >
                  <div
                    style={{
                      ...META_LABEL,
                      color: "var(--signal)",
                      letterSpacing: "0.14em",
                    }}
                  >
                    {formatDate(meeting.startTime)}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 12,
                      letterSpacing: "0.08em",
                      color: "var(--cream-2)",
                      marginTop: 4,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatTime(meeting.startTime)}–{formatTime(meeting.endTime)}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 17,
                      color: "var(--cream)",
                      letterSpacing: "-0.005em",
                      margin: 0,
                    }}
                  >
                    {meeting.title}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "4px 14px",
                      marginTop: 8,
                    }}
                  >
                    {meeting.location && (
                      <span
                        style={{
                          ...META_LABEL,
                          letterSpacing: "0.1em",
                          color: "var(--cream-3)",
                        }}
                      >
                        ◉ {meeting.location}
                      </span>
                    )}
                    {meeting.attendees?.length > 0 && (
                      <span
                        style={{
                          ...META_LABEL,
                          letterSpacing: "0.1em",
                          color: "var(--cream-3)",
                          textTransform: "none",
                        }}
                      >
                        {meeting.attendees.length === 1
                          ? meeting.attendees[0]
                          : `${meeting.attendees.length} attendees`}
                      </span>
                    )}
                  </div>
                  {meeting.description && (
                    <p
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 14,
                        lineHeight: 1.55,
                        color: "var(--cream-3)",
                        margin: "10px 0 0",
                      }}
                    >
                      {meeting.description}
                    </p>
                  )}
                </div>
                {meeting.meetingLink && (
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...GHOST_BUTTON,
                      borderColor: "var(--signal)",
                      color: "var(--signal)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
                    Join
                    <span aria-hidden>↗</span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {showScheduleModal &&
        mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={closeScheduleModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-meeting-title"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              background: "rgba(18, 18, 18, 0.72)",
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              ref={dialogRef}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 560,
                maxHeight: "calc(100vh - 32px)",
                overflowY: "auto",
                background: "var(--ink)",
                border: "1px solid var(--rule-strong)",
                padding: "28px 28px 24px",
                boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.6)",
              }}
            >
              <div
                style={{
                  paddingBottom: 16,
                  marginBottom: 20,
                  borderBottom: "1px solid var(--rule)",
                }}
              >
                <div
                  style={{
                    ...META_LABEL,
                    color: "var(--signal)",
                    marginBottom: 8,
                  }}
                >
                  § ☖ - SCHEDULE
                </div>
                <h2
                  id="schedule-meeting-title"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 26,
                    fontWeight: 400,
                    color: "var(--cream)",
                    letterSpacing: "-0.02em",
                    margin: 0,
                  }}
                >
                  New{" "}
                  <em style={{ fontStyle: "italic", color: "var(--signal)" }}>
                    meeting
                  </em>
                  .
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    color: "var(--cream-3)",
                    margin: "8px 0 0",
                  }}
                >
                  {dealName}
                </p>
              </div>

              <form
                onSubmit={handleCreateMeeting}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                <div>
                  <label
                    htmlFor="mt-title"
                    style={{ ...META_LABEL, display: "block", marginBottom: 8 }}
                  >
                    Title *
                  </label>
                  <input
                    id="mt-title"
                    type="text"
                    value={newMeeting.title}
                    onChange={(e) =>
                      setNewMeeting((m) => ({ ...m, title: e.target.value }))
                    }
                    placeholder="Discovery call, pricing review…"
                    style={INPUT_STYLE}
                    required
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.3fr 1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <label
                      htmlFor="mt-date"
                      style={{
                        ...META_LABEL,
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Date *
                    </label>
                    <input
                      id="mt-date"
                      type="date"
                      value={newMeeting.date}
                      onChange={(e) =>
                        setNewMeeting((m) => ({ ...m, date: e.target.value }))
                      }
                      style={INPUT_STYLE}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="mt-start"
                      style={{
                        ...META_LABEL,
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Start *
                    </label>
                    <input
                      id="mt-start"
                      type="time"
                      value={newMeeting.startTime}
                      onChange={(e) =>
                        setNewMeeting((m) => ({
                          ...m,
                          startTime: e.target.value,
                        }))
                      }
                      style={INPUT_STYLE}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="mt-end"
                      style={{
                        ...META_LABEL,
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      End *
                    </label>
                    <input
                      id="mt-end"
                      type="time"
                      value={newMeeting.endTime}
                      onChange={(e) =>
                        setNewMeeting((m) => ({
                          ...m,
                          endTime: e.target.value,
                        }))
                      }
                      style={INPUT_STYLE}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="mt-attendees"
                    style={{ ...META_LABEL, display: "block", marginBottom: 8 }}
                  >
                    Attendees{" "}
                    <span
                      style={{
                        color: "var(--cream-4)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      (comma separated)
                    </span>
                  </label>
                  <input
                    id="mt-attendees"
                    type="text"
                    value={newMeeting.attendees}
                    onChange={(e) =>
                      setNewMeeting((m) => ({
                        ...m,
                        attendees: e.target.value,
                      }))
                    }
                    placeholder="name@example.com, other@example.com"
                    style={INPUT_STYLE}
                  />
                </div>

                <div>
                  <label
                    htmlFor="mt-location"
                    style={{ ...META_LABEL, display: "block", marginBottom: 8 }}
                  >
                    Location
                  </label>
                  <input
                    id="mt-location"
                    type="text"
                    value={newMeeting.location}
                    onChange={(e) =>
                      setNewMeeting((m) => ({
                        ...m,
                        location: e.target.value,
                      }))
                    }
                    placeholder="Zoom, office, etc."
                    style={INPUT_STYLE}
                  />
                </div>

                <div>
                  <label
                    htmlFor="mt-description"
                    style={{ ...META_LABEL, display: "block", marginBottom: 8 }}
                  >
                    Agenda
                  </label>
                  <textarea
                    id="mt-description"
                    value={newMeeting.description}
                    onChange={(e) =>
                      setNewMeeting((m) => ({
                        ...m,
                        description: e.target.value,
                      }))
                    }
                    placeholder="What's on the table."
                    rows={3}
                    style={TEXTAREA_STYLE}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                    paddingTop: 18,
                    borderTop: "1px solid var(--rule)",
                  }}
                >
                  <button
                    type="button"
                    onClick={closeScheduleModal}
                    disabled={isCreating}
                    style={{
                      ...GHOST_BUTTON,
                      opacity: isCreating ? 0.55 : 1,
                      cursor: isCreating ? "not-allowed" : "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    style={{
                      ...PRIMARY_BUTTON,
                      opacity: isCreating ? 0.7 : 1,
                      cursor: isCreating ? "wait" : "pointer",
                    }}
                  >
                    {isCreating ? "Scheduling…" : "Schedule meeting"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
