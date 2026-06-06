"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [confirmText, setConfirmText] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const closeModal = useCallback(() => {
    if (!loading) {
      setOpen(false);
      setError(null);
      setConfirmText("");
      triggerRef.current?.focus();
    }
  }, [loading]);

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
  }, [open, loading, closeModal]);

  const triggerLinkStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono-jb)",
    fontSize: 10.5,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--wine)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
  };

  const triggerButtonStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono-jb)",
    fontSize: 10.5,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    padding: "9px 18px",
    border: "1px solid var(--wine)",
    background: "transparent",
    color: "var(--wine)",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        aria-label={`Delete deal ${dealName}`}
        className={className}
        style={variant === "link" ? triggerLinkStyle : triggerButtonStyle}
      >
        {children ?? (loading ? "Deleting…" : "Delete deal")}
      </button>
      {open && mounted && typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-deal-title"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              background: "rgba(18, 18, 18, 0.72)",
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              ref={dialogRef}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 480,
                maxHeight: "calc(100vh - 32px)",
                overflowY: "auto",
                background: "var(--ink)",
                border: "1px solid var(--wine)",
                padding: "26px 24px 22px",
                boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.6)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--wine)",
                  marginBottom: 14,
                }}
              >
                § † - DELETE DEAL
              </div>
              <h2
                id="delete-deal-title"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 30,
                  fontWeight: 400,
                  color: "var(--cream)",
                  margin: "0 0 10px",
                  letterSpacing: "-0.02em",
                }}
              >
                Delete{" "}
                <em style={{ fontStyle: "italic", color: "var(--wine)" }}>
                  {dealName}
                </em>
                ?
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 14,
                  color: "var(--cream-2)",
                  margin: "0 0 20px",
                  lineHeight: 1.5,
                }}
              >
                This entry will be struck from the book. Timeline, events and risk history go with it. This cannot be undone.
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--cream-3)",
                  margin: "0 0 8px",
                }}
              >
                Type <span style={{ color: "var(--wine)" }}>DELETE</span> to confirm
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                autoFocus
                disabled={loading}
                style={{
                  width: "100%",
                  fontFamily: "var(--font-mono-jb)",
                  fontSize: 13,
                  letterSpacing: "0.1em",
                  padding: "12px 14px",
                  background: "var(--ink-02)",
                  border: "1px solid var(--rule-strong)",
                  color: "var(--cream)",
                  outline: "none",
                }}
                placeholder="DELETE"
              />
              {error && (
                <p
                  role="alert"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontSize: 14,
                    color: "var(--wine)",
                    margin: "14px 0 0",
                  }}
                >
                  {error}
                </p>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                  marginTop: 24,
                  paddingTop: 18,
                  borderTop: "1px solid var(--rule)",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 10.5,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding: "9px 18px",
                    border: "1px solid var(--rule-strong)",
                    background: "transparent",
                    color: "var(--cream-2)",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.55 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading || confirmText !== "DELETE"}
                  style={{
                    fontFamily: "var(--font-mono-jb)",
                    fontSize: 10.5,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding: "9px 18px",
                    border: "1px solid var(--wine)",
                    background: "var(--wine)",
                    color: "var(--cream)",
                    cursor:
                      loading || confirmText !== "DELETE" ? "not-allowed" : "pointer",
                    opacity: loading || confirmText !== "DELETE" ? 0.55 : 1,
                  }}
                >
                  {loading ? "Deleting…" : "Delete deal"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
