"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRealtime } from "@/hooks/use-realtime";
import type { OnboardingState } from "../types";
import { daylightFontClass } from "./fonts";
import { DaylightSetupBar } from "./DaylightSetupBar";
import { DaylightTopBar } from "./DaylightTopBar";
import { announceNotificationsStale } from "./unread-notifications";
import {
  DAYLIGHT_NAV,
  NavIcon,
  SETTINGS_NAV,
  describeSources,
  isNavActive,
  type DaylightNavItem,
} from "./nav";

interface DaylightShellProps {
  title: string;
  dateLabel: string;
  syncTime: string;
  sourceLabels: string[];
  alertCount: number;
  onboarding: OnboardingState;
  pageNav?: React.ReactNode;
  children: React.ReactNode;
}

export function DaylightShell({
  title,
  dateLabel,
  syncTime,
  sourceLabels,
  alertCount,
  onboarding,
  pageNav,
  children,
}: DaylightShellProps) {
  const router = useRouter();

  useRealtime({
    onEvent(ev) {
      if (
        ev.type === "deal.updated" ||
        ev.type === "deal.created" ||
        ev.type === "deal.deleted" ||
        ev.type === "deal.at_risk"
      ) {
        router.refresh();
      }
      if (ev.type === "notification.new") announceNotificationsStale();
    },
  });

  return (
    <div className={`sentinel-daylight ${daylightFontClass}`}>
      <div className="flex min-h-screen flex-col lg:flex-row">
        <DaylightMobileBar alertCount={alertCount} />
        <DaylightSidebar
          alertCount={alertCount}
          status={{ syncTime, sourceLabels }}
          pageNav={pageNav}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <DaylightTopBar title={title} dateLabel={dateLabel} />
          <DaylightSetupBar
            isOnboarding={onboarding.isOnboarding}
            isDemoMode={onboarding.isDemoMode}
            crmConnected={onboarding.crmConnected}
          />
          <main
            id="main-content"
            tabIndex={-1}
            className="dl-main w-full flex-1"
            style={{ outline: "none" }}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function alertLabel(count: number): string {
  return count > 99 ? "99+" : String(count);
}

function SidebarLink({
  item,
  active,
  alertCount,
}: {
  item: DaylightNavItem;
  active: boolean;
  alertCount: number;
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className="dl-nav-link"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        height: 36,
        flexShrink: 0,
        padding: active ? "0 11px" : "0 12px",
        borderRadius: 9,
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        color: active ? "var(--dl-ink)" : "var(--dl-text-2)",
        ...(active
          ? {
            background: "var(--dl-panel)",
            border: "1px solid var(--dl-border)",
            boxShadow: "var(--dl-shadow)",
          }
          : {}),
      }}
    >
      <NavIcon color={active ? "currentColor" : "var(--dl-icon)"}>
        {item.icon}
      </NavIcon>
      {item.label}
      {item.showAlerts && alertCount > 0 && (
        <span
          aria-label={`${alertCount} flagged`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 20,
            height: 20,
            marginLeft: "auto",
            padding: "0 6px",
            borderRadius: 6,
            background: "var(--dl-signal-tint)",
            color: "var(--dl-signal-d)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {alertLabel(alertCount)}
        </span>
      )}
    </Link>
  );
}

export function DaylightSidebar({
  alertCount,
  status,
  pageNav,
}: {
  alertCount: number;
  status: { syncTime: string; sourceLabels: string[] } | null;
  pageNav?: React.ReactNode;
}) {
  const pathname = usePathname();
  const sources = status ? describeSources(status.sourceLabels) : null;
  const dotColor =
    sources?.state === "live"
      ? "var(--dl-green)"
      : sources?.state === "demo"
        ? "var(--dl-amber)"
        : "var(--dl-context)";
  const dotHalo =
    sources?.state === "live"
      ? "0 0 0 3px rgba(79, 154, 94, 0.18)"
      : sources?.state === "demo"
        ? "0 0 0 3px rgba(216, 148, 60, 0.2)"
        : "none";

  return (
    <aside
      aria-label="Primary navigation"
      className="hidden lg:flex"
      style={{
        position: "sticky",
        top: 0,
        flexDirection: "column",
        flexShrink: 0,
        width: 232,
        height: "100vh",
        overflowY: "auto",
        scrollbarWidth: "thin",
        padding: "0 14px 24px",
        borderRight: "1px solid var(--dl-divider)",
      }}
    >
      <Link
        href="/"
        aria-label="Sentinel home"
        style={{
          display: "flex",
          alignItems: "center",
          height: 61,
          flexShrink: 0,
          padding: "0 10px",
          fontFamily: "var(--dl-font-serif)",
          fontStyle: "italic",
          fontSize: 27,
          letterSpacing: "-0.01em",
          color: "var(--dl-ink)",
        }}
      >
        Sentinel<span style={{ color: "var(--dl-signal)" }}>.</span>
      </Link>
      <Link
        href="/deals/new"
        className="dl-btn-primary"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          height: 38,
          flexShrink: 0,
          borderRadius: 10,
          background: "var(--dl-ink)",
          boxShadow:
            "inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 1px 2px rgba(16, 24, 40, 0.25)",
          color: "var(--dl-panel)",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        <NavIcon size={15} strokeWidth={2}>
          <path d="M12 5v14M5 12h14" />
        </NavIcon>
        New deal
      </Link>
      <nav
        aria-label="Sections"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          marginTop: 16,
        }}
      >
        {DAYLIGHT_NAV.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={isNavActive(pathname, item.href)}
            alertCount={alertCount}
          />
        ))}
      </nav>
      <div
        aria-hidden
        style={{
          height: 1,
          flexShrink: 0,
          margin: "12px 12px",
          background: "var(--dl-divider)",
        }}
      />
      <SidebarLink
        item={SETTINGS_NAV}
        active={isNavActive(pathname, SETTINGS_NAV.href)}
        alertCount={0}
      />
      <div
        style={{
          flexShrink: 0,
          marginTop: 16,
          padding: "11px 12px",
          borderRadius: 11,
          border: "1px solid var(--dl-divider)",
        }}
      >
        {sources && status ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span
                aria-hidden
                style={{
                  width: 7,
                  height: 7,
                  flexShrink: 0,
                  borderRadius: "50%",
                  background: dotColor,
                  boxShadow: dotHalo,
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {sources.title}
              </span>
              {sources.state === "live" && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontFamily: "var(--dl-font-mono)",
                    fontSize: 11.5,
                    color: "var(--dl-muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  synced {status.syncTime}
                </span>
              )}
            </div>
            <div
              style={{ marginTop: 5, fontSize: 12.5, color: "var(--dl-muted)" }}
            >
              {sources.detail}
            </div>
          </>
        ) : (
          <div aria-hidden>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                height: 19.5,
              }}
            >
              <span
                className="dl-skel"
                style={{ width: 7, height: 7, borderRadius: "50%" }}
              />
              <span className="dl-skel" style={{ width: 92, height: 9 }} />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: 18.75,
                marginTop: 5,
              }}
            >
              <span className="dl-skel" style={{ width: 148, height: 8 }} />
            </div>
          </div>
        )}
      </div>
      {pageNav}
    </aside>
  );
}

