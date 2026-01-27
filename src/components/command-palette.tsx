"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";

interface Command {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: "navigation" | "actions" | "search";
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const commands: Command[] = [
    { id: "dashboard", label: "Go to Dashboard", category: "navigation", action: () => router.push("/dashboard") },
    { id: "deals", label: "Go to Deals", category: "navigation", action: () => router.push("/deals") },
    { id: "new-deal", label: "Create New Deal", shortcut: "N", category: "actions", action: () => router.push("/deals/new") },
    { id: "insights", label: "Go to Insights", category: "navigation", action: () => router.push("/insights") },
    { id: "reports", label: "Go to Reports", category: "navigation", action: () => router.push("/reports") },
    { id: "settings", label: "Go to Settings", category: "navigation", action: () => router.push("/settings") },
    { id: "notifications", label: "View Notifications", category: "navigation", action: () => router.push("/notifications") },
    { id: "webhooks", label: "Manage Webhooks", category: "navigation", action: () => router.push("/settings/webhooks") },
    { id: "api-docs", label: "API Documentation", category: "navigation", action: () => router.push("/api-docs") },
    { id: "dev-docs", label: "Developer Docs", category: "navigation", action: () => router.push("/docs/developers") },
  ];

  const filteredCommands = query
    ? commands.filter((cmd) => cmd.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  useHotkeys("mod+k", (e) => {
    e.preventDefault();
    setIsOpen(true);
  }, { enableOnFormTags: true });

  useHotkeys("escape", () => {
    setIsOpen(false);
    setQuery("");
  }, { enableOnFormTags: true, enabled: isOpen });

  useHotkeys("arrowdown", (e) => {
    e.preventDefault();
    setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
  }, { enabled: isOpen, enableOnFormTags: true });

  useHotkeys("arrowup", (e) => {
    e.preventDefault();
    setSelectedIndex((i) => Math.max(i - 1, 0));
  }, { enabled: isOpen, enableOnFormTags: true });

  useHotkeys("enter", (e) => {
    if (filteredCommands[selectedIndex]) {
      e.preventDefault();
      filteredCommands[selectedIndex].action();
      setIsOpen(false);
      setQuery("");
    }
  }, { enabled: isOpen, enableOnFormTags: true });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => { setIsOpen(false); setQuery(""); }}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg">
        <div
          className="w-full max-w-lg mx-4 sm:mx-auto bg-[#1a1a1a] rounded-xl border border-white/10 shadow-2xl overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            <svg className="w-5 h-5 text-white/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-white placeholder-white/40 outline-none min-w-0 w-full px-4 py-3 text-base"
            />
            <kbd className="px-2 py-1 text-xs text-white/40 bg-white/5 rounded-md border border-white/10 shrink-0">ESC</kbd>
          </div>
          <div className="max-h-[60vh] sm:max-h-[50vh] overflow-y-auto py-2">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-white/40 text-sm">
                No commands found
              </div>
            ) : (
              filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => {
                    cmd.action();
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors min-h-[44px] ${index === selectedIndex ? "bg-white/10" : "hover:bg-white/5"
                    }`}
                >
                  <span className="text-sm text-white">{cmd.label}</span>
                  {cmd.shortcut && (
                    <kbd className="px-2 py-0.5 text-xs text-white/40 bg-white/5 rounded border border-white/10">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              ))
            )}
          </div>
          <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-xs text-white/30">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
