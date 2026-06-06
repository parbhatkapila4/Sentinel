"use client";

import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import type { PaymentMethodItem } from "@/lib/payment-methods";
import { EditorialButton, SectionHeader, SerifEm } from "../primitives";

interface BillingSectionProps {
  planTag: string;
  planName: string;
  planPriceDisplay: string;
  isPaidPlan: boolean;
  dealsCount: number | null;
  dealLimit: number;
  teamMembersCount: number;
  teamMemberLimit: number;
  apiCallsDisplay: string;
  paymentMethods: PaymentMethodItem[];
  loadingPaymentMethods: boolean;
  onAddPaymentMethod: () => void;
  onEditPaymentMethod: (pm: PaymentMethodItem) => void;
  onRemovePaymentMethod: (id: string) => void;
  onSetDefaultPaymentMethod: (id: string) => void;
  onCancelSubscription: () => void;
}

export function BillingSection({
  planTag,
  planName,
  planPriceDisplay,
  isPaidPlan,
  dealsCount,
  dealLimit,
  teamMembersCount,
  teamMemberLimit,
  apiCallsDisplay,
  paymentMethods,
  loadingPaymentMethods,
  onAddPaymentMethod,
  onEditPaymentMethod,
  onRemovePaymentMethod,
  onSetDefaultPaymentMethod,
  onCancelSubscription,
}: BillingSectionProps) {
  const router = useRouter();

  return (
    <section
      id="settings-billing"
      style={{ marginBottom: 48, scrollMarginTop: 64 }}
    >
      <SectionHeader
        eyebrow="§ 06 - BILLING & PLAN"
        headline={
          <>
            The{" "}
            <i style={{ fontStyle: "italic", color: "var(--signal)" }}>
              ledger.
            </i>
          </>
        }
        deck="Your current plan, usage meters, and payment methods. Invoices are emailed on the 1st of each month."
        rightLabel="NEXT INVOICE"
        rightValue={isPaidPlan ? planPriceDisplay : "-"}
      />

      <div
        style={{
          background: "var(--ink-02)",
          border: "1px solid var(--rule)",
          padding: "28px 28px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: -1,
            left: 24,
            width: 52,
            height: 2,
            background: "var(--signal)",
          }}
        />
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "40%",
            height: "100%",
            background:
              "radial-gradient(ellipse at 100% 0%, rgba(200, 71, 46, 0.06) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
            position: "relative",
            zIndex: 1,
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--signal)",
                marginBottom: 10,
              }}
            >
              CURRENT PLAN · {planTag} TIER
            </div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 54,
                fontStyle: "italic",
                color: "var(--cream)",
                lineHeight: 0.95,
                letterSpacing: "-0.025em",
              }}
            >
              {planName}.
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--cream-2)",
                marginTop: 6,
                maxWidth: 420,
                lineHeight: 1.5,
              }}
            >
              {planTag === "FREE"
                ? "For solo operators and small books. Enough runway to prove the product before you commit."
                : "Your current plan. Renewed monthly."}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 48,
                color: "var(--cream)",
                lineHeight: 1,
                letterSpacing: "-0.03em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {planPriceDisplay}
            </div>
            {isPaidPlan && planPriceDisplay !== "Contact us" && (
              <div
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  color: "var(--cream-3)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginTop: 4,
                }}
              >
                PER MONTH
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            marginTop: 24,
            border: "1px solid var(--rule)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <PlanMeter
            label="DEALS"
            value={dealsCount ?? "—"}
            total={dealLimit}
            tone="signal"
          />
          <PlanMeter
            label="TEAM MEMBERS"
            value={teamMembersCount}
            total={teamMemberLimit}
            tone="copper"
          />
          <PlanMeter
            label="API CALLS"
            value={"-"}
            total={apiCallsDisplay}
            tone="ivy"
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 22,
            paddingTop: 20,
            borderTop: "1px solid var(--rule)",
            position: "relative",
            zIndex: 1,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10.5,
              color: "var(--cream-3)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {dealLimit > 0
              ? dealsCount === null
                ? "DEAL USAGE UNAVAILABLE"
                : `${Math.max(0, Math.round(100 - (dealsCount / dealLimit) * 100))}% OF DEAL QUOTA REMAINING`
              : "UNLIMITED DEALS"}{" "}
            · RENEWS {isPaidPlan ? "MONTHLY" : "NEVER"}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {isPaidPlan ? (
              <>
                <EditorialButton
                  type="button"
                  onClick={() => router.push("/pricing")}
                >
                  Change plan
                </EditorialButton>
                <EditorialButton type="button" onClick={onCancelSubscription}>
                  Cancel subscription
                </EditorialButton>
              </>
            ) : (
              <EditorialButton
                type="button"
                variant="primary"
                onClick={() => router.push("/pricing")}
              >
                Upgrade to Pro
              </EditorialButton>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          background: "rgba(217, 153, 90, 0.05)",
          borderLeft: "2px solid var(--copper)",
          padding: "14px 18px",
          marginTop: 24,
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
        }}
      >
        <span aria-hidden style={{ color: "var(--copper)", paddingTop: 2 }}>
          <svg
            viewBox="0 0 24 24"
            width={15}
            height={15}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        </span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 13.5,
              color: "var(--cream)",
              fontWeight: 500,
              marginBottom: 3,
              letterSpacing: "-0.005em",
            }}
          >
            Billing runs through PayPal checkout.
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--cream-2)",
              lineHeight: 1.5,
            }}
          >
            Plan upgrades and paid subscriptions are handled through{" "}
            <SerifEm>PayPal</SerifEm>. Payment methods saved here are your
            billing details on file for this account - we don&apos;t charge
            them directly.
          </div>
        </div>
      </div>

      <div style={{ marginTop: 36 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 14,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--cream-3)",
                marginBottom: 6,
              }}
            >
              § 06.01 - PAYMENT METHODS
            </div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 22,
                fontStyle: "italic",
                color: "var(--cream)",
                letterSpacing: "-0.015em",
              }}
            >
              {paymentMethods.length === 0 ? (
                <>
                  Nothing on file,{" "}
                  <span style={{ color: "var(--cream-3)" }}>yet.</span>
                </>
              ) : (
                <>
                  {paymentMethods.length} card
                  {paymentMethods.length === 1 ? "" : "s"} on file.
                </>
              )}
            </div>
          </div>
          <EditorialButton type="button" onClick={onAddPaymentMethod}>
            + Add method
          </EditorialButton>
        </div>

        {loadingPaymentMethods ? (
          <div
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 11,
              color: "var(--cream-3)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "12px 0",
            }}
          >
            LOADING…
          </div>
        ) : paymentMethods.length === 0 ? (
          <div
            style={{
              padding: 24,
              border: "1px dashed var(--rule-strong)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 18,
                color: "var(--cream-2)",
                marginBottom: 14,
              }}
            >
              &ldquo;No payment methods yet.&rdquo;
            </div>
            <button
              type="button"
              onClick={onAddPaymentMethod}
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--signal)",
                cursor: "pointer",
                background: "transparent",
                border: "none",
                padding: 0,
              }}
            >
              + Add new payment method
            </button>
          </div>
        ) : (
          <div>
            {paymentMethods.map((pm, idx) => (
              <div
                key={pm.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px minmax(0, 1fr) auto",
                  gap: 16,
                  alignItems: "center",
                  padding: "16px 0",
                  borderBottom:
                    idx === paymentMethods.length - 1
                      ? "none"
                      : "1px solid var(--rule)",
                }}
              >
                <CardBrandMark brand={pm.brand} />

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14.5,
                      color: "var(--cream)",
                      fontWeight: 500,
                      letterSpacing: "-0.005em",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    •••• •••• •••• {pm.last4}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 10.5,
                      color: "var(--cream-3)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      marginTop: 2,
                    }}
                  >
                    EXPIRES {String(pm.expMonth).padStart(2, "0")}/{pm.expYear}
                    {pm.isDefault && (
                      <>
                        {" · "}
                        <span style={{ color: "var(--signal)" }}>DEFAULT</span>
                      </>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexShrink: 0,
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                  }}
                >
                  {!pm.isDefault && (
                    <EditorialButton
                      type="button"
                      compact
                      onClick={() => onSetDefaultPaymentMethod(pm.id)}
                    >
                      Set default
                    </EditorialButton>
                  )}
                  <EditorialButton
                    type="button"
                    compact
                    onClick={() => onEditPaymentMethod(pm)}
                  >
                    Update
                  </EditorialButton>
                  <EditorialButton
                    type="button"
                    compact
                    variant="danger"
                    onClick={() => onRemovePaymentMethod(pm.id)}
                  >
                    Remove
                  </EditorialButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 36 }}>
        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--cream-3)",
            marginBottom: 14,
          }}
        >
          § 06.02 - INVOICES
        </div>
        <div
          style={{
            padding: 22,
            border: "1px solid var(--rule)",
            background: "var(--ink-02)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 17,
              color: "var(--cream-2)",
            }}
          >
            No invoices yet. Upgrade to Pro and the ledger begins.
          </div>
        </div>
      </div>
    </section>
  );
}

