"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics-client";

const EXPORT_FORMATS = [
  { value: "pdf", label: "PDF", ext: "pdf" },
  { value: "csv", label: "CSV", ext: "csv" },
  { value: "json", label: "JSON", ext: "json" },
] as const;

type ExportFormat = (typeof EXPORT_FORMATS)[number]["value"];

interface ExportButtonProps {
  className?: string;
  teamId?: string | null;
  includeTeamDeals?: boolean;
}

export function ExportButton({
  className,
  teamId,
  includeTeamDeals,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; left: number } | null>(null);

  React.useLayoutEffect(() => {
    if (!showMenu || !triggerRef.current) {
      if (!showMenu) setMenuPosition(null);
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 120;
    setMenuPosition({
      top: rect.bottom + 8,
      left: rect.right - menuWidth,
    });
  }, [showMenu]);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async (format: ExportFormat) => {
    setShowMenu(false);
    setIsExporting(true);
    try {
      const params = new URLSearchParams({ format });
      if (teamId) params.set("teamId", teamId);
      if (includeTeamDeals) params.set("includeTeamDeals", "true");

      const response = await fetch(`/api/deals/export?${params.toString()}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to export deals");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      const ext =
        EXPORT_FORMATS.find((f) => f.value === format)?.ext ?? format;
      let filename = `deals-export-${new Date().toISOString().split("T")[0]}.${ext}`;
      const match = disposition?.match(/filename="?([^";\n]+)"?/);
      if (match) filename = match[1];

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      trackEvent(ANALYTICS_EVENTS.DEAL_EXPORTED, { format });
    } catch (error) {
      console.error("Error exporting deals:", error);
      alert(error instanceof Error ? error.message : "Failed to export deals. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          ref={triggerRef}
          onClick={() => setShowMenu(!showMenu)}
          disabled={isExporting}
          className={className}
          aria-label="Export deals"
          aria-expanded={showMenu}
          aria-haspopup="true"
        >
        {isExporting ? (
          <>
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Exporting...
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Export
            <svg
              className={`w-4 h-4 transition-transform ${showMenu ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
        </button>
      </div>
      {typeof document !== "undefined" &&
        showMenu &&
        !isExporting &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Export format"
            className="fixed min-w-[120px] rounded-lg overflow-hidden py-1 bg-[#0a0a0a] border border-white/10 shadow-xl z-9999"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
            }}
          >
            {EXPORT_FORMATS.map((f) => (
              <button
                key={f.value}
                role="menuitem"
                onClick={() => handleExport(f.value)}
                className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/6 hover:text-white transition-colors"
              >
                {f.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
