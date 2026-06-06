"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ExportButton } from "@/components/export-button";

export type DealsFilterType = "all" | "active" | "at-risk" | "closed";
export type DealsScopeType = "my" | "all";

const FILTER_LABELS: Record<DealsFilterType, string> = {
  all: "All",
  active: "Active",
  "at-risk": "At risk",
  closed: "Closed",
};

const SCOPE_LABELS: Record<DealsScopeType, string> = {
  my: "My deals",
  all: "All deals",
};

interface DealsToolbarProps {
  currentFilter: DealsFilterType;
  currentScope: DealsScopeType;
  currentSearch: string;
  teamId: string | null;
  totalShown: number;
  totalInScope: number;
}

export function DealsToolbar({
  currentFilter,
  currentScope,
  currentSearch,
  teamId,
  totalShown,
  totalInScope,
}: DealsToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(currentSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  const isSearching =
    searchValue.trim() !== currentSearch.trim() || isPending;

  const commit = (params: URLSearchParams) => {
    const qs = params.toString();
    startTransition(() => {
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
    });
  };

  const changeFilter = (next: DealsFilterType) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("filter");
    else params.set("filter", next);
    commit(params);
  };

  const changeScope = (next: DealsScopeType) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "my") params.delete("scope");
    else params.set("scope", next);
    commit(params);
  };

  const onSearchChange = (value: string) => {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim().length === 0) params.delete("search");
      else params.set("search", value.trim());
      commit(params);
    }, 280);
  };

  const filters: DealsFilterType[] = ["all", "active", "at-risk", "closed"];
  const scopes: DealsScopeType[] = ["my", "all"];

  return (
    <div
      className="flex flex-col"
      style={{
        gap: 18,
        padding: "22px 0",
        borderTop: "1px solid var(--rule)",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <div
        className="flex flex-wrap items-center"
        style={{ gap: 16 }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "var(--cream-3)",
            textTransform: "uppercase",
          }}
        >
          Scope
        </span>
        <div className="flex" style={{ gap: 0 }} role="group" aria-label="Scope">
          {scopes.map((s, i) => {
            const active = currentScope === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => changeScope(s)}
                aria-pressed={active}
                style={{
                  padding: "6px 14px",
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: active ? "var(--signal)" : "var(--cream-3)",
                  background: active ? "rgba(200,71,46,0.06)" : "transparent",
                  border: "1px solid var(--rule-strong)",
                  borderLeft: i === 0 ? "1px solid var(--rule-strong)" : "none",
                  cursor: "pointer",
                }}
              >
                {SCOPE_LABELS[s]}
              </button>
            );
          })}
        </div>

        <span
          aria-hidden
          style={{
            width: 1,
            height: 18,
            background: "var(--rule)",
          }}
        />

        <span
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "var(--cream-3)",
            textTransform: "uppercase",
          }}
        >
          Filter
        </span>
        <div className="flex flex-wrap" style={{ gap: 0 }} role="group" aria-label="Filter">
          {filters.map((f, i) => {
            const active = currentFilter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => changeFilter(f)}
                aria-pressed={active}
                style={{
                  padding: "6px 14px",
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: active ? "var(--signal)" : "var(--cream-3)",
                  background: active ? "rgba(200,71,46,0.06)" : "transparent",
                  border: "1px solid var(--rule-strong)",
                  borderLeft: i === 0 ? "1px solid var(--rule-strong)" : "none",
                  cursor: "pointer",
                }}
              >
                {FILTER_LABELS[f]}
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        <span
          className="tabular"
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "var(--cream-4)",
            textTransform: "uppercase",
          }}
        >
          SHOWING {totalShown} / {totalInScope}
        </span>
      </div>

      <div
        className="flex flex-wrap items-center"
        style={{ gap: 12 }}
      >
        <div
          className="flex items-center flex-1"
          style={{
            minWidth: 240,
            gap: 10,
            background: "var(--ink-02)",
            border: "1px solid var(--rule)",
            padding: "8px 12px",
          }}
        >
          {isSearching ? (
            <svg
              className="animate-spin"
              width={13}
              height={13}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
              role="status"
              aria-label="Searching"
              style={{ color: "var(--signal)" }}
            >
              <circle cx={12} cy={12} r={9} strokeOpacity={0.25} />
              <path d="M21 12a9 9 0 0 1-9 9" strokeLinecap="round" />
            </svg>
          ) : (
            <svg
              width={13}
              height={13}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
              style={{ color: "var(--cream-3)" }}
            >
              <circle cx={11} cy={11} r={8} />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          )}
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search deals by name or stage…"
            aria-label="Search deals"
            aria-busy={isSearching}
            autoComplete="off"
            spellCheck={false}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--cream)",
              fontFamily: "var(--font-geist-sans)",
              fontSize: 13,
              flex: 1,
            }}
          />
          {searchValue && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onSearchChange("")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--cream-3)",
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "var(--font-mono-jb)",
              }}
            >
              ×
            </button>
          )}
        </div>

        <ExportButton
          className="sentinel-editorial-button inline-flex items-center gap-2 px-3 py-2"
          teamId={teamId}
          includeTeamDeals={currentScope === "all"}
        />

        <Link
          href="/deals/new"
          className="inline-flex items-center"
          style={{
            gap: 8,
            padding: "8px 14px",
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--cream)",
            background: "var(--signal)",
            border: "1px solid var(--signal)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 14,
              letterSpacing: 0,
            }}
          >
            →
          </span>
          New deal
        </Link>
      </div>
    </div>
  );
}
