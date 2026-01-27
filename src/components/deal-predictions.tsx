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
  const trendColor = winProb ? (winProb.trend === "up" ? "text-emerald-400" : winProb.trend === "down" ? "text-amber-400" : "text-white/50") : "";

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-white/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
          />
        </svg>
        Predictions
      </h2>

      {closed ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
          <span
            className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-semibold ${d.stage === "closed_won" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
              }`}
          >
            {d.stage === "closed_won" ? "Won" : "Lost"}
          </span>
          <span className="text-white/50 text-sm">This deal is closed.</span>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                Win probability
              </p>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all"
                    style={{ width: `${winProb!.probability}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-white w-12 text-right">
                  {winProb!.probability}%
                </span>
              </div>
              {trendLabel && <p className={`text-xs font-medium ${trendColor}`}>{trendLabel}</p>}
            </div>

            <div>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                Est. days to close
              </p>
              <p className="text-2xl font-bold text-white">{daysPred!.estimatedDays}</p>
              <p className="text-xs text-white/50 capitalize">{daysPred!.confidence} confidence</p>
            </div>
          </div>

          {winProb!.factors.length > 0 && (
            <div className="mt-5">
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                Factors
              </p>
              <ul className="space-y-1.5">
                {winProb!.factors.slice(0, 4).map((f, i) => (
                  <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                    <span className="text-white/40 mt-0.5">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {similar.similar.length > 0 && (
        <div className="mt-6 pt-5 border-t border-white/10">
          <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">
            Similar deals
          </p>
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
                    className={`px-2 py-0.5 rounded-md text-xs font-medium ${s.outcome === "won"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
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
        <p className="mt-5 text-sm text-white/40">
          Close more deals to see similar-deal comparisons.
        </p>
      )}
    </div>
  );
}
