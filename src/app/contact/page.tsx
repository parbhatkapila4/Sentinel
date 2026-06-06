"use client";

import Link from "next/link";
import { useState } from "react";

function BackLink() {
  return (
    <div className="border-b border-white/10 sticky top-0 z-50 bg-black/80 backdrop-blur">
      <div className="px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to home
        </Link>
        <a
          href="mailto:help@sentinels.in"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          help@sentinels.in →
        </a>
      </div>
    </div>
  );
}

const reasons = [
  "Reporting a bug or something broken",
  "Requesting a specific integration",
  "Questions about pricing, Enterprise terms, or a BAA",
  "Responsible disclosure of a security issue",
  "Feedback on a feature, or a feature you wish existed",
];

const channels = [
  {
    kicker: "Email",
    label: "help@sentinels.in",
    href: "mailto:help@sentinels.in",
    note: "Primary channel. Replies come from a human within one business day.",
    external: true,
  },
  {
    kicker: "Twitter / X",
    label: "@Parbhat03",
    href: "https://x.com/Parbhat03",
    note: "Quick questions, shipping updates, occasional thinking-out-loud about the product.",
    external: true,
  },
  {
    kicker: "LinkedIn",
    label: "parbhat-kapila",
    href: "https://www.linkedin.com/in/parbhat-kapila/",
    note: "Work-mode conversations - procurement, partnerships, hiring notes.",
    external: true,
  },
  {
    kicker: "GitHub",
    label: "parbhatkapila4/Sentinel",
    href: "https://github.com/parbhatkapila4/Sentinel",
    note: "Issues, commit history, and the changelog's source of truth.",
    external: true,
  },
] as const;

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("General");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "opening">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    const missing: string[] = [];
    if (!trimmedName) missing.push("name");
    if (!trimmedEmail) missing.push("reply-to email");
    if (!trimmedMessage) missing.push("message");

    if (missing.length > 0) {
      setError(
        `Please fill in: ${missing.join(", ")}. The form opens your mail app — empty fields would send an empty draft.`,
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("That reply-to email looks off. Double-check it before sending.");
      return;
    }

    setError(null);

    const subject = `[Sentinel · ${topic}] from ${trimmedName}`;
    const body = [
      trimmedMessage,
      "",
      "---",
      `From:  ${trimmedName}`,
      `Reply: ${trimmedEmail}`,
      `Topic: ${topic}`,
    ].join("\n");

    const mailto = `mailto:help@sentinels.in?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    setStatus("opening");
    window.location.href = mailto;
    window.setTimeout(() => setStatus("idle"), 2500);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <BackLink />

      <section className="px-6 lg:px-8 pt-20 pb-12">
        <div className="max-w-[1700px] mx-auto">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4">
            Contact
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-5 max-w-3xl leading-[1.05]">
            Say hello, report a bug, or ask the hard questions.
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
            Sentinel is built by one engineer. Every message lands directly in
            his inbox and gets a reply from a person, not a ticketing system.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-white/50">
            <span>Average reply time: within 1 business day</span>
            <span className="text-white/20">·</span>
            <span>No sales funnel, no drip sequence</span>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-8 pb-20">
        <div className="max-w-[1700px] mx-auto border-t border-white/10 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-x-14 gap-y-12">
            <div>
              <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6">
                Send a message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-[11px] font-mono uppercase tracking-[0.18em] text-white/50 mb-2"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      autoComplete="name"
                      className="w-full bg-transparent border-b border-white/15 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[11px] font-mono uppercase tracking-[0.18em] text-white/50 mb-2"
                    >
                      Reply-to email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      autoComplete="email"
                      className="w-full bg-transparent border-b border-white/15 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="topic"
                    className="block text-[11px] font-mono uppercase tracking-[0.18em] text-white/50 mb-2"
                  >
                    Topic
                  </label>
                  <select
                    id="topic"
                    name="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-transparent border-b border-white/15 py-2.5 text-white focus:outline-none focus:border-white transition-colors appearance-none cursor-pointer"
                  >
                    <option className="bg-black" value="General">
                      General question
                    </option>
                    <option className="bg-black" value="Bug">
                      Bug / something broken
                    </option>
                    <option className="bg-black" value="Integration">
                      Integration request
                    </option>
                    <option className="bg-black" value="Pricing">
                      Pricing / Enterprise
                    </option>
                    <option className="bg-black" value="Security">
                      Security / disclosure
                    </option>
                    <option className="bg-black" value="Feedback">
                      Feedback
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-[11px] font-mono uppercase tracking-[0.18em] text-white/50 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={7}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell me what's going on. Specific examples help a lot."
                    required
                    className="w-full bg-transparent border-b border-white/15 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors resize-none"
                  />
                </div>

                {error ? (
                  <div
                    role="alert"
                    className="text-xs leading-relaxed border border-red-500/30 bg-red-500/5 text-red-200/90 px-3 py-2 rounded-sm"
                  >
                    {error}
                  </div>
                ) : null}

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={status === "opening"}
                    className="inline-flex items-center justify-center gap-2 bg-white text-black px-5 py-2.5 rounded-md text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-60"
                  >
                    {status === "opening"
                      ? "Opening your mail app…"
                      : "Send via your mail app"}
                  </button>
                  <p className="text-xs text-white/45 leading-relaxed max-w-sm">
                    Submitting opens your default mail client pre-filled. No
                    form data is stored here - the message goes straight to{" "}
                    <a
                      href="mailto:help@sentinels.in"
                      className="text-white/70 underline underline-offset-2 hover:text-white"
                    >
                      help@sentinels.in
                    </a>
                    . If your mail app doesn&apos;t open, copy that address
                    and email directly.
                  </p>
                </div>
              </form>
            </div>

            <div>
              <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6">
                Other channels
              </h2>

              <div className="border-t border-white/10">
                {channels.map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    target={c.external ? "_blank" : undefined}
                    rel={c.external ? "noopener noreferrer" : undefined}
                    className="group block border-b border-white/10 py-5 transition-colors hover:bg-white/2"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45 mb-1">
                          {c.kicker}
                        </div>
                        <div className="text-white font-medium tracking-tight group-hover:underline underline-offset-4 decoration-white/40 truncate">
                          {c.label}
                        </div>
                      </div>
                      <span
                        aria-hidden
                        className="text-white/40 transition-transform group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </div>
                    <p className="text-sm text-white/55 leading-relaxed mt-2 max-w-md">
                      {c.note}
                    </p>
                  </a>
                ))}
              </div>

              <div className="mt-10">
                <h2 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-5">
                  What to include
                </h2>
                <ul className="space-y-3">
                  {reasons.map((r) => (
                    <li
                      key={r}
                      className="flex gap-3 text-[15px] text-white/70 leading-relaxed"
                    >
                      <span
                        aria-hidden
                        className="mt-[10px] h-[5px] w-[5px] flex-none rounded-full bg-white/50"
                      />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-white/45 leading-relaxed mt-6 max-w-md">
                  For bugs: a screenshot, the URL you were on, and roughly
                  when it happened cuts triage time in half.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
