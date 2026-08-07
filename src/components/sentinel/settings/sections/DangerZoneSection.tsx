"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EditorialButton, SerifEm } from "../primitives";

type ExportFormat = "csv" | "json";

export function DangerZoneSection({ onRequestDelete }: { onRequestDelete: () => void }) {
  const router = useRouter();
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  async function handleExport(format: ExportFormat) {
    setExporting(format);
    try {
      const response = await fetch(`/api/deals/export?format=${format}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Export failed");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="?([^";\n]+)"?/);
      const filename =
        match?.[1] ??
        `deals-export-${new Date().toISOString().split("T")[0]}.${format}`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Exported ${filename}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to export deals"
      );
    } finally {
      setExporting(null);
    }
  }

  return (
    <section
      id="settings-danger"
      style={{
        marginTop: 48,
        padding: 24,
        background: "rgba(139, 58, 58, 0.04)",
        border: "1px solid var(--wine)",
        position: "relative",
        scrollMarginTop: 64,
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: -1,
          left: 20,
          width: 42,
          height: 2,
          background: "var(--wine)",
        }}
      />
      <div
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--wine)",
          marginBottom: 16,
        }}
      >
        § † - DANGER ZONE · IRREVERSIBLE
      </div>

      <DangerRow
        title="Export your deals"
        subtitle="Downloads your deals - name, stage, value, owner, risk score and activity dates. Timeline events, emails and Slack messages are not included in this export."
      >
        <div style={{ display: "flex", gap: 8 }}>
          <EditorialButton
            type="button"
            disabled={exporting !== null}
            onClick={() => handleExport("csv")}
          >
            {exporting === "csv" ? "Exporting…" : "CSV"}
          </EditorialButton>
          <EditorialButton
            type="button"
            disabled={exporting !== null}
            onClick={() => handleExport("json")}
          >
            {exporting === "json" ? "Exporting…" : "JSON"}
          </EditorialButton>
        </div>
      </DangerRow>

      <DangerRow
        title="Transfer team ownership"
        subtitle="Owners can hand a team to another member from that team's detail page - open the member's role menu and choose Make owner. You become an admin; they become the owner."
      >
        <EditorialButton type="button" onClick={() => router.push("/settings/team")}>
          Open teams
        </EditorialButton>
      </DangerRow>

      <DangerRow
        title={<span style={{ color: "var(--wine)" }}>Delete account</span>}
        subtitle={
          <>
            Permanently delete your account and all data.{" "}
            <SerifEm>This cannot be undone</SerifEm> - no restores, no grace
            period, no second chances.
          </>
        }
        last
      >
        <EditorialButton type="button" variant="danger" onClick={onRequestDelete}>
          Delete account
        </EditorialButton>
      </DangerRow>
    </section>
  );
}

function DangerRow({
  title,
  subtitle,
  children,
  last,
}: {
  title: ReactNode;
  subtitle: ReactNode;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        alignItems: "center",
        gap: 20,
        padding: "18px 0",
        borderBottom: last ? "none" : "1px solid rgba(139, 58, 58, 0.2)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 14.5,
            color: "var(--cream)",
            fontWeight: 500,
            letterSpacing: "-0.005em",
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: "var(--cream-2)",
            lineHeight: 1.5,
            maxWidth: 560,
          }}
        >
          {subtitle}
        </div>
      </div>
      <div style={{ justifySelf: "end" }}>{children}</div>
    </div>
  );
}
