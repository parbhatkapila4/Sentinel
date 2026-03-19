import Link from "next/link";
import Image from "next/image";
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

  const CARD_CLASS = "rounded-xl p-5 sm:p-6 border border-white/[0.08] bg-[#080808] transition-colors hover:border-white/[0.1] card-elevated";

  const riskStyles = {
    High: "bg-red-700/15 text-red-400 border border-red-700/25",
    Medium: "bg-amber-700/15 text-amber-400 border border-amber-700/25",
    Low: "bg-green-700/15 text-green-400 border border-green-700/25",
  };
  const riskBarStyles = {
    High: "bg-linear-to-r from-red-700 to-red-500",
    Medium: "bg-linear-to-r from-amber-700 to-amber-500",
    Low: "bg-linear-to-r from-green-700 to-green-500",
  };

  return (
    <div className="fixed inset-0 bg-[#000000] overflow-y-auto">
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#000000]/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 shrink-0 w-fit">
            <Image
              src="/Sentinel New logo.png"
              alt="Sentinel"
              width={160}
              height={36}
              className="h-9 w-auto"
              priority
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white bg-white/[0.04] border border-white/[0.08] hover:border-white/12 transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </Link>
            {!deal.isDemo && (
              <DeleteDealButton dealId={deal.id} dealName={deal.name} variant="button" redirectTo="/dashboard" />
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        <div className={CARD_CLASS}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-medium text-white/50 mb-1.5">Deal</p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
                {deal.name}
              </h1>
              {deal.source && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium mt-2 border ${deal.source === "salesforce"
                    ? "bg-[#0f766e]/10 text-teal-400 border-[#0f766e]/20"
                    : deal.source === "hubspot"
                      ? "bg-amber-700/10 text-amber-400 border-amber-700/20"
                      : "bg-white/5 text-white/50 border-white/10"
                    }`}
                >
                  {deal.source === "salesforce" && "Synced from Salesforce"}
                  {deal.source === "hubspot" && "Synced from HubSpot"}
                  {deal.source !== "salesforce" && deal.source !== "hubspot" && deal.source}
                </span>
              )}
            </div>
            <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 border ${riskStyles[riskLevel]}`}>
              {riskLevel} risk
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <p className="text-xs font-medium text-white/50 mb-2">Stage</p>
              <StageSelector dealId={deal.id} currentStage={deal.stage} />
            </div>
            <div>
              <p className="text-xs font-medium text-white/50 mb-2">Value</p>
              <p className="text-xl font-bold text-white tabular-nums [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
                ${deal.value.toLocaleString("en-US")}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-white/50 mb-2">Status</p>
              <p className="text-lg font-semibold text-white">{deal.status ? deal.status.charAt(0).toUpperCase() + deal.status.slice(1).replace(/_/g, " ") : "-"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-white/50 mb-2">Last activity</p>
              <p className="text-lg font-semibold text-white/90">
                {formatDistanceToNow(new Date(deal.lastActivityAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7">
          <div className={`lg:col-span-2 ${CARD_CLASS}`}>
            <h2 className="text-base font-semibold text-white mb-6 border-l-2 border-[#0f766e] pl-3 [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
              Risk & action
            </h2>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium text-white/50 mb-2">Risk score</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-white tabular-nums [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
                    {(deal.riskScore * 100).toFixed(0)}%
                  </span>
                  <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium border ${riskStyles[riskLevel]}`}>
                    {riskLevel}
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${riskBarStyles[riskLevel]}`}
                    style={{ width: `${deal.riskScore * 100}%` }}
                  />
                </div>
              </div>

              {deal.primaryRiskReason && (
                <div>
                  <p className="text-xs font-medium text-white/50 mb-2">Primary risk reason</p>
                  <p className="text-sm text-white/85 leading-relaxed">{deal.primaryRiskReason}</p>
                </div>
              )}

              {deal.recommendedAction && (
                <div>
                  <p className="text-xs font-medium text-white/50 mb-2">Recommended action</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-white">{deal.recommendedAction.label}</p>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${deal.recommendedAction.urgency === "high" ? "bg-red-700/15 text-red-400" : deal.recommendedAction.urgency === "medium" ? "bg-amber-700/15 text-amber-400" : "bg-white/5 text-white/50"}`}>
                      {deal.recommendedAction.urgency}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {deal.nextAction && deal.nextActionReason ? (
            <div className={`${CARD_CLASS} border-[#0f766e]/25 bg-[#0f766e]/5`}>
              <h2 className="text-base font-semibold text-white mb-4 border-l-2 border-[#0f766e] pl-3 [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
                Next action
              </h2>
              <div className="rounded-lg p-4 mb-4 bg-white/[0.03] border border-white/[0.06]">
                <p className="text-base font-semibold text-white mb-1">
                  {deal.nextAction === "send_follow_up_email" ? "Send follow-up email" : deal.nextAction === "schedule_meeting" ? "Schedule meeting" : deal.nextAction === "escalate" ? "Escalate" : "Wait"}
                </p>
                <p className="text-sm text-white/55">{deal.nextActionReason}</p>
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#0f766e] hover:bg-[#0d9488] border border-[#0f766e]/40 transition-colors">
                <span>View action</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          ) : (
            <div className={CARD_CLASS}>
              <h2 className="text-base font-semibold text-white mb-4 border-l-2 border-green-700/50 pl-3 [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
                Status
              </h2>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-700/10 border border-green-700/20">
                <div className="w-9 h-9 rounded-lg bg-green-700/20 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">On track</p>
                  <p className="text-xs text-white/50">Activity within expected range</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DealPredictions deal={deal} allDeals={dealsForPredictions} />

        <DealSummaryCard dealId={deal.id} />

        <div className={CARD_CLASS}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-base font-semibold text-white border-l-2 border-white/20 pl-3 [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
              Events
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-wrap">
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
            <div className="text-center py-12">
              <p className="text-white/50 text-sm font-medium">No events yet</p>
              <p className="text-white/40 text-xs mt-1">Add an event with the buttons above</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {deal.events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#0f766e]/15 border border-[#0f766e]/20 flex items-center justify-center shrink-0">
                    {event.type.includes("email") ? (
                      <svg
                        className="w-4 h-4 text-teal-400"
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
                        className="w-4 h-4 text-red-400"
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
                    {Object.keys(event.payload as Record<string, unknown>).length > 0 && (
                      <pre className="mt-2 text-xs text-white/45 bg-white/[0.04] border border-white/[0.06] rounded-lg p-3 overflow-auto font-mono">
                        {JSON.stringify(event.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={CARD_CLASS}>
          <h2 className="text-base font-semibold text-white mb-6 border-l-2 border-white/20 pl-3 [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
            Timeline
          </h2>

          {deal.timeline && deal.timeline.length > 0 ? (
            <div className="relative">
              <div className="absolute left-[17px] top-2 bottom-2 w-px bg-white/10" />

              <div className="space-y-4">
                {deal.timeline.map((entry, index) => (
                  <div key={entry.id} className="flex gap-4 relative">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 z-10 ${index === 0 ? "bg-[#0f766e]/15 border border-[#0f766e]/25" : "bg-white/[0.04] border border-white/[0.06]"}`}>
                      <div className={`w-2.5 h-2.5 rounded-full ${index === 0 ? "bg-[#0f766e]" : "bg-white/30"}`} />
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
                          : "-"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/50 text-sm font-medium">No timeline entries</p>
            </div>
          )}
        </div>

        <DealMeetings dealId={deal.id} dealName={deal.name} />
      </main>
    </div>
  );
}
