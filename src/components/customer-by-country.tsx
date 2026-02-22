"use client";

import * as React from "react";
import { getDealCountsByCountry } from "@/app/actions/deals";
import { COUNTRY_COORDINATES } from "@/lib/country-coordinates";
import { COUNTRY_DISPLAY_NAMES } from "@/lib/countries";
import type { COBEOptions } from "cobe";
import { Globe } from "@/components/ui/globe";

interface CountryData {
  country: string;
  count: number;
}

function getDisplayName(country: string): string {
  return COUNTRY_DISPLAY_NAMES[country] ?? country;
}

export function CustomerByCountry() {
  const [countryData, setCountryData] = React.useState<CountryData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const data = await getDealCountsByCountry();
        setCountryData(data);
      } catch (error) {
        console.error("Failed to fetch country data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const maxCount = React.useMemo(() => {
    if (countryData.length === 0) return 0;
    return Math.max(...countryData.map((d) => d.count));
  }, [countryData]);

  const totalDeals = React.useMemo(
    () => countryData.reduce((sum, d) => sum + d.count, 0),
    [countryData]
  );

  const globePoints = React.useMemo(() => {
    return countryData
      .filter((d) => COUNTRY_COORDINATES[d.country])
      .map((d) => {
        const coords = COUNTRY_COORDINATES[d.country]!;
        return { lat: coords.lat, lng: coords.lng, count: d.count, country: d.country };
      });
  }, [countryData]);

  const globeConfig = React.useMemo((): COBEOptions => {
    const max = Math.max(maxCount, 1);
    return {
      width: 800,
      height: 800,
      onRender: () => { },
      devicePixelRatio: 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 0.4,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.02, 0.05, 0.1],
      markerColor: [0.22, 0.74, 0.97],
      glowColor: [0.1, 0.5, 0.8],
      markers: globePoints.map((p) => ({
        location: [p.lat, p.lng] as [number, number],
        size: 0.03 + 0.07 * (p.count / max),
      })),
    };
  }, [globePoints, maxCount]);

  const top3Countries = globePoints.slice(0, 3);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-5">
        <h3 className="text-base sm:text-lg font-semibold text-white [font-family:var(--font-syne),var(--font-geist-sans),sans-serif]">
          Customer by Country
        </h3>
        <p className="text-[11px] text-white/40 mt-0.5">
          {!isLoading && countryData.length > 0
            ? `${totalDeals} deal${totalDeals !== 1 ? "s" : ""} across ${countryData.length} countr${countryData.length !== 1 ? "ies" : "y"}`
            : "Deal locations"}
        </p>
      </div>

      <div className="flex-1 relative aspect-[2/1] min-h-[280px] w-full rounded-2xl overflow-hidden border border-white/[0.08] bg-[#050810]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#0ea5e9]/40 border-t-[#0ea5e9] rounded-full animate-spin" />
          </div>
        ) : globePoints.length > 0 ? (
          <>
            <Globe config={globeConfig} className="top-1/2 -translate-y-1/2" />
            <p className="absolute bottom-2 left-2 text-[10px] text-white/30 pointer-events-none z-10">Drag to rotate</p>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6">
              <p className="text-white/40 text-sm mb-2">No location data yet</p>
              <p className="text-white/30 text-xs">Add a country when creating a deal to see locations on the globe</p>
            </div>
          </div>
        )}
      </div>

      {!isLoading && top3Countries.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-3">Top locations</p>
          <div className="flex flex-wrap gap-2">
            {top3Countries.map((d) => {
              const pct = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
              return (
                <span
                  key={d.country}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs text-white/80"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9]/80" />
                  {getDisplayName(d.country)}
                  <span className="text-white/50 font-medium tabular-nums">({d.count})</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
