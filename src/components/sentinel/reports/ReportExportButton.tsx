"use client";

import { useState } from "react";

export function ReportExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
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
      a.download = `pipeline-report-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center"
      style={{
        gap: 10,
        padding: "10px 16px",
        background: isExporting ? "var(--ink-02)" : "var(--cream)",
        color: isExporting ? "var(--cream-3)" : "var(--ink)",
        border: "1px solid var(--cream)",
        fontFamily: "var(--font-mono-jb)",
        fontSize: 11,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        cursor: isExporting ? "wait" : "pointer",
        transition: "background 120ms ease, color 120ms ease",
      }}
    >
      {isExporting ? (
        <>
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              background: "var(--copper)",
              display: "inline-block",
            }}
            className="animate-pulse"
          />
          Exporting…
        </>
      ) : (
        <>
          <span aria-hidden style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 16, lineHeight: 1, letterSpacing: 0 }}>
            ↓
          </span>
          Export PDF
        </>
      )}
    </button>
  );
}
