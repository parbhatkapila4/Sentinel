"use client";

import * as React from "react";
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
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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
    <div ref={menuRef} className="relative">
      <button
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
      {showMenu && !isExporting && (
        <div
          className="absolute right-0 top-full mt-2 min-w-[120px] rounded-xl overflow-hidden z-50 py-1"
          style={{
            background: "rgba(20, 20, 20, 0.98)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          }}
        >
          {EXPORT_FORMATS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleExport(f.value)}
              className="w-full px-4 py-2 text-left text-sm text-[#8a8a8a] hover:bg-white/10 hover:text-white transition-colors"
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
