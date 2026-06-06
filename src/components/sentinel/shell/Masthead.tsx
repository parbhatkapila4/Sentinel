"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MastheadProps {
  syncTime: string;
  coveragePercent: number;
  sourceLabels: string[];
  alertCount: number;
  onOpenCommand?: () => void;
}

type SearchDeal = { id: string; name: string; stage: string; value: number };

const SEARCH_LIMIT = 8;
const DEBOUNCE_MS = 120;
const CACHE_MAX = 48;

export function Masthead({
  syncTime,
  coveragePercent,
  sourceLabels,
  alertCount,
  onOpenCommand,
}: MastheadProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchDeal[]>([]);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef<Map<string, SearchDeal[]>>(new Map());

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length === 0) {
      setIsSearching(false);
      setHasSearched(false);
      setResults([]);
      return;
    }

    const key = q.toLowerCase();

    const cached = cacheRef.current.get(key);
    if (cached) {
      setResults(cached.slice(0, SEARCH_LIMIT));
      setIsSearching(false);
      setHasSearched(true);
      setResultsOpen(true);
      return;
    }

    let hasPreview = false;
    for (let i = q.length - 1; i >= 1; i--) {
      const parent = cacheRef.current.get(q.slice(0, i).toLowerCase());
      if (parent) {
        const filtered = parent
          .filter((d) => d.name.toLowerCase().includes(key))
          .slice(0, SEARCH_LIMIT);
        setResults(filtered);
        hasPreview = true;
        break;
      }
    }
    if (!hasPreview) setResults([]);

    setIsSearching(true);
    setResultsOpen(true);

    const ctrl = new AbortController();
    let active = true;

    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/deals/search?q=${encodeURIComponent(q)}&limit=${SEARCH_LIMIT}`,
          { signal: ctrl.signal }
        );
        if (!res.ok) return;
        const json = await res.json();
        const payload = json.data ?? json;
        const list: SearchDeal[] = (payload.deals ?? []).slice(0, SEARCH_LIMIT);
        if (!active) return;
        const cache = cacheRef.current;
        cache.delete(key);
        cache.set(key, list);
        if (cache.size > CACHE_MAX) {
          const first = cache.keys().next().value;
          if (first !== undefined) cache.delete(first);
        }
        setResults(list);
        setResultsOpen(true);
        setHasSearched(true);
      } catch {
      } finally {
        if (active) setIsSearching(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      active = false;
      clearTimeout(t);
      ctrl.abort();
    };
  }, [searchQuery]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenCommand?.();
      }
      if (e.key === "Escape") setResultsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onOpenCommand]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setResultsOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/deals?search=${encodeURIComponent(searchQuery)}`);
    setResultsOpen(false);
  };

  return (
    <header
      className="hidden sm:grid items-center py-3.5 px-4 sm:px-8"
      style={{
        gridTemplateColumns: "auto 1fr auto",
        gap: 32,
        borderBottom: "1px solid var(--rule)",
        fontFamily: "var(--font-mono-jb)",
        fontSize: 10.5,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--cream-3)",
      }}
    >
      <Link
        href="/dashboard"
        aria-label="Sentinel"
        className="hidden lg:block"
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 20,
          color: "var(--cream)",
          letterSpacing: "-0.01em",
          textTransform: "none",
        }}
      >
        Sentinel<span style={{ color: "var(--signal)" }}>.</span>
      </Link>

      <div className="hidden md:flex justify-center" style={{ gap: 28 }}>
        <span>
          SYNC{" "}
          <strong style={{ color: "var(--cream)", fontWeight: 500 }}>{syncTime}</strong>
        </span>
        <span>
          COVERAGE{" "}
          <strong style={{ color: "var(--cream)", fontWeight: 500 }}>
            {coveragePercent.toFixed(1)}%
          </strong>
        </span>
        <span>
          SOURCES{" "}
          <strong style={{ color: "var(--cream)", fontWeight: 500 }}>
            {sourceLabels.join(" · ") || "NONE CONNECTED"}
          </strong>
        </span>
      </div>

      <div className="flex items-center" style={{ gap: 10 }}>
        <div ref={wrapRef} className="relative">
          <form onSubmit={onSubmit}>
            <button
              type="button"
              onClick={onOpenCommand}
              aria-label="Open command palette"
              className="hidden sm:flex items-center"
              style={{
                gap: 10,
                background: "var(--ink-02)",
                border: "1px solid var(--rule)",
                padding: "7px 10px",
                cursor: "pointer",
                color: "var(--cream-3)",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 12,
                  height: 12,
                  display: "inline-grid",
                  placeItems: "center",
                  position: "relative",
                  color: isSearching ? "var(--signal)" : "var(--cream-3)",
                  transition: "color 180ms ease",
                }}
              >
                {isSearching ? (
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      border: "1.5px solid var(--rule-strong)",
                      borderTopColor: "var(--signal)",
                      borderRadius: "50%",
                      animation:
                        "sentinel-search-spin 720ms linear infinite",
                    }}
                  />
                ) : (
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <circle cx={11} cy={11} r={8} />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                )}
              </span>
              <input
                value={searchQuery}
                onChange={(e) => {
                  const next = e.target.value;
                  setSearchQuery(next);
                  if (next.trim().length === 0) {
                    setResults([]);
                    setResultsOpen(false);
                  }
                }}
                onFocus={() => searchQuery && setResultsOpen(true)}
                placeholder="Search or ask anything…"
                aria-label="Search deals"
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--cream-2)",
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: 11.5,
                  textTransform: "none",
                  letterSpacing: 0,
                  width: 200,
                }}
              />
              <span
                style={{
                  fontSize: 9.5,
                  color: "var(--cream-3)",
                  border: "1px solid var(--rule-strong)",
                  padding: "2px 5px",
                }}
              >
                ⌘K
              </span>
            </button>
          </form>

          {resultsOpen && searchQuery.trim().length > 0 && (
            <div
              role="listbox"
              className="absolute right-0 top-full mt-1"
              style={{
                width: 300,
                background: "var(--ink-02)",
                border: "1px solid var(--rule-strong)",
                zIndex: 40,
                maxHeight: 340,
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  padding: "8px 12px",
                  borderBottom: "1px solid var(--rule)",
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 9.5,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--cream-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  background: "var(--ink)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {isSearching && (
                    <span
                      aria-hidden
                      style={{
                        width: 8,
                        height: 8,
                        border: "1.25px solid var(--rule-strong)",
                        borderTopColor: "var(--signal)",
                        borderRadius: "50%",
                        animation:
                          "sentinel-search-spin 720ms linear infinite",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span>
                    {isSearching
                      ? "Searching"
                      : results.length === 0
                        ? "No matches"
                        : `${results.length} result${results.length === 1 ? "" : "s"}`}
                  </span>
                </span>
                <span
                  style={{
                    color: "var(--cream-4)",
                    maxWidth: 160,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textTransform: "none",
                    letterSpacing: 0,
                    fontSize: 10,
                  }}
                  title={searchQuery}
                >
                  &ldquo;{searchQuery}&rdquo;
                </span>
              </div>

              {isSearching && results.length === 0 ? (
                <div>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        padding: "10px 12px",
                        borderBottom: "1px solid var(--rule)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          display: "block",
                          height: 12,
                          width: `${72 - i * 10}%`,
                          background:
                            "linear-gradient(90deg, var(--rule) 0%, var(--rule-strong) 50%, var(--rule) 100%)",
                          backgroundSize: "200% 100%",
                          animation: `sentinel-search-shimmer 1.2s linear infinite`,
                          animationDelay: `${i * 90}ms`,
                        }}
                      />
                      <span
                        aria-hidden
                        style={{
                          display: "block",
                          height: 8,
                          width: `${48 - i * 8}%`,
                          background:
                            "linear-gradient(90deg, var(--rule) 0%, var(--rule-strong) 50%, var(--rule) 100%)",
                          backgroundSize: "200% 100%",
                          animation: `sentinel-search-shimmer 1.2s linear infinite`,
                          animationDelay: `${i * 90 + 60}ms`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : results.length === 0 && hasSearched ? (
                <div
                  style={{
                    padding: "22px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      fontSize: 20,
                      lineHeight: 1.15,
                      color: "var(--cream)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    No deals match.
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-geist-sans)",
                      fontSize: 12.5,
                      lineHeight: 1.5,
                      color: "var(--cream-3)",
                    }}
                  >
                    Nothing in your workspace matches{" "}
                    <span style={{ color: "var(--cream)" }}>
                      &ldquo;{searchQuery}&rdquo;
                    </span>
                    . Try a shorter term, or check your full list.
                  </div>
                  <Link
                    href={`/deals?search=${encodeURIComponent(searchQuery)}`}
                    onClick={() => {
                      setResultsOpen(false);
                    }}
                    style={{
                      marginTop: 2,
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--signal)",
                      borderBottom: "1px solid var(--signal)",
                      paddingBottom: 1,
                    }}
                  >
                    Open deals list ›
                  </Link>
                </div>
              ) : (
                results.map((d) => (
                  <Link
                    key={d.id}
                    href={`/deals/${d.id}`}
                    onClick={() => {
                      setResultsOpen(false);
                      setSearchQuery("");
                    }}
                    className="block"
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid var(--rule)",
                      color: "var(--cream)",
                      textTransform: "none",
                      letterSpacing: 0,
                      fontFamily: "var(--font-geist-sans)",
                      fontSize: 13,
                    }}
                  >
                    <div style={{ fontWeight: 500 }}>{d.name}</div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 10,
                        letterSpacing: "0.08em",
                        color: "var(--cream-3)",
                        textTransform: "uppercase",
                        marginTop: 2,
                      }}
                    >
                      {d.stage} · ${d.value.toLocaleString("en-US")}
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        <Link
          href="/notifications"
          aria-label={`Alerts${alertCount > 0 ? `, ${alertCount} unread` : ""}`}
          className="relative hidden lg:grid place-items-center"
          style={{
            width: 30,
            height: 30,
            border: "1px solid var(--rule)",
            background: "var(--ink-02)",
            color: "var(--cream-3)",
          }}
        >
          <svg
            width={13}
            height={13}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M14 21a2 2 0 01-4 0" />
          </svg>
          {alertCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                background: "var(--signal)",
                color: "var(--cream)",
                fontFamily: "var(--font-mono-jb)",
                fontSize: 9,
                fontWeight: 500,
                minWidth: 14,
                height: 14,
                borderRadius: 7,
                display: "grid",
                placeItems: "center",
                padding: "0 3px",
                letterSpacing: 0,
              }}
            >
              {alertCount > 99 ? "99+" : alertCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
