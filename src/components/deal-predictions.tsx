"use client";

import Link from "next/link";
import {
  predictDaysToClose,
  calculateWinProbability,
  findSimilarDeals,
  type DealForPrediction,
} from "@/lib/predictions";

interface DealPredictionsProps {
  deal: DealForPrediction;
  allDeals: DealForPrediction[];
}

function toDeal(d: unknown): DealForPrediction {
  const x = d as Record<string, unknown>;
  return {
    id: String(x.id),
    name: String(x.name),
    stage: String(x.stage),
    value: Number(x.value),
    createdAt: x.createdAt instanceof Date ? x.createdAt : new Date(String(x.createdAt)),
    lastActivityAt: x.lastActivityAt instanceof Date ? x.lastActivityAt : new Date(String(x.lastActivityAt ?? x.createdAt)),
    riskScore: Number(x.riskScore ?? 0),
    riskLevel: x.riskLevel != null ? String(x.riskLevel) : undefined,
    status: x.status != null ? String(x.status) : undefined,
  };
}

const isClosed = (s: string) => s === "closed_won" || s === "closed_lost";

export function DealPredictions({ deal, allDeals }: DealPredictionsProps) {
  const d = toDeal(deal);
  const deals = allDeals.map(toDeal);
  const closed = isClosed(d.stage);
  const daysPred = closed ? null : predictDaysToClose(d, deals);
  const winProb = closed ? null : calculateWinProbability(d, deals);
  const similar = findSimilarDeals(d, deals);

  const trendLabel = winProb ? (winProb.trend === "up" ? "Improving" : winProb.trend === "down" ? "Declining" : "Stable") : null;

  const trendColorClass = winProb ? (winProb.trend === "up" ? "text-green-500" : winProb.trend === "down" ? "text-amber-500" : "text-white/50") : "";

  return (
    <div className="rounded-xl p-5 sm:p-6 border border-white/[0.08] bg-[#080808] transition-colors hover:border-white/[0.1] card-elevated">
      <h2 className="text-base font-semibold text-white mb-6 border-l-2 border-[#0f766e] pl-3 [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
        Predictions
      </h2>

      {closed ? (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <span className={`inline-flex px-3 py-1.5 rounded-md text-sm font-medium border ${d.stage === "closed_won" ? "bg-green-700/15 text-green-400 border-green-700/25" : "bg-red-700/15 text-red-400 border-red-700/25"}`}>
            {d.stage === "closed_won" ? "Won" : "Lost"}
          </span>
          <span className="text-white/50 text-sm">Deal closed.</span>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-white/50 mb-2">Win probability</p>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-[#0f766e] to-green-500 transition-all"
                    style={{ width: `${winProb!.probability}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-white w-12 text-right tabular-nums">{winProb!.probability}%</span>
              </div>
              {trendLabel && <p className={`text-xs font-medium ${trendColorClass}`}>{trendLabel}</p>}
            </div>

            <div>
              <p className="text-xs font-medium text-white/50 mb-2">Est. days to close</p>
              <p className="text-2xl font-bold text-white tabular-nums [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">{daysPred!.estimatedDays}</p>
              <p className="text-xs text-white/50 capitalize">{daysPred!.confidence} confidence</p>
            </div>
          </div>

          {winProb!.factors.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-medium text-white/50 mb-2">Factors</p>
              <ul className="space-y-1.5">
                {winProb!.factors.slice(0, 4).map((f, i) => (
                  <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                    <span className="text-white/40 mt-0.5">·</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {similar.similar.length > 0 && (
        <div className="mt-6 pt-5 border-t border-white/[0.06]">
          <p className="text-xs font-medium text-white/50 mb-3">Similar deals</p>
          <p className="text-xs text-white/50 mb-3">
            Win rate {Math.round(similar.winRate * 100)}% · Avg {similar.avgDaysToClose} days to close
          </p>
          <ul className="space-y-2">
            {similar.similar.slice(0, 5).map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <Link
                  href={`/deals/${s.id}`}
                  className="text-white/80 hover:text-white transition-colors truncate mr-2"
                >
                  {s.name}
                </Link>
                <span className="shrink-0 flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium border ${s.outcome === "won"
                      ? "bg-green-700/15 text-green-400 border-green-700/20"
                      : "bg-red-700/15 text-red-400 border-red-700/20"
                      }`}
                  >
                    {s.outcome}
                  </span>
                  {s.daysToClose != null && (
                    <span className="text-white/40 text-xs">{s.daysToClose}d</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {similar.similar.length === 0 && !deals.some((x) => x.stage === "closed_won" || x.stage === "closed_lost") && (
        <p className="mt-5 text-sm text-white/45">Close more deals to see similar-deal comparisons.</p>
      )}
    </div>
  );
}
