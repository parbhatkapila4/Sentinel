"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { formatRiskLevel } from "@/lib/dealRisk";
import { STAGE_FORM_OPTIONS } from "@/lib/config";
import { DeleteDealButton } from "@/components/delete-deal-button";

export type DealTableRow = {
  id: string;
  name: string;
  value: number;
  stage: string;
  status?: string;
  riskScore: number;
  assignedTo: { id: string; name: string | null; surname: string | null } | null;
  recommendedAction?: { label: string } | null;
  lastActivityAt: Date;
  isDemo?: boolean;
};

interface DealsTableProps {
  deals: DealTableRow[];
}

function fmtCurrency(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatStageLabel(stage: string) {
  return stage
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function riskTone(level: string, status?: string): { color: string; label: string } {
  if (status === "closed") return { color: "var(--cream-3)", label: "CLOSED" };
  if (level === "High") return { color: "var(--wine)", label: "HIGH RISK" };
  if (level === "Medium") return { color: "var(--copper)", label: "MEDIUM" };
  return { color: "var(--ivy)", label: "HEALTHY" };
}

export function DealsTable({ deals }: DealsTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [showStagePicker, setShowStagePicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const stagePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showStagePicker) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (
        stagePickerRef.current &&
        !stagePickerRef.current.contains(e.target as Node)
      ) {
        setShowStagePicker(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [showStagePicker]);

  const selectable = deals.filter((d) => !d.isDemo);
  const selectableIds = new Set(selectable.map((d) => d.id));
  const allSelected =
    selectable.length > 0 && selectable.every((d) => selectedIds.has(d.id));

  const toggle = (id: string) => {
    if (!selectableIds.has(id)) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(selectableIds));
  };

  const handleBulkStage = async (stage: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setIsBulkLoading(true);
    setShowStagePicker(false);
    try {
      const res = await fetch("/api/deals/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", dealIds: ids, updates: { stage } }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: { updated: number; failed: number; errors?: string[] };
        error?: string;
      };
      if (!res.ok) throw new Error(json.error || "Bulk update failed");
      const result = json.data;
      if (result) {
        if (result.updated > 0) {
          toast.success(
            `Updated ${result.updated} deal${result.updated === 1 ? "" : "s"} to ${formatStageLabel(stage)}`
          );
        }
        if (result.failed > 0 && result.errors?.length) {
          toast.error(`${result.failed} failed: ${result.errors.slice(0, 2).join("; ")}`);
        }
      }
      setSelectedIds(new Set());
      router.refresh();
    } catch (err) {
      console.error("Bulk update error:", err);
      toast.error(err instanceof Error ? err.message : "Bulk update failed");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setIsBulkLoading(true);
    setShowDeleteConfirm(false);
    try {
      const res = await fetch("/api/deals/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", dealIds: ids }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        data?: { deleted: number; failed: number; errors?: string[] };
        error?: string;
      };
      if (!res.ok) throw new Error(json.error || "Bulk delete failed");
      const result = json.data;
      if (result) {
        if (result.deleted > 0) {
          toast.success(`Deleted ${result.deleted} deal${result.deleted === 1 ? "" : "s"}`);
        }
        if (result.failed > 0 && result.errors?.length) {
          toast.error(`${result.failed} failed: ${result.errors.slice(0, 2).join("; ")}`);
        }
      }
      setSelectedIds(new Set());
      router.refresh();
    } catch (err) {
      console.error("Bulk delete error:", err);
      toast.error(err instanceof Error ? err.message : "Bulk delete failed");
    } finally {
      setIsBulkLoading(false);
    }
  };

  if (deals.length === 0) {
    return <DealsEmptyState />;
  }

  return (
    <>
      {selectedIds.size > 0 && (
        <div
          className="flex flex-wrap items-center"
          style={{
            gap: 14,
            padding: "12px 16px",
            margin: "16px 0",
            background: "var(--ink-02)",
            border: "1px solid var(--rule-strong)",
            borderLeft: "2px solid var(--signal)",
          }}
        >
          <span
            className="tabular"
            style={{
              fontFamily: "var(--font-mono-jb)",
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--signal)",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            {selectedIds.size} SELECTED
          </span>

          <div className="relative" ref={stagePickerRef}>
            <button
              type="button"
              onClick={() => setShowStagePicker((s) => !s)}
              disabled={isBulkLoading}
              className="inline-flex items-center"
              style={{
                gap: 8,
                padding: "6px 12px",
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--cream)",
                background: "var(--ink-03)",
                border: "1px solid var(--rule-strong)",
                cursor: isBulkLoading ? "not-allowed" : "pointer",
                opacity: isBulkLoading ? 0.55 : 1,
              }}
            >
              Advance stage
              <span style={{ fontSize: 10 }}>{showStagePicker ? "▲" : "▼"}</span>
            </button>
            {showStagePicker && (
              <div
                role="menu"
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  minWidth: 200,
                  background: "var(--ink-02)",
                  border: "1px solid var(--rule-strong)",
                  padding: 4,
                  zIndex: 30,
                }}
              >
                {STAGE_FORM_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    role="menuitem"
                    disabled={isBulkLoading}
                    onClick={() => handleBulkStage(s.value)}
                    className="block w-full text-left"
                    style={{
                      padding: "8px 12px",
                      fontFamily: "var(--font-mono-jb)",
                      fontSize: 11,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--cream-2)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isBulkLoading}
            style={{
              padding: "6px 12px",
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--wine)",
              background: "rgba(139,58,58,0.06)",
              border: "1px solid var(--wine)",
              cursor: isBulkLoading ? "not-allowed" : "pointer",
              opacity: isBulkLoading ? 0.55 : 1,
            }}
          >
            Delete selected
          </button>

          <div className="flex-1" />

          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            disabled={isBulkLoading}
            style={{
              padding: "6px 10px",
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--cream-3)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>
      )}

      {showDeleteConfirm && (
        <BulkDeleteDialog
          count={selectedIds.size}
          loading={isBulkLoading}
          onCancel={() => !isBulkLoading && setShowDeleteConfirm(false)}
          onConfirm={handleBulkDelete}
        />
      )}

      <div
        className="hidden md:block"
        style={{
          overflowX: "auto",
          marginTop: 20,
        }}
      >
        <table
          className="w-full"
          style={{
            borderCollapse: "collapse",
            minWidth: 820,
          }}
          aria-label="Deals pipeline"
        >
          <thead>
            <tr style={{ borderBottom: "1px solid var(--rule-strong)" }}>
              <th
                scope="col"
                style={{
                  width: 36,
                  padding: "12px 12px 12px 4px",
                  textAlign: "left",
                }}
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  disabled={selectable.length === 0}
                  aria-label="Select all deals"
                  className="sentinel-check"
                />
              </th>
              {["Deal", "Value", "Stage", "Status", "Assigned", "Next action", "Last activity"].map((h) => (
                <th
                  key={h}
                  scope="col"
                  style={{
                    padding: "12px 14px",
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    color: "var(--cream-3)",
                    textTransform: "uppercase",
                    textAlign: h === "Value" ? "right" : "left",
                  }}
                >
                  {h}
                </th>
              ))}
              <th aria-label="Row actions" style={{ width: 140 }} />
            </tr>
          </thead>
          <tbody>
            {deals.map((deal, i) => {
              const riskLevel = formatRiskLevel(deal.riskScore);
              const tone = riskTone(riskLevel, deal.status);
              const canSelect = selectableIds.has(deal.id);
              const isSelected = selectedIds.has(deal.id);
              return (
                <tr
                  key={deal.id}
                  className="anim-rise"
                  style={{
                    animationDelay: `${Math.min(i * 30, 360)}ms`,
                    borderBottom: "1px solid var(--rule)",
                    background: isSelected
                      ? "rgba(200,71,46,0.04)"
                      : "transparent",
                  }}
                >
                  <td style={{ padding: "14px 12px 14px 4px" }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(deal.id)}
                      disabled={!canSelect}
                      aria-label={`Select ${deal.name}`}
                      className="sentinel-check"
                    />
                  </td>
                  <td style={{ padding: "14px" }}>
                    <Link
                      href={`/deals/${deal.id}`}
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 17,
                        color: "var(--cream)",
                        lineHeight: 1.25,
                      }}
                    >
                      {deal.name}
                    </Link>
                    {deal.isDemo && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontFamily: "var(--font-mono-jb)",
                          fontSize: 9,
                          letterSpacing: "0.16em",
                          color: "var(--copper)",
                          border: "1px solid var(--copper)",
                          padding: "1px 5px",
                          verticalAlign: "middle",
                        }}
                      >
                        DEMO
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "14px",
                      textAlign: "right",
                    }}
                  >
                    <span
                      className="tabular"
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 17,
                        color: "var(--cream)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {fmtCurrency(deal.value)}
                    </span>
                  </td>
                  <td style={{ padding: "14px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        color: "var(--cream-2)",
                        textTransform: "uppercase",
                      }}
                    >
                      {formatStageLabel(deal.stage)}
                    </span>
                  </td>
                  <td style={{ padding: "14px" }}>
                    <span
                      className="inline-flex items-center"
                      style={{
                        gap: 6,
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 9.5,
                        letterSpacing: "0.16em",
                        color: tone.color,
                        textTransform: "uppercase",
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          width: 6,
                          height: 6,
                          background: tone.color,
                        }}
                      />
                      {tone.label}
                    </span>
                  </td>
                  <td style={{ padding: "14px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-geist-sans)",
                        fontSize: 13,
                        color: "var(--cream-2)",
                      }}
                    >
                      {deal.assignedTo
                        ? [deal.assignedTo.name, deal.assignedTo.surname]
                          .filter(Boolean)
                          .join(" ") || "-"
                        : "-"}
                    </span>
                  </td>
                  <td style={{ padding: "14px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontStyle: deal.recommendedAction ? "italic" : "normal",
                        fontSize: 14,
                        color: deal.recommendedAction ? "var(--cream-2)" : "var(--cream-4)",
                        lineHeight: 1.35,
                      }}
                    >
                      {deal.recommendedAction?.label ?? "No action needed"}
                    </span>
                  </td>
                  <td style={{ padding: "14px" }}>
                    <span
                      className="tabular"
                      style={{
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        color: "var(--cream-3)",
                        textTransform: "uppercase",
                      }}
                    >
                      {formatDistanceToNow(new Date(deal.lastActivityAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </td>
                  <td style={{ padding: "14px", whiteSpace: "nowrap", textAlign: "right" }}>
                    <div className="inline-flex items-center" style={{ gap: 14 }}>
                      <Link
                        href={`/deals/${deal.id}`}
                        style={{
                          fontFamily: "var(--font-mono-jb)",
                          fontSize: 10.5,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "var(--signal)",
                        }}
                      >
                        View →
                      </Link>
                      {!deal.isDemo && (
                        <DeleteDealButton
                          dealId={deal.id}
                          dealName={deal.name}
                          variant="link"
                          redirectTo="/deals"
                          className="sentinel-editorial-link-danger"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden" style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {deals.map((deal, i) => {
          const riskLevel = formatRiskLevel(deal.riskScore);
          const tone = riskTone(riskLevel, deal.status);
          return (
            <Link
              key={deal.id}
              href={`/deals/${deal.id}`}
              className="anim-rise"
              style={{
                animationDelay: `${Math.min(i * 30, 360)}ms`,
                display: "block",
                background: "var(--ink-02)",
                border: "1px solid var(--rule)",
                padding: "14px 16px",
              }}
            >
              <div className="flex items-baseline justify-between" style={{ gap: 12 }}>
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 18,
                    color: "var(--cream)",
                    lineHeight: 1.25,
                  }}
                >
                  {deal.name}
                </span>
                <span
                  className="tabular"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 17,
                    color: "var(--cream)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {fmtCurrency(deal.value)}
                </span>
              </div>
              <div
                className="flex flex-wrap"
                style={{
                  marginTop: 8,
                  gap: 12,
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 9.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--cream-3)",
                }}
              >
                <span>{formatStageLabel(deal.stage)}</span>
                <span style={{ color: tone.color }}>● {tone.label}</span>
                <span>
                  {formatDistanceToNow(new Date(deal.lastActivityAt), { addSuffix: true })}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function DealsEmptyState() {
  return (
    <div
      className="flex flex-col items-center text-center"
      style={{
        gap: 14,
        padding: "80px 24px",
      }}
      role="status"
    >
      <span
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.22em",
          color: "var(--signal)",
          textTransform: "uppercase",
        }}
      >
        The Desk Is Empty
      </span>
      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 40,
          lineHeight: 1,
          color: "var(--cream)",
          letterSpacing: "-0.02em",
          maxWidth: 520,
        }}
      >
        No deals{" "}
        <em
          style={{
            fontStyle: "italic",
            color: "var(--signal)",
            fontFamily: "var(--font-serif)",
          }}
        >
          to read.
        </em>
      </h3>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: "var(--cream-2)",
          maxWidth: 440,
          marginTop: 4,
        }}
      >
        Connect a CRM or add a deal manually and the wire will start populating with
        everything worth watching this morning.
      </p>
      <div className="flex flex-wrap justify-center" style={{ gap: 10, marginTop: 10 }}>
        <Link
          href="/deals/new"
          style={{
            padding: "9px 16px",
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--cream)",
            background: "var(--signal)",
            border: "1px solid var(--signal)",
          }}
        >
          → Create a deal
        </Link>
        <Link
          href="/settings?tab=integrations"
          style={{
            padding: "9px 16px",
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--cream-2)",
            background: "var(--ink-02)",
            border: "1px solid var(--rule-strong)",
          }}
        >
          Connect a CRM
        </Link>
      </div>
    </div>
  );
}

