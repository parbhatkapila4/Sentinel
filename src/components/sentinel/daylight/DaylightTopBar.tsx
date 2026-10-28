"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { getUserProfile } from "@/app/actions/user";
import { fullCurrency, sentenceCase } from "./format";
import { NavIcon } from "./nav";
import { useUnreadNotifications } from "./unread-notifications";

interface DaylightTopBarProps {
  title: string;
  dateLabel: string;
}

type SearchDeal = { id: string; name: string; stage: string; value: number };

const SEARCH_LIMIT = 8;
const DEBOUNCE_MS = 250;
const CACHE_MAX = 48;

export function DaylightTopBar({ title, dateLabel }: DaylightTopBarProps) {
  return (
    <header
      className="flex flex-wrap items-center justify-between"
      style={{
        gap: "10px 20px",
        minHeight: 61,
        padding: "12px var(--dl-gutter)",
        borderBottom: "1px solid var(--dl-divider)",
      }}
    >
      <div
        className="flex flex-wrap items-baseline"
        style={{ gap: "2px 12px" }}
      >
        <span
          style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.015em" }}
        >
          {title}
        </span>
        <span style={{ fontSize: 14, color: "var(--dl-muted)" }}>
          {dateLabel}
        </span>
      </div>
      <div className="dl-top-tools">
        <DealSearch />
        <NotificationsBell />
        <AccountMenu />
      </div>
    </header>
  );
}

