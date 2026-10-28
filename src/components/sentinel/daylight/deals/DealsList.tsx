"use client";

import {
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { deleteDeal } from "@/app/actions/deals";
import { ConfirmDialog } from "../ConfirmDialog";
import { fullCurrency } from "../format";
import { BulkBar } from "./BulkBar";
import { DealCards } from "./DealCards";
import { DealsTable } from "./DealsTable";
import { ListBar } from "./ListBar";
import { ListEmpty, ListNoMatch } from "./ListEmpty";
import {
  stageLabel,
  type DealRow,
  type DealsFilter,
  type DealsScope,
} from "./model";

interface DealsListProps {
  deals: DealRow[];
  filter: DealsFilter;
  scope: DealsScope;
  search: string;
  counts: Record<DealsFilter, number>;
  totalInScope: number;
  unavailable: boolean;
  nowMs: number;
}

type Dialog =
  | { kind: "row"; deal: DealRow; host: Element; trigger: HTMLElement | null }
  | { kind: "bulk"; host: Element; trigger: HTMLElement | null };

interface BulkResponse {
  data?: {
    updated?: number;
    deleted?: number;
    failed: number;
    errors?: string[];
  };
  error?: string;
}

const SEARCH_DEBOUNCE_MS = 280;

function plural(count: number): string {
  return `${count.toLocaleString("en-US")} deal${count === 1 ? "" : "s"}`;
}

async function postBulk(body: Record<string, unknown>): Promise<BulkResponse> {
  const res = await fetch("/api/deals/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as BulkResponse;
  if (!res.ok) throw new Error(json.error || "Bulk action failed");
  return json;
}

function reportFailures(result: BulkResponse["data"]) {
  if (result && result.failed > 0 && result.errors?.length) {
    toast.error(
      `${result.failed} failed: ${result.errors.slice(0, 2).join("; ")}`
    );
  }
}

export function DealsList({
  deals,
  filter,
  scope,
  search,
  counts,
  totalInScope,
  unavailable,
  nowMs,
}: DealsListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sectionRef = useRef<HTMLElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPending, startTransition] = useTransition();
  const [view, setView] = useOptimistic({ filter, scope });
  const [draft, setDraft] = useState(search);
  const [typing, setTyping] = useState(false);
  const [seenSearch, setSeenSearch] = useState(search);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);

  if (seenSearch !== search) {
    setSeenSearch(search);
    if (!typing && !isPending && search !== draft.trim()) setDraft(search);
  }

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const selectable = useMemo(() => deals.filter((d) => !d.isDemo), [deals]);
  const selected = useMemo(
    () => selectable.filter((d) => selectedIds.has(d.id)),
    [selectable, selectedIds]
  );
  const visibleSelection = useMemo(
    () => new Set(selected.map((d) => d.id)),
    [selected]
  );
  const allSelected =
    selectable.length > 0 && selected.length === selectable.length;
  const selectedValue = selected.reduce((sum, d) => sum + d.value, 0);
  const shownValue = deals.reduce((sum, d) => sum + d.value, 0);

  const navigate = (next: {
    filter?: DealsFilter;
    scope?: DealsScope;
    search?: string;
  }) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setTyping(false);

    const nextFilter = next.filter ?? view.filter;
    const nextScope = next.scope ?? view.scope;
    const nextSearch = (next.search ?? draft).trim();
    const params = new URLSearchParams(searchParams.toString());
    if (nextFilter === "all") params.delete("filter");
    else params.set("filter", nextFilter);
    if (nextScope === "my") params.delete("scope");
    else params.set("scope", nextScope);
    if (nextSearch) params.set("search", nextSearch);
    else params.delete("search");

    const qs = params.toString();
    if (qs === searchParams.toString()) return;

    setSelectedIds(new Set());
    startTransition(() => {
      setView({ filter: nextFilter, scope: nextScope });
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
    });
  };

  const onQuery = (value: string) => {
    setDraft(value);
    setTyping(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      navigate({ search: value });
    }, SEARCH_DEBOUNCE_MS);
  };

  const reset = () => {
    setDraft("");
    navigate({ filter: "all", search: "" });
  };

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds(
      allSelected ? new Set() : new Set(selectable.map((d) => d.id))
    );
  };

  const openDialog = (
    next:
      | { kind: "row"; deal: DealRow; trigger: HTMLElement | null }
      | { kind: "bulk"; trigger: HTMLElement | null }
  ) => {
    const host = sectionRef.current?.closest(".sentinel-daylight");
    if (!host) return;
    setDialogError(null);
    setDialog({ ...next, host });
  };

  const closeDialog = () => {
    if (!busy) setDialog(null);
  };

  const moveSelected = async (stage: string) => {
    const ids = selected.map((d) => d.id);
    if (ids.length === 0) return;
    setBusy(true);
    try {
      const { data } = await postBulk({
        action: "update",
        dealIds: ids,
        updates: { stage },
      });
      if (data?.updated) {
        toast.success(`Updated ${plural(data.updated)} to ${stageLabel(stage)}`);
      }
      reportFailures(data);
      setSelectedIds(new Set());
      router.refresh();
    } catch (err) {
      console.error("Bulk update error:", err);
      toast.error(err instanceof Error ? err.message : "Bulk update failed");
    } finally {
      setBusy(false);
    }
  };

  const deleteSelected = async () => {
    const ids = selected.map((d) => d.id);
    if (ids.length === 0) return;
    setBusy(true);
    setDialogError(null);
    try {
      const { data } = await postBulk({ action: "delete", dealIds: ids });
      if (data?.deleted) toast.success(`Deleted ${plural(data.deleted)}`);
      reportFailures(data);
      setDialog(null);
      setSelectedIds(new Set());
      router.refresh();
    } catch (err) {
      console.error("Bulk delete error:", err);
      setDialogError(err instanceof Error ? err.message : "Bulk delete failed");
    } finally {
      setBusy(false);
    }
  };

  const deleteOne = async (deal: DealRow) => {
    setBusy(true);
    setDialogError(null);
    try {
      await deleteDeal(deal.id);
      toast.success(`Deleted ${deal.name}`);
      setDialog(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deal.id);
        return next;
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to delete deal:", err);
      setDialogError(
        err instanceof Error
          ? err.message
          : "Failed to delete deal. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section ref={sectionRef} aria-label="Deals list" className="dl-fill">
      <ListBar
        filter={view.filter}
        scope={view.scope}
        counts={counts}
        query={draft}
        onFilter={(next) => navigate({ filter: next })}
        onScope={(next) => navigate({ scope: next })}
        onQuery={onQuery}
      />

      {deals.length === 0 ? (
        totalInScope === 0 ? (
          <ListEmpty unavailable={unavailable} />
        ) : (
          <ListNoMatch onReset={reset} />
        )
      ) : (
        <div
          aria-busy={isPending}
          className="dl-fill"
          style={{
            opacity: isPending ? 0.55 : 1,
            transition: "opacity 160ms ease",
          }}
        >
          <DealsTable
            deals={deals}
            nowMs={nowMs}
            selectedIds={visibleSelection}
            allSelected={allSelected}
            canSelectAny={selectable.length > 0}
            onToggle={toggle}
            onToggleAll={toggleAll}
            onDelete={(deal, trigger) =>
              openDialog({ kind: "row", deal, trigger })
            }
          />
          <DealCards deals={deals} nowMs={nowMs} />
        </div>
      )}

      <div
        className="flex flex-wrap items-center justify-between"
        style={{
          gap: "4px 16px",
          minHeight: 44,
          padding: "8px var(--dl-gutter)",
          background: "var(--dl-tint)",
          borderTop: "1px solid var(--dl-divider)",
          borderBottom: "1px solid var(--dl-divider)",
          fontSize: 13,
          color: "var(--dl-muted)",
        }}
      >
        <span>
          Showing {deals.length.toLocaleString("en-US")} of{" "}
          {totalInScope.toLocaleString("en-US")}
          {deals.length > 1 && (
            <span className="dl-wide-only">, sorted by urgency, then risk</span>
          )}
        </span>
        <span>
          <strong
            style={{
              fontWeight: 600,
              color: "var(--dl-ink)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {fullCurrency(shownValue)}
          </strong>{" "}
          {deals.length === totalInScope ? "on the book" : "in this view"}
        </span>
      </div>

      {selected.length > 0 && (
        <BulkBar
          count={selected.length}
          value={selectedValue}
          busy={busy}
          onMove={moveSelected}
          onDelete={(trigger) => openDialog({ kind: "bulk", trigger })}
          onClear={() => setSelectedIds(new Set())}
        />
      )}

      {dialog?.kind === "row" && (
        <ConfirmDialog
          host={dialog.host}
          kicker="Delete deal"
          title={
            <>
              Delete{" "}
              <em style={{ fontStyle: "italic", color: "var(--dl-signal)" }}>
                {dialog.deal.name}
              </em>
              ?
            </>
          }
          body="The deal goes, along with its timeline, events and risk history. This cannot be undone."
          requireText="DELETE"
          confirmLabel="Delete deal"
          busyLabel="Deleting"
          busy={busy}
          error={dialogError}
          returnFocus={dialog.trigger}
          onConfirm={() => deleteOne(dialog.deal)}
          onCancel={closeDialog}
        />
      )}

      {dialog?.kind === "bulk" && (
        <ConfirmDialog
          host={dialog.host}
          kicker="Delete deals"
          title={
            <>
              Delete{" "}
              <em style={{ fontStyle: "italic", color: "var(--dl-signal)" }}>
                {plural(selected.length)}
              </em>
              ?
            </>
          }
          body="All selected deals, their timeline, and any associated actions will be permanently removed. This cannot be undone."
          confirmLabel={`Delete ${plural(selected.length)}`}
          busyLabel="Deleting"
          busy={busy}
          error={dialogError}
          returnFocus={dialog.trigger}
          onConfirm={deleteSelected}
          onCancel={closeDialog}
        />
      )}
    </section>
  );
}
