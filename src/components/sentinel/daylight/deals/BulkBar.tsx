"use client";

import { Fragment, type CSSProperties } from "react";
import { STAGE_FORM_OPTIONS } from "@/lib/config";
import { fullCurrency, sentenceCase, stageStep } from "../format";
import { NavIcon } from "../nav";
import {
  Menu,
  MenuDivider,
  MenuHeading,
  menuItemStyle,
  usePopover,
} from "../Popover";
import { StageSteps } from "../ui";
import { closedKind } from "./model";

interface BulkBarProps {
  count: number;
  value: number;
  busy: boolean;
  onMove: (stage: string) => void;
  onDelete: (trigger: HTMLElement | null) => void;
  onClear: () => void;
}

const buttonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  height: 32,
  minHeight: 0,
  border: 0,
  borderRadius: 8,
  background: "transparent",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
};

const ruleStyle: CSSProperties = {
  width: 1,
  height: 20,
  background: "rgba(255, 255, 255, 0.18)",
};

const firstClosedStage = STAGE_FORM_OPTIONS.find(
  (option) => stageStep(option.value) === null
)?.value;

export function BulkBar({
  count,
  value,
  busy,
  onMove,
  onDelete,
  onClear,
}: BulkBarProps) {
  const { open, anchor, triggerRef, panelRef, toggle, close } = usePopover({
    side: "top",
    align: "start",
  });
  const noun = count === 1 ? "deal" : "deals";

  return (
    <div className="dl-bulk-dock">
      <div
        role="toolbar"
        aria-label="Actions for selected deals"
        className="dl-bulk-bar"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          height: 48,
          padding: "0 8px 0 16px",
          borderRadius: 13,
          background: "var(--dl-ink)",
          boxShadow:
            "0 18px 38px -14px rgba(16, 24, 40, 0.55), 0 2px 6px rgba(16, 24, 40, 0.2)",
          color: "var(--dl-panel)",
          whiteSpace: "nowrap",
        }}
      >
        <span
          aria-live="polite"
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {count.toLocaleString("en-US")} selected
        </span>
        <span
          style={{
            fontSize: 13,
            color: "rgba(255, 255, 255, 0.62)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {fullCurrency(value)}
        </span>
        <span aria-hidden style={{ ...ruleStyle, margin: "0 6px" }} />
        <button
          ref={triggerRef}
          type="button"
          onClick={toggle}
          disabled={busy}
          aria-haspopup="menu"
          aria-expanded={open}
          className="dl-bulk-btn"
          style={{
            ...buttonStyle,
            padding: "0 10px 0 12px",
            color: "var(--dl-panel)",
          }}
        >
          Move to stage
          <NavIcon size={13} strokeWidth={2}>
            <path d="M6 15l6-6 6 6" />
          </NavIcon>
        </button>
        <button
          type="button"
          onClick={(e) => onDelete(e.currentTarget)}
          disabled={busy}
          className="dl-bulk-btn"
          style={{ ...buttonStyle, padding: "0 12px", color: "#FFB8A8" }}
        >
          <NavIcon size={14} strokeWidth={1.7}>
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
          </NavIcon>
          Delete
        </button>
        <span aria-hidden style={{ ...ruleStyle, margin: "0 2px" }} />
        <button
          type="button"
          onClick={onClear}
          disabled={busy}
          aria-label="Clear selection"
          className="dl-bulk-btn"
          style={{
            ...buttonStyle,
            justifyContent: "center",
            width: 32,
            padding: 0,
            color: "rgba(255, 255, 255, 0.72)",
          }}
        >
          <NavIcon size={15} strokeWidth={2}>
            <path d="M6 6l12 12M18 6L6 18" />
          </NavIcon>
        </button>
      </div>
      <Menu
        anchor={anchor}
        panelRef={panelRef}
        onClose={close}
        label="Move to stage"
        width={232}
      >
        <MenuHeading>
          Move {count.toLocaleString("en-US")} {noun} to
        </MenuHeading>
        {STAGE_FORM_OPTIONS.map((option) => {
          const closed = closedKind(option.value);
          return (
            <Fragment key={option.value}>
              {option.value === firstClosedStage && <MenuDivider />}
              <button
                type="button"
                role="menuitem"
                disabled={busy}
                onClick={() => {
                  close();
                  onMove(option.value);
                }}
                className="dl-menu-item"
                style={menuItemStyle}
              >
                {sentenceCase(option.label)}
                {stageStep(option.value) !== null ? (
                  <StageSteps
                    stage={option.value}
                    marginTop={0}
                    segmentWidth={12}
                  />
                ) : (
                  <span
                    aria-hidden
                    style={{
                      width: 7,
                      height: 7,
                      marginRight: 2,
                      borderRadius: "50%",
                      background:
                        closed === "won"
                          ? "var(--dl-green)"
                          : "var(--dl-context)",
                    }}
                  />
                )}
              </button>
            </Fragment>
          );
        })}
      </Menu>
    </div>
  );
}
