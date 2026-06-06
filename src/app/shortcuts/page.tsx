import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shortcuts · Sentinel",
  description:
    "Every keyboard shortcut in Sentinel, verified against the source. No aspirational bindings - only keys that actually do something today.",
};

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
        <Link
          href="/docs"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Docs →
        </Link>
      </div>
    </div>
  );
}

type Shortcut = {
  keys: string[];
  action: string;
  note?: string;
};

type Group = {
  id: string;
  kicker: string;
  title: string;
  intro?: string;
  items: Shortcut[];
};

const groups: Group[] = [
  {
    id: "global",
    kicker: "01",
    title: "Global",
    intro:
      "These work anywhere in the app. Nothing fires while you’re typing in an input or textarea.",
    items: [
      {
        keys: ["⌘", "K"],
        action: "Open the command palette",
        note: "Control + K on Windows and Linux. The same palette is available from the search box in the masthead.",
      },
      {
        keys: ["Esc"],
        action: "Close the active dialog, drawer, or dropdown",
        note: "Works on the AI Rail, the command palette, search results, confirmations, and the settings panels.",
      },
    ],
  },
  {
    id: "navigate",
    kicker: "02",
    title: "Navigate",
    intro:
      "Press g, release, then press the destination key within one second. Vim-style. Nothing happens if the second key isn’t recognized.",
    items: [
      { keys: ["G", "D"], action: "Go to Dashboard" },
      { keys: ["G", "L"], action: "Go to Deals (list)" },
      { keys: ["G", "I"], action: "Go to Insights" },
      { keys: ["G", "R"], action: "Go to Reports" },
      { keys: ["G", "S"], action: "Go to Settings" },
      { keys: ["G", "N"], action: "Go to Notifications" },
    ],
  },
  {
    id: "create",
    kicker: "03",
    title: "Create",
    items: [
      {
        keys: ["N"],
        action: "Start a new deal",
        note: "Opens /deals/new. Disabled while an input or textarea is focused.",
      },
      {
        keys: ["⌘", "N"],
        action: "New thread in the AI workspace",
        note: "Only active inside the AI Desk. Control + N on Windows and Linux.",
      },
    ],
  },
  {
    id: "chat",
    kicker: "04",
    title: "Chat & AI",
    intro:
      "The AI workspace (/dashboard · Ask) has its own editing bindings inside the composer.",
    items: [
      {
        keys: ["Enter"],
        action: "Send the current message",
        note: "Ignored while IME composition is active, so Asian-language input still works.",
      },
      {
        keys: ["Shift", "Enter"],
        action: "Insert a newline without sending",
      },
    ],
  },
];

function KeyCap({ label }: { label: string }) {
  return (
    <kbd
      className="inline-grid place-items-center font-mono text-[11px] uppercase tracking-[0.08em] text-white/85 border border-white/20 bg-white/4 rounded-[4px] min-w-[28px] h-7 px-2"
      style={{
        boxShadow:
          "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 -1px 0 0 rgba(0,0,0,0.4) inset",
      }}
    >
      {label}
    </kbd>
  );
}

function Combo({ keys }: { keys: string[] }) {
  return (
    <span className="inline-flex items-center gap-1.5 flex-wrap">
      {keys.map((k, i) => (
        <span key={`${k}-${i}`} className="inline-flex items-center gap-1.5">
          <KeyCap label={k} />
          {i < keys.length - 1 && (
            <span className="text-white/30 text-xs font-mono">
              {keys[0].toLowerCase() === "g" && i === 0 ? "then" : "+"}
            </span>
          )}
        </span>
      ))}
    </span>
  );
}

function Section({ group }: { group: Group }) {
  return (
    <section id={group.id} className="px-6 lg:px-8 pb-16">
      <div className="max-w-[1700px] mx-auto">
        <div className="grid grid-cols-[96px_1fr] gap-8 items-start">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35 pt-1">
              {group.kicker}
            </div>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-3 leading-tight">
              {group.title}
            </h2>
            {group.intro && (
              <p className="text-white/60 leading-relaxed max-w-2xl mb-7 text-[15px]">
                {group.intro}
              </p>
            )}
            <ul className="divide-y divide-white/5 border-y border-white/5">
              {group.items.map((s, i) => (
                <li
                  key={i}
                  className="py-5 grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-3 sm:gap-6 items-start"
                >
                  <div>
                    <Combo keys={s.keys} />
                  </div>
                  <div>
                    <div className="text-white text-[15px] leading-snug">
                      {s.action}
                    </div>
                    {s.note && (
                      <p className="text-white/50 text-sm leading-relaxed mt-1.5 max-w-xl">
                        {s.note}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ShortcutsPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <BackLink />

      <section className="px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-[1700px] mx-auto">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-4">
            Shortcuts
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-5 max-w-3xl leading-[1.05]">
            Every key binding, verified.
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
            This page is generated by hand from the actual keyboard handlers in
            the Sentinel source. If a shortcut isn&apos;t listed here, it
            doesn&apos;t exist yet - not even as a stretch goal.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-white/50">
            <span>macOS uses ⌘ · Windows and Linux use Ctrl</span>
            <span className="text-white/20">·</span>
            <span>Disabled while an input or textarea is focused</span>
          </div>
        </div>
      </section>

      {groups.map((g) => (
        <Section key={g.id} group={g} />
      ))}

      <section className="px-6 lg:px-8 pb-24">
        <div className="max-w-[1700px] mx-auto border-t border-white/10 pt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-white/60 text-sm max-w-md">
            Want a shortcut that isn&apos;t here yet? File it through Contact
            and it shows up in the changelog when it ships.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border border-white/15 text-white px-4 py-2 rounded-md text-sm hover:border-white/30 transition-colors w-fit"
          >
            Request a shortcut →
          </Link>
        </div>
      </section>
    </div>
  );
}
