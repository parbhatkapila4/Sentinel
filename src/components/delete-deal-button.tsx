"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { deleteDeal } from "@/app/actions/deals";
import { getFocusableElements, trapFocus } from "@/lib/a11y";

interface DeleteDealButtonProps {
  dealId: string;
  dealName: string;
  variant?: "button" | "link";
  redirectTo?: string;
  className?: string;
  children?: React.ReactNode;
}

export function DeleteDealButton({
  dealId,
  dealName,
  variant = "button",
  redirectTo = "/dashboard",
  className = "",
  children,
}: DeleteDealButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  function closeModal() {
    if (!loading) {
      setOpen(false);
      setError(null);
      triggerRef.current?.focus();
    }
  }

  async function handleDelete() {
    setError(null);
    setLoading(true);
    try {
      await deleteDeal(dealId);
      setOpen(false);
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      console.error("Failed to delete deal:", err);
      const message = err instanceof Error ? err.message : "Failed to delete deal. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const trigger =
    children ??
    (variant === "link" ? (
      <span className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium cursor-pointer">
        Delete
      </span>
    ) : (
      <span className="flex items-center gap-2">
        {loading ? (
          "Deleting…"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete deal
          </>
        )}
      </span>
    ));

  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const first = getFocusableElements(dialogRef.current)[0];
    first?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
        return;
      }
      if (dialogRef.current && trapFocus(e, dialogRef.current)) {
        e.stopPropagation();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, loading]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        aria-label={`Delete deal ${dealName}`}
        className={
          variant === "link"
            ? `inline-block ${className}`.trim()
            : `inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-colors disabled:opacity-50 ${className}`.trim()
        }
      >
        {trigger}
      </button>
      {open && mounted && typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-deal-title"
          >
            <div
              ref={dialogRef}
              className="rounded-2xl border border-white/10 bg-[#0a0a0b] p-6 max-w-md w-full shadow-xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                id="delete-deal-title"
                className="text-lg font-semibold text-white mb-2"
              >
                Delete deal?
              </h2>
              <p className="text-white/60 text-sm mb-6">
                &quot;{dealName}&quot; will be permanently deleted. This cannot be
                undone.
              </p>
              {error && (
                <p className="text-red-400 text-sm mb-4" role="alert">
                  {error}
                </p>
              )}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50"
                >
                  {loading ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
