"use client";

import { useState } from "react";

export function ReportActions() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/reports/export");
      if (!response.ok) {
        throw new Error("Failed to export PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pipeline-report-${new Date().toISOString().split("T")[0]
        }.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={handleExportPDF}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[#8a8a8a] hover:text-white transition-colors bg-[#131313] border border-[#1f1f1f] disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
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
            Export PDF
          </>
        )}
      </button>
    </div>
  );
}
