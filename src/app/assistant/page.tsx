"use client";

import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestions = [
  "How do I reduce risk on my deals?",
  "What should I do with stale deals?",
  "Explain deal risk scores",
  "Best practices for deal follow-ups",
  "How to prioritize my pipeline?",
  "Tips for closing deals faster",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your Revenue Sentinel AI Assistant. I can help you with deal management, risk analysis, sales strategies, and answer any questions about using the platform. What can I help you with today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();

      if (!data.content) {
        throw new Error("Invalid response from AI");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I apologize, but I encountered an error. Please try again or contact support if the issue persists.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full" style={{ background: "#0a0a0f" }}>
        <div
          className="shrink-0 px-6 py-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
              }}
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">AI Assistant</h1>
              <p className="text-xs text-white/40">
                Powered by Revenue Sentinel AI
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
                    message.role === "assistant"
                      ? "bg-gradient-to-br from-violet-500 to-indigo-500"
                      : "bg-gradient-to-br from-amber-400 to-orange-500"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                      />
                    </svg>
                  ) : (
                    <span className="text-white text-xs font-semibold">U</span>
                  )}
                </div>

                <div
                  className={`flex-1 max-w-[80%] ${
                    message.role === "user" ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`inline-block rounded-2xl px-4 py-3 text-sm ${
                      message.role === "assistant"
                        ? "bg-white/5 text-white/90"
                        : "bg-violet-500/20 text-white"
                    }`}
                    style={{
                      borderRadius:
                        message.role === "user"
                          ? "20px 20px 4px 20px"
                          : "20px 20px 20px 4px",
                    }}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                  <p className="text-[10px] text-white/30 mt-1 px-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-500">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                    />
                  </svg>
                </div>
                <div
                  className="bg-white/5 rounded-2xl px-4 py-3"
                  style={{ borderRadius: "20px 20px 20px 4px" }}
                >
                  <div className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {messages.length <= 2 && (
          <div className="px-6 pb-4">
            <div className="max-w-3xl mx-auto">
              <p className="text-xs text-white/30 mb-3">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-2 rounded-xl text-xs text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div
          className="shrink-0 p-6 border-t"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="max-w-3xl mx-auto">
            <div
              className="flex items-end gap-3 rounded-2xl p-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about deals, risk management, sales strategies..."
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-white/30 outline-none resize-none text-sm min-h-[24px] max-h-[120px]"
                style={{ lineHeight: "24px" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  input.trim() && !isLoading
                    ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white"
                    : "bg-white/5 text-white/30"
                }`}
              >
                {isLoading ? (
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-[10px] text-white/20 text-center mt-3">
              AI responses are generated to help with deal management. Always
              verify critical information.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
