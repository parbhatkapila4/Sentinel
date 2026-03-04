"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  getUpcomingMeetings,
  getGoogleCalendarStatus,
  createMeetingForDeal,
} from "@/app/actions/google-calendar";
import { formatDate, formatTime } from "@/lib/utils";

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

export function DealMeetings({ dealId, dealName }: DealMeetingsProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    attendees: "",
    location: "",
  });

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

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title || !newMeeting.date || !newMeeting.startTime || !newMeeting.endTime) {
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
        attendees: newMeeting.attendees ? newMeeting.attendees.split(",").map((a) => a.trim()) : undefined,
        location: newMeeting.location || undefined,
      });

      setMeetings((prev) =>
        [...prev, { ...meeting, description: null, attendees: [], location: null, meetingLink: null, dealId }].sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
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
      toast.success("Meeting scheduled!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to schedule meeting");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="rounded-xl p-5 sm:p-6 border border-white/[0.08] bg-[#080808] transition-colors hover:border-white/[0.1] card-elevated">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white border-l-2 border-white/20 pl-3 [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
            Meetings
          </h3>
          {calendarConnected && (
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[#0f766e]/15 text-teal-400 border border-[#0f766e]/25 hover:bg-[#0f766e]/20 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Schedule
            </button>
          )}
        </div>

        {!calendarConnected ? (
          <div className="text-center py-10">
            <p className="text-white/55 mb-3 text-sm">Connect Google Calendar to see meetings for this deal.</p>
            <Link href="/settings" className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors inline-flex items-center gap-1">
              Connect in Settings
              <span aria-hidden>→</span>
            </Link>
          </div>
        ) : loadingMeetings ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse p-4 rounded-xl bg-white/[0.02]">
                <div className="h-4 w-32 bg-white/10 rounded mb-2"></div>
                <div className="h-3 w-48 bg-white/5 rounded"></div>
              </div>
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/40">No upcoming meetings for this deal</p>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{meeting.title}</p>
                    <p className="text-xs text-white/60 mt-1">
                      {formatDate(meeting.startTime)} · {formatTime(meeting.startTime)} -{" "}
                      {formatTime(meeting.endTime)}
                    </p>
                    {meeting.attendees?.length > 0 && (
                      <p className="text-xs text-white/40 mt-1 flex items-center gap-1">
                        <span>👤</span> {meeting.attendees.join(", ")}
                      </p>
                    )}
                    {meeting.location && (
                      <p className="text-xs text-white/40 mt-1 flex items-center gap-1">
                        <span>📍</span> {meeting.location}
                      </p>
                    )}
                  </div>
                  {meeting.meetingLink && (
                    <a
                      href={meeting.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#0f766e]/20 hover:bg-[#0f766e]/30 border border-[#0f766e]/25 transition-colors"
                    >
                      Join
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {showScheduleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowScheduleModal(false)}
        >
          <div
            className="rounded-xl p-6 max-w-md w-full border border-white/[0.08] bg-[#0a0a0a] card-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white">Schedule meeting</h3>
              <p className="text-sm text-white/50 mt-0.5">{dealName}</p>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting((m) => ({ ...m, title: e.target.value }))}
                  placeholder="Enter meeting title"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Date *</label>
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting((m) => ({ ...m, date: e.target.value }))}
                    className="w-full px-3 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Start *</label>
                  <input
                    type="time"
                    value={newMeeting.startTime}
                    onChange={(e) => setNewMeeting((m) => ({ ...m, startTime: e.target.value }))}
                    className="w-full px-3 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">End *</label>
                  <input
                    type="time"
                    value={newMeeting.endTime}
                    onChange={(e) => setNewMeeting((m) => ({ ...m, endTime: e.target.value }))}
                    className="w-full px-3 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Attendees <span className="text-white/40">(comma separated emails)</span>
                </label>
                <input
                  type="text"
                  value={newMeeting.attendees}
                  onChange={(e) => setNewMeeting((m) => ({ ...m, attendees: e.target.value }))}
                  placeholder="email1@example.com, email2@example.com"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Location</label>
                <input
                  type="text"
                  value={newMeeting.location}
                  onChange={(e) => setNewMeeting((m) => ({ ...m, location: e.target.value }))}
                  placeholder="Office, Zoom, etc."
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting((m) => ({ ...m, description: e.target.value }))}
                  placeholder="Meeting agenda..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-3 rounded-lg text-sm font-medium text-white bg-[#0f766e] hover:bg-[#0d9488] border border-[#0f766e]/40 transition-colors disabled:opacity-50"
                >
                  {isCreating ? "Scheduling…" : "Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
