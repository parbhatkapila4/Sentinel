"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatRiskLevel } from "@/lib/dealRisk";
import { formatDistanceToNow } from "date-fns";
import { DeleteDealButton } from "@/components/delete-deal-button";
import { STAGE_FORM_OPTIONS } from "@/lib/config";
import { toast } from "sonner";

export type DealRow = {
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

interface DealsTableWithBulkProps {
  deals: DealRow[];
} 

export function DealsTableWithBulk({ deals }: DealsTableWithBulkProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [showStagePicker, setShowStagePicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const stagePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        stagePickerRef.current &&
        !stagePickerRef.current.contains(e.target as Node)
      ) {
        setShowStagePicker(false);
      }
    }
    if (showStagePicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showStagePicker]);

  const selectableDeals = deals.filter((d) => !d.isDemo);
  const selectableIds = new Set(selectableDeals.map((d) => d.id));
  const allSelectableSelected =
    selectableDeals.length > 0 &&
    selectableDeals.every((d) => selectedIds.has(d.id));

  function toggleSelect(id: string) {
    if (!selectableIds.has(id)) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allSelectableSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableIds));
    }
  }

  async function handleBulkUpdateStage(stage: string) {
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
      const data = (await res.json()) as {
        success?: boolean;
        data?: { updated: number; failed: number; errors?: string[] };
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || "Bulk update failed");
      }

      const result = data.data;
      if (result) {
        if (result.updated > 0) {
          toast.success(`Updated ${result.updated} deal(s) to ${stage.replace(/_/g, " ")}`);
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
  }

  async function handleBulkDelete() {
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
      const data = (await res.json()) as {
        success?: boolean;
        data?: { deleted: number; failed: number; errors?: string[] };
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || "Bulk delete failed");
      }

      const result = data.data;
      if (result) {
        if (result.deleted > 0) {
          toast.success(`Deleted ${result.deleted} deal(s)`);
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
  }

  return (
    <>
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-3 mb-4 rounded-xl bg-[#151515] border border-[#1f1f1f] max-sm:flex-col max-sm:items-stretch max-sm:gap-2">
          <span className="text-sm text-white font-medium">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2">
            <div className="relative" ref={stagePickerRef}>
              <button
                onClick={() => setShowStagePicker(!showStagePicker)}
                disabled={isBulkLoading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-blue-600/80 hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                Bulk update stage
                <svg
                  className={`w-4 h-4 transition-transform ${showStagePicker ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showStagePicker && (
                <div
                  className="absolute top-full left-0 mt-2 w-48 rounded-xl overflow-hidden z-50 py-1"
                  style={{
                    background: "rgba(20, 20, 20, 0.98)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                  }}
                >
                  {STAGE_FORM_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => handleBulkUpdateStage(s.value)}
                      disabled={isBulkLoading}
                      className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isBulkLoading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors disabled:opacity-50"
            >
              Bulk delete
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              disabled={isBulkLoading}
              className="text-sm text-[#8a8a8a] hover:text-white"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => !isBulkLoading && setShowDeleteConfirm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-delete-title"
        >
          <div
            className="rounded-2xl border border-white/10 bg-[#0a0a0b] p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="bulk-delete-title" className="text-lg font-semibold text-white mb-2">
              Delete {selectedIds.size} deal(s)?
            </h2>
            <p className="text-white/60 text-sm mb-6">
              This action cannot be undone. All selected deals will be permanently
              deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isBulkLoading}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isBulkLoading}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {isBulkLoading ? "Deleting…" : "Delete all"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full min-w-[700px]" aria-label="Deals pipeline">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              <th scope="col" className="text-left px-3 sm:px-4 py-3 sm:py-4 w-10">
                <input
                  type="checkbox"
                  checked={allSelectableSelected}
                  onChange={toggleSelectAll}
                  disabled={selectableDeals.length === 0}
                  className="rounded border-[#3f3f3f] bg-[#151515] text-[#8b1a1a] focus:ring-[#8b1a1a]"
                  aria-label="Select all deals"
                />
              </th>
              <th scope="col" className="text-left text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-4 font-semibold text-white uppercase tracking-wider">
                Deal
              </th>
              <th scope="col" className="text-left text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-4 font-semibold text-white uppercase tracking-wider">
                Value
              </th>
              <th scope="col" className="text-left text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-4 font-semibold text-white uppercase tracking-wider">
                Stage
              </th>
              <th scope="col" className="text-left text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-4 font-semibold text-white uppercase tracking-wider">
                Risk
              </th>
              <th scope="col" className="text-left text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-4 font-semibold text-white uppercase tracking-wider">
                Assigned to
              </th>
              <th scope="col" className="text-left text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-4 font-semibold text-white uppercase tracking-wider">
                Next Action
              </th>
              <th scope="col" className="text-left text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-4 font-semibold text-white uppercase tracking-wider">
                Last Activity
              </th>
              <th scope="col" className="text-left text-xs sm:text-sm px-3 sm:px-4 py-3 sm:py-4 font-semibold text-white uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => {
              const riskLevel = formatRiskLevel(deal.riskScore);
              const canSelect = selectableIds.has(deal.id);
              return (
                <tr
                  key={deal.id}
                  className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#151515] transition-colors"
                >
                  <td className="py-3 sm:py-4 px-3 sm:px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(deal.id)}
                      onChange={() => toggleSelect(deal.id)}
                      disabled={!canSelect}
                      className="rounded border-[#3f3f3f] bg-[#151515] text-[#8b1a1a] focus:ring-[#8b1a1a] disabled:opacity-40"
                      aria-label={`Select ${deal.name}`}
                    />
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#151515] border border-[#1f1f1f] flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-[#8b1a1a]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-white">
                        {deal.name}
                      </span>
                      {deal.isDemo && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/20 text-blue-400 rounded">
                          DEMO
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4">
                    <span className="text-sm font-semibold text-white">
                      ${deal.value.toLocaleString("en-US")}
                    </span>
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4">
                    <span className="text-sm text-[#8a8a8a]">{deal.stage}</span>
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${deal.status === "closed"
                        ? "bg-white/10 text-white/70 border border-white/20"
                        : riskLevel === "High"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : riskLevel === "Medium"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                    >
                      {deal.status === "closed" ? "Closed" : riskLevel}
                    </span>
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4">
                    <span className="text-sm text-[#8a8a8a]">
                      {deal.assignedTo
                        ? [deal.assignedTo.name, deal.assignedTo.surname]
                          .filter(Boolean)
                          .join(" ") || "—"
                        : "—"}
                    </span>
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4">
                    <span className="text-sm text-[#8a8a8a]">
                      {deal.recommendedAction?.label || "No action needed"}
                    </span>
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4">
                    <span className="text-sm text-[#8a8a8a]">
                      {formatDistanceToNow(new Date(deal.lastActivityAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/deals/${deal.id}`}
                        className="text-sm text-[#8b1a1a] hover:text-[#6b0f0f] transition-colors font-medium"
                      >
                        View →
                      </Link>
                      {!deal.isDemo && (
                        <DeleteDealButton
                          dealId={deal.id}
                          dealName={deal.name}
                          variant="link"
                          redirectTo="/dashboard"
                          className="text-sm text-red-400 hover:text-red-300"
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

      <div className="sm:hidden space-y-3">
        {deals.map((deal) => {
          const riskLevel = formatRiskLevel(deal.riskScore);
          return (
            <Link
              key={deal.id}
              href={`/deals/${deal.id}`}
              className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/[0.07] transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white">{deal.name}</span>
                <span className="text-sm text-white/60">
                  ${deal.value.toLocaleString("en-US")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/50 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-white/10">
                  {deal.stage}
                </span>
                <span>—</span>
                {deal.isDemo && (
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/20 text-blue-400 rounded">
                    DEMO
                  </span>
                )}
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${deal.status === "closed"
                    ? "bg-white/10 text-white/70"
                    : riskLevel === "High"
                      ? "bg-red-500/20 text-red-400"
                      : riskLevel === "Medium"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}
                >
                  {deal.status === "closed" ? "Closed" : riskLevel}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