function NotificationsBell() {
  const unread = useUnreadNotifications();
  const onPage = usePathname() === "/notifications";
  const count = unread ?? 0;

  return (
    <Link
      href="/notifications"
      aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
      aria-current={onPage ? "page" : undefined}
      className="dl-icon-btn dl-tap"
      style={{
        display: "flex",
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: 10,
        background: "var(--dl-panel)",
        border: `1px solid ${onPage ? "var(--dl-ink)" : "var(--dl-border)"}`,
        boxShadow: "var(--dl-shadow)",
        color: onPage ? "var(--dl-ink)" : "var(--dl-text-2)",
      }}
    >
      <NavIcon>
        <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M14 21a2 2 0 01-4 0" />
      </NavIcon>
      {count > 0 && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 19,
            height: 19,
            padding: "0 5px",
            borderRadius: 999,
            background: "var(--dl-signal)",
            border: "2px solid var(--dl-ground)",
            color: "var(--dl-panel)",
            fontSize: 10.5,
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

function DealSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchDeal[]>([]);
  const [open, setOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef<Map<string, SearchDeal[]>>(new Map());
  const timerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cancelPending = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    abortRef.current?.abort();
    abortRef.current = null;
  };

  const onQueryChange = (next: string) => {
    setQuery(next);
    cancelPending();

    const q = next.trim();
    if (q.length === 0) {
      setIsSearching(false);
      setHasSearched(false);
      setResults([]);
      setOpen(false);
      return;
    }

    const key = q.toLowerCase();
    const cached = cacheRef.current.get(key);
    if (cached) {
      setResults(cached.slice(0, SEARCH_LIMIT));
      setIsSearching(false);
      setHasSearched(true);
      setOpen(true);
      return;
    }

    let preview: SearchDeal[] = [];
    for (let i = q.length - 1; i >= 1; i--) {
      const parent = cacheRef.current.get(q.slice(0, i).toLowerCase());
      if (parent) {
        preview = parent
          .filter((d) => d.name.toLowerCase().includes(key))
          .slice(0, SEARCH_LIMIT);
        break;
      }
    }
    setResults(preview);
    setIsSearching(true);
    setOpen(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    timerRef.current = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/deals/search?q=${encodeURIComponent(q)}&limit=${SEARCH_LIMIT}`,
          { signal: ctrl.signal }
        );
        if (!res.ok) return;
        const json = await res.json();
        const payload = json.data ?? json;
        const list: SearchDeal[] = (payload.deals ?? []).slice(0, SEARCH_LIMIT);
        if (ctrl.signal.aborted) return;
        const cache = cacheRef.current;
        cache.delete(key);
        cache.set(key, list);
        if (cache.size > CACHE_MAX) {
          const first = cache.keys().next().value;
          if (first !== undefined) cache.delete(first);
        }
        setResults(list);
        setOpen(true);
        setHasSearched(true);
      } catch {
      } finally {
        if (!ctrl.signal.aborted) setIsSearching(false);
      }
    }, DEBOUNCE_MS);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/deals?search=${encodeURIComponent(query)}`);
    setOpen(false);
  };

  const trimmed = query.trim();

  return (
    <div ref={wrapRef} style={{ position: "relative", flex: "0 1 300px", minWidth: 0 }}>
      <form
        onSubmit={onSubmit}
        role="search"
        className="dl-search"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          width: "100%",
          height: 36,
          padding: "0 8px 0 11px",
          borderRadius: 10,
          background: "var(--dl-panel)",
          border: "1px solid var(--dl-border)",
          boxShadow: "var(--dl-shadow)",
          color: "var(--dl-muted)",
        }}
      >
        {isSearching ? (
          <span
            aria-hidden
            style={{
              width: 15,
              height: 15,
              flexShrink: 0,
              border: "1.5px solid var(--dl-border-strong)",
              borderTopColor: "var(--dl-signal)",
              borderRadius: "50%",
              animation: "sentinel-search-spin 720ms linear infinite",
            }}
          />
        ) : (
          <svg
            viewBox="0 0 24 24"
            width={15}
            height={15}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.8-3.8" />
          </svg>
        )}
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => trimmed && setOpen(true)}
          placeholder="Search deals or ask anything"
          aria-label="Search deals"
          style={{
            flex: 1,
            minWidth: 0,
            border: 0,
            outline: 0,
            background: "transparent",
            fontSize: 13.5,
            color: "var(--dl-ink)",
          }}
        />
        <kbd
          className="dl-top-kbd"
          style={{
            padding: "2px 6px",
            borderRadius: 6,
            background: "var(--dl-ground)",
            border: "1px solid var(--dl-border)",
            fontFamily: "var(--dl-font-mono)",
            fontSize: 10.5,
            color: "var(--dl-muted)",
            whiteSpace: "nowrap",
          }}
        >
          Ctrl K
        </kbd>
      </form>

      {open && trimmed.length > 0 && (
        <div
          role="listbox"
          aria-label="Search results"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 6px)",
            zIndex: 40,
            width: 320,
            maxWidth: "calc(100vw - 32px)",
            maxHeight: 340,
            overflowY: "auto",
            borderRadius: 12,
            background: "var(--dl-panel)",
            border: "1px solid var(--dl-border)",
            boxShadow: "var(--dl-shadow-pop)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              padding: "8px 14px",
              background: "var(--dl-tint)",
              borderBottom: "1px solid var(--dl-divider)",
              fontSize: 12.5,
              color: "var(--dl-muted)",
            }}
          >
            <span>
              {isSearching
                ? "Searching"
                : results.length === 0
                  ? "No matches"
                  : `${results.length} result${results.length === 1 ? "" : "s"}`}
            </span>
            <span
              title={query}
              style={{
                maxWidth: 170,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              &ldquo;{query}&rdquo;
            </span>
          </div>

          {isSearching && results.length === 0 ? (
            <div>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    padding: "12px 14px",
                    borderBottom: "1px solid var(--dl-row)",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      display: "block",
                      height: 12,
                      width: `${72 - i * 10}%`,
                      borderRadius: 4,
                      background:
                        "linear-gradient(90deg, var(--dl-row) 0%, var(--dl-border) 50%, var(--dl-row) 100%)",
                      backgroundSize: "200% 100%",
                      animation: "sentinel-search-shimmer 1.2s linear infinite",
                      animationDelay: `${i * 90}ms`,
                    }}
                  />
                  <span
                    aria-hidden
                    style={{
                      display: "block",
                      height: 8,
                      width: `${48 - i * 8}%`,
                      borderRadius: 4,
                      background:
                        "linear-gradient(90deg, var(--dl-row) 0%, var(--dl-border) 50%, var(--dl-row) 100%)",
                      backgroundSize: "200% 100%",
                      animation: "sentinel-search-shimmer 1.2s linear infinite",
                      animationDelay: `${i * 90 + 60}ms`,
                    }}
                  />
                </div>
              ))}
            </div>
          ) : results.length === 0 && hasSearched ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 8,
                padding: "18px 14px",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                No deals match.
              </div>
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "var(--dl-muted)",
                }}
              >
                Nothing in your workspace matches{" "}
                <span style={{ color: "var(--dl-ink)" }}>
                  &ldquo;{query}&rdquo;
                </span>
                . Try a shorter term, or check your full list.
              </div>
              <Link
                href={`/deals?search=${encodeURIComponent(query)}`}
                onClick={() => setOpen(false)}
                className="dl-link"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--dl-ink)",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                Open deals list
              </Link>
            </div>
          ) : (
            results.map((d) => (
              <Link
                key={d.id}
                href={`/deals/${d.id}`}
                role="option"
                aria-selected={false}
                onClick={() => {
                  setOpen(false);
                  onQueryChange("");
                }}
                className="dl-action"
                style={{
                  display: "block",
                  padding: "10px 14px",
                  borderBottom: "1px solid var(--dl-row)",
                  color: "var(--dl-ink)",
                }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{d.name}</div>
                <div
                  style={{
                    marginTop: 1,
                    fontSize: 12.5,
                    color: "var(--dl-muted)",
                  }}
                >
                  {sentenceCase(d.stage.replace(/_/g, " "))} ·{" "}
                  {fullCurrency(d.value)}
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AccountMenu() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const [open, setOpen] = useState(false);
  const [imgBroken, setImgBroken] = useState(false);
  const [dbImageUrl, setDbImageUrl] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profile = await getUserProfile();
        if (!cancelled) setDbImageUrl(profile?.imageUrl ?? null);
      } catch {
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const imageUrl = dbImageUrl ?? user?.imageUrl ?? null;
  const fallbackInitial = (
    user?.firstName?.[0] ??
    user?.username?.[0] ??
    user?.primaryEmailAddress?.emailAddress?.[0] ??
    "S"
  ).toUpperCase();
  const accountLabel =
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Account";
  const showImage = Boolean(imageUrl) && !imgBroken;

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={accountLabel}
        title={accountLabel}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 34,
          height: 34,
          padding: 0,
          minHeight: 0,
          border: 0,
          borderRadius: "50%",
          overflow: "hidden",
          background: "var(--dl-ink)",
          color: "var(--dl-panel)",
          fontSize: 13,
          fontWeight: 600,
          boxShadow:
            "0 0 0 2px var(--dl-ground), 0 0 0 3px var(--dl-border-strong)",
          cursor: "pointer",
        }}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl ?? undefined}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setImgBroken(true)}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <span aria-hidden style={{ opacity: isLoaded ? 1 : 0 }}>
            {fallbackInitial}
          </span>
        )}
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 10px)",
            zIndex: 50,
            width: 220,
            padding: 6,
            borderRadius: 12,
            background: "var(--dl-panel)",
            border: "1px solid var(--dl-border)",
            boxShadow: "var(--dl-shadow-pop)",
          }}
        >
          <div
            style={{
              padding: "8px 10px 10px",
              marginBottom: 4,
              borderBottom: "1px solid var(--dl-row)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: 12.5,
              color: "var(--dl-muted)",
            }}
          >
            {accountLabel}
          </div>
          <Link
            href="/notifications"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="dl-action"
            style={{
              display: "flex",
              alignItems: "center",
              height: 34,
              padding: "0 10px",
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 500,
              color: "var(--dl-ink)",
            }}
          >
            Notifications
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              await signOut();
              router.push("/");
              router.refresh();
            }}
            className="dl-action"
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              height: 34,
              padding: "0 10px",
              border: 0,
              borderRadius: 8,
              background: "transparent",
              fontSize: 13.5,
              fontWeight: 500,
              color: "var(--dl-signal-d)",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
