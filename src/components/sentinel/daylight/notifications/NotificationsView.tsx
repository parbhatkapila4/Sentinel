"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import {
  DividerRow,
  HeroLink,
  PageHero,
  Square,
  captionStyle,
  kpiLabelStyle,
  kpiValueStyle,
  secondaryButtonStyle,
  smallButtonStyle,
  subStyle,
} from "../blocks";
import { TrashIcon } from "../controls";
import { NavIcon } from "../nav";
import {
  CATEGORY_LABEL,
  NOTIFICATIONS_DECK,
  categorize,
  categoryColor,
  displayMessage,
  displayTitle,
  groupRows,
  heroCopy,
  subjectOf,
  timeLabel,
  type NotificationFilter,
  type NotificationRow,
} from "./model";
import { RowsSkeleton } from "./RowsSkeleton";
import { useNotifications, type UseNotificationsOptions } from "./useNotifications";

export type NotificationsViewProps = UseNotificationsOptions;

const tabPillStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  height: 18,
  padding: "0 6px",
  borderRadius: 6,
  background: "var(--dl-signal-tint)",
  color: "var(--dl-signal-d)",
  fontSize: 11.5,
  fontWeight: 600,
  fontVariantNumeric: "tabular-nums",
};

function CountTile({ label, value, caption }: { label: string; value: number; caption: string }) {
  return (
    <div className="dl-kpi">
      <div style={kpiLabelStyle}>{label}</div>
      <div className="dl-kpi-value" style={kpiValueStyle}>
        {value.toLocaleString("en-US")}
      </div>
      <div style={{ ...captionStyle, marginTop: 6 }}>{caption}</div>
    </div>
  );
}

const TABS: Array<{ value: NotificationFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
];

function ViewBar({
  filter,
  unread,
  search,
  shown,
  onFilter,
  onSearch,
}: {
  filter: NotificationFilter;
  unread: number;
  search: string;
  shown: number;
  onFilter: (next: NotificationFilter) => void;
  onSearch: (next: string) => void;
}) {
  return (
    <div className="dl-viewbar">
      <div role="group" aria-label="Show" className="dl-viewbar-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            aria-pressed={filter === tab.value}
            onClick={() => onFilter(tab.value)}
            className="dl-tab"
          >
            <span className="dl-tab-label" data-label={tab.label}>
              <span>{tab.label}</span>
            </span>
            {tab.value === "unread" && unread > 0 && (
              <span style={tabPillStyle}>{unread > 99 ? "99+" : unread}</span>
            )}
          </button>
        ))}
      </div>
      <div className="dl-viewbar-controls">
        <label className="dl-search dl-filter-field dl-nt-search">
          <NavIcon size={15} strokeWidth={2}>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </NavIcon>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search notifications"
            aria-label="Search notifications"
            autoComplete="off"
            spellCheck={false}
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onSearch("")}
              className="dl-kebab dl-tap"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                flexShrink: 0,
                padding: 0,
                border: 0,
                borderRadius: 6,
                background: "transparent",
                color: "var(--dl-muted)",
                cursor: "pointer",
              }}
            >
              <NavIcon size={13} strokeWidth={2}>
                <path d="M6 6l12 12M18 6L6 18" />
              </NavIcon>
            </button>
          )}
        </label>
        <span style={{ ...subStyle, flexShrink: 0, whiteSpace: "nowrap" }}>
          {shown.toLocaleString("en-US")} shown
        </span>
      </div>
    </div>
  );
}

