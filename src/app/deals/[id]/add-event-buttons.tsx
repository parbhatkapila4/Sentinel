"use client";

import { createDealEvent } from "@/app/actions/events";
import { useRouter } from "next/navigation";
import { useState } from "react";

type EventType = "email_received" | "email_sent" | "meeting_held";

export function AddEventButtons({ dealId }: { dealId: string }) {
  const [pending, setPending] = useState<EventType | null>(null);
  const router = useRouter();

  async function handleAddEvent(type: EventType) {
    setPending(type);
    try {
      await createDealEvent(dealId, type, {});
      router.refresh();
    } catch (error) {
      console.error("Failed to create event:", error);
    } finally {
      setPending(null);
    }
  }

  const buttons: { type: EventType; label: string }[] = [
    { type: "email_received", label: "Email received" },
    { type: "email_sent", label: "Email sent" },
    { type: "meeting_held", label: "Meeting held" },
  ];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {buttons.map((btn) => {
        const loading = pending === btn.type;
        return (
          <button
            key={btn.type}
            type="button"
            onClick={() => handleAddEvent(btn.type)}
            disabled={pending !== null}
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "8px 14px",
              border: "1px solid var(--rule-strong)",
              background: "var(--ink)",
              color: "var(--cream-2)",
              cursor: pending !== null ? "wait" : "pointer",
              opacity: pending !== null && !loading ? 0.4 : 1,
            }}
          >
            {loading ? "Adding…" : btn.label}
          </button>
        );
      })}
    </div>
  );
}
