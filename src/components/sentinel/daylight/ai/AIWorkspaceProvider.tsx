"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AIRecentAnswer, AISession } from "@/components/sentinel/ai/types";
import { useAIWorkspace } from "@/components/sentinel/ai/useAIWorkspace";
import { ConfirmDialog } from "../ConfirmDialog";
import { groupThreads, type ThreadGroup } from "./model";

type AIWorkspaceValue = ReturnType<typeof useAIWorkspace> & {
  now: Date;
  groups: ThreadGroup[];
  requestDelete: (id: string, trigger: HTMLElement) => void;
};

const AIWorkspaceContext = createContext<AIWorkspaceValue | null>(null);

export interface AIWorkspaceProviderProps {
  sessions: AISession[];
  recentAnswers: AIRecentAnswer[];
  todayChatCount: number;
  connectedSourceCount: number;
  nowISO: string;
  children: ReactNode;
}

export function AIWorkspaceProvider({
  sessions,
  recentAnswers,
  todayChatCount,
  connectedSourceCount,
  nowISO,
  children,
}: AIWorkspaceProviderProps) {
  const workspace = useAIWorkspace({
    initialSessions: sessions,
    initialRecentAnswers: recentAnswers,
    initialTodayCount: todayChatCount,
    connectedSourceCount,
  });
  const [dialog, setDialog] = useState<{ host: Element; trigger: HTMLElement } | null>(null);

  const now = useMemo(() => new Date(nowISO), [nowISO]);
  const groups = useMemo(
    () => groupThreads(workspace.filteredSessions, now),
    [workspace.filteredSessions, now]
  );

  const requestDelete = (id: string, trigger: HTMLElement) => {
    const host = trigger.closest(".sentinel-daylight");
    if (!host) return;
    workspace.handleDeleteSession(id);
    setDialog({ host, trigger });
  };

  const closeDialog = () => {
    if (workspace.deletingThread) return;
    workspace.cancelDeleteThread();
    setDialog(null);
  };

  return (
    <AIWorkspaceContext.Provider value={{ ...workspace, now, groups, requestDelete }}>
      {children}
      {dialog && workspace.pendingDeleteId && (
        <ConfirmDialog
          host={dialog.host}
          kicker="Delete thread"
          title={`Delete ${workspace.pendingDeleteTitle}?`}
          body="The whole conversation and every message in it will be removed. This cannot be undone."
          confirmLabel="Delete thread"
          busyLabel="Deleting"
          busy={workspace.deletingThread}
          returnFocus={dialog.trigger}
          onConfirm={() => void workspace.confirmDeleteThread()}
          onCancel={closeDialog}
        />
      )}
    </AIWorkspaceContext.Provider>
  );
}

export function useAIWorkspaceContext(): AIWorkspaceValue {
  const value = useContext(AIWorkspaceContext);
  if (!value) {
    throw new Error("useAIWorkspaceContext needs an AIWorkspaceProvider above it");
  }
  return value;
}
