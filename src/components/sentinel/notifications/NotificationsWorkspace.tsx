"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { CategoryIcon, CATEGORY_STYLE } from "./category-style";
import {
  categorize,
  formatWhen,
  groupByRelativeDate,
} from "./notifications-utils";
import type { NotificationRow } from "./types";

export type { NotificationCategory, NotificationRow } from "./types";

interface NotificationsWorkspaceProps {
  initialItems: NotificationRow[];
  initialUnread: number;
  initialHasMore: boolean;
  totalCount: number;
  todayCount: number;
  pageSize: number;
  nowISO: string;
}

type Filter = "all" | "unread";

export function NotificationsWorkspace({
  initialItems,
  initialUnread,
  initialHasMore,
  totalCount,
  todayCount,
  pageSize,
  nowISO,
}: NotificationsWorkspaceProps) {
  const [items, setItems] = useState<NotificationRow[]>(initialItems);
  const [unread, setUnread] = useState(initialUnread);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [, startTransition] = useTransition();

  const now = useMemo(() => new Date(nowISO), [nowISO]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = items;
    if (filter === "unread") list = list.filter((n) => !n.read);
    if (q) {
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, filter, search]);

  const groups = useMemo(() => groupByRelativeDate(filtered, now), [filtered, now]);

  const fetchPage = useCallback(
    async (skip: number, append: boolean, nextFilter: Filter = filter) => {
      const res = await fetch(
        `/api/notifications?limit=${pageSize}&skip=${skip}&unreadOnly=${nextFilter === "unread"
        }`
      );
      if (!res.ok) return;
      const json = await res.json();
      const data = (json.data ?? json) as {
        notifications: NotificationRow[];
        unreadCount: number;
      };
      const list = (data.notifications ?? []).map((n) => ({
        ...n,
        createdAt:
          typeof n.createdAt === "string"
            ? n.createdAt
            : new Date(n.createdAt).toISOString(),
      }));
      if (append) setItems((prev) => [...prev, ...list]);
      else setItems(list);
      setUnread(data.unreadCount ?? 0);
      setHasMore(list.length === pageSize);
    },
    [filter, pageSize]
  );

  const switchFilter = useCallback(
    async (f: Filter) => {
      if (f === filter) return;
      setFilter(f);
      setSwitching(true);
      try {
        await fetchPage(0, false, f);
      } catch (err) {
        console.error(err);
        toast.error("Couldn't refresh notifications");
      } finally {
        setSwitching(false);
      }
    },
    [filter, fetchPage]
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      await fetchPage(items.length, true, filter);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't load more");
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, items.length, loadingMore, filter]);

  const markRead = useCallback(
    async (id: string) => {
      const target = items.find((n) => n.id === id);
      if (!target || target.read) return;
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnread((u) => Math.max(0, u - 1));
      try {
        await fetch(`/api/notifications/${id}/read`, { method: "POST" });
        startTransition(() => { });
      } catch (err) {
        console.error(err);
      }
    },
    [items]
  );

  const markAllRead = useCallback(async () => {
    if (unread === 0) return;
    const prev = items;
    setItems((cur) => cur.map((n) => ({ ...n, read: true })));
    setUnread(0);
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      toast.success("Everything marked read");
      startTransition(() => { });
    } catch (err) {
      console.error(err);
      setItems(prev);
      toast.error("Couldn't mark all read");
    }
  }, [items, unread]);

  const deleteOne = useCallback(
    async (id: string) => {
      const target = items.find((n) => n.id === id);
      if (!target) return;
      const prev = items;
      setItems((cur) => cur.filter((n) => n.id !== id));
      if (!target.read) setUnread((u) => Math.max(0, u - 1));
      try {
        await fetch(`/api/notifications/${id}`, { method: "DELETE" });
        startTransition(() => { });
      } catch (err) {
        console.error(err);
        setItems(prev);
        toast.error("Couldn't remove that");
      }
    },
    [items]
  );

  const hasAny = items.length > 0;
  const isEmpty = !switching && filtered.length === 0;

  return (
    <div
      style={{
        padding: "44px 56px 80px",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      <Hero
        totalCount={totalCount}
        unread={unread}
        todayCount={todayCount}
        nowISO={nowISO}
      />

      <div style={{ height: 32 }} />

      <ControlsBar
        filter={filter}
        onFilter={switchFilter}
        search={search}
        onSearch={setSearch}
        unread={unread}
        onMarkAllRead={markAllRead}
        totalShown={filtered.length}
      />

      <div style={{ height: 28 }} />

      <KPIBand
        totalCount={totalCount}
        unread={unread}
        todayCount={todayCount}
        shown={filtered.length}
      />

      <div style={{ height: 40 }} />

      <SectionHead
        eyebrow="§ III"
        title="The dispatch"
        italic="log."
        meta={
          filter === "unread"
            ? `${filtered.length} ${filtered.length === 1 ? "UNREAD" : "UNREAD"}`
            : `${filtered.length} ${filtered.length === 1 ? "ITEM" : "ITEMS"}`
        }
      />

      {switching ? (
        <ListLoading />
      ) : isEmpty ? (
        <EmptyState hasAny={hasAny} filter={filter} />
      ) : (
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            borderTop: "1px solid var(--rule-strong)",
          }}
        >
          {groups.map((g) => (
            <li key={g.label} style={{ listStyle: "none" }}>
              <GroupHeader label={g.label} count={g.items.length} />
              <ul
                style={{ margin: 0, padding: 0, listStyle: "none" }}
                aria-label={`Notifications from ${g.label.toLowerCase()}`}
              >
                {g.items.map((n) => (
                  <Row
                    key={n.id}
                    n={n}
                    onMarkRead={markRead}
                    onDelete={deleteOne}
                  />
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      {!switching && hasMore && filtered.length > 0 && (
        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="sentinel-notif-more"
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--cream-2)",
              background: "var(--ink-02)",
              border: "1px solid var(--rule-strong)",
              padding: "12px 22px",
              cursor: loadingMore ? "wait" : "pointer",
              transition: "color 140ms, border-color 140ms",
              opacity: loadingMore ? 0.6 : 1,
            }}
          >
            {loadingMore ? "Loading…" : "Load more →"}
          </button>
        </div>
      )}
    </div>
  );
}

function Hero({
  totalCount,
  unread,
  todayCount,
  nowISO,
}: {
  totalCount: number;
  unread: number;
  todayCount: number;
  nowISO: string;
}) {
  const headline =
    unread === 0
      ? { word: "clean.", verb: "The book is" }
      : unread === 1
        ? { word: "item.", verb: "One pending" }
        : { word: "items.", verb: `${unread} pending` };

  return (
    <header>
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--copper)",
          marginBottom: 16,
        }}
      >
        § - THE DISPATCH · DAILY LEDGER
      </div>
      <h1
        className="anim-rise"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(44px, 6vw, 68px)",
          fontWeight: 400,
          lineHeight: 0.98,
          letterSpacing: "-0.035em",
          color: "var(--cream)",
          margin: 0,
          maxWidth: 860,
        }}
      >
        {headline.verb}{" "}
        <em
          style={{
            fontStyle: "italic",
            color: "var(--signal)",
            fontFamily: "var(--font-serif)",
          }}
        >
          {headline.word}
        </em>
      </h1>

      <div style={{ height: 14 }} />

      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 18,
          lineHeight: 1.5,
          color: "var(--cream-2)",
          maxWidth: 640,
          letterSpacing: "-0.005em",
          margin: 0,
        }}
      >
        Every deal slip, every stage move, every nudge from the desk -{" "}
        <InlineEntity>catalogued</InlineEntity> and dated. Clear what you can,
        act on what you must.
      </p>

      <div style={{ height: 20 }} />

      <div
        className="tabular"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 18,
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10.5,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--cream-3)",
        }}
      >
        <span>
          <Dot color={unread > 0 ? "var(--signal)" : "var(--ivy)"} />{" "}
          {unread > 0 ? `${unread} UNREAD` : "ALL CAUGHT UP"}
        </span>
        <Separator />
        <span>{totalCount} TOTAL</span>
        <Separator />
        <span>{todayCount} TODAY</span>
        <Separator />
        <span>SYNCED · {format(new Date(nowISO), "HH:mm").toUpperCase()}</span>
      </div>
    </header>
  );
}

