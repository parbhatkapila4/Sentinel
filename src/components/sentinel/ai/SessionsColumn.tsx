"use client";

import type { AISession } from "./types";

interface SessionsColumnProps {
  sessions: AISession[];
  groups: { label: string; sessions: AISession[] }[];
  activeId: string | null;
  search: string;
  onSearch: (v: string) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewThread: () => void;
  todayCount: number;
}

export function SessionsColumn({
  sessions,
  groups,
  activeId,
  search,
  onSearch,
  onSelect,
  onDelete,
  onNewThread,
  todayCount,
}: SessionsColumnProps) {
  return (
    <aside
      aria-label="Threads"
      style={{
        borderRight: "1px solid var(--rule)",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        position: "relative",
        background: "var(--ink)",
      }}
    >
      <div
        style={{
          padding: "28px 24px 20px",
          borderBottom: "1px solid var(--rule)",
          position: "relative",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: -1,
            left: 24,
            width: 32,
            height: 2,
            background: "var(--signal)",
          }}
        />
        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--cream-3)",
            marginBottom: 10,
          }}
        >
          § - THE INTELLIGENCE DESK
        </div>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 30,
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            color: "var(--cream)",
            marginBottom: 4,
          }}
        >
          <em
            style={{
              fontStyle: "italic",
              color: "var(--signal)",
              fontFamily: "var(--font-serif)",
            }}
          >
            Threads
          </em>
          <br />
          and questions.
        </h1>
        <div
          className="tabular"
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10.5,
            color: "var(--cream-3)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {sessions.length}{" "}
          {sessions.length === 1 ? "CONVERSATION" : "CONVERSATIONS"} ·{" "}
          {todayCount} TODAY
        </div>
      </div>

      <button
        type="button"
        onClick={onNewThread}
        className="sentinel-ai-new-thread"
        style={{
          margin: "16px 24px 0",
          padding: "14px 16px",
          background: "var(--ink-02)",
          border: "1px solid var(--rule-strong)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          textAlign: "left",
          color: "var(--cream)",
          transition: "all 160ms",
        }}
      >
        <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontSize: 14, color: "var(--cream)", fontWeight: 500 }}>
            Begin a new thread
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              color: "var(--cream-3)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            ⌘ + N
          </span>
        </span>
        <span
          aria-hidden
          style={{
            color: "var(--signal)",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 22,
          }}
        >
          →
        </span>
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          margin: "20px 24px 0",
          border: "1px solid var(--rule)",
        }}
      >
        <SessionStat
          label="ACTIVE"
          number={sessions.length}
          meta="TOTAL THREADS"
          live
        />
        <SessionStat label="TODAY" number={todayCount} meta="SO FAR" divider />
      </div>

      <div
        style={{
          margin: "20px 24px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "var(--ink-02)",
          border: "1px solid var(--rule)",
          padding: "9px 12px",
        }}
      >
        <svg
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          style={{ color: "var(--cream-3)", flexShrink: 0 }}
          aria-hidden
        >
          <circle cx={11} cy={11} r={8} />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search threads…"
          aria-label="Search threads"
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--cream)",
            fontFamily: "var(--font-geist-sans)",
            fontSize: 12.5,
            flex: 1,
            minWidth: 0,
            letterSpacing: "-0.005em",
          }}
        />
      </div>

      <div
        style={{ flex: 1, overflowY: "auto", padding: "0 0 20px", minHeight: 0 }}
      >
        {sessions.length === 0 ? (
          <SessionsEmpty />
        ) : groups.length === 0 ? (
          <p
            style={{
              margin: "24px 24px 0",
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--cream-4)",
            }}
          >
            No matching threads.
          </p>
        ) : (
          groups.map((g) => (
            <SessionGroup
              key={g.label}
              label={g.label}
              sessions={g.sessions}
              activeId={activeId}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </aside>
  );
}

function SessionStat({
  label,
  number,
  meta,
  live,
  divider,
}: {
  label: string;
  number: number;
  meta: string;
  live?: boolean;
  divider?: boolean;
}) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderLeft: divider ? "1px solid var(--rule)" : "none",
      }}
    >
      <div
        className="flex items-center"
        style={{
          gap: 6,
          marginBottom: 8,
          fontFamily: "var(--font-mono-jb)",
          fontSize: 9.5,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--cream-3)",
        }}
      >
        {live && (
          <span
            aria-hidden
            className="sentinel-ai-ping"
            style={{
              width: 5,
              height: 5,
              background: "var(--ivy)",
              color: "var(--ivy)",
              borderRadius: "50%",
            }}
          />
        )}
        {label}
      </div>
      <div
        className="tabular"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 32,
          lineHeight: 1,
          color: "var(--cream)",
          letterSpacing: "-0.02em",
        }}
      >
        {number}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 9.5,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--cream-3)",
          marginTop: 4,
        }}
      >
        {meta}
      </div>
    </div>
  );
}

