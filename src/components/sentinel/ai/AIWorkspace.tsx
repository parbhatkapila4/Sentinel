"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import {
  createChat,
  getChatMessages,
  saveChatMessage,
  updateChatTitle,
  deleteChat,
} from "@/app/actions/chats";

import { Composer } from "./Composer";
import { ContextPanel } from "./ContextPanel";
import { AIContextStrip } from "./AIContextStrip";
import { categorize, SessionsColumn } from "./SessionsColumn";
import { ConvoHeader } from "./ConvoHeader";
import { IntroSection } from "./IntroSection";
import { ConvoLoading, MessageThread } from "./ConvoBody";
import { ConfirmDialog } from "@/components/sentinel/ConfirmDialog";
import {
  clampInput,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_BYTES,
  MODES,
  readFileAsDataUrl,
  type AIAttachment,
  type Mode,
} from "./composer-utils";
import { groupSessions, countSessionsToday, formatSessionOrdinal } from "./derive";
import type {
  AIMessage,
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
  const [sessions, setSessions] = useState<AISession[]>(initialSessions);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("FAST");
  const [search, setSearch] = useState("");
  const [recentAnswers, setRecentAnswers] = useState(initialRecentAnswers);
  const [attachments, setAttachments] = useState<AIAttachment[]>([]);
  const [isContextCollapsed, setIsContextCollapsed] = useState(false);
  const [, startTransition] = useTransition();

  const bodyRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const now = useMemo(() => new Date(nowISO), [nowISO]);

  const filteredSessions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => s.title.toLowerCase().includes(q));
  }, [sessions, search]);

  const groups = useMemo(
    () => groupSessions(filteredSessions, now),
    [filteredSessions, now]
  );

  const todayCount = useMemo(() => {
    if (sessions === initialSessions) return initialTodayCount;
    return countSessionsToday(sessions);
  }, [sessions, initialSessions, initialTodayCount]);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeId) ?? null,
    [sessions, activeId]
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
    if (!activeId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingMessages(true);
      try {
        const raw = await getChatMessages(activeId);
        if (cancelled) return;
        setMessages(
          raw.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            createdAt:
              m.createdAt instanceof Date
                ? m.createdAt.toISOString()
                : String(m.createdAt),
          }))
        );
      } catch (err) {
        console.error("Failed to load messages", err);
        if (!cancelled) {
          toast.error("Couldn't load that thread. Please try again.");
        }
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages.length, isSending]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  const handleNewThread = useCallback(() => {
    setActiveId(null);
    setMessages([]);
    setInput("");
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleNewThread();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleNewThread]);

  const handleSelectSession = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const handlePromptCard = useCallback((card: AIPromptCard) => {
    setInput(clampInput(card.prompt));
    textareaRef.current?.focus();
  }, []);

  const handleSuggested = useCallback((p: string) => {
    setInput(clampInput(p));
    textareaRef.current?.focus();
  }, []);

  const handleAddAttachments = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      const remaining = MAX_ATTACHMENTS - attachments.length;
      if (remaining <= 0) {
        toast.error(`You can attach up to ${MAX_ATTACHMENTS} files per message.`);
        return;
      }
      const accepted = files.slice(0, remaining);
      if (files.length > accepted.length) {
        toast.error(
          `Only ${MAX_ATTACHMENTS} attachments allowed - took the first ${accepted.length}.`
        );
      }
      const next: AIAttachment[] = [];
      for (const f of accepted) {
        if (f.size > MAX_ATTACHMENT_BYTES) {
          toast.error(`"${f.name}" is larger than 8MB and was skipped.`);
          continue;
        }
        try {
          const data = await readFileAsDataUrl(f);
          if (!data) throw new Error("Empty file");
          next.push({ name: f.name, type: f.type || "application/octet-stream", size: f.size, data });
        } catch {
          toast.error(`Couldn't read "${f.name}".`);
        }
      }
      if (next.length > 0) setAttachments((prev) => [...prev, ...next]);
    },
    [attachments.length]
  );

  const handleRemoveAttachment = useCallback((name: string, size: number) => {
    setAttachments((prev) => prev.filter((a) => !(a.name === name && a.size === size)));
  }, []);

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingThread, setDeletingThread] = useState(false);

  const handleDeleteSession = useCallback((id: string) => {
    setPendingDeleteId(id);
  }, []);

  const confirmDeleteThread = useCallback(async () => {
    if (!pendingDeleteId) return;
    setDeletingThread(true);
    try {
      await deleteChat(pendingDeleteId);
      setSessions((prev) => prev.filter((s) => s.id !== pendingDeleteId));
      if (activeId === pendingDeleteId) {
        setActiveId(null);
        setMessages([]);
      }
      toast.success("Thread removed");
      setPendingDeleteId(null);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't delete thread");
    } finally {
      setDeletingThread(false);
    }
  }, [pendingDeleteId, activeId]);

  const cancelDeleteThread = useCallback(() => {
    if (deletingThread) return;
    setPendingDeleteId(null);
  }, [deletingThread]);

  const pendingDeleteTitle = useMemo(() => {
    if (!pendingDeleteId) return "";
    const session = sessions.find((s) => s.id === pendingDeleteId);
    return session?.title?.trim() || "this thread";
  }, [pendingDeleteId, sessions]);

  const deriveTitle = (text: string): string => {
    const clean = text.trim().replace(/\s+/g, " ");
    return clean.length > 60 ? `${clean.slice(0, 57)}…` : clean || "New thread";
  };

  const handleSend = useCallback(async () => {
    const text = input.trim();
    const pending = attachments;
    if ((!text && pending.length === 0) || isSending) return;

    setIsSending(true);
    const createdAt = new Date();
    const attachmentSuffix =
      pending.length > 0
        ? `\n\n[Attached: ${pending.map((a) => a.name).join(", ")}]`
        : "";
    const displayContent = text + attachmentSuffix;
    const userMsg: AIMessage = {
      id: `local-${createdAt.getTime()}`,
      role: "user",
      content: displayContent || "(attachments)",
      createdAt: createdAt.toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachments([]);

    try {
      let chatId = activeId;
      const isNewThread = !chatId;
      if (!chatId) {
        const id = await createChat(deriveTitle(text));
        if (!id) {
          throw new Error("Unauthorized");
        }
        chatId = id;
        setActiveId(id);
      }

      await saveChatMessage(chatId, "user", displayContent || "(attachments)");

      const started = performance.now();
      const apiMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: text || "(see attachments)" },
      ];
      const res = await fetch("/api/insights/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          mode,
          attachments:
            pending.length > 0
              ? pending.map((a) => ({
                name: a.name,
                type: a.type,
                size: a.size,
                data: a.data,
              }))
              : undefined,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(
          (j as { error?: { message?: string } }).error?.message ||
          `Request failed with ${res.status}`
        );
      }

      const json = (await res.json()) as {
        data?: { content?: string };
        content?: string;
      };
      const aiContent =
        json.data?.content ?? json.content ?? "No response received.";
      const elapsed = ((performance.now() - started) / 1000).toFixed(1);

      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: aiContent,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      await saveChatMessage(chatId, "assistant", aiContent);

      if (isNewThread) {
        try {
          const titleSource =
            text ||
            (pending.length > 0 ? `Attachments: ${pending[0].name}` : "New thread");
          await updateChatTitle(chatId, deriveTitle(titleSource));
        } catch {
        }
      }

      setRecentAnswers((prev) => {
        const questionSource =
          text || (pending.length > 0 ? `Attachments: ${pending.map((a) => a.name).join(", ")}` : "");
        const next: AIRecentAnswer = {
          id: aiMsg.id,
          question:
            questionSource.length > 90
              ? `${questionSource.slice(0, 87)}…`
              : questionSource,
          when: format(new Date(), "HH:mm").toUpperCase(),
          meta: `${elapsed}s · ${sources.filter((s) => s.connected).length} SOURCES`,
        };
        return [next, ...prev].slice(0, 3);
      });

      setSessions((prev) => {
        const existing = prev.find((s) => s.id === chatId);
        const nowIso = new Date().toISOString();
        if (existing) {
          return [
            {
              ...existing,
              messageCount: existing.messageCount + 2,
              updatedAt: nowIso,
            },
            ...prev.filter((s) => s.id !== chatId),
          ];
        }
        const titleSource =
          text ||
          (pending.length > 0 ? `Attachments: ${pending[0].name}` : "New thread");
        return [
          {
            id: chatId!,
            title: deriveTitle(titleSource),
            updatedAt: nowIso,
            createdAt: nowIso,
            messageCount: 2,
            category: categorize(titleSource),
          },
          ...prev,
        ];
      });

      startTransition(() => {
      });
    } catch (err) {
      console.error("Send failed", err);
      toast.error(
        err instanceof Error ? err.message : "Sentinel couldn't answer right now."
      );
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      setInput(clampInput(text));
      setAttachments(pending);
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  }, [
    input,
    isSending,
    activeId,
    messages,
    sources,
    attachments,
  ]);

  const onTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void handleSend();
    }
  };

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
                onSuggested={handleSuggested}
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
            onCycleMode={() =>
              setMode((m) => MODES[(MODES.indexOf(m) + 1) % MODES.length])
            }
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