function InlineEntity({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        color: "var(--cream)",
        fontStyle: "normal",
        fontFamily: "var(--font-geist-sans)",
        fontSize: 14.5,
        fontWeight: 500,
        padding: "0 4px",
        borderBottom: "1px solid var(--signal)",
        letterSpacing: 0,
      }}
    >
      {children}
    </span>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="anim-ping"
      style={{
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: color,
        color,
        marginRight: 6,
        verticalAlign: "middle",
      }}
    />
  );
}

function Separator() {
  return (
    <span aria-hidden style={{ color: "var(--rule-strong)" }}>
      ·
    </span>
  );
}

function ControlsBar({
  filter,
  onFilter,
  search,
  onSearch,
  unread,
  onMarkAllRead,
  totalShown,
}: {
  filter: Filter;
  onFilter: (f: Filter) => void;
  search: string;
  onSearch: (v: string) => void;
  unread: number;
  onMarkAllRead: () => void;
  totalShown: number;
}) {
  const chip = (active: boolean): React.CSSProperties => ({
    fontFamily: "var(--font-mono-jb)",
    fontSize: 10,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    padding: "7px 14px",
    background: active ? "var(--ink-02)" : "transparent",
    border: `1px solid ${active ? "var(--signal)" : "var(--rule-strong)"}`,
    color: active ? "var(--cream)" : "var(--cream-3)",
    cursor: "pointer",
    transition: "color 120ms ease, border-color 120ms ease, background 120ms ease",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "14px 0",
        borderTop: "1px solid var(--rule)",
        borderBottom: "1px solid var(--rule)",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--cream-3)",
            marginRight: 4,
          }}
        >
          Filter -
        </span>
        <button
          type="button"
          onClick={() => onFilter("all")}
          style={chip(filter === "all")}
          aria-pressed={filter === "all"}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => onFilter("unread")}
          style={chip(filter === "unread")}
          aria-pressed={filter === "unread"}
        >
          Unread{unread > 0 ? ` · ${unread}` : ""}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "var(--ink-02)",
          border: "1px solid var(--rule)",
          padding: "8px 12px",
          flex: "1 1 280px",
          minWidth: 240,
          maxWidth: 420,
        }}
      >
        <svg
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          style={{ color: "var(--cream-3)", flexShrink: 0 }}
          aria-hidden
        >
          <circle cx={11} cy={11} r={8} />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search the ledger…"
          aria-label="Search notifications"
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--cream)",
            fontFamily: "var(--font-geist-sans)",
            fontSize: 12.5,
            flex: 1,
            minWidth: 0,
            letterSpacing: "-0.005em",
          }}
        />
        {search.length > 0 && (
          <button
            type="button"
            onClick={() => onSearch("")}
            aria-label="Clear search"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--cream-3)",
              cursor: "pointer",
              padding: 0,
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        )}
      </div>

      <span style={{ flex: 1 }} />

      <span
        className="tabular"
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--cream-3)",
        }}
      >
        {totalShown} SHOWN
      </span>

      <button
        type="button"
        onClick={onMarkAllRead}
        disabled={unread === 0}
        className="sentinel-notif-mark-all"
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          padding: "8px 14px",
          background: unread === 0 ? "transparent" : "var(--ink-02)",
          border: `1px solid ${unread === 0 ? "var(--rule)" : "var(--signal)"}`,
          color: unread === 0 ? "var(--cream-4)" : "var(--signal)",
          cursor: unread === 0 ? "not-allowed" : "pointer",
          transition: "color 120ms ease, border-color 120ms ease, background 120ms ease",
        }}
      >
        Mark all read →
      </button>
    </div>
  );
}

