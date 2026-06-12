"use client";

import type { ReactNode } from "react";
import type {
  AllIntegrationStatuses,
  IntegrationLogEntry,
} from "@/app/actions/integrations";
import { formatRelativeTime } from "@/lib/utils";
import { EditorialButton, SectionHeader } from "../primitives";
import type {
  ConnectModalKind,
  ManageModalKind,
} from "../dialogs/IntegrationDialogs";

interface IntegrationsSectionProps {
  statuses: AllIntegrationStatuses | null;
  loading: boolean;
  connectedCount: number;
  logs: IntegrationLogEntry[];
  onConnect: (kind: NonNullable<ConnectModalKind>) => void;
  onManage: (kind: NonNullable<ManageModalKind>) => void;
}

export function IntegrationsSection({
  statuses,
  loading,
  connectedCount,
  logs,
  onConnect,
  onManage,
}: IntegrationsSectionProps) {
  return (
    <section
      id="settings-integrations"
      style={{ marginBottom: 48, scrollMarginTop: 64 }}
    >
      <SectionHeader
        eyebrow="§ 04 - INTEGRATIONS"
        headline={
          <>
            Where your{" "}
            <i style={{ fontStyle: "italic", color: "var(--signal)" }}>data</i>{" "}
            lives.
          </>
        }
        deck="Connect your CRM, calls, email, and chat so Sentinel can read the signal underneath your pipeline."
        rightLabel="CONNECTED"
        rightValue={`${connectedCount} OF 6`}
      />

      {loading ? (
        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--cream-3)",
            padding: "24px 0",
          }}
        >
          LOADING INTEGRATIONS…
        </div>
      ) : (
        <div>
          <IntegrationRow
            brand="salesforce"
            name="Salesforce"
            sub="CRM · SYNC DEALS & CONTACTS"
            connected={statuses?.salesforce?.connected ?? false}
            lastSyncAt={statuses?.salesforce?.lastSyncAt}
            onConnect={() => onConnect("salesforce")}
            onManage={() => onManage("salesforce")}
            icon={
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            }
          />
          <IntegrationRow
            brand="hubspot"
            name="HubSpot"
            sub="CRM · FULL INTEGRATION"
            connected={statuses?.hubspot?.connected ?? false}
            lastSyncAt={statuses?.hubspot?.lastSyncAt}
            onConnect={() => onConnect("hubspot")}
            onManage={() => onManage("hubspot")}
            icon={
              <>
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8M12 8v8" />
              </>
            }
          />
          <IntegrationRow
            brand="gmail"
            name="Gmail"
            sub="EMAIL · OAUTH READ-ONLY SYNC"
            connected={statuses?.gmail?.connected ?? false}
            lastSyncAt={statuses?.gmail?.lastSyncAt}
            onConnect={() => onConnect("gmail")}
            onManage={() => onManage("gmail")}
            icon={
              <>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M4 7l8 6 8-6" />
              </>
            }
          />
          <IntegrationRow
            brand="slack"
            name="Slack"
            sub="NOTIFICATIONS · CHANNELS & DMS"
            connected={statuses?.slack?.connected ?? false}
            onConnect={() => onConnect("slack")}
            onManage={() => onManage("slack")}
            icon={
              <path d="M14.5 10h2a2.5 2.5 0 010 5h-2zM9.5 14H7.5a2.5 2.5 0 010-5h2zM10 14.5v2a2.5 2.5 0 005 0v-2zM14 9.5v-2a2.5 2.5 0 00-5 0v2z" />
            }
          />
          <IntegrationRow
            brand="google"
            name="Google Calendar"
            sub="MEETINGS · SYNC UPCOMING EVENTS"
            connected={statuses?.googleCalendar?.connected ?? false}
            lastSyncAt={statuses?.googleCalendar?.lastSyncAt}
            onConnect={() => onConnect("google_calendar")}
            onManage={() => onManage("googleCalendar")}
            icon={
              <>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </>
            }
            last
          />
        </div>
      )}

      <div
        style={{
          marginTop: 36,
          paddingTop: 24,
          borderTop: "1px solid var(--rule)",
        }}
      >
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
          § 04.02 - RECENT ACTIVITY
        </div>
        {logs.length === 0 ? (
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
              No integration activity yet. The wire is quiet.
            </div>
          </div>
        ) : (
          <div
            style={{
              border: "1px solid var(--rule)",
              background: "var(--ink-02)",
            }}
          >
            {logs.map((log, idx) => (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 18px",
                  borderBottom:
                    idx === logs.length - 1 ? "none" : "1px solid var(--rule)",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 6,
                    height: 6,
                    background:
                      log.status === "success"
                        ? "var(--ivy)"
                        : log.status === "failed"
                          ? "var(--wine)"
                          : "var(--cream-3)",
                    borderRadius: "50%",
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--cream-2)",
                    minWidth: 100,
                  }}
                >
                  {log.integration.replace("_", " ")}
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: "var(--cream)",
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {log.message || log.action.replace("_", " ")}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--cream-3)",
                  }}
                >
                  {formatRelativeTime(log.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function IntegrationRow({
  brand,
  name,
  sub,
  connected,
  lastSyncAt,
  onConnect,
  onManage,
  icon,
  last,
}: {
  brand: "salesforce" | "hubspot" | "slack" | "google" | "gmail";
  name: string;
  sub: string;
  connected: boolean;
  lastSyncAt?: Date | string | null;
  onConnect: () => void;
  onManage: () => void;
  icon: ReactNode;
  last?: boolean;
}) {
  const brandColor = {
    salesforce: "#00A1E0",
    hubspot: "var(--signal)",
    slack: "var(--copper)",
    google: "var(--ivy)",
    gmail: "var(--wine)",
  }[brand];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "44px minmax(0, 1fr) auto",
        gap: 16,
        alignItems: "center",
        padding: "18px 0",
        borderBottom: last ? "none" : "1px solid var(--rule)",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          border: "1px solid var(--rule-strong)",
          background: "var(--ink-02)",
          display: "grid",
          placeItems: "center",
          color: brandColor,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width={20}
          height={20}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icon}
        </svg>
      </div>
      <div
        style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}
      >
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 18,
            color: "var(--cream)",
            letterSpacing: "-0.015em",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {name}
          {connected && (
            <span
              aria-hidden
              className="sentinel-ivy-ping"
              style={{
                width: 6,
                height: 6,
                background: "var(--ivy)",
                borderRadius: "50%",
              }}
            />
          )}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10.5,
            color: "var(--cream-3)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {connected
            ? lastSyncAt
              ? `CONNECTED · SYNCED ${formatRelativeTime(lastSyncAt) ?? "-"}`
              : "CONNECTED"
            : sub}
        </div>
      </div>
      {connected ? (
        <div style={{ display: "flex", gap: 8 }}>
          <span
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "7px 10px",
              border: "1px solid var(--ivy)",
              color: "var(--ivy)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 5,
                height: 5,
                background: "var(--ivy)",
                borderRadius: "50%",
              }}
            />
            CONNECTED
          </span>
          <EditorialButton type="button" onClick={onManage}>
            Manage
          </EditorialButton>
        </div>
      ) : (
        <EditorialButton type="button" variant="primary" onClick={onConnect}>
          Connect
        </EditorialButton>
      )}
    </div>
  );
}