function PlanMeter({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number | string;
  total: number | string;
  tone: "signal" | "copper" | "ivy";
}) {
  const bg =
    tone === "signal"
      ? "var(--signal)"
      : tone === "copper"
        ? "var(--copper)"
        : "var(--ivy)";
  const numValue = typeof value === "number" ? value : 0;
  const numTotal = typeof total === "number" ? total : 0;
  const pct =
    numTotal > 0 ? Math.min(100, Math.max(0, (numValue / numTotal) * 100)) : 0;

  return (
    <div
      style={{
        padding: "18px 20px",
        borderRight: "1px solid var(--rule)",
        minWidth: 0,
      }}
      className="sentinel-plan-meter-cell"
    >
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--cream-3)",
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 30,
          color: "var(--cream)",
          lineHeight: 1,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
          marginBottom: 10,
        }}
      >
        {value}
        <span
          style={{
            fontFamily: "var(--font-geist-sans)",
            fontSize: 14,
            color: "var(--cream-3)",
            marginLeft: 4,
          }}
        >
          / {total}
        </span>
      </div>
      <div
        style={{
          height: 3,
          background: "var(--rule)",
          position: "relative",
        }}
      >
        <span
          aria-hidden
          className="sentinel-bar-fill"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: `${pct}%`,
            background: bg,
          }}
        />
      </div>
    </div>
  );
}