export function DaylightMobileBar({ alertCount }: { alertCount: number }) {
  const pathname = usePathname();
  const items = [...DAYLIGHT_NAV, SETTINGS_NAV];

  return (
    <div
      className="scrollbar-hide flex items-center overflow-x-auto lg:hidden [&>*]:shrink-0"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        gap: 4,
        padding: "8px 12px",
        background: "var(--dl-ground)",
        borderBottom: "1px solid var(--dl-divider)",
      }}
    >
      <Link
        href="/"
        aria-label="Sentinel home"
        style={{
          marginRight: 6,
          padding: "0 6px",
          fontFamily: "var(--dl-font-serif)",
          fontStyle: "italic",
          fontSize: 22,
          lineHeight: "36px",
          color: "var(--dl-ink)",
        }}
      >
        S<span style={{ color: "var(--dl-signal)" }}>.</span>
      </Link>
      <Link
        href="/deals/new"
        aria-label="New deal"
        title="New deal"
        className="dl-btn-primary"
        style={{
          display: "grid",
          placeItems: "center",
          width: 36,
          height: 36,
          marginRight: 4,
          borderRadius: 10,
          background: "var(--dl-ink)",
          color: "var(--dl-panel)",
        }}
      >
        <NavIcon size={15} strokeWidth={2}>
          <path d="M12 5v14M5 12h14" />
        </NavIcon>
      </Link>
      {items.map((item) => {
        const active = isNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            title={item.label}
            className="dl-nav-link"
            style={{
              position: "relative",
              display: "grid",
              placeItems: "center",
              width: 36,
              height: 36,
              borderRadius: 9,
              color: active ? "var(--dl-ink)" : "var(--dl-icon)",
              ...(active
                ? {
                  background: "var(--dl-panel)",
                  border: "1px solid var(--dl-border)",
                  boxShadow: "var(--dl-shadow)",
                }
                : {}),
            }}
          >
            <NavIcon>{item.icon}</NavIcon>
            {item.showAlerts && alertCount > 0 && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--dl-signal)",
                  border: "1.5px solid var(--dl-ground)",
                }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
