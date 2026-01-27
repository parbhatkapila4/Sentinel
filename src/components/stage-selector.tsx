"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateDealStage } from "@/app/actions/deals";
import { toast } from "sonner";
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

    setIsLoading(true);
    try {
      await updateDealStage(dealId, newStage);
      toast.success(`Stage changed to ${newStage}`);
      router.refresh();
    } catch (error) {
      console.error("Failed to update stage:", error);
      toast.error("Failed to update stage");
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50"
      >
        <span className="capitalize">{currentStage.replace(/_/g, " ")}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-48 rounded-xl overflow-hidden z-50"
          style={{
            background: "rgba(20, 20, 20, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          }}
        >
          {stages.map((stage) => (
            <button
              key={stage}
              onClick={() => handleStageChange(stage)}
              disabled={isLoading}
              className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${stage === currentStage
                ? "bg-white/10 text-white font-medium"
                : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
            >
              <span className="capitalize">{stage.replace(/_/g, " ")}</span>
              {stage === currentStage && (
                <span className="ml-2 text-xs text-emerald-400">Current</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
