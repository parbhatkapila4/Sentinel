"use client";

import { useEffect, useRef } from "react";
import createGlobe, { type COBEOptions } from "cobe";

interface GlobePin {
  country: string;
  count: number;
}

interface GlobeColumnProps {
  pins: GlobePin[];
}

const COUNTRY_LATLNG: Record<string, [number, number]> = {
  US: [37.0902, -95.7129],
  USA: [37.0902, -95.7129],
  "UNITED STATES": [37.0902, -95.7129],
  CA: [56.1304, -106.3468],
  CANADA: [56.1304, -106.3468],
  MX: [23.6345, -102.5528],
  MEXICO: [23.6345, -102.5528],
  BR: [-14.235, -51.9253],
  BRAZIL: [-14.235, -51.9253],
  AR: [-38.4161, -63.6167],
  UK: [55.3781, -3.436],
  GB: [55.3781, -3.436],
  "UNITED KINGDOM": [55.3781, -3.436],
  IE: [53.1424, -7.6921],
  IRELAND: [53.1424, -7.6921],
  DE: [51.1657, 10.4515],
  GERMANY: [51.1657, 10.4515],
  FR: [46.2276, 2.2137],
  FRANCE: [46.2276, 2.2137],
  ES: [40.4637, -3.7492],
  SPAIN: [40.4637, -3.7492],
  IT: [41.8719, 12.5674],
  ITALY: [41.8719, 12.5674],
  NL: [52.1326, 5.2913],
  NETHERLANDS: [52.1326, 5.2913],
  SE: [60.1282, 18.6435],
  SWEDEN: [60.1282, 18.6435],
  NO: [60.472, 8.4689],
  NORWAY: [60.472, 8.4689],
  CH: [46.8182, 8.2275],
  SWITZERLAND: [46.8182, 8.2275],
  PL: [51.9194, 19.1451],
  POLAND: [51.9194, 19.1451],
  TR: [38.9637, 35.2433],
  IN: [20.5937, 78.9629],
  INDIA: [20.5937, 78.9629],
  JP: [36.2048, 138.2529],
  JAPAN: [36.2048, 138.2529],
  CN: [35.8617, 104.1954],
  CHINA: [35.8617, 104.1954],
  KR: [35.9078, 127.7669],
  ID: [-0.7893, 113.9213],
  SG: [1.3521, 103.8198],
  SINGAPORE: [1.3521, 103.8198],
  MY: [4.2105, 101.9758],
  TH: [15.87, 100.9925],
  VN: [14.0583, 108.2772],
  PH: [12.8797, 121.774],
  AU: [-25.2744, 133.7751],
  AUSTRALIA: [-25.2744, 133.7751],
  NZ: [-40.9006, 174.886],
  ZA: [-30.5595, 22.9375],
  "SOUTH AFRICA": [-30.5595, 22.9375],
  NG: [9.082, 8.6753],
  KE: [-0.0236, 37.9062],
  EG: [26.0975, 30.0444],
  AE: [23.4241, 53.8478],
  SA: [23.8859, 45.0792],
  IL: [31.0461, 34.8516],
};

const CREAM_RGB: [number, number, number] = [0.961, 0.929, 0.839];
const SIGNAL_RGB: [number, number, number] = [0.784, 0.278, 0.18];

export function GlobeColumn({ pins }: GlobeColumnProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const widthRef = useRef(0);
  const phiRef = useRef(2.2);

  const totalCustomers = pins.reduce((s, p) => s + p.count, 0);
  const maxCount = pins.reduce((m, p) => Math.max(m, p.count), 1);

  const placedPins = pins
    .map((p) => {
      const key = (p.country ?? "").toUpperCase();
      const coord = COUNTRY_LATLNG[key];
      if (!coord) return null;
      return { ...p, coord };
    })
    .filter(
      (p): p is GlobePin & { coord: [number, number] } => p !== null
    );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onResize = () => {
      widthRef.current = canvas.offsetWidth;
    };
    window.addEventListener("resize", onResize);
    onResize();

    const markers: COBEOptions["markers"] = placedPins.map((p) => ({
      location: p.coord,
      size: 0.045 + (p.count / maxCount) * 0.055,
    }));

    const config: COBEOptions = {
      devicePixelRatio: 2,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      phi: 0,
      theta: 0.25,
      dark: 1,
      diffuse: 1.1,
      mapSamples: 16000,
      mapBrightness: 5.6,
      baseColor: CREAM_RGB,
      markerColor: SIGNAL_RGB,
      glowColor: [0.16, 0.14, 0.12],
      markers,
      onRender: (state) => {
        phiRef.current += 0.0028;
        state.phi = phiRef.current;
        state.width = widthRef.current * 2;
        state.height = widthRef.current * 2;
      },
    };

    const globe = createGlobe(canvas, config);

    requestAnimationFrame(() => {
      canvas.style.opacity = "1";
    });

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins.length, totalCustomers, maxCount]);

  return (
    <div>
      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 26,
          color: "var(--cream)",
          marginBottom: 6,
          letterSpacing: "-0.01em",
        }}
      >
        Customers{" "}
        <em
          style={{
            fontStyle: "italic",
            color: "var(--signal)",
            fontFamily: "var(--font-serif)",
          }}
        >
          by country
        </em>
      </h3>
      <p
        style={{
          fontFamily: "var(--font-mono-jb)",
          fontSize: 10,
          letterSpacing: "0.14em",
          color: "var(--cream-4)",
          textTransform: "uppercase",
          marginBottom: 18,
        }}
      >
        {totalCustomers} CUSTOMERS · {pins.length} REGIONS
      </p>

      <div
        className="relative grid place-items-center"
        style={{
          aspectRatio: "1",
          width: "100%",
          maxWidth: 380,
          margin: "0 auto",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: "6%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 48%, rgba(245,237,214,0.08) 0%, rgba(245,237,214,0.02) 45%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />

        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "6%",
            right: "6%",
            top: "50%",
            height: 1,
            background:
              "linear-gradient(90deg, transparent 0%, var(--rule-strong) 18%, var(--rule-strong) 82%, transparent 100%)",
            opacity: 0.55,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            opacity: 0,
            transition: "opacity 800ms ease",
            contain: "layout paint size",
          }}
          aria-label="Customer distribution globe"
          role="img"
        />

        {placedPins.length === 0 && pins.length === 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 10,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--cream-4)",
              }}
            >
              No customers placed yet
            </div>
          </div>
        )}
      </div>

      <div
        className="flex items-center justify-center"
        style={{
          marginTop: 12,
          gap: 8,
          fontFamily: "var(--font-mono-jb)",
          fontSize: 9.5,
          letterSpacing: "0.18em",
          color: "var(--cream-4)",
          textTransform: "uppercase",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "var(--signal)",
            boxShadow: "0 0 8px rgba(200,71,46,0.6)",
          }}
        />
        <span>Live · auto-rotating</span>
      </div>

      {pins.length > 0 && (
        <div
          className="flex flex-wrap"
          style={{
            justifyContent: "center",
            gap: 6,
            marginTop: 14,
          }}
        >
          {pins.slice(0, 8).map((p) => (
            <span
              key={p.country}
              className="tabular"
              style={{
                fontFamily: "var(--font-mono-jb)",
                fontSize: 9.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--cream-2)",
                border: "1px solid var(--rule-strong)",
                padding: "3px 7px",
              }}
            >
              {p.country} · {p.count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
