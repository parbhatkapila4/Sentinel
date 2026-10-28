"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
} from "react";
import { formatShortMoney } from "@/lib/format-money";
import {
  ACCEPTED_FILE_TYPES,
  MODES,
  clampInput,
  formatFileSize,
  type AIAttachment,
  type Mode,
} from "@/components/sentinel/ai/composer-utils";
import type { AIRecentAnswer } from "@/components/sentinel/ai/types";
import { useVoiceInput } from "@/components/sentinel/ai/useVoiceInput";
import {
  Pill,
  primaryButtonStyle,
  secondaryButtonStyle,
  smallButtonStyle,
  subStyle,
} from "../blocks";
import { Money, Monogram } from "../ui";
import { useAIWorkspaceContext } from "./AIWorkspaceProvider";
import { AnswerPending, MessageItem, ThreadLoading } from "./Message";
import {
  MODE_LABEL,
  categoryLabel,
  syncedLabel,
  type AIBook,
  type AIPrompt,
  type AISource,
} from "./model";
import { barStyle, sectionTitle, tagStyle } from "./styles";
import { ThreadList } from "./threads";

export interface AIViewProps {
  prompts: AIPrompt[];
  suggestions: string[];
  book: AIBook;
  sources: AISource[];
}

function Icon({ children, size = 16 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function Status({ busy }: { busy: boolean }) {
  return (
    <span
      role="status"
      style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--dl-muted)" }}
    >
      <span
        aria-hidden
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: busy ? "var(--dl-amber)" : "var(--dl-green)",
        }}
      />
      {busy ? "Answering" : "Ready"}
    </span>
  );
}

