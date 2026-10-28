"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
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

import { categorizeSession, countSessionsToday } from "./derive";
import {
  clampInput,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_BYTES,
  MODES,
  readFileAsDataUrl,
  type AIAttachment,
  type Mode,
} from "./composer-utils";
import type { AIMessage, AIRecentAnswer, AISession } from "./types";

interface UseAIWorkspaceOptions {
  initialSessions: AISession[];
  initialRecentAnswers: AIRecentAnswer[];
  initialTodayCount: number;
  connectedSourceCount: number;
}

function deriveTitle(text: string): string {
  const clean = text.trim().replace(/\s+/g, " ");
  return clean.length > 60 ? `${clean.slice(0, 57)}…` : clean || "New thread";
}

export function useAIWorkspace({
  initialSessions,
  initialRecentAnswers,
  initialTodayCount,
  connectedSourceCount,
}: UseAIWorkspaceOptions) {
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
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingThread, setDeletingThread] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredSessions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => s.title.toLowerCase().includes(q));
  }, [sessions, search]);

  const todayCount = useMemo(() => {
    if (sessions === initialSessions) return initialTodayCount;
    return countSessionsToday(sessions);
  }, [sessions, initialSessions, initialTodayCount]);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeId) ?? null,
    [sessions, activeId]
  );

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
    const onKey = (e: globalThis.KeyboardEvent) => {
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

  const applyPrompt = useCallback((prompt: string) => {
    setInput(clampInput(prompt));
    textareaRef.current?.focus();
  }, []);

  const cycleMode = useCallback(() => {
    setMode((m) => MODES[(MODES.indexOf(m) + 1) % MODES.length]);
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

      const titleSource =
        text ||
        (pending.length > 0 ? `Attachments: ${pending[0].name}` : "New thread");

      if (isNewThread) {
        try {
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
          meta: `${elapsed}s · ${connectedSourceCount} SOURCES`,
          chatId: chatId ?? undefined,
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
        return [
          {
            id: chatId!,
            title: deriveTitle(titleSource),
            updatedAt: nowIso,
            createdAt: nowIso,
            messageCount: 2,
            category: categorizeSession(titleSource),
          },
          ...prev,
        ];
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
    connectedSourceCount,
    attachments,
    mode,
  ]);

  const onTextareaKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        void handleSend();
      }
    },
    [handleSend]
  );

  return {
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
    setMode,
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
  };
}