function KPIBand({
  totalCount,
  unread,
  todayCount,
  shown,
}: {
  totalCount: number;
  unread: number;
  todayCount: number;
  shown: number;
}) {
  const read = Math.max(0, totalCount - unread);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        borderTop: "1px solid var(--rule-strong)",
        borderBottom: "1px solid var(--rule-strong)",
      }}
    >
      <KPI label="Pending" value={unread} meta="UNREAD" tone="signal" />
      <KPI label="Cleared" value={read} meta="READ" divider />
      <KPI label="Today" value={todayCount} meta="FILED" tone="copper" divider />
      <KPI label="In view" value={shown} meta="SHOWN" divider />
    </div>
  );
}

function KPI({
  label,
  value,
  meta,
  tone,
  divider,
}: {
  label: string;
  value: number;
  meta: string;
  tone?: "signal" | "copper" | "ivy";
  divider?: boolean;
}) {
  const color =
    tone === "signal"
      ? "var(--signal)"
      : tone === "copper"
        ? "var(--copper)"
        : tone === "ivy"
          ? "var(--ivy)"
          : "var(--cream)";
  return (
    <div
      style={{
        padding: "22px 26px 24px",
        borderLeft: divider ? "1px solid var(--rule)" : "none",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--cream-3)",
        }}
      >
        {label}
      </div>
      <div
        className="tabular"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 42,
          lineHeight: 1,
          color,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 9.5,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--cream-4)",
        }}
      >
        {meta}
      </div>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  italic,
  meta,
}: {
  eyebrow: string;
  title: string;
  italic: string;
  meta?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 18,
        padding: "14px 0",
        borderTop: "1px solid var(--rule-strong)",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--copper)",
        }}
      >
        {eyebrow}
      </span>
      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 22,
          fontWeight: 400,
          lineHeight: 1,
          color: "var(--cream)",
          letterSpacing: "-0.02em",
          margin: 0,
        }}
      >
        {title}{" "}
        <em
          style={{
            fontStyle: "italic",
            color: "var(--signal)",
            fontFamily: "var(--font-serif)",
          }}
        >
          {italic}
        </em>
      </h2>
      <span style={{ flex: 1 }} />
      {meta && (
        <span
          className="tabular"
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--cream-3)",
          }}
        >
          {meta}
        </span>
      )}
    </div>
  );
}

