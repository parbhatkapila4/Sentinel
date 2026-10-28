"use client";

import type { CSSProperties } from "react";
import type { AISession } from "@/components/sentinel/ai/types";
import { Pill, PlusIcon, secondaryButtonStyle, smallButtonStyle } from "../blocks";
import { NavIcon } from "../nav";
import { useAIWorkspaceContext } from "./AIWorkspaceProvider";
import {
  categoryLabel,
  messageCountLabel,
  threadWhen,
  type ThreadGroup,
} from "./model";
import { barStyle, groupStyle, sectionTitle, tagStyle } from "./styles";

type DeleteHandler = (id: string, trigger: HTMLElement) => void;

function NewThreadButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="dl-btn-secondary"
      style={{ ...secondaryButtonStyle, ...smallButtonStyle, paddingLeft: 9 }}
    >
      <PlusIcon size={14} />
      New
    </button>
  );
}

function ThreadSearch({
  value,
  onChange,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  style?: CSSProperties;
}) {
  return (
    <label
      className="dl-search"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: 36,
        padding: "0 11px",
        borderRadius: 9,
        border: "1px solid var(--dl-border)",
        background: "var(--dl-panel)",
        boxShadow: "var(--dl-shadow)",
        color: "var(--dl-muted)",
        ...style,
      }}
    >
      <NavIcon size={14} strokeWidth={1.75}>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </NavIcon>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search threads"
        aria-label="Search threads"
        style={{
          flex: 1,
          minWidth: 0,
          border: 0,
          background: "none",
          outline: "none",
          fontSize: 13.5,
          color: "var(--dl-ink)",
        }}
      />
    </label>
  );
}

function DeleteThreadButton({
  session,
  onDelete,
  style,
}: {
  session: AISession;
  onDelete: DeleteHandler;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      className="dl-ai-thread-del dl-kebab"
      aria-label={`Delete thread: ${session.title}`}
      onClick={(e) => onDelete(session.id, e.currentTarget)}
      style={{
        position: "absolute",
        top: 10,
        right: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        minHeight: 0,
        padding: 0,
        border: 0,
        borderRadius: 7,
        background: "transparent",
        color: "var(--dl-icon)",
        cursor: "pointer",
        ...style,
      }}
    >
      <NavIcon size={15} strokeWidth={1.75}>
        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
      </NavIcon>
    </button>
  );
}

function ThreadMeta({ session, now }: { session: AISession; now: Date }) {
  return (
    <>
      <span style={tagStyle}>{categoryLabel(session.category)}</span>
      <span>
        {messageCountLabel(session.messageCount)} · {threadWhen(session.updatedAt, now)}
      </span>
    </>
  );
}

function emptyText(search: string): string {
  return search.trim()
    ? "No threads match that search."
    : "No threads yet. Ask a first question.";
}

export function ThreadList({
  groups,
  total,
  activeId,
  search,
  onSearch,
  onSelect,
  onDelete,
  onNew,
  now,
}: {
  groups: ThreadGroup[];
  total: number;
  activeId: string | null;
  search: string;
  onSearch: (v: string) => void;
  onSelect: (id: string) => void;
  onDelete: DeleteHandler;
  onNew: () => void;
  now: Date;
}) {
  return (
    <>
      <div style={{ ...barStyle, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <h2 style={sectionTitle}>Threads</h2>
          <Pill>{total}</Pill>
        </div>
        <NewThreadButton onClick={onNew} />
      </div>
      <div style={{ padding: "12px var(--dl-gutter) 2px" }}>
        <ThreadSearch value={search} onChange={onSearch} />
      </div>
      {groups.length === 0 ? (
        <p style={{ padding: "16px var(--dl-gutter)", fontSize: 13.5, color: "var(--dl-muted)" }}>
          {emptyText(search)}
        </p>
      ) : (
        groups.map((group) => (
          <div key={group.label}>
            <p style={groupStyle}>{group.label}</p>
            <ul aria-label={`${group.label} threads`}>
              {group.sessions.map((s) => (
                <li
                  key={s.id}
                  className="dl-ai-thread"
                  aria-current={s.id === activeId ? "true" : undefined}
                  style={{ position: "relative", borderTop: "1px solid var(--dl-row)" }}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(s.id)}
                    style={{
                      display: "block",
                      width: "100%",
                      minHeight: 0,
                      padding: "11px 44px 12px var(--dl-gutter)",
                      border: 0,
                      background: "none",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ display: "block", fontSize: 13.5, fontWeight: 500, lineHeight: 1.4 }}>
                      {s.title}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "4px 8px",
                        marginTop: 5,
                        fontSize: 12,
                        color: "var(--dl-muted)",
                      }}
                    >
                      <ThreadMeta session={s} now={now} />
                    </span>
                  </button>
                  <DeleteThreadButton session={s} onDelete={onDelete} />
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </>
  );
}

export function SidebarThreads() {
  const {
    sessions,
    groups,
    activeId,
    search,
    setSearch,
    handleSelectSession,
    handleNewThread,
    requestDelete,
    now,
  } = useAIWorkspaceContext();

  return (
    <section className="dl-side-threads" aria-label="Threads">
      <div className="dl-side-threads-head">
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <h2 style={sectionTitle}>Threads</h2>
          <Pill>{sessions.length}</Pill>
        </div>
        <NewThreadButton onClick={handleNewThread} />
      </div>
      <ThreadSearch value={search} onChange={setSearch} style={{ flexShrink: 0, marginTop: 10 }} />
      <div className="dl-side-threads-list">
        {groups.length === 0 ? (
          <p className="dl-side-threads-empty">{emptyText(search)}</p>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              <p className="dl-side-threads-group">{group.label}</p>
              <ul aria-label={`${group.label} threads`}>
                {group.sessions.map((s) => (
                  <li
                    key={s.id}
                    className="dl-side-thread"
                    aria-current={s.id === activeId ? "true" : undefined}
                  >
                    <button
                      type="button"
                      className="dl-side-thread-open"
                      onClick={() => handleSelectSession(s.id)}
                    >
                      <span className="dl-side-thread-title">{s.title}</span>
                      <span className="dl-side-thread-meta">
                        <ThreadMeta session={s} now={now} />
                      </span>
                    </button>
                    <DeleteThreadButton
                      session={s}
                      onDelete={requestDelete}
                      style={{ top: 6, right: 6, width: 26, height: 26 }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
