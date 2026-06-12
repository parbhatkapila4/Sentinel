"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { generateFollowUpEmail } from "@/app/actions/ai";
import type { EmailTone, GeneratedEmail } from "@/types";
import { toast } from "sonner";
import { getFocusableElements, trapFocus } from "@/lib/a11y";

const TONES: { value: EmailTone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "urgent", label: "Urgent" },
];

interface EmailGeneratorProps {
  dealId: string;
  dealName: string;
  dealValue: number;
  dealStage: string;
  onEmailLogged?: () => void;
}

const META_LABEL: React.CSSProperties = {
  fontFamily: "var(--font-mono-jb)",
  fontSize: 10,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--cream-3)",
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  fontFamily: "var(--font-mono-jb)",
  fontSize: 13,
  letterSpacing: "0.04em",
  padding: "11px 14px",
  background: "var(--ink-02)",
  border: "1px solid var(--rule-strong)",
  color: "var(--cream)",
  outline: "none",
};

const TEXTAREA_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  fontFamily: "var(--font-serif)",
  fontSize: 15,
  lineHeight: 1.6,
  letterSpacing: 0,
  padding: "14px 16px",
  resize: "vertical",
  minHeight: 220,
};

const GHOST_BUTTON: React.CSSProperties = {
  fontFamily: "var(--font-mono-jb)",
  fontSize: 10.5,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  padding: "9px 16px",
  border: "1px solid var(--rule-strong)",
  background: "transparent",
  color: "var(--cream-2)",
  cursor: "pointer",
};

const PRIMARY_BUTTON: React.CSSProperties = {
  fontFamily: "var(--font-mono-jb)",
  fontSize: 10.5,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  padding: "9px 18px",
  border: "1px solid var(--signal)",
  background: "var(--signal)",
  color: "var(--ink)",
  cursor: "pointer",
  fontWeight: 600,
};