function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: "18px 4px 8px",
        fontFamily: "var(--font-mono-jb)",
        fontSize: 9.5,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "var(--cream-3)",
      }}
    >
      <span>{label}</span>
      <span style={{ color: "var(--signal)" }}>{count}</span>
    </div>
  );
}

function Row({
  n,
  onMarkRead,
  onDelete,
}: {
  n: NotificationRow;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const category = categorize(n.type);
  const cat = CATEGORY_STYLE[category];
  const when = formatWhen(n.createdAt);
  const href = n.dealId ? `/deals/${n.dealId}` : null;

  const body = (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <div
        className="flex items-baseline"
        style={{
          gap: 10,
          fontFamily: "var(--font-mono-jb)",
          fontSize: 9.5,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: cat.labelColor,
        }}
      >
        <span>{cat.label}</span>
        <span style={{ color: "var(--rule-strong)" }}>·</span>
        <span style={{ color: "var(--cream-4)" }}>{when}</span>
        {!n.read && (
          <>
            <span style={{ color: "var(--rule-strong)" }}>·</span>
            <span style={{ color: "var(--signal)", fontWeight: 500 }}>NEW</span>
          </>
        )}
      </div>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: n.read ? "normal" : "italic",
          fontSize: 19,
          lineHeight: 1.25,
          color: "var(--cream)",
          letterSpacing: "-0.015em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {n.title}
      </div>
      <div
        style={{
          fontFamily: "var(--font-geist-sans)",
          fontSize: 13,
          lineHeight: 1.5,
          color: "var(--cream-2)",
          letterSpacing: "-0.005em",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {n.message}
      </div>
    </div>
  );

  return (
    <li
      className="sentinel-notif-row"
      style={{
        display: "grid",
        gridTemplateColumns: "40px minmax(0,1fr) auto",
        gap: 18,
        padding: "20px 4px",
        borderBottom: "1px solid var(--rule)",
        alignItems: "flex-start",
        transition: "background 140ms ease, border-left-color 140ms ease",
        borderLeft: `2px solid ${!n.read ? "var(--signal)" : "transparent"}`,
        paddingLeft: 18,
        listStyle: "none",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "grid",
          placeItems: "center",
          width: 40,
          height: 40,
          border: "1px solid var(--rule-strong)",
          background: "var(--ink-02)",
          color: cat.iconColor,
          flexShrink: 0,
        }}
      >
        <CategoryIcon category={category} />
      </span>

      {href ? (
        <Link
          href={href}
          onClick={() => !n.read && onMarkRead(n.id)}
          style={{
            textDecoration: "none",
            color: "inherit",
            display: "block",
            minWidth: 0,
          }}
        >
          {body}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => !n.read && onMarkRead(n.id)}
          style={{
            textAlign: "left",
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: !n.read ? "pointer" : "default",
            color: "inherit",
            minWidth: 0,
          }}
        >
          {body}
        </button>
      )}

      <div
        className="flex items-center"
        style={{
          gap: 10,
          flexShrink: 0,
          paddingTop: 4,
        }}
      >
        {!n.read && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onMarkRead(n.id);
            }}
            className="sentinel-notif-action"
            title="Mark as read"
            aria-label="Mark as read"
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 9.5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              background: "transparent",
              border: "1px solid var(--rule-strong)",
              color: "var(--cream-3)",
              padding: "6px 10px",
              cursor: "pointer",
              transition: "color 140ms, border-color 140ms, background 140ms",
            }}
          >
            Clear
          </button>
        )}
        {href && (
          <Link
            href={href}
            onClick={() => !n.read && onMarkRead(n.id)}
            className="sentinel-notif-open"
            aria-label="Open deal"
            title="Open deal"
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 20,
              color: "var(--cream-3)",
              textDecoration: "none",
              lineHeight: 1,
              display: "inline-block",
              padding: "4px 6px",
              transition: "color 140ms, transform 140ms",
            }}
          >
            →
          </Link>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onDelete(n.id);
          }}
          className="sentinel-notif-delete"
          aria-label="Delete"
          title="Delete"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--cream-4)",
            cursor: "pointer",
            padding: 6,
            lineHeight: 1,
            fontFamily: "var(--font-mono-jb)",
            fontSize: 15,
            transition: "color 140ms",
          }}
        >
          ×
        </button>
      </div>
    </li>
  );
}

