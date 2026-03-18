"use client";

import Link from "next/link";

export function DashboardGettingStarted({
  show,
  crmConnected,
  crmEverSynced,
  demoMode,
}: {
  show: boolean;
  crmConnected: boolean;
  crmEverSynced: boolean;
  demoMode: boolean;
}) {
  if (!show) return null;

  const step1 = crmConnected;
  const step2 = crmEverSynced;

  return (
    <section
      className="rounded-xl border border-[#0f766e]/30 bg-[#0f766e]/5 p-5 sm:p-6 card-elevated"
      aria-label="Getting started"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#0f766e] mb-2">
            Getting started
          </p>
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Connect your CRM → sync → ask AI
          </h2>
          <p className="text-sm text-white/55 mt-2 max-w-xl">
            {demoMode
              ? "You’re viewing demo deals. Connect HubSpot or Salesforce to pull your real pipeline, then use AI Insights on live data."
              : "Finish setup to get risk scores and AI answers on your real pipeline."}
          </p>
        </div>
        <Link
          href="/settings?tab=integrations"
          className="shrink-0 inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-[#0f766e] hover:bg-[#0d9488] border border-[#0f766e]/40 transition-colors"
        >
          Open integrations
        </Link>
      </div>
      <ol className="mt-6 grid gap-3 sm:grid-cols-3">
        <li
          className={`rounded-lg border p-4 ${
            step1
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "border-white/10 bg-white/[0.02]"
          }`}
        >
          <span className="text-xs font-medium text-white/40">Step 1</span>
          <p className="text-sm font-medium text-white mt-1">Connect CRM</p>
          <p className="text-xs text-white/45 mt-1">
            HubSpot or Salesforce under Settings → Integrations
          </p>
          {step1 ? (
            <span className="text-xs text-emerald-400 mt-2 inline-block">Done</span>
          ) : (
            <Link
              href="/settings?tab=integrations"
              className="text-xs text-[#0f766e] mt-2 inline-block hover:underline"
            >
              Connect →
            </Link>
          )}
        </li>
        <li
          className={`rounded-lg border p-4 ${
            step2
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "border-white/10 bg-white/[0.02]"
          }`}
        >
          <span className="text-xs font-medium text-white/40">Step 2</span>
          <p className="text-sm font-medium text-white mt-1">Sync deals</p>
          <p className="text-xs text-white/45 mt-1">
            Use Sync on the integration card after connecting
          </p>
          {step2 ? (
            <span className="text-xs text-emerald-400 mt-2 inline-block">Done</span>
          ) : (
            <Link
              href="/settings?tab=integrations"
              className="text-xs text-[#0f766e] mt-2 inline-block hover:underline"
            >
              Sync →
            </Link>
          )}
        </li>
        <li className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <span className="text-xs font-medium text-white/40">Step 3</span>
          <p className="text-sm font-medium text-white mt-1">AI insights</p>
          <p className="text-xs text-white/45 mt-1">
            Ask about pipeline, risk, and follow-ups
          </p>
          <Link
            href="/insights"
            className="text-xs text-[#0f766e] mt-2 inline-block hover:underline"
          >
            Open AI →
          </Link>
        </li>
      </ol>
    </section>
  );
}
