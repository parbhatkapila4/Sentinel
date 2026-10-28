"use client";

import { useEffect, useRef } from "react";
import createGlobe, { type COBEOptions } from "cobe";
import { COUNTRY_LATLNG } from "./country-coords";

interface CustomersGlobeProps {
  pins: Array<{ country: string; count: number }>;
  size?: number;
}

const PAPER_RGB: [number, number, number] = [1, 1, 1];
const SIGNAL_RGB: [number, number, number] = [0.784, 0.278, 0.18];
const GLOW_RGB: [number, number, number] = [0.89, 0.91, 0.94];
const START_PHI = 5.72;
const SPIN_STEP = 0.0028;

export function CustomersGlobe({ pins, size = 180 }: CustomersGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phiRef = useRef(START_PHI);

  const pinKey = pins.map((p) => `${p.country}:${p.count}`).join("|");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const maxCount = pins.reduce((m, p) => Math.max(m, p.count), 1);
    const markers: COBEOptions["markers"] = [];
    for (const pin of pins) {
      const coord = COUNTRY_LATLNG[(pin.country ?? "").toUpperCase()];
      if (!coord) continue;
      markers.push({
        location: coord,
        size: 0.09 + (pin.count / maxCount) * 0.07,
      });
    }

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let side = canvas.offsetWidth || size;
    const onResize = () => {
      side = canvas.offsetWidth || side;
    };
    let globe: ReturnType<typeof createGlobe> | null = null;
    try {
      globe = createGlobe(canvas, {
        devicePixelRatio: 2,
        width: side * 2,
        height: side * 2,
        phi: phiRef.current,
        theta: 0.28,
        dark: 0,
        diffuse: 0.4,
        mapSamples: 30000,
        mapBrightness: 1.2,
        baseColor: PAPER_RGB,
        markerColor: SIGNAL_RGB,
        glowColor: GLOW_RGB,
        markers,
        onRender: (state) => {
          if (!still) phiRef.current += SPIN_STEP;
          state.phi = phiRef.current;
          state.width = side * 2;
          state.height = side * 2;
        },
      });
    } catch {
      return;
    }
    window.addEventListener("resize", onResize);

    const frame = requestAnimationFrame(() => {
      canvas.style.opacity = "1";
    });

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frame);
      globe?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinKey, size]);

  return (
    <div
      style={{
        position: "relative",
        flex: `1 1 ${Math.round(size * 0.74)}px`,
        maxWidth: size,
        aspectRatio: "1 / 1",
      }}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Globe showing where your customers are"
        width={size * 2}
        height={size * 2}
        style={{
          width: "100%",
          height: "100%",
          opacity: 0,
          transition: "opacity 800ms ease",
          contain: "layout paint size",
        }}
      />
      {pins.length === 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              background: "var(--dl-panel)",
              border: "1px solid var(--dl-border)",
              fontSize: 12.5,
              color: "var(--dl-muted)",
            }}
          >
            No customers placed yet
          </span>
        </div>
      )}
    </div>
  );
}
