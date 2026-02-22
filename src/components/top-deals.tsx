"use client";

import Link from "next/link";
import { STAGE_ICONS } from "@/lib/config";

interface Deal {
  id: string;
  name: string;
  stage: string;
  value: number;
  createdAt: Date;
  isDemo?: boolean;
}

interface TopDealsProps {
  deals: Deal[];
}

const DEFAULT_DEAL_ICON = "💼";

function getDealIcon(stage: string): string {
  return STAGE_ICONS[stage.toLowerCase()] ?? DEFAULT_DEAL_ICON;
}

export function TopDeals({ deals }: TopDealsProps) {
  const topDeals = deals
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
    .map((deal) => ({
      ...deal,
      icon: getDealIcon(deal.stage),
    }));

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-5">
        <h3 className="text-base sm:text-lg font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
          Top Deals
        </h3>
        <p className="text-[11px] text-white/40 mt-0.5">By value</p>
      </div>

      <div className="flex-1 overflow-auto min-w-0 w-full">
        <table className="w-full min-w-[300px] border-collapse">
          <thead>
            <tr>
              <th className="text-left py-2.5 px-0 text-[10px] font-medium text-white/40 uppercase tracking-wider">
                Deal
              </th>
              <th className="text-left py-2.5 px-3 text-[10px] font-medium text-white/40 uppercase tracking-wider">
                Stage
              </th>
              <th className="text-right py-2.5 pr-0 pl-3 text-[10px] font-medium text-white/40 uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {topDeals.length > 0 ? (
              topDeals.map((deal) => (
                <tr
                  key={deal.id}
                  className="group border-t border-white/[0.06] first:border-t-0"
                >
                  <td className="py-3.5 px-0">
                    <Link
                      href={`/deals/${deal.id}`}
                      className="flex items-center gap-3 rounded-lg -mx-1 px-1 py-0.5 transition-colors hover:bg-white/[0.05]"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-sm text-white/80">
                        {deal.icon}
                      </span>
                      <span className="text-sm font-medium text-white truncate group-hover:text-[#38bdf8] transition-colors">
                        {deal.name}
                      </span>
                      {deal.isDemo && (
                        <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border border-[#0ea5e9]/20 bg-[#0ea5e9]/10 text-[#38bdf8]">
                          Demo
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-xs text-white/50 capitalize">{deal.stage}</span>
                  </td>
                  <td className="py-3.5 pr-0 pl-3 text-right">
                    <span className="text-sm font-semibold tabular-nums text-white">
                      ${deal.value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-0 py-12 text-center">
                  <p className="text-sm text-white/40">No deals yet</p>
                  <p className="text-xs text-white/30 mt-1">Deals will appear here by value</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
