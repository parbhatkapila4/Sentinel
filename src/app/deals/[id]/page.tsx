import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { formatDistanceToNow } from "date-fns";

import { getAllDeals, getDealById } from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";
import { UnauthorizedError } from "@/lib/errors";

import { SentinelShell } from "@/components/sentinel/shell/SentinelShell";
import { buildShellContextForPage } from "@/components/sentinel/shell/buildContextForPage";

import { AddEventButtons } from "./add-event-buttons";
import { EmailGenerator } from "@/components/email-generator";
import { DealSummaryCard } from "@/components/deal-summary-card";
import { DealPredictions } from "@/components/deal-predictions";
import { StageSelector } from "@/components/stage-selector";
import { DealMeetings } from "@/components/deal-meetings";
import { DeleteDealButton } from "@/components/delete-deal-button";

export const dynamic = "force-dynamic";

const RISK_TONE = {
  High: { color: "var(--wine)", bg: "rgba(119, 47, 47, 0.08)", bar: "var(--wine)" },
  Medium: { color: "var(--copper)", bg: "rgba(198, 143, 78, 0.08)", bar: "var(--copper)" },
  Low: { color: "var(--ivy)", bg: "rgba(116, 125, 79, 0.08)", bar: "var(--ivy)" },
} as const;

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
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
  const riskTone = RISK_TONE[riskLevel];
  let allDeals: Awaited<ReturnType<typeof getAllDeals>> = [];
  try {
    allDeals = await getAllDeals();
  } catch {
  }
  const dealInAll = allDeals.some((d) => d.id === deal.id);
  const dealsForPredictions = dealInAll ? allDeals : [deal, ...allDeals];

  const shellContext = await buildShellContextForPage();

  return (
    <SentinelShell
      syncTime={shellContext.syncTime}
      coveragePercent={shellContext.coveragePercent}
      sourceLabels={shellContext.sourceLabels}
      alertCount={shellContext.alertCount}
      tickerItems={shellContext.tickerItems}
      onboarding={shellContext.onboarding}
    >
      <section
        className="sentinel-deal-hero"
        style={{
          padding: "48px 32px 40px",
          borderBottom: "1px solid var(--rule)",
          display: "grid",
          gridTemplateColumns: "minmax(140px, 160px) minmax(0, 1fr) auto",
          gap: 48,
        }}
      >
        <div
          className="sentinel-deal-hero-section"
          style={{
            borderRight: "1px solid var(--rule)",
            paddingRight: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ fontFamily: "var(--font-mono-jb)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--cream-3)" }}>
            Section -
          </div>
          <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 60, lineHeight: 0.85, color: "var(--cream)", letterSpacing: "-0.04em" }}>
            § DEAL
          </div>
          <div style={{ fontFamily: "var(--font-mono-jb)", fontSize: 11, color: "var(--cream-2)", letterSpacing: "0.06em", lineHeight: 1.6, textTransform: "uppercase" }}>
            <strong style={{ color: "var(--cream)", fontWeight: 500 }}>ENTRY · ON FILE</strong>
            <br />
            VALUE · ${deal.value.toLocaleString("en-US")}
            <br />
            RISK · {riskLevel.toUpperCase()}
          </div>
        </div>

        <div
          className="sentinel-deal-hero-main"
          style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, minWidth: 0 }}
        >
          <Link
            href="/dashboard"
            className="sentinel-link-signal"
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            ← Back to the desk
          </Link>
          <h1
            className="sentinel-deal-hero-title"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 52,
              fontWeight: 400,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              color: "var(--cream)",
              margin: 0,
              wordBreak: "break-word",
            }}
          >
            <em style={{ fontStyle: "italic", color: "var(--signal)", fontFamily: "var(--font-serif)" }}>
              {deal.name}
            </em>
          </h1>
          {deal.source && (
            <span
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                padding: "3px 10px",
                color: "var(--cream-2)",
                border: "1px solid var(--rule-strong)",
                background: "var(--ink-02)",
                alignSelf: "flex-start",
                marginTop: 6,
              }}
            >
              SYNCED FROM {deal.source}
            </span>
          )}
        </div>

        <div
          className="sentinel-deal-hero-side"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "5px 12px",
              color: riskTone.color,
              border: `1px solid ${riskTone.color}`,
              background: riskTone.bg,
            }}
          >
            {riskLevel} RISK
          </span>
          {!deal.isDemo && (
            <DeleteDealButton
              dealId={deal.id}
              dealName={deal.name}
              variant="button"
              redirectTo="/dashboard"
            />
          )}
        </div>
      </section>

      <div
        className="sentinel-deal-meta-strip"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <MetaCell label="Stage">
          <StageSelector dealId={deal.id} currentStage={deal.stage} />
        </MetaCell>
        <MetaCell label="Value">
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 26,
              color: "var(--cream)",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.02em",
            }}
          >
            ${deal.value.toLocaleString("en-US")}
          </span>
        </MetaCell>
        <MetaCell label="Status">
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 20,
              color: "var(--cream)",
              textTransform: "capitalize",
            }}
          >
            {deal.status
              ? deal.status.charAt(0).toUpperCase() +
              deal.status.slice(1).replace(/_/g, " ")
              : "-"}
          </span>
        </MetaCell>
        <MetaCell label="Last activity" last>
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 18,
              color: "var(--cream-2)",
            }}
          >
            {formatDistanceToNow(new Date(deal.lastActivityAt), {
              addSuffix: true,
            })}
          </span>
        </MetaCell>
      </div>

      <section
        className="sentinel-deal-body"
        style={{
          padding: "48px 32px 80px",
          maxWidth: 1400,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 40,
        }}
      >
        <div
          className="sentinel-deal-risk-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
            gap: 32,
          }}
        >
          <section
            style={{
              border: "1px solid var(--rule)",
              background: "var(--ink-02)",
              padding: "28px 26px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginBottom: 20,
                paddingBottom: 14,
                borderBottom: "1px solid var(--rule)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--cream-3)",
                }}
              >
                § - RISK &amp; ACTION
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 26,
                  fontWeight: 400,
                  color: "var(--cream)",
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                Where the{" "}
                <em style={{ fontStyle: "italic", color: "var(--signal)" }}>
                  weight
                </em>{" "}
                sits.
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 10,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--cream-3)",
                    margin: "0 0 8px",
                  }}
                >
                  Risk score
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 44,
                      color: "var(--cream)",
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                    }}
                  >
                    {(deal.riskScore * 100).toFixed(0)}%
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 10.5,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      color: riskTone.color,
                      border: `1px solid ${riskTone.color}`,
                      background: riskTone.bg,
                    }}
                  >
                    {riskLevel}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 14,
                    height: 3,
                    background: "var(--rule)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${deal.riskScore * 100}%`,
                      background: riskTone.bar,
                      transition: "width 420ms ease",
                    }}
                  />
                </div>
              </div>

              {deal.primaryRiskReason && (
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 10,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "var(--cream-3)",
                      margin: "0 0 6px",
                    }}
                  >
                    Primary risk reason
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 16,
                      lineHeight: 1.55,
                      color: "var(--cream-2)",
                      margin: 0,
                    }}
                  >
                    {deal.primaryRiskReason}
                  </p>
                </div>
              )}

              {deal.recommendedAction && (
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 10,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "var(--cream-3)",
                      margin: "0 0 6px",
                    }}
                  >
                    Recommended
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 18,
                        color: "var(--cream)",
                      }}
                    >
                      {deal.recommendedAction.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 10,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        padding: "3px 9px",
                        color:
                          deal.recommendedAction.urgency === "high"
                            ? "var(--wine)"
                            : deal.recommendedAction.urgency === "medium"
                              ? "var(--copper)"
                              : "var(--cream-3)",
                        border: `1px solid ${deal.recommendedAction.urgency === "high"
                            ? "var(--wine)"
                            : deal.recommendedAction.urgency === "medium"
                              ? "var(--copper)"
                              : "var(--rule-strong)"
                          }`,
                      }}
                    >
                      {deal.recommendedAction.urgency}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {deal.nextAction && deal.nextActionReason ? (
            <section
              style={{
                border: "1px solid var(--signal)",
                background: "rgba(200, 71, 46, 0.04)",
                padding: "28px 26px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--signal)",
                  }}
                >
                  § - NEXT ACTION
                </span>
                <h2
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 26,
                    fontWeight: 400,
                    color: "var(--cream)",
                    letterSpacing: "-0.02em",
                    margin: "6px 0 0",
                  }}
                >
                  Do this{" "}
                  <em style={{ fontStyle: "italic", color: "var(--signal)" }}>
                    next
                  </em>
                  .
                </h2>
              </div>
              <div
                style={{
                  border: "1px solid var(--rule)",
                  background: "var(--ink)",
                  padding: "16px 18px",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 18,
                    color: "var(--cream)",
                    margin: "0 0 6px",
                  }}
                >
                  {deal.nextAction === "send_follow_up_email"
                    ? "Send a follow-up email"
                    : deal.nextAction === "schedule_meeting"
                      ? "Schedule a meeting"
                      : deal.nextAction === "escalate"
                        ? "Escalate"
                        : "Wait"}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: "var(--cream-2)",
                    margin: 0,
                  }}
                >
                  {deal.nextActionReason}
                </p>
              </div>
            </section>
          ) : (
            <section
              style={{
                border: "1px solid var(--rule)",
                background: "var(--ink-02)",
                padding: "28px 26px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--cream-3)",
                }}
              >
                § - STATUS
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 26,
                  fontWeight: 400,
                  color: "var(--cream)",
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                <em style={{ fontStyle: "italic", color: "var(--ivy)" }}>
                  On track.
                </em>
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 15,
                  color: "var(--cream-2)",
                  margin: 0,
                }}
              >
                Activity within the expected range. Nothing calls for your hand just now.
              </p>
            </section>
          )}
        </div>

        <DealPredictions deal={deal} allDeals={dealsForPredictions} />

        <DealSummaryCard dealId={deal.id} />

        <section
          style={{
            border: "1px solid var(--rule)",
            background: "var(--ink-02)",
            padding: "28px 26px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 24,
              paddingBottom: 14,
              borderBottom: "1px solid var(--rule)",
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--cream-3)",
                }}
              >
                § - EVENTS
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 26,
                  fontWeight: 400,
                  color: "var(--cream)",
                  letterSpacing: "-0.02em",
                  margin: "6px 0 0",
                }}
              >
                The{" "}
                <em style={{ fontStyle: "italic", color: "var(--signal)" }}>
                  record
                </em>
                .
              </h2>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
            <p
              style={{
                padding: "40px 0",
                textAlign: "center",
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 16,
                color: "var(--cream-3)",
                margin: 0,
              }}
            >
              No events yet. Add one above to begin the record.
            </p>
          ) : (
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                border: "1px solid var(--rule)",
                borderBottom: "none",
              }}
            >
              {deal.events.map((event) => {
                const isEmail = event.type.includes("email");
                const payloadKeys = Object.keys(
                  event.payload as Record<string, unknown>
                );
                return (
                  <li
                    key={event.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      padding: "16px 20px",
                      borderBottom: "1px solid var(--rule)",
                    }}
                  >
                    <div
                      aria-hidden
                      style={{
                        width: 34,
                        height: 34,
                        border: "1px solid var(--rule-strong)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isEmail ? "var(--signal)" : "var(--copper)",
                        background: "var(--ink)",
                        marginTop: 2,
                      }}
                    >
                      {isEmail ? (
                        <svg
                          width={16}
                          height={16}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                          />
                        </svg>
                      ) : (
                        <svg
                          width={16}
                          height={16}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                          />
                        </svg>
                      )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: 16,
                          color: "var(--cream)",
                          textTransform: "capitalize",
                          margin: 0,
                        }}
                      >
                        {event.type.replace(/_/g, " ")}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-mono-jb)",
                          fontSize: 10.5,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--cream-3)",
                          margin: "4px 0 0",
                        }}
                      >
                        {formatDistanceToNow(new Date(event.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                      {payloadKeys.length > 0 && (
                        <pre
                          style={{
                            marginTop: 10,
                            padding: "10px 12px",
                            fontFamily: "var(--font-mono-jb)",
                            fontSize: 11.5,
                            color: "var(--cream-3)",
                            background: "var(--ink)",
                            border: "1px solid var(--rule)",
                            overflow: "auto",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section
          style={{
            border: "1px solid var(--rule)",
            background: "var(--ink-02)",
            padding: "28px 26px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginBottom: 22,
              paddingBottom: 14,
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--cream-3)",
              }}
            >
              § - TIMELINE
            </span>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 26,
                fontWeight: 400,
                color: "var(--cream)",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              The{" "}
              <em style={{ fontStyle: "italic", color: "var(--signal)" }}>
                story
              </em>{" "}
              so far.
            </h2>
          </div>

          {deal.timeline && deal.timeline.length > 0 ? (
            <div style={{ position: "relative" }}>
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: 17,
                  top: 4,
                  bottom: 4,
                  width: 1,
                  background: "var(--rule)",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {deal.timeline.map((entry, index) => {
                  const active = index === 0;
                  const metadata = entry.metadata as Record<string, unknown>;
                  return (
                    <div
                      key={entry.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 16,
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: 35,
                          height: 35,
                          border: `1px solid ${active ? "var(--signal)" : "var(--rule-strong)"}`,
                          background: "var(--ink)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          zIndex: 1,
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            background: active ? "var(--signal)" : "var(--cream-3)",
                            borderRadius: "50%",
                          }}
                        />
                      </div>
                      <div style={{ flex: 1, paddingTop: 4, paddingBottom: 4, minWidth: 0 }}>
                        <p
                          style={{
                            fontFamily: "var(--font-serif)",
                            fontSize: 15,
                            color: "var(--cream)",
                            margin: 0,
                          }}
                        >
                          {entry.eventType === "risk_evaluated"
                            ? `Risk evaluated · ${((metadata?.score as number) * 100).toFixed(0)}%`
                            : entry.eventType === "event_created"
                              ? `Event recorded · ${(metadata?.eventType as string) || ""}`
                              : entry.eventType === "stage_changed"
                                ? `Stage changed to ${(metadata?.stage as string) || ""}`
                                : entry.eventType === "email_drafted"
                                  ? `Follow-up drafted${(metadata?.subject as string)
                                    ? ` · "${String(metadata.subject).slice(0, 40)}…"`
                                    : ""
                                  }`
                                  : entry.eventType}
                        </p>
                        <p
                          style={{
                            fontFamily: "var(--font-mono-jb)",
                            fontSize: 10,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "var(--cream-3)",
                            margin: "3px 0 0",
                          }}
                        >
                          {entry.createdAt
                            ? formatDistanceToNow(new Date(entry.createdAt), {
                              addSuffix: true,
                            })
                            : "-"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p
              style={{
                padding: "24px 0",
                textAlign: "center",
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 15,
                color: "var(--cream-3)",
                margin: 0,
              }}
            >
              No chapters yet.
            </p>
          )}
        </section>

        <DealMeetings dealId={deal.id} dealName={deal.name} />
      </section>
    </SentinelShell>
  );
}

function MetaCell({
  label,
  children,
  last,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className="sentinel-deal-meta-cell"
      style={{
        padding: "22px 24px",
        borderRight: last ? "none" : "1px solid var(--rule)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--cream-3)",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}
