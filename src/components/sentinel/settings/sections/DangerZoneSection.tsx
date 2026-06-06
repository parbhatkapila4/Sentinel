"use client";

import type { ReactNode } from "react";
import { toast } from "sonner";
import { EditorialButton, SerifEm } from "../primitives";

export function DangerZoneSection({ onRequestDelete }: { onRequestDelete: () => void }) {
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
        title="Export all data"
        subtitle="Download everything - deals, calls, emails, signals, insights - as a zipped archive. Takes a few minutes."
      >
        <EditorialButton
          type="button"
          onClick={() =>
            toast.message(
              "Export request queued - we'll email you when the archive is ready."
            )
          }
        >
          Request export
        </EditorialButton>
      </DangerRow>

      <DangerRow
        title="Transfer ownership"
        subtitle="Hand the account to another admin. You'll become a Manager until they confirm."
      >
        <EditorialButton
          type="button"
          onClick={() =>
            toast.message(
              "Ownership transfer is handled in the team detail view."
            )
          }
        >
          Transfer
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