function SessionsEmpty() {
  return (
    <div
      style={{
        margin: "32px 24px 0",
        textAlign: "center",
        padding: "18px 0",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 18,
          lineHeight: 1.4,
          color: "var(--cream-2)",
          letterSpacing: "-0.005em",
          marginBottom: 10,
        }}
      >
        No threads yet - your first
        <br />
        question starts here.
      </div>
      <span
        aria-hidden
        className="sentinel-ai-empty-arrow"
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 34,
          color: "var(--signal)",
          display: "inline-block",
          lineHeight: 1,
        }}
      >
        ↓
      </span>
    </div>
  );
}

function SessionGroup({
  label,
  sessions,
  activeId,
  onSelect,
  onDelete,
}: {
  label: string;
  sessions: AISession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      <div style={{ padding: "18px 24px 6px" }}>
        <div
          className="flex items-baseline justify-between"
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 9.5,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--cream-3)",
            marginBottom: 12,
          }}
        >
          <span>{label}</span>
          <span style={{ color: "var(--signal)", fontWeight: 500 }}>
            {sessions.length}
          </span>
        </div>
      </div>
      {sessions.map((s) => (
        <SessionRow
          key={s.id}
          session={s}
          active={activeId === s.id}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

function SessionRow({
  session,
  active,
  onSelect,
  onDelete,
}: {
  session: AISession;
  active: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(session.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(session.id);
        }
      }}
      className="sentinel-ai-session-row"
      style={{
        display: "grid",
        gridTemplateColumns: "22px minmax(0,1fr) auto",
        gap: 12,
        padding: "10px 24px",
        cursor: "pointer",
        borderLeft: `2px solid ${active ? "var(--signal)" : "transparent"}`,
        background: active ? "var(--ink-02)" : "transparent",
        transition: "all 140ms",
        alignItems: "flex-start",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "grid",
          placeItems: "center",
          paddingTop: 2,
          color: active ? "var(--signal)" : "var(--cream-3)",
        }}
      >
        <CategoryIcon category={session.category} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            color: active ? "var(--cream)" : "var(--cream-2)",
            lineHeight: 1.4,
            marginBottom: 4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {session.title}
        </div>
        <div
          className="flex"
          style={{
            gap: 8,
            fontFamily: "var(--font-mono-jb)",
            fontSize: 9.5,
            color: "var(--cream-3)",
            letterSpacing: "0.06em",
          }}
        >
          <span>
            {session.messageCount}{" "}
            {session.messageCount === 1 ? "MESSAGE" : "MESSAGES"}
          </span>
          <span style={{ color: "var(--rule-strong)" }}>·</span>
          <span>{session.category}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(session.id);
        }}
        aria-label="Delete thread"
        className="sentinel-ai-session-delete"
        style={{
          background: "transparent",
          border: "none",
          padding: 4,
          color: "var(--cream-4)",
          cursor: "pointer",
          lineHeight: 1,
          fontFamily: "var(--font-mono-jb)",
          fontSize: 11,
        }}
      >
        ×
      </button>
    </div>
  );
}

function CategoryIcon({ category }: { category: AISession["category"] }) {
  const c = {
    width: 12,
    height: 12,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (category) {
    case "WIN/LOSS":
      return (
        <svg {...c} aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
        </svg>
      );
    case "FORECAST":
      return (
        <svg {...c} aria-hidden>
          <path d="M3 3v18h18M7 14l4-4 4 4 5-5" />
        </svg>
      );
    case "OUTREACH":
      return (
        <svg {...c} aria-hidden>
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
        </svg>
      );
    case "PRIORITY":
      return (
        <svg {...c} aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3M12 17h.01" />
        </svg>
      );
    case "RISK":
      return (
        <svg {...c} aria-hidden>
          <path d="M12 2l10 18H2z" />
          <path d="M12 9v5M12 17h.01" />
        </svg>
      );
    case "ANALYSIS":
      return (
        <svg {...c} aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v18M3 12h18" />
        </svg>
      );
    case "RESEARCH":
      return (
        <svg {...c} aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4-4" />
        </svg>
      );
    case "REPORT":
      return (
        <svg {...c} aria-hidden>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6M8 13h8M8 17h5" />
        </svg>
      );
    default:
      return (
        <svg {...c} aria-hidden>
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="19" cy="12" r="1.5" />
          <circle cx="5" cy="12" r="1.5" />
        </svg>
      );
  }
}

export function categorize(title: string): AISession["category"] {
  const t = title.toLowerCase();
  if (/win|lost|loss|closed/.test(t)) return "WIN/LOSS";
  if (/forecast|pipeline/.test(t)) return "FORECAST";
  if (/email|follow-?up|outreach|draft/.test(t)) return "OUTREACH";
  if (/prioriti|which deal|focus/.test(t)) return "PRIORITY";
  if (/risk|slipping|stall/.test(t)) return "RISK";
  if (/compare|analy[sz]e|analy[sz]is|benchmark/.test(t)) return "ANALYSIS";
  if (/summari[sz]e|call|meeting|research/.test(t)) return "RESEARCH";
  if (/report|breakdown/.test(t)) return "REPORT";
  return "GENERAL";
}
