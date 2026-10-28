"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { fullCurrency } from "../format";
import { Menu, menuItemStyle, usePopover } from "../Popover";
import { Monogram, tableHeadStyle } from "../ui";
import {
  ActionCell,
  ActivityCell,
  DemoTag,
  OwnerCell,
  RiskCell,
  StageMark,
} from "./cells";
import { stageLabel, type DealRow } from "./model";

interface DealsTableProps {
  deals: DealRow[];
  nowMs: number;
  selectedIds: ReadonlySet<string>;
  allSelected: boolean;
  canSelectAny: boolean;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onDelete: (deal: DealRow, trigger: HTMLElement | null) => void;
}

const headStyle: CSSProperties = { ...tableHeadStyle, borderTop: 0 };

const ellipsis: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

function RowMenu({
  deal,
  onDelete,
}: {
  deal: DealRow;
  onDelete: DealsTableProps["onDelete"];
}) {
  const { open, anchor, triggerRef, panelRef, toggle, close } = usePopover({
    side: "auto",
    align: "end",
    gap: 6,
  });

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-label={`More actions for ${deal.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="dl-kebab"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          padding: 0,
          border: 0,
          borderRadius: 7,
          background: "transparent",
          color: "var(--dl-icon)",
          cursor: "pointer",
        }}
      >
        <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
          <circle cx="5" cy="12" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="19" cy="12" r="1.7" />
        </svg>
      </button>
      <Menu
        anchor={anchor}
        panelRef={panelRef}
        onClose={close}
        label={`Actions for ${deal.name}`}
        width={176}
      >
        <Link
          href={`/deals/${deal.id}`}
          role="menuitem"
          onClick={() => close()}
          className="dl-menu-item"
          style={menuItemStyle}
        >
          View deal
        </Link>
        {!deal.isDemo && (
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              const trigger = triggerRef.current;
              close();
              onDelete(deal, trigger);
            }}
            className="dl-menu-item"
            style={{ ...menuItemStyle, color: "var(--dl-signal-d)" }}
          >
            Delete deal
          </button>
        )}
      </Menu>
    </>
  );
}

export function DealsTable({
  deals,
  nowMs,
  selectedIds,
  allSelected,
  canSelectAny,
  onToggle,
  onToggleAll,
  onDelete,
}: DealsTableProps) {
  return (
    <div
      role="table"
      aria-label="Deals"
      aria-rowcount={deals.length + 1}
      className="dl-deals-table dl-fill"
    >
      <div role="rowgroup">
        <div role="row" className="dl-deal-grid" style={headStyle}>
          <span role="columnheader" style={{ display: "flex" }}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onToggleAll}
              disabled={!canSelectAny}
              aria-label="Select all deals"
              className="dl-check"
            />
          </span>
          <span role="columnheader">Deal</span>
          <span role="columnheader">Stage</span>
          <span role="columnheader">Risk</span>
          <span role="columnheader" className="dl-col-owner">
            Owner
          </span>
          <span role="columnheader" className="dl-col-action">
            Next action
          </span>
          <span role="columnheader" className="dl-col-activity">
            Last activity
          </span>
          <span role="columnheader" style={{ textAlign: "right" }}>
            Value
          </span>
          <span role="columnheader">
            <span className="sr-only">Actions</span>
          </span>
        </div>
      </div>
      <div
        role="rowgroup"
        className="dl-deal-rows"
        style={{ maxHeight: `calc(${deals.length} * var(--dl-row-max))` }}
      >
        {deals.map((deal, i) => {
          const selected = selectedIds.has(deal.id);
          return (
            <div
              key={deal.id}
              role="row"
              data-selected={selected || undefined}
              className="dl-row dl-deal-grid"
              style={{
                minHeight: 62,
                borderBottom:
                  i === deals.length - 1 ? undefined : "1px solid var(--dl-row)",
              }}
            >
              <span role="cell" style={{ display: "flex" }}>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => onToggle(deal.id)}
                  disabled={deal.isDemo}
                  aria-label={`Select ${deal.name}`}
                  className="dl-check"
                />
              </span>
              <div
                role="cell"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  minWidth: 0,
                }}
              >
                <Monogram name={deal.name} />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      minWidth: 0,
                    }}
                  >
                    <Link
                      href={`/deals/${deal.id}`}
                      className="dl-link"
                      style={{
                        ...ellipsis,
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--dl-ink)",
                      }}
                    >
                      {deal.name}
                    </Link>
                    {deal.isDemo && <DemoTag />}
                  </div>
                  {deal.location && (
                    <div
                      style={{
                        ...ellipsis,
                        fontSize: 13,
                        color: "var(--dl-muted)",
                      }}
                    >
                      {deal.location}
                    </div>
                  )}
                </div>
              </div>
              <div role="cell" style={{ minWidth: 0 }}>
                <div
                  style={{ ...ellipsis, fontSize: 13, color: "var(--dl-text-2)" }}
                >
                  {stageLabel(deal.stage)}
                </div>
                <StageMark stage={deal.stage} />
              </div>
              <div role="cell">
                <RiskCell deal={deal} />
              </div>
              <div role="cell" className="dl-col-owner" style={{ minWidth: 0 }}>
                <OwnerCell owner={deal.owner} />
              </div>
              <div role="cell" className="dl-col-action" style={{ minWidth: 0 }}>
                <ActionCell deal={deal} nowMs={nowMs} />
              </div>
              <div role="cell" className="dl-col-activity">
                <ActivityCell deal={deal} nowMs={nowMs} />
              </div>
              <div
                role="cell"
                style={{
                  textAlign: "right",
                  fontSize: 14,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                }}
              >
                {fullCurrency(deal.value)}
              </div>
              <div role="cell">
                <RowMenu deal={deal} onDelete={onDelete} />
              </div>
            </div>
          );
        })}
      </div>
      <div aria-hidden className="dl-deal-rest" />
    </div>
  );
}
