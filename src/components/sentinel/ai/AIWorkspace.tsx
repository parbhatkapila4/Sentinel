"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Composer } from "./Composer";
import { ContextPanel } from "./ContextPanel";
import { AIContextStrip } from "./AIContextStrip";
import { SessionsColumn } from "./SessionsColumn";
import { ConvoHeader } from "./ConvoHeader";
import { IntroSection } from "./IntroSection";
import { ConvoLoading, MessageThread } from "./ConvoBody";
import { ConfirmDialog } from "@/components/sentinel/ConfirmDialog";
import { groupSessions, formatSessionOrdinal } from "./derive";
import { useAIWorkspace } from "./useAIWorkspace";
import type {
  AIPromptCard,
  AISession,
  AIBookFact,
  AIConnectedSource,
  AIRecentAnswer,
  AIShellMeta,
} from "./types";

interface AIWorkspaceProps {
  sessions: AISession[];
  promptCards: AIPromptCard[];
  suggestedPrompts: string[];
  bookFacts: AIBookFact[];
  sources: AIConnectedSource[];
  recentAnswers: AIRecentAnswer[];
  modelLabel: string;
  ctxLabel: string;
  syncTime: string;
  todayChatCount: number;
  nowISO: string;
}

export function AIWorkspace({
  sessions: initialSessions,
  promptCards,
  suggestedPrompts,
  bookFacts,
  sources,
  recentAnswers: initialRecentAnswers,
  modelLabel,
  ctxLabel,
  syncTime,
  todayChatCount: initialTodayCount,
  nowISO,
}: AIWorkspaceProps) {
  const {
    sessions,
    filteredSessions,
    activeId,
    activeSession,
    messages,
    loadingMessages,
    isSending,
    input,
    setInput,
    mode,
    cycleMode,
    search,
    setSearch,
    recentAnswers,
    attachments,
    todayCount,
    textareaRef,
    handleNewThread,
    handleSelectSession,
    applyPrompt,
    handleAddAttachments,
    handleRemoveAttachment,
    handleDeleteSession,
    confirmDeleteThread,
    cancelDeleteThread,
    pendingDeleteId,
    pendingDeleteTitle,
    deletingThread,
    handleSend,
    onTextareaKeyDown,
  } = useAIWorkspace({
    initialSessions,
    initialRecentAnswers,
    initialTodayCount,
    connectedSourceCount: sources.filter((s) => s.connected).length,
  });
  const [isContextCollapsed, setIsContextCollapsed] = useState(false);

  const bodyRef = useRef<HTMLDivElement>(null);

  const now = useMemo(() => new Date(nowISO), [nowISO]);

  const groups = useMemo(
    () => groupSessions(filteredSessions, now),
    [filteredSessions, now]
  );

  const shellMeta: AIShellMeta = useMemo(
    () => ({
      sessionOrdinal: formatSessionOrdinal(sessions.length),
      modelLabel,
      ctxLabel,
    }),
    [sessions.length, modelLabel, ctxLabel]
  );

  const currentThreadLabel = activeSession
    ? `THREAD · ${activeSession.category}`
    : "A NEW THREAD";

  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages.length, isSending]);

  const handlePromptCard = (card: AIPromptCard) => applyPrompt(card.prompt);

  const showIntro = messages.length === 0 && !loadingMessages;

  return (
    <>
      <AIContextStrip meta={shellMeta} currentThreadLabel={currentThreadLabel} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isContextCollapsed
            ? "280px minmax(0,1fr) 56px"
            : "280px minmax(0,1fr) 320px",
          flex: 1,
          minHeight: 0,
        }}
        className="ai-workspace"
      >
        <SessionsColumn
          sessions={sessions}
          groups={groups}
          activeId={activeId}
          search={search}
          onSearch={setSearch}
          onSelect={handleSelectSession}
          onDelete={handleDeleteSession}
          onNewThread={handleNewThread}
          todayCount={todayCount}
        />

        <section
          className="sentinel-ai-convo"
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "50%",
              height: "60%",
              background:
                "radial-gradient(ellipse at 100% 0%, rgba(200,71,46,0.04) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />

          <ConvoHeader
            activeSession={activeSession}
            isSending={isSending}
            ctxLabel={ctxLabel}
          />

          <div
            ref={bodyRef}
            className="sentinel-ai-body"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {loadingMessages ? (
              <ConvoLoading />
            ) : showIntro ? (
              <IntroSection
                promptCards={promptCards}
                suggestedPrompts={suggestedPrompts}
                onPromptCard={handlePromptCard}
                onSuggested={applyPrompt}
              />
            ) : (
              <MessageThread
                messages={messages}
                isSending={isSending}
                modelLabel={modelLabel}
              />
            )}
          </div>

          <Composer
            value={input}
            onChange={setInput}
            onSend={() => void handleSend()}
            onKeyDown={onTextareaKeyDown}
            isSending={isSending}
            mode={mode}
            onCycleMode={cycleMode}
            textareaRef={textareaRef}
            ctxLabel={ctxLabel}
            modelLabel={modelLabel}
            attachments={attachments}
            onAddAttachments={handleAddAttachments}
            onRemoveAttachment={handleRemoveAttachment}
          />
        </section>

        <ContextPanel
          collapsed={isContextCollapsed}
          onToggleCollapse={() =>
            setIsContextCollapsed((isCollapsed) => !isCollapsed)
          }
          syncTime={syncTime}
          connectedCount={sources.filter((s) => s.connected).length}
          bookFacts={bookFacts}
          sources={sources}
          recentAnswers={recentAnswers}
        />
      </div>
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title={`Delete ${pendingDeleteTitle}?`}
        body="The entire conversation and every message in it will be removed. This can't be undone."
        confirmLabel="Delete thread"
        tone="danger"
        busy={deletingThread}
        onConfirm={confirmDeleteThread}
        onCancel={cancelDeleteThread}
      />
    </>
  );
}