function CardBrandMark({ brand }: { brand: string }) {
  const key = brand.toLowerCase();
  const base: CSSProperties = {
    width: 44,
    height: 28,
    border: "1px solid var(--rule-strong)",
    background: "var(--ink-02)",
    display: "grid",
    placeItems: "center",
    fontFamily: "var(--font-serif)",
    fontSize: 12,
    fontStyle: "italic",
    letterSpacing: "-0.01em",
    color: "var(--cream)",
  };
  if (key.startsWith("visa")) {
    return <div style={base}>Visa</div>;
  }
  if (key.startsWith("amex") || key.includes("express")) {
    return <div style={base}>Amex</div>;
  }
  if (key.startsWith("disc")) {
    return <div style={base}>Disc</div>;
  }
  if (key.startsWith("master")) {
    return (
      <div
        style={{
          ...base,
          display: "flex",
          gap: 0,
          padding: 0,
        }}
        aria-label="Mastercard"
      >
        <svg width="44" height="28" viewBox="0 0 44 28" aria-hidden>
          <circle cx="18" cy="14" r="7" fill="var(--wine)" opacity="0.9" />
          <circle cx="26" cy="14" r="7" fill="var(--copper)" opacity="0.9" />
          <path
            d="M22 8.5a7 7 0 010 11"
            fill="none"
            stroke="var(--ink-02)"
            strokeWidth="1"
          />
        </svg>
      </div>
    );
  }
  return (
    <div
      style={{
        ...base,
        fontFamily: "var(--font-mono-jb)",
        fontSize: 9,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontStyle: "normal",
      }}
    >
      {brand.slice(0, 4).toUpperCase()}
    </div>
  );
}
