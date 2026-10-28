import { NavIcon } from "../nav";
import {
  DEALS_FILTERS,
  FILTER_LABELS,
  type DealsFilter,
  type DealsScope,
} from "./model";

interface ListBarProps {
  filter: DealsFilter;
  scope: DealsScope;
  counts: Record<DealsFilter, number>;
  query: string;
  onFilter: (next: DealsFilter) => void;
  onScope: (next: DealsScope) => void;
  onQuery: (next: string) => void;
}

const SCOPES: Array<{ value: DealsScope; label: string; short: string }> = [
  { value: "my", label: "My deals", short: "Mine" },
  { value: "all", label: "All deals", short: "Team" },
];

export function ListBar({
  filter,
  scope,
  counts,
  query,
  onFilter,
  onScope,
  onQuery,
}: ListBarProps) {
  return (
    <div className="dl-viewbar">
      <div role="group" aria-label="Filter deals" className="dl-viewbar-tabs">
        {DEALS_FILTERS.map((value) => {
          const flagged = value === "at-risk" && counts[value] > 0;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => onFilter(value)}
              className="dl-tab"
            >
              <span className="dl-tab-label" data-label={FILTER_LABELS[value]}>
                <span>{FILTER_LABELS[value]}</span>
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 20,
                  padding: "0 7px",
                  borderRadius: 6,
                  background: flagged
                    ? "var(--dl-signal-tint)"
                    : "var(--dl-chip)",
                  fontSize: 12,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                  color: flagged ? "var(--dl-signal-d)" : "var(--dl-text-2)",
                }}
              >
                {counts[value].toLocaleString("en-US")}
              </span>
            </button>
          );
        })}
      </div>
      <div className="dl-viewbar-controls">
        <div role="group" aria-label="Scope" className="dl-seg">
          {SCOPES.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={scope === item.value}
              aria-label={item.label}
              onClick={() => onScope(item.value)}
              className="dl-seg-btn dl-tap"
            >
              <span className="dl-wide-only">{item.label}</span>
              <span className="dl-narrow-only">{item.short}</span>
            </button>
          ))}
        </div>
        <label className="dl-search dl-filter-field">
          <NavIcon size={15} strokeWidth={1.8}>
            <path d="M4 6h16M7 12h10M10 18h4" />
          </NavIcon>
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Filter by name or stage"
            aria-label="Filter the list"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              aria-label="Clear filter"
              onClick={() => onQuery("")}
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
      </div>
    </div>
  );
}