function Facts({ book }: { book: AIBook }) {
  const facts: Array<[ReactNode, string]> = [
    [book.activeDeals, "active deals"],
    [<Money key="open" value={book.openValue} />, "open pipeline"],
    [book.flagged, "flagged at risk"],
    [book.overdue, "actions overdue"],
  ];
  return (
    <div className="dl-ai-facts" aria-label="Your book">
      {facts.map(([value, label]) => (
        <div key={label}>
          <b
            style={{
              display: "block",
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {value}
          </b>
          <span style={{ fontSize: 12.5, color: "var(--dl-muted)" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function Intro({
  book,
  hasDeals,
  prompts,
  suggestions,
  onPrompt,
}: {
  book: AIBook;
  hasDeals: boolean;
  prompts: AIPrompt[];
  suggestions: string[];
  onPrompt: (prompt: string) => void;
}) {
  return (
    <>
      <div style={{ padding: "clamp(24px, 3.4cqw, 44px) var(--dl-gutter) 22px" }}>
        <h2
          style={{
            fontFamily: "var(--dl-font-serif)",
            fontWeight: 400,
            fontSize: "clamp(36px, 4.2cqw, 54px)",
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
          }}
        >
          Ask the book{" "}
          <em style={{ fontStyle: "italic", color: "var(--dl-signal)" }}>anything.</em>
        </h2>
        <p style={{ maxWidth: 540, marginTop: 10, fontSize: 15, lineHeight: 1.6, color: "var(--dl-text-2)" }}>
          Pick a starting point or write your own question. Sentinel reads the
          same deals you see on every other page.
        </p>
      </div>
      {hasDeals && <Facts book={book} />}
      <div className="dl-ai-prompts">
        {prompts.map((p) => (
          <button key={p.key} type="button" className="dl-ai-prompt" onClick={() => onPrompt(p.prompt)}>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>
              {p.title}{" "}
              <em style={{ fontFamily: "var(--dl-font-serif)", fontSize: 19, fontWeight: 400 }}>
                {p.emphasis}
              </em>
            </span>
            <span style={{ marginTop: 4, fontSize: 13, lineHeight: 1.5, color: "var(--dl-muted)" }}>
              {p.sub}
            </span>
            <span style={{ ...tagStyle, marginTop: "auto", paddingTop: 12 }}>{p.tag}</span>
          </button>
        ))}
      </div>
      <div style={{ padding: "18px var(--dl-gutter) 0" }}>
        <p style={{ fontSize: 13, color: "var(--dl-muted)" }}>Or ask</p>
        <div style={{ marginTop: 6 }}>
          {suggestions.map((s) => (
            <button key={s} type="button" className="dl-ai-ask" onClick={() => onPrompt(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function ToolButton({
  label,
  pressed,
  disabled,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className="dl-icon-btn"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        minHeight: 0,
        padding: 0,
        borderRadius: 8,
        border: "1px solid var(--dl-border)",
        background: pressed ? "var(--dl-signal-tint)" : "var(--dl-panel)",
        color: pressed ? "var(--dl-signal-d)" : "var(--dl-text-2)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

function Composer({
  value,
  onChange,
  onSend,
  onKeyDown,
  isSending,
  mode,
  onMode,
  textareaRef,
  attachments,
  onAddAttachments,
  onRemoveAttachment,
  followUp,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isSending: boolean;
  mode: Mode;
  onMode: (m: Mode) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  attachments: AIAttachment[];
  onAddAttachments: (files: File[]) => void | Promise<void>;
  onRemoveAttachment: (name: string, size: number) => void;
  followUp: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isListening, voiceSupported, toggleVoice } = useVoiceInput(value, onChange);
  const empty = value.trim().length === 0 && attachments.length === 0;
  const label = followUp ? "Ask a follow-up" : "Ask Sentinel";

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) void onAddAttachments(files);
    e.target.value = "";
  };

  return (
    <div className="dl-ai-composer">
      <div
        className="dl-ai-box"
        style={{
          borderRadius: 12,
          border: "1px solid var(--dl-border-strong)",
          background: "var(--dl-panel)",
          boxShadow: "var(--dl-shadow)",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleFiles}
          hidden
        />
        {attachments.length > 0 && (
          <ul aria-label="Attachments" style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "10px 12px 0" }}>
            {attachments.map((a) => (
              <li
                key={`${a.name}-${a.size}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  height: 26,
                  padding: "0 4px 0 9px",
                  borderRadius: 7,
                  background: "var(--dl-chip)",
                  fontSize: 12.5,
                  color: "var(--dl-text-2)",
                }}
              >
                <span style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {a.name}
                </span>
                <span style={{ color: "var(--dl-muted)" }}>{formatFileSize(a.size)}</span>
                <button
                  type="button"
                  aria-label={`Remove ${a.name}`}
                  onClick={() => onRemoveAttachment(a.name, a.size)}
                  className="dl-kebab"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 20,
                    height: 20,
                    minHeight: 0,
                    padding: 0,
                    border: 0,
                    borderRadius: 5,
                    background: "transparent",
                    color: "var(--dl-icon)",
                    cursor: "pointer",
                  }}
                >
                  <Icon size={12}>
                    <path d="M6 6l12 12M18 6L6 18" />
                  </Icon>
                </button>
              </li>
            ))}
          </ul>
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(clampInput(e.target.value))}
          onKeyDown={onKeyDown}
          rows={2}
          aria-label={label}
          placeholder={followUp ? "Ask a follow-up" : "Ask about a deal, the pipeline or what to do next"}
          style={{
            display: "block",
            width: "100%",
            minHeight: 60,
            padding: "13px 14px 4px",
            border: 0,
            background: "none",
            resize: "none",
            fontSize: 14.5,
            lineHeight: 1.5,
            color: "var(--dl-ink)",
            outline: "none",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 8px 8px 10px" }}>
          <ToolButton label="Attach a file" onClick={() => fileInputRef.current?.click()} disabled={isSending}>
            <Icon>
              <path d="M21 12.5l-8.6 8.6a5 5 0 01-7.1-7.1l8.6-8.6a3.3 3.3 0 014.7 4.7l-8.6 8.6a1.7 1.7 0 01-2.4-2.4l7.9-7.9" />
            </Icon>
          </ToolButton>
          {voiceSupported && (
            <ToolButton
              label={isListening ? "Stop voice" : "Voice"}
              pressed={isListening}
              onClick={toggleVoice}
              disabled={isSending}
            >
              <Icon>
                <rect x="9" y="3" width="6" height="11" rx="3" />
                <path d="M5 11a7 7 0 0014 0M12 18v3" />
              </Icon>
            </ToolButton>
          )}
          <div className="dl-ai-modes" role="group" aria-label="Answer mode">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => onMode(m)}
                className="dl-ai-mode"
              >
                {MODE_LABEL[m]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onSend}
            disabled={isSending || empty}
            className="dl-btn-primary"
            style={{
              ...primaryButtonStyle,
              ...smallButtonStyle,
              marginLeft: "auto",
              opacity: isSending || empty ? 0.5 : 1,
              cursor: isSending || empty ? "not-allowed" : "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
      <p className="dl-wide-only" style={{ ...subStyle, marginTop: 8, fontSize: 12 }}>
        Enter to send · Shift + Enter for a new line
      </p>
    </div>
  );
}

function ContextColumn({
  book,
  sources,
  recentAnswers,
  now,
  onOpenThread,
}: {
  book: AIBook;
  sources: AISource[];
  recentAnswers: AIRecentAnswer[];
  now: Date;
  onOpenThread: (id: string) => void;
}) {
  const connected = sources.filter((s) => s.connected).length;
  const head = (title: string, pill?: ReactNode) => (
    <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "18px var(--dl-gutter) 14px" }}>
      <h2 style={sectionTitle}>{title}</h2>
      {pill}
    </div>
  );
  const kv = (label: string, value: ReactNode) => (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 16,
        padding: "11px 0",
        borderTop: "1px solid var(--dl-row)",
        fontSize: 13.5,
        color: "var(--dl-text-2)",
      }}
    >
      {label}
      <b style={{ fontSize: 15, fontWeight: 600, color: "var(--dl-ink)", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </b>
    </div>
  );
  const section: CSSProperties = {
    padding: "0 var(--dl-gutter) 16px",
    borderBottom: "1px solid var(--dl-divider)",
  };
  const rowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "10px 0",
    borderTop: "1px solid var(--dl-row)",
  };
  return (
    <>
      <div className="dl-ai-book">
        {head("Your book", <Pill tone="good">Live</Pill>)}
        <div style={section}>
          {kv("Active deals", book.activeDeals)}
          {kv("Open pipeline", formatShortMoney(book.openValue))}
          {kv("Flagged at risk", book.flagged)}
          {kv("Most likely to close", formatShortMoney(book.likely))}
        </div>
      </div>
      {head("Connected sources", <Pill>{`${connected} of ${sources.length}`}</Pill>)}
      <div style={section}>
        {sources.map((s) => (
          <div key={s.key} style={rowStyle}>
            <Monogram name={s.name} label={s.monogram} />
            <div style={{ flex: "1 1 auto", minWidth: 0 }}>
              <b style={{ display: "block", fontSize: 13.5, fontWeight: 600 }}>{s.name}</b>
              <small style={{ display: "block", fontSize: 12, color: "var(--dl-muted)" }}>
                {s.kind} · {s.connected ? syncedLabel(s.syncedAt, now) : "not connected"}
              </small>
            </div>
            {s.connected ? (
              <Pill tone="good">Synced</Pill>
            ) : (
              <Link
                href="/settings?tab=integrations"
                className="dl-link dl-tap"
                style={{ fontSize: 13.5, fontWeight: 500, color: "var(--dl-ink)" }}
              >
                Connect
              </Link>
            )}
          </div>
        ))}
      </div>
      {recentAnswers.length > 0 && (
        <>
          {head("Recent answers")}
          <div style={section}>
            {recentAnswers.map((r) => {
              const body = (
                <>
                  <b style={{ display: "block", fontSize: 13.5, fontWeight: 500 }}>{r.question}</b>
                  <small style={{ display: "block", fontSize: 12, color: "var(--dl-muted)" }}>{r.when}</small>
                </>
              );
              return r.chatId ? (
                <button
                  key={r.id}
                  type="button"
                  className="dl-ai-recent"
                  onClick={() => onOpenThread(r.chatId!)}
                  style={{
                    ...rowStyle,
                    width: "100%",
                    minHeight: 0,
                    borderRight: 0,
                    borderBottom: 0,
                    borderLeft: 0,
                    background: "none",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ minWidth: 0 }}>{body}</span>
                </button>
              ) : (
                <div key={r.id} style={rowStyle}>
                  <span style={{ minWidth: 0 }}>{body}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
      <div style={{ ...section, paddingTop: 14, borderBottom: 0 }}>
        <p style={{ ...subStyle, lineHeight: 1.55 }}>
          Ask follow-ups in the same thread to keep context. Sentinel remembers
          everything said in it.
        </p>
      </div>
    </>
  );
}

export function AIView({ prompts, suggestions, book, sources }: AIViewProps) {
  const {
    sessions,
    groups,
    now,
    activeId,
    activeSession,
    messages,
    loadingMessages,
    isSending,
    input,
    setInput,
    mode,
    setMode,
    search,
    setSearch,
    recentAnswers,
    attachments,
    textareaRef,
    handleNewThread,
    handleSelectSession,
    applyPrompt,
    handleAddAttachments,
    handleRemoveAttachment,
    requestDelete,
    handleSend,
    onTextareaKeyDown,
  } = useAIWorkspaceContext();

  const [threadsOpen, setThreadsOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const hasDeals = book.activeDeals > 0 || book.openValue > 0;

  useEffect(() => {
    if (messages.length === 0 && !isSending) return;
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages.length, isSending]);

  const selectThread = (id: string) => {
    handleSelectSession(id);
    setThreadsOpen(false);
  };

  const newThread = () => {
    handleNewThread();
    setThreadsOpen(false);
  };

  const showIntro = !activeId && messages.length === 0 && !loadingMessages;
  const title = activeSession?.title ?? (activeId ? "Thread" : "New thread");

  const threadList = (
    <ThreadList
      groups={groups}
      total={sessions.length}
      activeId={activeId}
      search={search}
      onSearch={setSearch}
      onSelect={selectThread}
      onDelete={requestDelete}
      onNew={newThread}
      now={now}
    />
  );

  return (
    <div className="dl-ai-ws dl-grow">
      <aside className="dl-ai-threads" aria-label="Threads">
        {threadList}
      </aside>

      <section className="dl-ai-center" aria-label="Conversation">
        <div style={barStyle}>
          <button
            type="button"
            className="dl-ai-threads-toggle dl-btn-secondary"
            aria-expanded={threadsOpen}
            onClick={() => setThreadsOpen((open) => !open)}
            style={{ ...secondaryButtonStyle, ...smallButtonStyle }}
          >
            Threads
            <Pill>{sessions.length}</Pill>
          </button>
          <h2
            style={{
              ...sectionTitle,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </h2>
          {activeSession && (
            <span className="dl-wide-only" style={tagStyle}>
              {categoryLabel(activeSession.category)}
            </span>
          )}
          <Status busy={isSending} />
          {!activeId && (
            <span className="dl-wide-only" style={{ ...subStyle, marginLeft: "auto" }}>
              Answers from your deals and connected sources
            </span>
          )}
        </div>

        {threadsOpen && <div className="dl-ai-threads-inline">{threadList}</div>}

        {loadingMessages ? (
          <div style={{ padding: "22px var(--dl-gutter) 8px" }}>
            <ThreadLoading />
          </div>
        ) : showIntro ? (
          <Intro
            book={book}
            hasDeals={hasDeals}
            prompts={prompts}
            suggestions={suggestions}
            onPrompt={applyPrompt}
          />
        ) : (
          <div
            aria-live="polite"
            style={{ display: "flex", flexDirection: "column", gap: 22, padding: "22px var(--dl-gutter) 8px" }}
          >
            {messages.map((m) => (
              <MessageItem key={m.id} message={m} />
            ))}
            {isSending && <AnswerPending />}
            <div ref={endRef} style={{ scrollMarginBottom: 200 }} />
          </div>
        )}

        <Composer
          value={input}
          onChange={setInput}
          onSend={() => void handleSend()}
          onKeyDown={onTextareaKeyDown}
          isSending={isSending}
          mode={mode}
          onMode={setMode}
          textareaRef={textareaRef}
          attachments={attachments}
          onAddAttachments={handleAddAttachments}
          onRemoveAttachment={handleRemoveAttachment}
          followUp={!showIntro}
        />
      </section>

      <aside className="dl-ai-ctx" aria-label="Context">
        <ContextColumn
          book={book}
          sources={sources}
          recentAnswers={recentAnswers}
          now={now}
          onOpenThread={selectThread}
        />
      </aside>
    </div>
  );
}
