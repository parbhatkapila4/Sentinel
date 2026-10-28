"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { generateFollowUpEmail } from "@/app/actions/ai";
import type { EmailTone } from "@/types";
import { primaryButtonStyle, secondaryButtonStyle } from "../blocks";
import { LightDialog } from "../LightDialog";
import { smallSecondary } from "./sections";

const TONES: Array<{ value: EmailTone; label: string }> = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "urgent", label: "Urgent" },
];

const NOTE =
  "Drafted from this deal's history, last activity and stage. Edit anything before you send it.";

export interface FollowUpDraft {
  subject: string;
  body: string;
}

export function FollowUpDialog({
  host,
  returnFocus,
  dealId,
  dealName,
  sub,
  initialDraft,
  onClose,
}: {
  host: Element;
  returnFocus: HTMLElement | null;
  dealId: string;
  dealName: string;
  sub: string;
  initialDraft?: FollowUpDraft;
  onClose: () => void;
}) {
  const router = useRouter();
  const [tone, setTone] = useState<EmailTone>("professional");
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [draft, setDraft] = useState<FollowUpDraft | null>(initialDraft ?? null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const requestRef = useRef(0);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busy = loading || regenerating;

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    []
  );

  const generate = useCallback(
    async (targetTone: EmailTone, isFirst: boolean) => {
      if (isFirst) setLoading(true);
      else setRegenerating(true);
      setError(null);
      const request = ++requestRef.current;
      try {
        const result = await generateFollowUpEmail(dealId, targetTone, {
          logToTimeline: isFirst,
        });
        if (requestRef.current !== request) return;
        setDraft({ subject: result.subject, body: result.body });
        router.refresh();
      } catch (err) {
        if (requestRef.current !== request) return;
        const message = err instanceof Error && err.message ? err.message : "The email could not be drafted.";
        setError(message);
        toast.error(message);
      } finally {
        if (requestRef.current === request) {
          setLoading(false);
          setRegenerating(false);
        }
      }
    },
    [dealId, router]
  );

  function pickTone(next: EmailTone) {
    if (next === tone) return;
    setTone(next);
    if (draft) void generate(next, false);
  }

  function copy() {
    if (!draft) return;
    void navigator.clipboard
      .writeText(`Subject: ${draft.subject}\n\n${draft.body}`)
      .then(() => {
        setCopied(true);
        if (copyTimer.current) clearTimeout(copyTimer.current);
        copyTimer.current = setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => toast.error("Could not copy. The browser blocked clipboard access."));
  }

  const mailto = draft
    ? `mailto:?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`
    : "";

  return (
    <LightDialog
      host={host}
      kicker="Follow-up email"
      title={dealName}
      sub={sub}
      maxWidth={640}
      closeButton
      busy={busy}
      returnFocus={returnFocus}
      onClose={onClose}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginTop: 16 }}>
        <span className="dl-dd-label">Tone</span>
        <div className="dl-dd-tones" role="group" aria-label="Tone">
          {TONES.map((t) => (
            <button
              key={t.value}
              type="button"
              className="dl-dd-tone"
              aria-pressed={tone === t.value}
              aria-busy={(tone === t.value && busy) || undefined}
              disabled={busy}
              onClick={() => pickTone(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {draft && (
        <div className="dl-fields" style={{ opacity: regenerating ? 0.55 : 1 }}>
          <label>
            <b>Subject</b>
            <input
              className="dl-st-field"
              value={draft.subject}
              onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
              placeholder="Subject line"
            />
          </label>
          <label>
            <b>Body</b>
            <textarea
              className="dl-st-field"
              rows={10}
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              placeholder="Email body"
            />
          </label>
        </div>
      )}

      <p className="dl-dialog-note">{NOTE}</p>
      {error && (
        <p role="alert" style={{ marginTop: 10, fontSize: 13.5, fontWeight: 500, color: "var(--dl-signal-d)" }}>
          {error}
        </p>
      )}

      <div className="dl-dialog-foot">
        {draft ? (
          <>
            <button
              type="button"
              onClick={() => void generate(tone, false)}
              disabled={busy}
              className="dl-btn-secondary"
              style={{ ...smallSecondary, opacity: busy ? 0.55 : 1 }}
            >
              {regenerating ? "Regenerating" : "Regenerate"}
            </button>
            <button
              type="button"
              onClick={copy}
              aria-live="polite"
              className="dl-btn-secondary"
              style={smallSecondary}
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <a
              href={mailto}
              target="_blank"
              rel="noopener noreferrer"
              className="dl-btn-secondary"
              style={smallSecondary}
            >
              Open in mail
            </a>
            <span className="dl-spacer" />
            <button type="button" onClick={onClose} disabled={busy} className="dl-btn-primary" style={primaryButtonStyle}>
              Done
            </button>
          </>
        ) : (
          <>
            <span className="dl-spacer" />
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="dl-btn-secondary"
              style={secondaryButtonStyle}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void generate(tone, true)}
              disabled={loading}
              aria-busy={loading || undefined}
              className="dl-btn-primary"
              style={{ ...primaryButtonStyle, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Drafting" : "Draft email"}
            </button>
          </>
        )}
      </div>
    </LightDialog>
  );
}
