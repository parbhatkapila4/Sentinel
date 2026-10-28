"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  EXPORT_FORMATS,
  downloadDealsExport,
  type ExportFormat,
} from "@/components/export-button";
import { NavIcon } from "./nav";
import { Menu, MenuHeading, menuItemStyle, usePopover } from "./Popover";

interface ExportMenuProps {
  teamId: string | null;
  includeTeamDeals: boolean;
}

export function ExportMenu({ teamId, includeTeamDeals }: ExportMenuProps) {
  const { open, anchor, triggerRef, panelRef, toggle, close } = usePopover({
    side: "auto",
    align: "start",
  });
  const [busy, setBusy] = useState(false);

  const run = async (format: ExportFormat) => {
    close();
    setBusy(true);
    try {
      await downloadDealsExport(format, { teamId, includeTeamDeals });
    } catch (error) {
      console.error("Error exporting deals:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to export deals. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
        className="dl-btn-secondary"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          height: 36,
          padding: "0 11px 0 13px",
          borderRadius: 9,
          background: "var(--dl-panel)",
          border: "1px solid var(--dl-border-strong)",
          boxShadow: "var(--dl-shadow)",
          fontSize: 13.5,
          fontWeight: 500,
          color: "var(--dl-ink)",
          cursor: "pointer",
        }}
      >
        <NavIcon size={15} color="var(--dl-icon)" strokeWidth={1.7}>
          <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
        </NavIcon>
        {busy ? "Exporting" : "Export"}
        <NavIcon size={13} color="var(--dl-icon)" strokeWidth={2}>
          <path d="M6 9l6 6 6-6" />
        </NavIcon>
      </button>
      <Menu
        anchor={anchor}
        panelRef={panelRef}
        onClose={close}
        label="Export format"
        width={168}
      >
        <MenuHeading>Export as</MenuHeading>
        {EXPORT_FORMATS.map((format) => (
          <button
            key={format.value}
            type="button"
            role="menuitem"
            onClick={() => run(format.value)}
            className="dl-menu-item"
            style={menuItemStyle}
          >
            {format.label}
            <span
              aria-hidden
              style={{
                fontFamily: "var(--dl-font-mono)",
                fontSize: 11,
                color: "var(--dl-muted)",
              }}
            >
              .{format.ext}
            </span>
          </button>
        ))}
      </Menu>
    </>
  );
}
