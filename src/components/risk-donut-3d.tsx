"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const INNER_R = 0.52;
const OUTER_R = 0.78;
const DEPTH = 0.18;
const COLORS = {
  low: 0x34d399,
  medium: 0xfbbf24,
  high: 0xf87171,
};

function createDonutSegmentGeometry(
  startAngle: number,
  endAngle: number
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const angle = endAngle - startAngle;
  if (angle <= 0) {
    return new THREE.ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: false });
  }
  shape.moveTo(INNER_R * Math.cos(startAngle), INNER_R * Math.sin(startAngle));
  shape.lineTo(OUTER_R * Math.cos(startAngle), OUTER_R * Math.sin(startAngle));
  shape.absarc(0, 0, OUTER_R, startAngle, endAngle, false);
  shape.lineTo(
    INNER_R * Math.cos(endAngle),
    INNER_R * Math.sin(endAngle)
  );
  shape.absarc(0, 0, INNER_R, endAngle, startAngle, true);
  return new THREE.ExtrudeGeometry(shape, {
    depth: DEPTH,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 3,
  });
}

function DonutSegments({
  low,
  medium,
  high,
}: {
  low: number;
  medium: number;
  high: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const total = low + medium + high;

  const segments = useMemo(() => {
    if (total <= 0) return [];
    const twoPi = Math.PI * 2;
    const a0 = (low / total) * twoPi;
    const a1 = (medium / total) * twoPi;
    const a2 = (high / total) * twoPi;
    const segs: { start: number; end: number; color: number }[] = [];
    if (low > 0) segs.push({ start: 0, end: a0, color: COLORS.low });
    if (medium > 0) segs.push({ start: a0, end: a0 + a1, color: COLORS.medium });
    if (high > 0) segs.push({ start: a0 + a1, end: twoPi, color: COLORS.high });
    return segs;
  }, [low, medium, high, total]);

  const meshes = useMemo(() => {
    return segments.map((seg, i) => {
      const geom = createDonutSegmentGeometry(seg.start, seg.end);
      return { geometry: geom, color: seg.color };
    });
  }, [segments]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z -= delta * 0.15;
    }
  });

  if (total <= 0) {
    return (
      <group>
        <mesh>
          <torusGeometry args={[(INNER_R + OUTER_R) / 2, (OUTER_R - INNER_R) / 2, 32, 48]} />
          <meshStandardMaterial color={0x1f2937} metalness={0.2} roughness={0.8} />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef}>
      {meshes.map((m, i) => (
        <mesh key={i} geometry={m.geometry} position={[0, 0, -DEPTH / 2]}>
          <meshStandardMaterial
            color={m.color}
            metalness={0.35}
            roughness={0.5}
            emissive={m.color}
            emissiveIntensity={0.08}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ low, medium, high }: { low: number; medium: number; high: number }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-4, -4, 4]} intensity={0.4} color="#0ea5e9" />
      <DonutSegments low={low} medium={medium} high={high} />
    </>
  );
}

export interface RiskDonut3DProps {
  lowRisk: number;
  mediumRisk: number;
  highRisk: number;
  className?: string;
}

export function RiskDonut3D({
  lowRisk,
  mediumRisk,
  highRisk,
  className = "",
}: RiskDonut3DProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white/2 border border-white/5 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 2.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Scene low={lowRisk} medium={mediumRisk} high={highRisk} />
      </Canvas>
    </div>
  );
}
