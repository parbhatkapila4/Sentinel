"use client";

import Link from "next/link";
import { createDeal } from "@/app/actions/deals";
import { getTeamMembers } from "@/app/actions/teams";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect, useRef } from "react";
import { COUNTRIES } from "@/lib/countries";
import { STAGE_FORM_OPTIONS, STAGES } from "@/lib/config";
import { toast } from "sonner";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics-client";

const stageIconClass = "w-5 h-5 shrink-0 text-white/70";

function StageIcon({ stageValue }: { stageValue: string }) {
  switch (stageValue) {
    case STAGES.DISCOVER:
      return (
        <svg className={stageIconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      );
    case STAGES.QUALIFY:
      return (
        <svg className={stageIconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case STAGES.PROPOSAL:
      return (
        <svg className={stageIconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    case STAGES.NEGOTIATION:
      return (
        <svg className={stageIconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-2.186a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
      );
    case STAGES.CLOSED_WON:
      return (
        <svg className={stageIconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285zm0 0A11.959 11.959 0 0120.401 6 11.99 11.99 0 0021 9.749c0 5.592-3.824 10.29-9 11.623-5.176 1.332-9-6.03-9-11.622 0-1.31.21-2.571.598-3.751h.152c3.196 0 6.1 1.248 8.25 3.285z" />
        </svg>
      );
    case STAGES.CLOSED_LOST:
      return (
        <svg className={stageIconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      );
    default:
      return (
        <svg className={stageIconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      );
  }
}

type TeamItem = { id: string; name: string; slug: string; memberCount: number; myRole: string };
type MemberItem = { id: string; userId: string; role: string; user: { id: string; name: string | null; surname: string | null; email: string } };

export default function NewDealPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dealName, setDealName] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [assignedToId, setAssignedToId] = useState<string>("");
  const [locationOpen, setLocationOpen] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  const selectedStageData = STAGE_FORM_OPTIONS.find((s) => s.value === selectedStage);

  useEffect(() => {
    if (!locationOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [locationOpen]);

  useEffect(() => {
    fetch("/api/teams/me")
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        const payload = json?.data ?? json;
        setTeams((payload?.teams ?? []) as TeamItem[]);
      })
      .catch(() => setTeams([]));
  }, []);

  useEffect(() => {
    if (!selectedTeamId) {
      queueMicrotask(() => {
        setMembers([]);
        setAssignedToId("");
      });
      return;
    }
    queueMicrotask(() => setAssignedToId(""));
    getTeamMembers(selectedTeamId)
      .then(setMembers as (m: MemberItem[]) => void)
      .catch(() => setMembers([]));
  }, [selectedTeamId]);

  const formatCurrency = (value: string) => {
    const num = parseInt(value.replace(/,/g, ""), 10);
    if (isNaN(num)) return "";
    return num.toLocaleString("en-US");
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    if (raw === "" || /^\d+$/.test(raw)) {
      setDealValue(raw);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!dealName.trim()) {
      setError("Please enter a deal name");
      return;
    }
    if (!selectedStage) {
      setError("Please select a stage");
      return;
    }
    if (!dealValue || parseInt(dealValue) <= 0) {
      setError("Please enter a valid deal value");
      return;
    }

    const formData = new FormData();
    formData.append("name", dealName.trim());
    formData.append("stage", selectedStage);
    formData.append("value", dealValue);
    if (location) formData.append("location", location);
    if (selectedTeamId) formData.append("teamId", selectedTeamId);
    if (assignedToId) formData.append("assignedToId", assignedToId);

    startTransition(async () => {
      try {
        await createDeal(formData);
        trackEvent(ANALYTICS_EVENTS.DEAL_CREATED);
        router.push("/dashboard");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to create deal. Please try again.";
        setError(msg);
        toast.error(msg);
      }
    });
  }

  return (
    <div className="fixed inset-0 bg-[#000000] overflow-y-auto">
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#000000]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 shrink-0 w-fit">
            <img src="/Sentinel New logo.png" alt="Sentinel" className="h-9 w-auto" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white bg-white/[0.04] border border-white/[0.08] hover:border-white/12 transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </Link>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-3 space-y-8">
            <div>
              <p className="text-xs font-medium text-white/50 mb-2">New deal</p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
                Create deal
              </h1>
              <p className="text-white/50 text-sm mt-1.5">
                Add a deal to your pipeline to track value and risk.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
              <div className="space-y-2">
                <label htmlFor="deal-name" className="block text-xs font-medium text-white/50">
                  Deal name
                </label>
                <input
                  id="deal-name"
                  type="text"
                  value={dealName}
                  onChange={(e) => setDealName(e.target.value)}
                  placeholder="e.g., Acme Corp – Enterprise License"
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30 transition-colors text-base"
                  aria-describedby={error ? "deal-error" : undefined}
                />
              </div>

              <div className="space-y-3" role="group" aria-labelledby="stage-label">
                <p id="stage-label" className="text-xs font-medium text-white/50">
                  Stage
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {STAGE_FORM_OPTIONS.map((stage) => (
                    <button
                      key={stage.value}
                      type="button"
                      onClick={() => setSelectedStage(stage.value)}
                      aria-pressed={selectedStage === stage.value}
                      className={`relative p-4 rounded-lg border text-left transition-colors ${selectedStage === stage.value
                        ? "bg-[#0f766e]/10 border-[#0f766e]/30"
                        : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1]"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <StageIcon stageValue={stage.value} />
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${selectedStage === stage.value ? "text-white" : "text-white/80"}`}>
                            {stage.label}
                          </p>
                          <p className="text-xs text-white/45 mt-0.5 truncate">{stage.description}</p>
                        </div>
                      </div>
                      {selectedStage === stage.value && (
                        <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#0f766e] flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="deal-value" className="block text-xs font-medium text-white/50">
                  Deal value
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-medium text-base" aria-hidden="true">
                    $
                  </span>
                  <input
                    id="deal-value"
                    type="text"
                    inputMode="numeric"
                    value={formatCurrency(dealValue)}
                    onChange={handleValueChange}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30 transition-colors text-xl font-semibold tabular-nums"
                  />
                  {dealValue && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-xs">USD</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label id="deal-location-label" className="block text-xs font-medium text-white/50">
                  Location <span className="text-white/40 font-normal">(optional)</span>
                </label>
                <div className="relative" ref={locationRef}>
                  <button
                    type="button"
                    id="deal-location"
                    aria-haspopup="listbox"
                    aria-expanded={locationOpen}
                    aria-labelledby="deal-location-label"
                    aria-label="Location (optional)"
                    onClick={() => setLocationOpen((o) => !o)}
                    className="w-full flex items-center justify-between gap-2 pl-4 pr-10 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-left text-white focus:outline-none focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30 transition-colors text-base"
                  >
                    <span className={location ? "text-white" : "text-white/40"}>{location || "Select a country…"}</span>
                    <svg className={`absolute right-4 top-1/2 w-4 h-4 -translate-y-1/2 text-white/50 shrink-0 transition-transform ${locationOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {locationOpen && (
                    <div
                      role="listbox"
                      aria-labelledby="deal-location-label"
                      className="absolute top-full left-0 right-0 mt-1 max-h-[280px] overflow-y-auto rounded-lg border border-white/[0.08] bg-[#0a0a0a] py-1 shadow-xl z-50 scrollbar-hide"
                    >
                      <button
                        type="button"
                        role="option"
                        aria-selected={!location}
                        onClick={() => { setLocation(""); setLocationOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-sm text-white/50 hover:bg-white/[0.06] hover:text-white transition-colors"
                      >
                        Select a country…
                      </button>
                      {COUNTRIES.map((country) => (
                        <button
                          key={country}
                          type="button"
                          role="option"
                          aria-selected={location === country}
                          onClick={() => { setLocation(country); setLocationOpen(false); }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${location === country ? "bg-[#0f766e]/15 text-teal-300" : "text-white hover:bg-white/[0.06]"}`}
                        >
                          {country}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {teams.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-white/50">
                    Team <span className="text-white/40 font-normal">(optional)</span>
                  </label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30 transition-colors text-base"
                  >
                    <option value="" className="bg-[#0a0a0a]">Personal</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#0a0a0a]">{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedTeamId && members.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-white/50">
                    Assign to <span className="text-white/40 font-normal">(optional)</span>
                  </label>
                  <select
                    value={assignedToId}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-[#0f766e]/50 focus:ring-1 focus:ring-[#0f766e]/30 transition-colors text-base"
                  >
                    <option value="" className="bg-[#0a0a0a]">-</option>
                    {members.map((m) => {
                      const display = [m.user.name, m.user.surname].filter(Boolean).join(" ") || m.user.email;
                      return <option key={m.id} value={m.userId} className="bg-[#0a0a0a]">{display}</option>;
                    })}
                  </select>
                </div>
              )}

              {error && (
                <div id="deal-error" role="alert" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-700/10 border border-red-700/20">
                  <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-white bg-[#0f766e] hover:bg-[#0d9488] border border-[#0f766e]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  {isPending ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Creating…</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Create deal</span>
                    </>
                  )}
                </button>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.1] transition-colors min-h-[44px]"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 space-y-6">
              <p className="text-xs font-medium text-white/50 mb-3">Preview</p>
              <div className="relative rounded-xl p-5 border border-white/[0.08] bg-[#080808] card-elevated">
                {selectedStageData && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#0f766e]/50 rounded-t-xl" aria-hidden />
                )}
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center">
                      {selectedStage ? <StageIcon stageValue={selectedStage} /> : <span className="text-white/40 text-sm">-</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-white truncate [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
                        {dealName || "Deal name"}
                      </h3>
                      <p className="text-white/50 text-sm mt-0.5">
                        {selectedStageData?.label ?? "Select a stage"}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-xs font-medium text-white/50 mb-1">Deal value</p>
                    <p className="text-2xl font-bold text-white tabular-nums">
                      ${dealValue ? parseInt(dealValue).toLocaleString("en-US") : "0"}
                    </p>
                  </div>

                  {selectedStage && (
                    <div>
                      <p className="text-xs font-medium text-white/50 mb-2">Pipeline stage</p>
                      <div className="flex gap-1">
                        {STAGE_FORM_OPTIONS.slice(0, 4).map((stage, index) => {
                          const currentIndex = STAGE_FORM_OPTIONS.findIndex((s) => s.value === selectedStage);
                          const isActive = index <= currentIndex;
                          const isCurrent = stage.value === selectedStage;
                          return (
                            <div key={stage.value} className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/10">
                              <div
                                className={`h-full rounded-full transition-colors ${isActive ? (isCurrent ? "bg-[#0f766e]" : "bg-white/25") : "bg-transparent"}`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-4 border-t border-white/[0.06]">
                    <span className="text-xs text-white/45" suppressHydrationWarning>
                      {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-white/45">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600" aria-hidden />
                      Low risk
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-4 bg-white/[0.03] border border-white/[0.06] border-l-2 border-l-[#0f766e]/50">
                <p className="text-xs font-medium text-white/50 mb-1">Note</p>
                <p className="text-sm text-white/55 leading-relaxed">
                  After creating the deal, add events on the deal page to track engagement and update risk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
