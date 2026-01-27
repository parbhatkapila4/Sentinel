"use client";

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h3 className="text-base sm:text-lg font-medium text-white">Top Deals</h3>
      </div>

      <div className="flex-1 overflow-auto overflow-x-auto min-w-0 w-full">
        <table className="w-full min-w-[320px]">
          <thead>
            <tr className="border-b border-[#1f1f1f]">
              <th className="text-left py-3 px-3 lg:px-4 text-xs lg:text-sm font-semibold text-white/60 uppercase tracking-wider">
                Deal Name
              </th>
              <th className="text-left py-3 px-3 lg:px-4 text-xs lg:text-sm font-semibold text-white/60 uppercase tracking-wider">
                Stage
              </th>
              <th className="text-left py-3 px-3 lg:px-4 text-xs lg:text-sm font-semibold text-white/60 uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {topDeals.length > 0 ? (
              topDeals.map((deal) => (
                <tr
                  key={deal.id}
                  className="border-t border-white/5 first:border-t-0 border-b border-[#1a1a1a] last:border-0 hover:bg-[#151515] transition-colors"
                >
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl opacity-70">{deal.icon}</span>
                      <span className="text-sm text-white">{deal.name}</span>
                      {deal.isDemo && (
                        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/20 text-blue-400 rounded">
                          DEMO
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <span className="text-sm text-[#8a8a8a]">{deal.stage}</span>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <span className="text-sm font-semibold text-white">
                      $
                      {deal.value.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-3 lg:px-4 py-8 text-center">
                  <p className="text-sm text-white/40">No deals yet</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
