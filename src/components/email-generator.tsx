"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateFollowUpEmail } from "@/app/actions/ai";
import type { EmailTone, GeneratedEmail } from "@/types";
import { toast } from "sonner";

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

  async function handleGenerate() {
    if (email) {
      setRegenerating(true);
    } else {
      setLoading(true);
    }
    try {
      const result = await generateFollowUpEmail(dealId, tone, {
        logToTimeline: true,
      });
      setEmail(result);
      setSubject(result.subject);
      setBody(result.body);
      onEmailLogged?.();
      router.refresh();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to generate email"
      );
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  }

  function handleCopy() {
    const text = `Subject: ${subject}\n\n${body}`;
    void navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard");
    });
  }

  function handleClose() {
    setOpen(false);
    setEmail(null);
    setSubject("");
    setBody("");
  }

  const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#0f766e] hover:bg-[#0d9488] border border-[#0f766e]/40 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
        <span>Generate Follow-up</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            aria-hidden="true"
            onClick={handleClose}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide rounded-xl p-6 bg-[#0a0a0a] border border-white/[0.08] shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-1">
              Follow-up email
            </h3>
            <p className="text-sm text-white/50 mb-4">
              {dealName} · ${dealValue.toLocaleString("en-US")} · {dealStage}
            </p>

            {!email ? (
              <>
                <p className="text-xs font-medium text-white/50 mb-2">Tone</p>
                <div className="flex gap-2 mb-6">
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTone(t.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${tone === t.value
                        ? "bg-[#0f766e]/20 text-teal-300 border-[#0f766e]/40"
                        : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border-white/10"
                        }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#0f766e] hover:bg-[#0d9488] border border-[#0f766e]/40 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Generating…" : "Generate"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-2 mb-4">
                  <span className="text-xs font-medium text-white/50 self-center mr-1">Tone</span>
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTone(t.value)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${tone === t.value
                        ? "bg-[#0f766e]/20 text-teal-300 border-[#0f766e]/40"
                        : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border-white/10"
                        }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1">Subject</label>
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:border-[#0f766e]/50 focus:outline-none focus:ring-1 focus:ring-[#0f766e]/30"
                      placeholder="Subject line"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1">Body</label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={12}
                      className="w-full px-4 py-2.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:border-[#0f766e]/50 focus:outline-none focus:ring-1 focus:ring-[#0f766e]/30 resize-y overflow-y-auto scrollbar-hide"
                      placeholder="Email body"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    Copy
                  </button>
                  <a
                    href={mailto}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    Open in client
                  </a>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={regenerating}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50"
                  >
                    {regenerating ? "Regenerating…" : "Regenerate"}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-white bg-[#0f766e] hover:bg-[#0d9488] border border-[#0f766e]/40 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
