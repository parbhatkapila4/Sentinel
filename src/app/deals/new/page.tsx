"use client";

import Link from "next/link";
import { createDeal } from "@/app/actions/deals";
import { getTeamMembers } from "@/app/actions/teams";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { COUNTRIES } from "@/lib/countries";
import { STAGE_FORM_OPTIONS } from "@/lib/config";
import { toast } from "sonner";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics-client";

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

  const selectedStageData = STAGE_FORM_OPTIONS.find((s) => s.value === selectedStage);

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
    <div className="fixed inset-0 bg-[#030303] overflow-y-auto">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-30%] right-[-20%] w-[800px] h-[800px] rounded-full animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 50%)",
            filter: "blur(100px)",
          }}
        />
        <div
          className="absolute bottom-[-30%] left-[-20%] w-[700px] h-[700px] rounded-full animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(139,26,26,0.06) 0%, transparent 50%)",
            filter: "blur(80px)",
            animationDelay: "1s",
          }}
        />
        <div
          className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 50%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(3, 3, 3, 0.7)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(255,255,255,0.05)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="transition-transform group-hover:scale-105">
              <svg
                className="w-10 h-10"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="36" height="36" rx="10" fill="#10B981" />
                <path
                  d="M18 8V28"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M22 12C22 12 20.5 10 18 10C15.5 10 13 11.5 13 14C13 16.5 15 17 18 18C21 19 23 19.5 23 22C23 24.5 20.5 26 18 26C15.5 26 14 24 14 24"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight hidden sm:block">
              Sentinel
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
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
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-3 space-y-6">
            <div className="mb-6 lg:mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-xs font-medium text-blue-400">
                  New Deal
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-3">
                Create a New Deal
              </h1>
              <p className="text-white/40 text-base sm:text-lg">
                Track your pipeline and never miss an opportunity
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
              <div className="space-y-3">
                <label htmlFor="deal-name" className="flex items-center gap-2 text-sm font-medium text-white/70">
                  <svg
                    className="w-4 h-4 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Deal Name
                </label>
                <input
                  id="deal-name"
                  type="text"
                  value={dealName}
                  onChange={(e) => setDealName(e.target.value)}
                  placeholder="e.g., Acme Corp - Enterprise License"
                  className="w-full px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/25 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all text-base"
                  aria-describedby={error ? "deal-error" : undefined}
                />
              </div>

              <div className="space-y-4" role="group" aria-labelledby="stage-label">
                <div id="stage-label" className="flex items-center gap-2 text-sm font-medium text-white/70">
                  <svg
                    className="w-4 h-4 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Select Stage
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4">
                  {STAGE_FORM_OPTIONS.map((stage) => (
                    <button
                      key={stage.value}
                      type="button"
                      onClick={() => setSelectedStage(stage.value)}
                      aria-pressed={selectedStage === stage.value}
                      className={`relative group p-4 rounded-2xl border transition-all duration-300 text-left ${selectedStage === stage.value
                        ? `${stage.bgColor} ${stage.borderColor} border-2`
                        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{stage.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium text-sm ${selectedStage === stage.value
                              ? "text-white"
                              : "text-white/70 group-hover:text-white"
                              }`}
                          >
                            {stage.label}
                          </p>
                          <p className="text-[11px] text-white/40 mt-0.5 truncate">
                            {stage.description}
                          </p>
                        </div>
                      </div>
                      {selectedStage === stage.value && (
                        <div className="absolute top-2 right-2">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="deal-value" className="flex items-center gap-2 text-sm font-medium text-white/70">
                  <svg
                    className="w-4 h-4 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Deal Value
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-400 font-semibold text-lg" aria-hidden="true">
                    $
                  </span>
                  <input
                    id="deal-value"
                    type="text"
                    inputMode="numeric"
                    value={formatCurrency(dealValue)}
                    onChange={handleValueChange}
                    placeholder="0"
                    className="w-full pl-10 pr-5 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/25 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all text-2xl font-semibold tracking-tight"
                  />
                  {dealValue && (
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 text-sm">
                      USD
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="deal-location" className="flex items-center gap-2 text-sm font-medium text-white/70">
                  <svg
                    className="w-4 h-4 text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Location (Optional)
                </label>
                <div className="relative">
                  <select
                    id="deal-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-5 pr-14 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all text-base appearance-none"
                    aria-label="Location (optional)"
                  >
                    <option value="" className="bg-[#030303]">
                      Select a country...
                    </option>
                    {COUNTRIES.map((country) => (
                      <option
                        key={country}
                        value={country}
                        className="bg-[#030303]"
                      >
                        {country}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-5 top-1/2 w-5 h-5 -translate-y-1/2 pointer-events-none text-white/70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {teams.length > 0 && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-white/70">
                    <svg
                      className="w-4 h-4 text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Team (Optional)
                  </label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:border-red-500/50 focus:bg-white/[0.05] transition-all text-base"
                  >
                    <option value="" className="bg-[#030303]">Personal</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#030303]">
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedTeamId && members.length > 0 && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-white/70">
                    Assign to (Optional)
                  </label>
                  <select
                    value={assignedToId}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:border-red-500/50 focus:bg-white/[0.05] transition-all text-base"
                  >
                    <option value="" className="bg-[#030303]">—</option>
                    {members.map((m) => {
                      const display = [m.user.name, m.user.surname].filter(Boolean).join(" ") || m.user.email;
                      return (
                        <option key={m.id} value={m.userId} className="bg-[#030303]">
                          {display}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {error && (
                <div id="deal-error" role="alert" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <svg
                    className="w-5 h-5 text-red-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-base font-semibold transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed group min-h-[44px]"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #8b1a1a 100%)",
                    boxShadow:
                      "0 8px 32px rgba(139, 26, 26, 0.25), 0 0 0 1px rgba(255,255,255,0.1) inset",
                  }}
                >
                  {isPending ? (
                    <>
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
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 transition-transform group-hover:rotate-90"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>Create Deal</span>
                    </>
                  )}
                </button>
                <Link
                  href="/dashboard"
                  className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 sm:py-4 rounded-2xl text-base font-medium text-white/50 hover:text-white hover:bg-white/[0.05] transition-all border border-white/[0.06] hover:border-white/[0.12] min-h-[44px]"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 space-y-6">
              <p className="text-sm font-medium text-white/40 mb-4 flex items-center gap-2">
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Live Preview
              </p>
              <div
                className="rounded-3xl p-6 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {selectedStageData && (
                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${selectedStageData.color}`}
                  />
                )}

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${selectedStageData
                        ? selectedStageData.bgColor
                        : "bg-white/5"
                        }`}
                    >
                      {selectedStageData?.icon || "📋"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-white truncate">
                        {dealName || "Deal Name"}
                      </h3>
                      <p className="text-white/40 text-sm mt-1">
                        {selectedStageData?.label || "Select a stage"}
                      </p>
                    </div>
                  </div>

                  <div
                    className="p-5 rounded-2xl"
                    style={{ background: "rgba(16, 185, 129, 0.08)" }}
                  >
                    <p className="text-emerald-400/60 text-xs font-medium uppercase tracking-wider mb-1">
                      Deal Value
                    </p>
                    <p className="text-3xl font-bold text-white">
                      ${dealValue ? parseInt(dealValue).toLocaleString("en-US") : "0"}
                    </p>
                  </div>

                  {selectedStage && (
                    <div>
                      <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">
                        Pipeline Stage
                      </p>
                      <div className="flex items-center gap-1">
                        {STAGE_FORM_OPTIONS.slice(0, 4).map((stage, index) => {
                          const currentIndex = STAGE_FORM_OPTIONS.findIndex(
                            (s) => s.value === selectedStage
                          );
                          const isActive = index <= currentIndex;
                          const isCurrent = stage.value === selectedStage;
                          return (
                            <div key={stage.value} className="flex-1">
                              <div
                                className={`h-2 rounded-full transition-all ${isActive
                                  ? isCurrent
                                    ? `bg-gradient-to-r ${selectedStageData?.color}`
                                    : "bg-white/30"
                                  : "bg-white/10"
                                  }`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 text-white/30 text-sm">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        {new Date().toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/30 text-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Low Risk</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-amber-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm font-medium">Pro Tip</p>
                    <p className="text-white/40 text-xs mt-1">
                      After creating the deal, add timeline events to track
                      engagement and automatically assess risk levels.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