export function EmailGenerator({
  dealId,
  dealName,
  dealValue,
  dealStage,
  onEmailLogged,
}: EmailGeneratorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<EmailTone>("professional");
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [email, setEmail] = useState<GeneratedEmail | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const [copied, setCopied] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  const closeModal = useCallback(() => {
    if (loading || regenerating) return;
    setOpen(false);
    setEmail(null);
    setSubject("");
    setBody("");
    setError(null);
    setCopied(false);
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }
    triggerRef.current?.focus();
  }, [loading, regenerating]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const generate = useCallback(
    async (targetTone: EmailTone, isInitial: boolean) => {
      if (isInitial) setLoading(true);
      else setRegenerating(true);
      setError(null);
      const reqId = ++requestIdRef.current;
      try {
        const result = await generateFollowUpEmail(dealId, targetTone, {
          logToTimeline: isInitial,
        });
        if (requestIdRef.current !== reqId) return;
        setEmail(result);
        setSubject(result.subject);
        setBody(result.body);
        onEmailLogged?.();
        router.refresh();
      } catch (e) {
        if (requestIdRef.current !== reqId) return;
        const message =
          e instanceof Error ? e.message : "Failed to generate email";
        setError(message);
        toast.error(message);
      } finally {
        if (requestIdRef.current === reqId) {
          setLoading(false);
          setRegenerating(false);
        }
      }
    },
    [dealId, onEmailLogged, router]
  );

  const handleGenerate = useCallback(() => {
    void generate(tone, !email);
  }, [generate, tone, email]);

  const handleToneSelect = useCallback(
    (next: EmailTone) => {
      if (next === tone) return;
      setTone(next);
      if (email) {
        void generate(next, false);
      }
    },
    [tone, email, generate]
  );

  function handleCopy() {
    const text = `Subject: ${subject}\n\n${body}`;
    void navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => {
          setCopied(false);
          copyTimeoutRef.current = null;
        }, 1800);
      })
      .catch(() => {
        toast.error("Could not copy - clipboard access blocked");
      });
  }

  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const first = getFocusableElements(dialogRef.current)[0];
    first?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
        return;
      }
      if (dialogRef.current && trapFocus(e, dialogRef.current)) {
        e.stopPropagation();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, closeModal]);

  const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10.5,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          padding: "8px 16px",
          border: "1px solid var(--signal)",
          background: "transparent",
          color: "var(--signal)",
          cursor: "pointer",
        }}
      >
        <svg
          aria-hidden
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6h16v12H4z" />
          <path d="M4 7l8 6 8-6" />
        </svg>
        <span>Draft follow-up</span>
      </button>

      {open &&
        mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="email-generator-title"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              background: "rgba(18, 18, 18, 0.72)",
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              ref={dialogRef}
              onClick={(e) => e.stopPropagation()}
              className="scrollbar-hide"
              style={{
                width: "100%",
                maxWidth: 680,
                maxHeight: "calc(100vh - 32px)",
                overflowY: "auto",
                background: "var(--ink)",
                border: "1px solid var(--rule-strong)",
                padding: "28px 28px 24px",
                boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.6)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 20,
                  paddingBottom: 18,
                  marginBottom: 22,
                  borderBottom: "1px solid var(--rule)",
                }}
              >
                <div>
                  <div
                    style={{
                      ...META_LABEL,
                      color: "var(--signal)",
                      marginBottom: 8,
                    }}
                  >
                    § ✉ - FOLLOW-UP
                  </div>
                  <h2
                    id="email-generator-title"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 28,
                      fontWeight: 400,
                      color: "var(--cream)",
                      letterSpacing: "-0.02em",
                      margin: 0,
                    }}
                  >
                    The{" "}
                    <em style={{ fontStyle: "italic", color: "var(--signal)" }}>
                      next touch
                    </em>
                    .
                  </h2>
                  <p
                    style={{
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 11,
                      letterSpacing: "0.08em",
                      color: "var(--cream-3)",
                      margin: "10px 0 0",
                    }}
                  >
                    {dealName}
                    <span
                      style={{ color: "var(--rule-strong)", margin: "0 10px" }}
                    >
                      /
                    </span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>
                      ${dealValue.toLocaleString("en-US")}
                    </span>
                    <span
                      style={{ color: "var(--rule-strong)", margin: "0 10px" }}
                    >
                      /
                    </span>
                    <span style={{ textTransform: "uppercase" }}>
                      {dealStage}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading || regenerating}
                  aria-label="Close follow-up card"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 28,
                    lineHeight: 1,
                    border: "1px solid var(--rule-strong)",
                    background: "transparent",
                    color: "var(--cream-2)",
                    width: 34,
                    height: 34,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor:
                      loading || regenerating ? "not-allowed" : "pointer",
                    opacity: loading || regenerating ? 0.5 : 1,
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: email ? 18 : 26 }}>
                <div style={{ ...META_LABEL, marginBottom: 10 }}>Tone</div>
                <div style={{ display: "flex", gap: 0 }}>
                  {TONES.map((t, i) => {
                    const selected = tone === t.value;
                    const showSpinner =
                      selected && (regenerating || loading);
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => handleToneSelect(t.value)}
                        aria-pressed={selected}
                        aria-busy={showSpinner}
                        style={{
                          flex: 1,
                          fontFamily: "var(--font-mono-jb)",
                          fontSize: 10.5,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          padding: "10px 14px",
                          border: "1px solid var(--rule-strong)",
                          borderLeftWidth: i === 0 ? 1 : 0,
                          background: selected ? "var(--ink-02)" : "transparent",
                          color: selected ? "var(--signal)" : "var(--cream-3)",
                          cursor: "pointer",
                          position: "relative",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 10,
                        }}
                      >
                        {selected && (
                          <span
                            aria-hidden
                            style={{
                              position: "absolute",
                              left: 0,
                              right: 0,
                              bottom: -1,
                              height: 2,
                              background: "var(--signal)",
                            }}
                          />
                        )}
                        <span>{t.label}</span>
                        {showSpinner && (
                          <svg
                            className="animate-spin"
                            width={11}
                            height={11}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            aria-hidden
                            style={{ color: "var(--signal)" }}
                          >
                            <circle cx={12} cy={12} r={9} strokeOpacity={0.25} />
                            <path d="M21 12a9 9 0 0 1-9 9" strokeLinecap="round" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {!email ? (
                <>
                  <p
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      fontSize: 14,
                      color: "var(--cream-3)",
                      lineHeight: 1.55,
                      margin: "0 0 22px",
                    }}
                  >
                    Drafted from the timeline, last activity, and the
                    deal&apos;s current stage. You can edit everything before
                    sending.
                  </p>
                  {error && (
                    <p
                      role="alert"
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontStyle: "italic",
                        fontSize: 14,
                        color: "var(--wine)",
                        margin: "0 0 18px",
                      }}
                    >
                      {error}
                    </p>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 10,
                      paddingTop: 18,
                      borderTop: "1px solid var(--rule)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={loading}
                      style={{
                        ...GHOST_BUTTON,
                        opacity: loading ? 0.55 : 1,
                        cursor: loading ? "not-allowed" : "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={loading}
                      style={{
                        ...PRIMARY_BUTTON,
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? "wait" : "pointer",
                      }}
                    >
                      {loading ? "Drafting…" : "Draft email"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label
                      htmlFor="fu-subject"
                      style={{
                        ...META_LABEL,
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Subject
                    </label>
                    <input
                      id="fu-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      style={INPUT_STYLE}
                      placeholder="Subject line"
                    />
                  </div>
                  <div style={{ marginBottom: 22 }}>
                    <label
                      htmlFor="fu-body"
                      style={{
                        ...META_LABEL,
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Body
                    </label>
                    <textarea
                      id="fu-body"
                      className="scrollbar-hide"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={12}
                      style={TEXTAREA_STYLE}
                      placeholder="Email body"
                    />
                  </div>
                  {error && (
                    <p
                      role="alert"
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontStyle: "italic",
                        fontSize: 14,
                        color: "var(--wine)",
                        margin: "0 0 18px",
                      }}
                    >
                      {error}
                    </p>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      paddingTop: 18,
                      borderTop: "1px solid var(--rule)",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={regenerating || loading}
                      style={{
                        ...GHOST_BUTTON,
                        borderColor: "var(--rule)",
                        color: "var(--cream-3)",
                        opacity: regenerating || loading ? 0.55 : 1,
                        cursor:
                          regenerating || loading ? "wait" : "pointer",
                      }}
                    >
                      {regenerating ? "Regenerating…" : "Regenerate"}
                    </button>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        onClick={handleCopy}
                        aria-live="polite"
                        style={{
                          ...GHOST_BUTTON,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          ...(copied && {
                            color: "var(--ivy)",
                            borderColor: "var(--ivy)",
                          }),
                        }}
                      >
                        {copied ? (
                          <>
                            <svg
                              width={11}
                              height={11}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.5}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Copied</span>
                          </>
                        ) : (
                          <span>Copy</span>
                        )}
                      </button>
                      <a
                        href={mailto}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          ...GHOST_BUTTON,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        Open in mail
                      </a>
                      <button
                        type="button"
                        onClick={closeModal}
                        style={PRIMARY_BUTTON}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
