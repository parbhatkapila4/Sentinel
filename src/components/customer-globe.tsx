"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three/examples/jsm/controls/OrbitControls.js";

import ThreeGlobe from "three-globe";

function getFallbackEarthDataUrl(): string {
  if (typeof document === "undefined") return "";
  const w = 256;
  const h = 128;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#0d3b66");
  grad.addColorStop(0.5, "#1a5f7a");
  grad.addColorStop(1, "#0d3b66");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#2d5a27";
  ctx.beginPath();
  ctx.ellipse(0.22 * w, 0.45 * h, 0.12 * w, 0.2 * h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0.5 * w, 0.35 * h, 0.14 * w, 0.22 * h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0.72 * w, 0.5 * h, 0.15 * w, 0.2 * h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0.58 * w, 0.82 * h, 0.2 * w, 0.15 * h, 0, 0, Math.PI * 2);
  ctx.fill();
  return canvas.toDataURL("image/jpeg", 0.9);
}

export interface GlobePoint {
  lat: number;
  lng: number;
  count: number;
  country: string;
}

function OrbitControls() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  useEffect(() => {
    let controls: OrbitControlsImpl | null = null;
    void import("three/examples/jsm/controls/OrbitControls.js").then((module) => {
      const OrbitControlsClass = module.OrbitControls;
      controls = new OrbitControlsClass(camera, gl.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.autoRotate = false;
      controls.minDistance = 180;
      controls.maxDistance = 520;
      controlsRef.current = controls;
    });
    return () => {
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
    };
  }, [camera, gl]);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return null;
}

function GlobeWithPoints({ points, textureUrl }: { points: GlobePoint[]; textureUrl: string | null }) {
  const { scene } = useThree();
  const globeRef = useRef<InstanceType<typeof ThreeGlobe> | null>(null);
  const maxCountRef = useRef(1);

  useEffect(() => {
    if (!textureUrl) return;

    const maxCount = points.length
      ? Math.max(...points.map((p) => p.count), 1)
      : 1;
    maxCountRef.current = maxCount;

    const globe = new ThreeGlobe({
      waitForGlobeReady: false,
      animateIn: false,
    })
      .globeImageUrl(textureUrl)
      .showAtmosphere(true)
      .atmosphereColor("rgba(100, 160, 255, 0.5)")
      .atmosphereAltitude(0.18)
      .showGraticules(false)
      .pointsData(points)
      .pointLat("lat")
      .pointLng("lng")
      .pointColor(() => "#38bdf8")
      .pointAltitude((d) => 0.06 + 0.08 * ((d as GlobePoint).count / maxCount))
      .pointRadius((d) => 0.25 + 0.2 * ((d as GlobePoint).count / maxCount))
      .pointResolution(12)
      .pointsMerge(false)
      .pointsTransitionDuration(800);

    globeRef.current = globe;
    scene.add(globe);

    return () => {
      scene.remove(globe);
      globeRef.current = null;
    };
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, textureUrl]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !points.length) return;

    const maxCount = Math.max(...points.map((p) => p.count), 1);
    maxCountRef.current = maxCount;

    globe
      .pointsData(points)
      .pointAltitude((d) => 0.06 + 0.08 * ((d as GlobePoint).count / maxCount))
      .pointRadius((d) => 0.25 + 0.2 * ((d as GlobePoint).count / maxCount));
  }, [points]);

  return null;
}

function Scene({ points, textureUrl }: { points: GlobePoint[]; textureUrl: string | null }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, -10, 5]} intensity={0.3} />
      <OrbitControls />
      <GlobeWithPoints points={points} textureUrl={textureUrl} />
    </>
  );
}

interface CustomerGlobeProps {
  points: GlobePoint[];
  className?: string;
}

export function CustomerGlobe({ points, className }: CustomerGlobeProps) {
  const [textureUrl, setTextureUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    
    const fallbackId = setTimeout(() => setTextureUrl(getFallbackEarthDataUrl()), 0);
    let cancelled = false;
    fetch("/api/globe-texture")
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error("502"))))
      .then((blob) => {
        if (cancelled) return;
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = URL.createObjectURL(blob);
        setTextureUrl(blobUrlRef.current);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      clearTimeout(fallbackId);
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  return (
    <div className={className} style={{ background: "transparent" }}>
      <Canvas
        camera={{ position: [0, 0, 350], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Scene points={points} textureUrl={textureUrl} />
      </Canvas>
    </div>
  );
}