function EmptyState({ hasAny, filter }: { hasAny: boolean; filter: Filter }) {
  return (
    <div
      style={{
        padding: "72px 0",
        textAlign: "center",
        borderTop: "1px solid var(--rule-strong)",
        borderBottom: "1px solid var(--rule-strong)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--copper)",
          marginBottom: 14,
        }}
      >
        - The desk is quiet -
      </div>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 28,
          lineHeight: 1.2,
          color: "var(--cream)",
          letterSpacing: "-0.01em",
        }}
      >
        {filter === "unread" && hasAny
          ? "Nothing unread - everything accounted for."
          : hasAny
            ? "No matches. Try a different filter."
            : "You're all caught up. The ledger is clean."}
      </div>
    </div>
  );
}

function ListLoading() {
  return (
    <div
      aria-live="polite"
      style={{
        borderTop: "1px solid var(--rule-strong)",
        borderBottom: "1px solid var(--rule-strong)",
      }}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "40px minmax(0,1fr) 100px",
            gap: 18,
            padding: "20px 4px",
            borderBottom:
              i === 3 ? "none" : "1px solid var(--rule)",
          }}
        >
          <div
            aria-hidden
            style={{
              width: 40,
              height: 40,
              background: "var(--ink-02)",
              border: "1px solid var(--rule)",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              aria-hidden
              style={{
                height: 10,
                width: "40%",
                background: "var(--ink-02)",
              }}
            />
            <div
              aria-hidden
              style={{
                height: 18,
                width: "70%",
                background: "var(--ink-03)",
              }}
            />
            <div
              aria-hidden
              style={{
                height: 12,
                width: "55%",
                background: "var(--ink-02)",
              }}
            />
          </div>
          <div
            aria-hidden
            style={{
              height: 18,
              width: 80,
              background: "var(--ink-02)",
              justifySelf: "end",
            }}
          />
        </div>
      ))}
    </div>
  );
}

