"use client";

import { useState } from "react";
import { toast } from "sonner";
import { primaryButtonStyle } from "../blocks";

export function ExportPdfButton() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch("/api/reports/export");
      if (!response.ok) throw new Error("Failed to export PDF");
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
      toast.error("The PDF could not be made. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={exporting}
      aria-busy={exporting}
      className="dl-btn-primary"
      style={{
        ...primaryButtonStyle,
        paddingLeft: 12,
        opacity: exporting ? 0.7 : 1,
        cursor: exporting ? "wait" : "pointer",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width={15}
        height={15}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
      </svg>
      {exporting ? "Exporting PDF" : "Export PDF"}
    </button>
  );
}
