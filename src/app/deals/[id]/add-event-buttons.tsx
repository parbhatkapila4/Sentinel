"use client";

import { createDealEvent } from "@/app/actions/events";
import { useState } from "react";

type EventType = "email_received" | "email_sent" | "meeting_held";

export function AddEventButtons({ dealId }: { dealId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleAddEvent(type: EventType) {
    setIsLoading(true);
    try {
      await createDealEvent(dealId, type, {});
    } catch (error) {
      console.error("Failed to create event:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAddEvent("email_received")}
        disabled={isLoading}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {isLoading ? "Adding..." : "Email Received"}
      </button>
      <button
        onClick={() => handleAddEvent("email_sent")}
        disabled={isLoading}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {isLoading ? "Adding..." : "Email Sent"}
      </button>
      <button
        onClick={() => handleAddEvent("meeting_held")}
        disabled={isLoading}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {isLoading ? "Adding..." : "Meeting Held"}
      </button>
    </div>
  );
}
