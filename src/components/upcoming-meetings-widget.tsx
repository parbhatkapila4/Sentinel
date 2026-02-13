"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getUpcomingMeetings, getGoogleCalendarStatus } from "@/app/actions/google-calendar";
import { formatDate, formatTime } from "@/lib/utils";

interface Meeting {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  location: string | null;
  meetingLink: string | null;
  dealId: string | null;
}

function getDemoMeetings(limit: number): Meeting[] {
  const now = new Date();
  const in1h = new Date(now.getTime() + 60 * 60 * 1000);
  const in3h = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in26h = new Date(now.getTime() + 26 * 60 * 60 * 1000);
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const slots: { start: Date; durationMins: number }[] = [
    { start: in1h, durationMins: 30 },
    { start: in3h, durationMins: 45 },
    { start: in24h, durationMins: 30 },
    { start: in26h, durationMins: 60 },
    { start: in48h, durationMins: 45 },
  ];

  const titles = [
    "Discovery call - Acme Corporation",
    "Product demo - TechStart Inc",
    "Follow-up - Global Systems Ltd",
    "Contract review - Pinnacle Solutions",
    "Kickoff - Horizon Dynamics",
  ];

  return slots.slice(0, Math.min(limit, titles.length)).map((slot, i) => {
    const end = new Date(slot.start.getTime() + slot.durationMins * 60 * 1000);
    return {
      id: `demo-meeting-${i}`,
      title: titles[i],
      startTime: slot.start,
      endTime: end,
      attendees: ["Demo"],
      location: "Video call",
      meetingLink: null,
      dealId: null,
    };
  });
}

export function UpcomingMeetingsWidget({ limit = 5 }: { limit?: number }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [mounted, setMounted] = useState(false);
  const demoMeetings = useMemo(() => (mounted ? getDemoMeetings(limit) : []), [limit, mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadMeetings() {
      try {
        const status = await getGoogleCalendarStatus();
        setConnected(status.connected);
        if (status.connected) {
          const upcomingMeetings = await getUpcomingMeetings();
          setMeetings(upcomingMeetings.slice(0, limit));
        }
      } catch (error) {
        console.error("Failed to load meetings:", error);
      } finally {
        setLoading(false);
      }
    }
    loadMeetings();
  }, [limit]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Upcoming Meetings</h3>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse p-3 rounded-xl bg-white/[0.02]">
            <div className="h-4 w-32 bg-white/10 rounded mb-2"></div>
            <div className="h-3 w-24 bg-white/5 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!connected) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Upcoming Meetings</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-white/50">Demo</span>
            <Link
              href="/settings"
              className="text-sm text-white/40 hover:text-white transition-colors"
            >
              Connect Calendar →
            </Link>
          </div>
        </div>
        <div className="space-y-3">
          {!mounted
            ? [1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse p-3 rounded-xl bg-white/[0.02]">
                  <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                  <div className="h-3 w-24 bg-white/5 rounded" />
                </div>
              ))
            : demoMeetings.map((meeting) => {
            const isToday = new Date(meeting.startTime).toDateString() === new Date().toDateString();
            const isTomorrow =
              new Date(meeting.startTime).toDateString() ===
              new Date(Date.now() + 86400000).toDateString();

            return (
              <div
                key={meeting.id}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{meeting.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md ${
                          isToday
                            ? "bg-red-500/20 text-red-400"
                            : isTomorrow
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-white/10 text-white/60"
                        }`}
                      >
                        {isToday ? "Today" : isTomorrow ? "Tomorrow" : formatDate(meeting.startTime)}
                      </span>
                      <span className="text-xs text-white/40">
                        {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                      </span>
                    </div>
                    {meeting.location && (
                      <p className="text-xs text-white/40 mt-1">{meeting.location}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Upcoming Meetings</h3>
        <Link href="/settings" className="text-sm text-white/40 hover:text-white transition-colors">
          Settings →
        </Link>
      </div>

      {meetings.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-white/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
          </div>
          <p className="text-white/40 text-sm">No upcoming meetings</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map((meeting) => {
            const isToday = new Date(meeting.startTime).toDateString() === new Date().toDateString();
            const isTomorrow =
              new Date(meeting.startTime).toDateString() ===
              new Date(Date.now() + 86400000).toDateString();

            return (
              <div
                key={meeting.id}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{meeting.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md ${isToday
                          ? "bg-red-500/20 text-red-400"
                          : isTomorrow
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-white/10 text-white/60"
                          }`}
                      >
                        {isToday ? "Today" : isTomorrow ? "Tomorrow" : formatDate(meeting.startTime)}
                      </span>
                      <span className="text-xs text-white/40">
                        {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                      </span>
                    </div>
                    {meeting.dealId && (
                      <Link
                        href={`/deals/${meeting.dealId}`}
                        className="text-xs text-blue-400 hover:underline mt-1 inline-block"
                      >
                        View Deal →
                      </Link>
                    )}
                  </div>
                  {meeting.meetingLink && (
                    <a
                      href={meeting.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-500/20 hover:bg-blue-500/30 transition-colors shrink-0"
                    >
                      Join
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