function NotificationItem({
  n,
  now,
  onMarkRead,
  onDelete,
}: {
  n: NotificationRow;
  now: Date;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const title = displayTitle(n.title);
  const subject = subjectOf(n.title);
  const href = n.dealId ? `/deals/${n.dealId}` : null;
  const openRead = () => {
    if (!n.read) onMarkRead(n.id);
  };

  const body = (
    <>
      <span className="dl-nt-title">
        {!n.read && <i className="dl-nt-dot" aria-hidden />}
        <span>{title}</span>
      </span>
      {n.message.trim() && <span className="dl-nt-msg">{displayMessage(n.message)}</span>}
    </>
  );

  return (
    <li className={n.read ? "dl-nt-row" : "dl-nt-row is-unread"}>
      <span className="dl-nt-cat">
        <Square color={categoryColor(n)} />
        {CATEGORY_LABEL[categorize(n.type)]}
      </span>
      {href ? (
        <Link href={href} onClick={openRead} className="dl-nt-main">
          {body}
        </Link>
      ) : (
        <div className="dl-nt-main">{body}</div>
      )}
      <div className="dl-nt-side">
        <span className="dl-nt-when">
          <time dateTime={n.createdAt}>{timeLabel(n.createdAt, now)}</time>
        </span>
        {!n.read && (
          <button type="button" onClick={() => onMarkRead(n.id)} className="dl-btn-text">
            Mark read
          </button>
        )}
        {href && (
          <Link
            href={href}
            onClick={openRead}
            aria-label={subject ? `Open deal: ${subject}` : undefined}
            className="dl-btn-secondary"
            style={{ ...secondaryButtonStyle, ...smallButtonStyle }}
          >
            Open deal
          </Link>
        )}
        <button
          type="button"
          onClick={() => onDelete(n.id)}
          aria-label={`Delete: ${title}`}
          title="Delete"
          className="dl-quiet-btn"
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}

function EmptyList({
  filter,
  search,
  onClearSearch,
  onShowAll,
}: {
  filter: NotificationFilter;
  search: string;
  onClearSearch: () => void;
  onShowAll: () => void;
}) {
  if (search.trim()) {
    return (
      <section className="dl-empty dl-grow" aria-label="Notifications" role="status">
        <h2>
          No <em>matches.</em>
        </h2>
        <p>
          Nothing loaded here mentions &ldquo;{search.trim()}&rdquo;. Try a shorter word or
          clear the search.
        </p>
        <div className="dl-hero-actions">
          <button
            type="button"
            onClick={onClearSearch}
            className="dl-btn-secondary"
            style={secondaryButtonStyle}
          >
            Clear search
          </button>
        </div>
      </section>
    );
  }
  if (filter === "unread") {
    return (
      <section className="dl-empty dl-grow" aria-label="Notifications" role="status">
        <h2>
          Nothing <em>unread.</em>
        </h2>
        <p>Everything here has been read. The full history stays under All.</p>
        <div className="dl-hero-actions">
          <button
            type="button"
            onClick={onShowAll}
            className="dl-btn-secondary"
            style={secondaryButtonStyle}
          >
            Show all
          </button>
        </div>
      </section>
    );
  }
  return (
    <section className="dl-empty dl-grow" aria-label="Notifications" role="status">
      <h2>
        You&apos;re all <em>caught up.</em>
      </h2>
      <p>
        Risk flags, overdue next steps and stage moves show up here as they happen, each
        linked to its deal.
      </p>
    </section>
  );
}

export function NotificationsView(props: NotificationsViewProps) {
  const ws = useNotifications(props);
  const hero = heroCopy(ws.unread, ws.items);
  const groups = groupRows(ws.shown, ws.now);
  const showList = !ws.switching && ws.shown.length > 0;

  return (
    <>
      <PageHero
        chip={hero.chip}
        headline={hero.headline}
        emphasis={hero.emphasis}
        clause={hero.clause}
        deck={NOTIFICATIONS_DECK}
        actions={
          <>
            <button
              type="button"
              onClick={() => void ws.markAllRead()}
              disabled={ws.unread === 0}
              className="dl-btn-secondary"
              style={{
                ...secondaryButtonStyle,
                cursor: ws.unread === 0 ? "not-allowed" : "pointer",
              }}
            >
              Mark all read
            </button>
            <HeroLink href="/settings#settings-notifications" tone="secondary">
              Notification settings
            </HeroLink>
          </>
        }
      />

      <section aria-label="Counts" className="dl-grid">
        <CountTile label="Unread" value={ws.unread} caption="Waiting on you" />
        <CountTile label="Read" value={ws.read} caption="Cleared" />
        <CountTile label="Today" value={ws.today} caption="Since midnight" />
        <CountTile label="Showing" value={ws.shown.length} caption="In this view" />
      </section>

      <ViewBar
        filter={ws.filter}
        unread={ws.unread}
        search={ws.search}
        shown={ws.shown.length}
        onFilter={(next) => void ws.switchFilter(next)}
        onSearch={ws.setSearch}
      />

      {ws.switching ? (
        <section className="dl-grow" aria-label="Notifications" aria-busy="true">
          <RowsSkeleton rows={6} />
        </section>
      ) : showList ? (
        <section className="dl-grow" aria-label="Notifications">
          {groups.map((group) => (
            <div key={group.label}>
              <DividerRow>
                <span>{group.label}</span>
                <span style={{ marginLeft: "auto" }}>{group.items.length}</span>
              </DividerRow>
              <ul aria-label={group.label}>
                {group.items.map((n) => (
                  <NotificationItem
                    key={n.id}
                    n={n}
                    now={ws.now}
                    onMarkRead={(id) => void ws.markRead(id)}
                    onDelete={(id) => void ws.remove(id)}
                  />
                ))}
              </ul>
            </div>
          ))}
          {ws.loadingMore && <RowsSkeleton rows={3} />}
          {ws.hasMore && (
            <div className="dl-more">
              <button
                type="button"
                onClick={() => void ws.loadMore()}
                disabled={ws.loadingMore}
                aria-busy={ws.loadingMore || undefined}
                className="dl-btn-secondary"
                style={secondaryButtonStyle}
              >
                Load more
              </button>
            </div>
          )}
        </section>
      ) : (
        <EmptyList
          filter={ws.filter}
          search={ws.search}
          onClearSearch={() => ws.setSearch("")}
          onShowAll={() => void ws.switchFilter("all")}
        />
      )}
    </>
  );
}
