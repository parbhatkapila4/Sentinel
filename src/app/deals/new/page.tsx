"use client";

import Link from "next/link";
import { createDeal } from "@/app/actions/deals";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { COUNTRIES } from "@/lib/countries";

const stages = [
  {
    value: "Discovery",
    label: "Discovery",
    icon: "🔍",
    color: "from-blue-500 to-cyan-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description: "Initial research & outreach",
  },
  {
    value: "Qualification",
    label: "Qualification",
    icon: "✓",
    color: "from-cyan-500 to-teal-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    description: "Assessing fit & budget",
  },
  {
    value: "Proposal",
    label: "Proposal",
    icon: "📄",
    color: "from-violet-500 to-purple-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    description: "Presenting the solution",
  },
  {
    value: "Negotiation",
    label: "Negotiation",
    icon: "🤝",
    color: "from-amber-500 to-orange-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    description: "Terms & pricing discussion",
  },
  {
    value: "Closed Won",
    label: "Closed Won",
    icon: "🎉",
    color: "from-emerald-500 to-green-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    description: "Deal successfully closed",
  },
  {
    value: "Closed Lost",
    label: "Closed Lost",
    icon: "❌",
    color: "from-red-500 to-rose-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    description: "Deal did not proceed",
  },
];

export default function NewDealPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dealName, setDealName] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  const selectedStageData = stages.find((s) => s.value === selectedStage);

  const formatCurrency = (value: string) => {
    const num = parseInt(value.replace(/,/g, ""), 10);
    if (isNaN(num)) return "";
    return num.toLocaleString();
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
    if (location) {
      formData.append("location", location);
    }

    startTransition(async () => {
      try {
        await createDeal(formData);
        router.push("/dashboard");
      } catch {
        setError("Failed to create deal. Please try again.");
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#030303]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
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
              "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 50%)",
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
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)",
              }}
            >
              <span className="text-white text-sm font-bold">RS</span>
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

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 lg:py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-xs font-medium text-blue-400">
                  New Deal
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-3">
                Create a New Deal
              </h1>
              <p className="text-white/40 text-lg">
                Track your pipeline and never miss an opportunity
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-white/70">
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
                  type="text"
                  value={dealName}
                  onChange={(e) => setDealName(e.target.value)}
                  placeholder="e.g., Acme Corp - Enterprise License"
                  className="w-full px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/25 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all text-base"
                />
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-medium text-white/70">
                  <svg
                    className="w-4 h-4 text-violet-400"
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
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {stages.map((stage) => (
                    <button
                      key={stage.value}
                      type="button"
                      onClick={() => setSelectedStage(stage.value)}
                      className={`relative group p-4 rounded-2xl border transition-all duration-300 text-left ${
                        selectedStage === stage.value
                          ? `${stage.bgColor} ${stage.borderColor} border-2`
                          : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{stage.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium text-sm ${
                              selectedStage === stage.value
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
                <label className="flex items-center gap-2 text-sm font-medium text-white/70">
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
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-400 font-semibold text-lg">
                    $
                  </span>
                  <input
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
                <label className="flex items-center gap-2 text-sm font-medium text-white/70">
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
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all text-base"
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
              </div>

              {error && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
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

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed group"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    boxShadow:
                      "0 8px 32px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(255,255,255,0.1) inset",
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
                  className="px-6 py-4 rounded-2xl text-base font-medium text-white/50 hover:text-white hover:bg-white/[0.05] transition-all border border-white/[0.06] hover:border-white/[0.12]"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-28">
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
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                        selectedStageData
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
                      ${dealValue ? parseInt(dealValue).toLocaleString() : "0"}
                    </p>
                  </div>

                  {selectedStage && (
                    <div>
                      <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">
                        Pipeline Stage
                      </p>
                      <div className="flex items-center gap-1">
                        {stages.slice(0, 4).map((stage, index) => {
                          const currentIndex = stages.findIndex(
                            (s) => s.value === selectedStage
                          );
                          const isActive = index <= currentIndex;
                          const isCurrent = stage.value === selectedStage;
                          return (
                            <div key={stage.value} className="flex-1">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  isActive
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

              <div className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
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
