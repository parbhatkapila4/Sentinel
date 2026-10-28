"use client";

import { useSyncExternalStore } from "react";
import type { BriefingItem } from "../types";

interface BriefStripProps {
  items: BriefingItem[];
}

type Period = "morning" | "afternoon" | "evening" | "night";

const COUNT_WORDS = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
];

function periodFor(hour: number): Period {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}

function kickerFor(period: Period): string {
  switch (period) {
    case "morning":
      return "Morning brief";
    case "afternoon":
      return "Afternoon brief";
    case "evening":
      return "Evening brief";
    case "night":
      return "Night brief";
  }
}

function titleFor(count: number, period: Period, hour: number): string {
  if (count === 0) {
    switch (period) {
      case "morning":
        return "Today on the desk";
      case "afternoon":
        return "This afternoon on the desk";
      case "evening":
        return "This evening on the desk";
      case "night":
        return "Tonight on the desk";
    }
  }
  const word = COUNT_WORDS[count] ?? String(count);
  const thing = count === 1 ? "thing" : "things";
  if (period === "morning") return `${word} ${thing} before your 9am`;
  return `${word} ${thing} for your ${String(hour).padStart(2, "0")}:00`;
}

function subscribeMinute(cb: () => void) {
  const id = window.setInterval(cb, 60_000);
  return () => window.clearInterval(id);
}

function readHour(): number {
  return new Date().getHours();
}

function readServerHour(): number {
  return 9;
}

function renderBody(item: BriefingItem): React.ReactNode {
  const { body, emphasis } = item;
  if (!emphasis) return body;
  const at = body.indexOf(emphasis);
  if (at === -1) return body;
  return (
    <>
      {body.slice(0, at)}
      <strong style={{ fontWeight: 600, color: "var(--dl-ink)" }}>
        {emphasis}
      </strong>
      {body.slice(at + emphasis.length)}
    </>
  );
}

export function BriefStrip({ items }: BriefStripProps) {
  const hour = useSyncExternalStore(subscribeMinute, readHour, readServerHour);
  const period = periodFor(hour);

  return (
    <>
      <div
        className="flex flex-wrap items-center"
        style={{
          gap: "4px 12px",
          minHeight: 38,
          padding: "8px var(--dl-gutter)",
          background: "var(--dl-tint)",
          borderBottom: "1px solid var(--dl-divider)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--dl-font-mono)",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--dl-signal-d)",
          }}
        >
          {kickerFor(period)}
        </span>
        <span style={{ fontSize: 13.5, fontWeight: 500 }}>
          {titleFor(items.length, period, hour)}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "var(--dl-font-mono)",
            fontSize: 11,
            color: "var(--dl-muted)",
          }}
        >
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>
      {items.length > 0 && (
        <ol className="dl-grid">
          {items.map((item, i) => (
            <li
              key={i}
              className="dl-quarter"
              style={{
                display: "flex",
                gap: 12,
                padding: "14px var(--dl-gutter) 16px",
              }}
            >
              <span
                style={{
                  paddingTop: 2,
                  fontFamily: "var(--dl-font-mono)",
                  fontSize: 11.5,
                  color: "var(--dl-muted)",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  color: "var(--dl-text-2)",
                }}
              >
                {renderBody(item)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
