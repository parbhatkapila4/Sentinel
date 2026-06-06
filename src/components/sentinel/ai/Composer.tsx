"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type {
  SentinelSpeechRecognition,
  SentinelSpeechRecognitionErrorEvent,
  SentinelSpeechRecognitionEvent,
  SentinelWindowWithSpeech,
} from "@/types/speech-recognition";
import {
  ACCEPTED_FILE_TYPES,
  clampInput,
  formatFileSize,
  MAX_ATTACHMENTS,
  MAX_INPUT_CHARS,
  type AIAttachment,
  type Mode,
} from "./composer-utils";

interface ComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isSending: boolean;
  mode: Mode;
  onCycleMode: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  ctxLabel: string;
  modelLabel: string;
  attachments: AIAttachment[];
  onAddAttachments: (files: File[]) => void | Promise<void>;
  onRemoveAttachment: (name: string, size: number) => void;
}

export function Composer({
  value,
  onChange,
  onSend,
  onKeyDown,
  isSending,
  mode,
  onCycleMode,
  textareaRef,
  ctxLabel,
  modelLabel,
  attachments,
  onAddAttachments,
  onRemoveAttachment,
}: ComposerProps) {
  const counter = `${value.length} / ${MAX_INPUT_CHARS}`;
  const disabled =
    isSending || (value.trim().length === 0 && attachments.length === 0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const w = window as unknown as SentinelWindowWithSpeech;
    return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition);
  });
  const recognitionRef = useRef<SentinelSpeechRecognition | null>(null);
  const transcriptBaseRef = useRef<string>("");

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
      recognitionRef.current = null;
    };
  }, []);

  const handleAttachClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) void onAddAttachments(files);
    e.target.value = "";
  };

  const handleVoiceClick = () => {
    if (typeof window === "undefined") return;
    const w = window as unknown as SentinelWindowWithSpeech;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setVoiceSupported(false);
      toast.error("Voice isn't supported in this browser.");
      return;
    }
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop?.();
      return;
    }
    try {
      const rec = new Ctor();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang =
        (typeof navigator !== "undefined" && navigator.language) || "en-US";
      transcriptBaseRef.current = value ? `${value.trim()} ` : "";
      rec.onresult = (event: SentinelSpeechRecognitionEvent) => {
        let finalText = "";
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const r = event.results[i];
          const chunk = r[0]?.transcript ?? "";
          if (r.isFinal) finalText += chunk;
          else interim += chunk;
        }
        const next = clampInput(
          `${transcriptBaseRef.current}${finalText}${interim}`.trimStart()
        );
        onChange(next);
        if (finalText) transcriptBaseRef.current = next;
      };
      rec.onerror = (e: SentinelSpeechRecognitionErrorEvent) => {
        setIsListening(false);
        if (e.error && e.error !== "aborted" && e.error !== "no-speech") {
          toast.error(`Voice error: ${e.error}`);
        }
      };
      rec.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };
      recognitionRef.current = rec;
      rec.start();
      setIsListening(true);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't start voice input.");
    }
  };

  return (
    <div
      style={{
        borderTop: "1px solid var(--rule)",
        background: "var(--ink)",
        padding: "16px 32px 18px",
        position: "sticky",
        bottom: 0,
      }}
    >
      <div
        className="sentinel-ai-input-wrap"
        style={{
          maxWidth: 820,
          margin: "0 auto",
          background: "var(--ink-02)",
          border: "1px solid var(--rule-strong)",
          padding: "14px 16px 12px",
          position: "relative",
          transition: "border-color 160ms",
        }}
      >
        <span aria-hidden className="sentinel-ai-input-accent" />

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleFileChange}
          style={{ display: "none" }}
          aria-hidden
          tabIndex={-1}
        />

        {attachments.length > 0 && (
          <div
            className="flex flex-wrap"
            style={{
              gap: 6,
              marginBottom: 12,
              paddingBottom: 10,
              borderBottom: "1px solid var(--rule)",
            }}
          >
            {attachments.map((a) => (
              <span
                key={`${a.name}-${a.size}`}
                className="flex items-center"
                style={{
                  gap: 8,
                  padding: "4px 8px 4px 10px",
                  border: "1px solid var(--rule-strong)",
                  background: "var(--ink)",
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--cream-2)",
                  maxWidth: 240,
                }}
              >
                <svg
                  width={10}
                  height={10}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "var(--signal)", flexShrink: 0 }}
                  aria-hidden
                >
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
                <span
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    minWidth: 0,
                    textTransform: "none",
                    letterSpacing: "-0.005em",
                    fontFamily: "var(--font-geist-sans)",
                    fontSize: 11.5,
                    color: "var(--cream)",
                  }}
                >
                  {a.name}
                </span>
                <span style={{ color: "var(--cream-4)" }}>
                  {formatFileSize(a.size)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveAttachment(a.name, a.size)}
                  aria-label={`Remove ${a.name}`}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--cream-3)",
                    cursor: "pointer",
                    padding: 0,
                    lineHeight: 1,
                    fontSize: 13,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(clampInput(e.target.value))}
          onKeyDown={onKeyDown}
          placeholder="Ask Sentinel anything about your pipeline…"
          aria-label="Ask Sentinel"
          rows={1}
          disabled={isSending}
          maxLength={MAX_INPUT_CHARS}
          className="sentinel-ai-textarea"
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--cream)",
            fontFamily: "var(--font-geist-sans)",
            fontSize: 14.5,
            lineHeight: 1.5,
            resize: "none",
            letterSpacing: "-0.005em",
            minHeight: 24,
            maxHeight: 200,
          }}
        />

        <div
          className="flex items-center justify-between"
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid var(--rule)",
          }}
        >
          <div className="flex items-center" style={{ gap: 4 }}>
            <PromptTool
              label={
                attachments.length > 0
                  ? `Attach (${attachments.length}/${MAX_ATTACHMENTS})`
                  : "Attach"
              }
              onClick={handleAttachClick}
              active={attachments.length > 0}
              disabled={isSending || attachments.length >= MAX_ATTACHMENTS}
            >
              <svg
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
            </PromptTool>
            <PromptTool
              label={isListening ? "Stop voice" : "Voice"}
              onClick={handleVoiceClick}
              active={isListening}
              disabled={isSending || !voiceSupported}
            >
              <svg
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
              </svg>
            </PromptTool>
            <button
              type="button"
              onClick={onCycleMode}
              className="sentinel-ai-mode"
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--cream-3)",
                padding: "4px 10px",
                border: "1px solid var(--rule-strong)",
                marginLeft: 4,
                cursor: "pointer",
                background: "transparent",
              }}
              aria-label="Switch mode"
            >
              MODE ·{" "}
              <b style={{ color: "var(--signal)", fontWeight: 500 }}>{mode}</b>
            </button>
          </div>

          <div className="flex items-center" style={{ gap: 12 }}>
            <span
              className="tabular"
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                color: "var(--cream-3)",
                letterSpacing: "0.05em",
              }}
            >
              {counter}
            </span>
            <button
              type="button"
              onClick={onSend}
              disabled={disabled}
              style={{
                background: disabled ? "var(--ink-03)" : "var(--signal)",
                color: disabled ? "var(--cream-3)" : "var(--cream)",
                border: "none",
                padding: "7px 16px",
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontWeight: 500,
                cursor: disabled ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "background 140ms",
              }}
            >
              {isSending ? "Sending…" : "Send"}
              <span
                aria-hidden
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 11,
                  opacity: 0.7,
                }}
              >
                ⏎
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between"
        style={{
          maxWidth: 820,
          margin: "10px auto 0",
          fontFamily: "var(--font-mono-jb)",
          fontSize: 9.5,
          color: "var(--cream-3)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        <span>
          <Kbd>⏎</Kbd> SEND · <Kbd>⇧⏎</Kbd> NEW LINE · <Kbd>⌘K</Kbd> COMMANDS
        </span>
        <span>
          {modelLabel} · CTX {ctxLabel}
        </span>
      </div>
    </div>
  );
}

function PromptTool({
  label,
  children,
  onClick,
  active,
  disabled,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active || undefined}
      onClick={onClick}
      disabled={disabled}
      className="sentinel-ai-tool"
      style={{
        width: 28,
        height: 28,
        display: "grid",
        placeItems: "center",
        color: active ? "var(--signal)" : "var(--cream-3)",
        background: active ? "rgba(200,71,46,0.08)" : "transparent",
        border: "none",
        borderRadius: 3,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "all 140ms",
      }}
    >
      {children}
    </button>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      style={{
        fontFamily: "var(--font-mono-jb)",
        fontSize: 9,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        border: "1px solid var(--rule-strong)",
        padding: "2px 5px",
        margin: "0 3px",
      }}
    >
      {children}
    </kbd>
  );
}
