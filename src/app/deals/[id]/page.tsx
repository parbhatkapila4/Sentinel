import Link from "next/link";
import { getDealById, getAllDeals } from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";
import { formatDistanceToNow } from "date-fns";
import { notFound, redirect } from "next/navigation";
import { UnauthorizedError } from "@/lib/errors";
import { AddEventButtons } from "./add-event-buttons";
import { EmailGenerator } from "@/components/email-generator";
import { DealSummaryCard } from "@/components/deal-summary-card";
import { DealPredictions } from "@/components/deal-predictions";
import { StageSelector } from "@/components/stage-selector";
import { DealMeetings } from "@/components/deal-meetings";
import { DeleteDealButton } from "@/components/delete-deal-button";

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let deal;
  try {
    deal = await getDealById(id);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect("/sign-in?redirect=" + encodeURIComponent("/deals/" + id));
    }
    notFound();
  }

  const riskLevel = formatRiskLevel(deal.riskScore);
  let allDeals: Awaited<ReturnType<typeof getAllDeals>> = [];
  try {
    allDeals = await getAllDeals();
  } catch {

  }
  const dealInAll = allDeals.some((d) => d.id === deal.id);
  const dealsForPredictions = dealInAll ? allDeals : [deal, ...allDeals];

  return (
    <div className="fixed inset-0 bg-[#030303] overflow-y-auto">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 60%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(3, 3, 3, 0.8)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <img
                src="/Sentinel New logo.png"
                alt="Sentinel"
                className="h-9 w-auto"
              />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
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
            {!deal.isDemo && (
              <DeleteDealButton
                dealId={deal.id}
                dealName={deal.name}
                variant="button"
                redirectTo="/dashboard"
              />
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
                {deal.name}
              </h1>
              {deal.source && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${deal.source === "salesforce"
                    ? "bg-blue-500/20 text-blue-400"
                    : deal.source === "hubspot"
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-white/10 text-white/60"
                    }`}
                >
                  {deal.source === "salesforce" && "☁️ Synced from Salesforce"}
                  {deal.source === "hubspot" && "🔶 Synced from HubSpot"}
                  {deal.source !== "salesforce" && deal.source !== "hubspot" && `📥 ${deal.source}`}
                </span>
              )}
            </div>
            <span
              className={`inline-flex px-3 py-1.5 rounded-xl text-sm font-medium ${riskLevel === "High"
                ? "bg-red-500/15 text-red-400 border border-red-500/20"
                : riskLevel === "Medium"
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                  : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                }`}
            >
              {riskLevel} Risk
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">
                Stage
              </p>
              <StageSelector dealId={deal.id} currentStage={deal.stage} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">
                Value
              </p>
              <p className="text-lg font-semibold text-white">
                ${deal.value.toLocaleString("en-US")}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">
                Status
              </p>
              <p className="text-lg font-semibold text-white">{deal.status ? deal.status.charAt(0).toUpperCase() + deal.status.slice(1).replace(/_/g, " ") : "—"}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">
                Last Activity
              </p>
              <p className="text-lg font-semibold text-white">
                {formatDistanceToNow(new Date(deal.lastActivityAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-white/40"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="36" height="36" rx="8" fill="#10B981" />
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
              Risk & Action
            </h2>

            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                  Risk Score
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-white">
                    {(deal.riskScore * 100).toFixed(0)}%
                  </span>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${riskLevel === "High"
                      ? "bg-red-500/15 text-red-400"
                      : riskLevel === "Medium"
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-emerald-500/15 text-emerald-400"
                      }`}
                  >
                    {riskLevel}
                  </span>
                </div>

                <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${riskLevel === "High"
                      ? "bg-gradient-to-r from-red-500 to-red-400"
                      : riskLevel === "Medium"
                        ? "bg-gradient-to-r from-amber-500 to-amber-400"
                        : "bg-gradient-to-r from-emerald-500 to-emerald-400"
                      }`}
                    style={{ width: `${deal.riskScore * 100}%` }}
                  />
                </div>
              </div>

              {deal.primaryRiskReason && (
                <div>
                  <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                    Primary Risk Reason
                  </p>
                  <p className="text-sm text-white/80">
                    {deal.primaryRiskReason}
                  </p>
                </div>
              )}

              {deal.recommendedAction && (
                <div>
                  <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                    Recommended Action
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">
                      {deal.recommendedAction.label}
                    </p>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${deal.recommendedAction.urgency === "high"
                        ? "bg-red-500/15 text-red-400"
                        : deal.recommendedAction.urgency === "medium"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-white/5 text-white/50"
                        }`}
                    >
                      {deal.recommendedAction.urgency}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {deal.nextAction && deal.nextActionReason ? (
            <div
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(145deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.02) 100%)",
                border: "1px solid rgba(59,130,246,0.2)",
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                    />
                  </svg>
                  Next Action Required
                </h2>
                <div
                  className="rounded-xl p-4 mb-3"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <p className="text-base font-semibold text-white mb-1">
                    {deal.nextAction === "send_follow_up_email"
                      ? "Send Follow-up Email"
                      : deal.nextAction === "schedule_meeting"
                        ? "Schedule Meeting"
                        : deal.nextAction === "escalate"
                          ? "Escalate"
                          : "Wait"}
                  </p>
                  <p className="text-sm text-white/60">
                    {deal.nextActionReason}
                  </p>
                </div>
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  <span>Take Action</span>
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
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div
              className="space-y-4 rounded-2xl p-4 sm:p-6"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-white/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Status
              </h2>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    No immediate action needed
                  </p>
                  <p className="text-xs text-white/50">
                    Deal is progressing normally
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 lg:mt-8 mb-6">
          <DealPredictions deal={deal} allDeals={dealsForPredictions} />
        </div>

        <div className="mb-6">
          <DealSummaryCard dealId={deal.id} />
        </div>

        <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <svg
                className="w-5 h-5 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
              Events
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 flex-wrap">
              <EmailGenerator
                dealId={deal.id}
                dealName={deal.name}
                dealValue={deal.value}
                dealStage={deal.stage}
              />
              <AddEventButtons dealId={deal.id} />
            </div>
          </div>

          {deal.events.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-white/30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
              </div>
              <p className="text-white/40 text-sm">No events recorded yet</p>
              <p className="text-white/25 text-xs mt-1">
                Add events using the buttons above
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {deal.events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-4 rounded-xl transition-colors hover:bg-white/[0.02]"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    {event.type.includes("email") ? (
                      <svg
                        className="w-5 h-5 text-blue-400"
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
                    ) : (
                      <svg
                        className="w-5 h-5 text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white capitalize">
                      {event.type.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm text-white/40 mt-0.5">
                      {formatDistanceToNow(new Date(event.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                    {Object.keys(event.payload as Record<string, unknown>)
                      .length > 0 && (
                        <pre className="mt-2 text-xs text-white/30 bg-white/5 rounded-lg p-2 overflow-auto">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="rounded-2xl p-6"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-white/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Timeline
          </h2>

          {deal.timeline && deal.timeline.length > 0 ? (
            <div className="relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-blue-500/50 via-white/10 to-transparent" />

              <div className="space-y-4">
                {deal.timeline.map((entry, index) => (
                  <div key={entry.id} className="flex gap-4 relative">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 ${index === 0 ? "bg-blue-500/20" : "bg-white/5"
                        }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${index === 0 ? "bg-blue-400" : "bg-white/30"
                          }`}
                      />
                    </div>

                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-white">
                        {entry.eventType === "risk_evaluated"
                          ? `Risk evaluated: ${((entry.metadata as Record<string, unknown>)
                            ?.score as number) * 100
                          }%`
                          : entry.eventType === "event_created"
                            ? `Event recorded: ${((entry.metadata as Record<string, unknown>)
                              ?.eventType as string) || ""
                            }`
                            : entry.eventType === "stage_changed"
                              ? `Stage changed to ${((entry.metadata as Record<string, unknown>)
                                ?.stage as string) || ""
                              }`
                              : entry.eventType === "email_drafted"
                                ? `Follow-up email drafted${((entry.metadata as Record<string, unknown>)?.subject as string) ? `: "${String((entry.metadata as Record<string, unknown>)?.subject).slice(0, 40)}..."` : ""}`
                                : entry.eventType}
                      </p>
                      <p className="text-xs text-white/40 mt-1">
                        {entry.createdAt
                          ? formatDistanceToNow(new Date(entry.createdAt), {
                            addSuffix: true,
                          })
                          : "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-white/30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-white/40 text-sm">No timeline entries yet</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <DealMeetings dealId={deal.id} dealName={deal.name} />
        </div>
      </main>
    </div>
  );
}
