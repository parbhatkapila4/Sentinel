"use client";

import { useEffect, useState } from "react";
import type { BriefingItem } from "../types";

interface BriefingAsideProps {
  items: BriefingItem[];
}

type Period = "morning" | "afternoon" | "evening" | "night";

function periodFor(hour: number): Period {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}

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

function spellCount(n: number): string {
  return COUNT_WORDS[n] ?? String(n);
}

function kickerFor(period: Period): string {
  switch (period) {
    case "morning":
      return "Morning Brief";
    case "afternoon":
      return "Afternoon Brief";
    case "evening":
      return "Evening Brief";
    case "night":
      return "Night Brief";
  }
}

function emptyTitleFor(period: Period): string {
  switch (period) {
    case "morning":
      return "Today on the desk.";
    case "afternoon":
      return "This afternoon\non the desk.";
    case "evening":
      return "This evening\non the desk.";
    case "night":
      return "Tonight on the desk.";
  }
}

function titleFor(count: number, period: Period, hour: number): string {
  if (count === 0) return emptyTitleFor(period);
  const word = spellCount(count);
  const thing = count === 1 ? "thing" : "things";
  const hh = String(hour).padStart(2, "0");
  switch (period) {

    case "morning":
      return `${word} ${thing}\nbefore your 9am.`;

    case "afternoon":
      return `${word} ${thing}\nfor your ${hh}:00.`;
    case "evening":
      return `${word} ${thing}\nfor your ${hh}:00.`;
    case "night":
      return `${word} ${thing}\nfor your ${hh}:00.`;
  }
}

export function BriefingAside({ items }: BriefingAsideProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const hour = now?.getHours() ?? 9;
  const period = periodFor(hour);
  const kicker = kickerFor(period);
  const title = titleFor(items.length, period, hour);

  return (
    <aside
      className="anim-rise"
      style={{
        animationDelay: "200ms",
        background: "var(--ink-02)",
        border: "1px solid var(--rule-strong)",
        position: "relative",
        padding: "32px 26px 28px",
      }}
      aria-label={`${kicker}`}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: "0 0 auto 0",
          height: 2,
          background: "var(--signal)",
        }}
      />
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "var(--signal)",
          textTransform: "uppercase",
          marginBottom: 18,
        }}
      >
        {kicker}
      </div>
      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 400,
          fontSize: 26,
          lineHeight: 1.15,
          color: "var(--cream)",
          letterSpacing: "-0.01em",
          marginBottom: 22,
        }}
      >
        {title.split("\n").map((line, i) => (
          <span key={i} style={{ display: "block" }}>
            {line}
          </span>
        ))}
      </h3>
      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((item, i) => (
          <li
            key={i}
            className="flex"
            style={{
              gap: 14,
              padding: "14px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--rule)",
            }}
          >
            <span
              className="tabular"
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.14em",
                color: "var(--cream-3)",
                minWidth: 22,
                paddingTop: 2,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              style={{
                fontSize: 13.5,
                lineHeight: 1.5,
                color: "var(--cream-2)",
              }}
            >
              {item.body}
            </span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
