"use client";

import * as React from "react";
import { getDealCountsByCountry } from "@/app/actions/deals";
import DottedMap from "dotted-map";
import { COUNTRY_COORDINATES } from "@/lib/country-coordinates";
import { COUNTRY_DISPLAY_NAMES } from "@/lib/countries";

interface CountryData {
  country: string;
  count: number;
}

const ROYAL_GREEN = "#0d9488";
const ROYAL_GREEN_GLOW = "#14b8a6";
const ROYAL_GREEN_SOFT = "rgba(20, 184, 166, 0.4)";

function getDisplayName(country: string): string {
  return COUNTRY_DISPLAY_NAMES[country] ?? country;
}

type DotSize = "low" | "medium" | "high";

function getDotSize(count: number, maxCount: number): DotSize {
  if (maxCount <= 0) return "low";
  const ratio = count / maxCount;
  if (ratio <= 1 / 3) return "low";
  if (ratio <= 2 / 3) return "medium";
  return "high";
}

const DOT_RADIUS: Record<DotSize, number> = {
  low: 6,
  medium: 12,
  high: 20,
};

function projectLatLngToXY(
  lat: number,
  lng: number,
  width: number = 1000,
  height: number = 500
) {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
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

  const mapInstance = React.useMemo(() => {
    return new DottedMap({ height: 60, grid: "diagonal" });
  }, []);

  const svgMap = React.useMemo(() => {
    return mapInstance.getSVG({
      radius: 0.22,
      color: "#2a2a2a",
      shape: "circle",
      backgroundColor: "#0a0a0a",
    });
  }, [mapInstance]);

  const maxCount = React.useMemo(() => {
    if (countryData.length === 0) return 0;
    return Math.max(...countryData.map((d) => d.count));
  }, [countryData]);

  const totalDeals = React.useMemo(
    () => countryData.reduce((sum, d) => sum + d.count, 0),
    [countryData]
  );

  const dotsWithCoords = React.useMemo(() => {
    return countryData
      .filter((d) => COUNTRY_COORDINATES[d.country])
      .map((d) => ({
        ...d,
        coords: COUNTRY_COORDINATES[d.country]!,
        size: getDotSize(d.count, maxCount),
      }));
  }, [countryData, maxCount]);

  const hasHigh = dotsWithCoords.some((d) => d.size === "high");
  const hasMedium = dotsWithCoords.some((d) => d.size === "medium");
  const hasLow = dotsWithCoords.some((d) => d.size === "low");

  const top3Countries = dotsWithCoords.slice(0, 3);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-white">
          Customer by Country
        </h3>
      </div>

      <div
        className="flex-1 relative aspect-[2/1] min-h-[300px] w-full h-[300px] lg:h-[350px] xl:h-[400px]"
        style={{ background: "#0f0f0f" }}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="absolute inset-0 opacity-80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
                alt="World map"
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>

            <svg
              viewBox="0 0 1000 500"
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <filter id="royal-green-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                  <feFlood floodColor={ROYAL_GREEN_GLOW} floodOpacity="0.5" result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="royal-green-fill" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={ROYAL_GREEN_GLOW} />
                  <stop offset="100%" stopColor={ROYAL_GREEN} />
                </linearGradient>
              </defs>
              {dotsWithCoords.map((dot, i) => {
                const { x, y } = projectLatLngToXY(dot.coords.lat, dot.coords.lng);
                const r = DOT_RADIUS[dot.size];
                const delay = `${i * 0.25}s`;
                return (
                  <g key={`${dot.country}-${i}`}>

                    <circle
                      cx={x}
                      cy={y}
                      r={r}
                      fill="none"
                      stroke={ROYAL_GREEN_GLOW}
                      strokeWidth="2"
                      opacity="0.6"
                    >
                      <animate
                        attributeName="r"
                        values={`${r};${r * 2.2};${r}`}
                        dur="2.5s"
                        begin={delay}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.6;0;0.6"
                        dur="2.5s"
                        begin={delay}
                        repeatCount="indefinite"
                      />
                    </circle>
                    <g filter="url(#royal-green-glow)">
                      <circle
                        cx={x}
                        cy={y}
                        r={r}
                        fill="url(#royal-green-fill)"
                      />
                    </g>
                  </g>
                );
              })}
            </svg>


            {dotsWithCoords.length === 0 && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white/40 text-sm mb-2">
                    No location data yet
                  </p>
                  <p className="text-white/30 text-xs">
                    Choose a country when creating a new deal to see green dots here
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
