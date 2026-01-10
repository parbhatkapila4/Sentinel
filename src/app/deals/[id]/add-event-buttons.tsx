"use client";

import { createDealEvent } from "@/app/actions/events";
import { useRouter } from "next/navigation";
import { useState } from "react";

type EventType = "email_received" | "email_sent" | "meeting_held";

export function AddEventButtons({ dealId }: { dealId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleAddEvent(type: EventType) {
    setIsLoading(true);
    try {
      await createDealEvent(dealId, type, {});
      router.refresh();
    } catch (error) {
      console.error("Failed to create event:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const buttons = [
    {
      type: "email_received" as EventType,
      label: "Email Received",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      ),
    },
    {
      type: "email_sent" as EventType,
      label: "Email Sent",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
          />
        </svg>
      ),
    },
    {
      type: "meeting_held" as EventType,
      label: "Meeting Held",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {buttons.map((btn) => (
        <button
          key={btn.type}
          onClick={() => handleAddEvent(btn.type)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 text-white/70 hover:text-white hover:bg-white/[0.06]"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {btn.icon}
          <span>{isLoading ? "Adding..." : btn.label}</span>
        </button>
      ))}
    </div>
  );
}
