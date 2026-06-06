"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateDealStage } from "@/app/actions/deals";
import { STAGES } from "@/lib/config";

interface StageSelectorProps {
  dealId: string;
  currentStage: string;
}

export function StageSelector({ dealId, currentStage }: StageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const stages = Object.values(STAGES);

  async function handleStageChange(newStage: string) {
    if (newStage === currentStage) {
      setIsOpen(false);
      return;
    }
    setIsOpen(false);
    setIsLoading(true);
    try {
      await updateDealStage(dealId, newStage);
      toast.success(`Stage changed to ${newStage.replace(/_/g, " ")}`);
      router.refresh();
    } catch (error) {
      console.error("Failed to update stage:", error);
      toast.error("Failed to update stage");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          justifyContent: "space-between",
          minWidth: 200,
          padding: "10px 14px",
          border: "1px solid var(--rule-strong)",
          background: "var(--ink-02)",
          color: "var(--cream)",
          fontFamily: "var(--font-serif)",
          fontSize: 15,
          cursor: isLoading ? "wait" : "pointer",
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        <span style={{ textTransform: "capitalize" }}>
          {isLoading
            ? "Updating…"
            : currentStage.replace(/_/g, " ")}
        </span>
        <span
          aria-hidden
          style={{
            fontFamily: "var(--font-mono-jb)",
            fontSize: 10,
            letterSpacing: "0.1em",
            color: "var(--cream-3)",
            transition: "transform 140ms ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <>
          <div
            aria-hidden
            onClick={() => setIsOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
          />
          <div
            role="listbox"
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              minWidth: 220,
              zIndex: 50,
              background: "var(--ink)",
              border: "1px solid var(--rule-strong)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            {stages.map((stage) => {
              const active = stage === currentStage;
              return (
                <button
                  key={stage}
                  onClick={() => handleStageChange(stage)}
                  disabled={isLoading}
                  role="option"
                  aria-selected={active}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "12px 16px",
                    border: "none",
                    borderBottom: "1px solid var(--rule)",
                    textAlign: "left",
                    background: active ? "rgba(200, 71, 46, 0.06)" : "transparent",
                    color: active ? "var(--signal)" : "var(--cream-2)",
                    fontFamily: "var(--font-serif)",
                    fontSize: 14,
                    fontStyle: active ? "italic" : "normal",
                    cursor: isLoading ? "wait" : "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  <span>{stage.replace(/_/g, " ")}</span>
                  {active && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono-jb)",
                        fontSize: 9,
                        letterSpacing: "0.18em",
                        color: "var(--signal)",
                        fontStyle: "normal",
                      }}
                    >
                      NOW
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