function BulkDeleteDialog({
  count,
  loading,
  onCancel,
  onConfirm,
}: {
  count: number;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sentinel-bulk-delete-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "grid",
        placeItems: "center",
        background: "rgba(10,8,6,0.72)",
        backdropFilter: "blur(4px)",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--ink-02)",
          border: "1px solid var(--rule-strong)",
          padding: 26,
          maxWidth: 440,
          width: "100%",
          position: "relative",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: "0 0 auto 0",
            height: 2,
            background: "var(--wine)",
          }}
        />
        <div
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "var(--wine)",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Irreversible action
        </div>
        <h2
          id="sentinel-bulk-delete-title"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 24,
            color: "var(--cream)",
            letterSpacing: "-0.01em",
            marginBottom: 10,
          }}
        >
          Delete {count}{" "}
          <em
            style={{
              fontStyle: "italic",
              color: "var(--signal)",
              fontFamily: "var(--font-serif)",
            }}
          >
            deal{count === 1 ? "" : "s"}?
          </em>
        </h2>
        <p
          style={{
            fontSize: 13.5,
            color: "var(--cream-2)",
            lineHeight: 1.6,
            marginBottom: 20,
          }}
        >
          All selected deals, their timeline, and any associated actions will be
          permanently removed. This cannot be undone.
        </p>
        <div className="flex" style={{ gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "8px 14px",
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--cream-2)",
              background: "transparent",
              border: "1px solid var(--rule-strong)",
              cursor: "pointer",
              opacity: loading ? 0.55 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "8px 14px",
              fontFamily: "var(--font-mono-jb)",
              fontSize: 10.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--cream)",
              background: "var(--wine)",
              border: "1px solid var(--wine)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.55 : 1,
            }}
          >
            {loading ? "Deleting…" : "Delete all"}
          </button>
        </div>
      </div>
    </div>
  );
}
