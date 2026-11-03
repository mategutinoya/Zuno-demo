"use client";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { getFruitGeometry } from "./fruitGeometry";
import { sceneState } from "@/lib/sceneState";
import { createAchachairuFleshTexture, createLimeSliceTexture, createPassionPulpTexture } from "./textures";

export type FruitPiece =
  | "lychee"
  | "lycheePeeled"
  | "raspberry"
  | "mango"
  | "mangoCube"
  | "passion"
  | "passionHalf"
  | "achachairu"
  | "achachairuHalf"
  | "lime"
  | "limeSlice"
  | "blackberry"
  | "blueberry";

let mats: ReturnType<typeof buildMaterials> | null = null;
function buildMaterials() {
  const phys = (p: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(p);
  const limeTex = createLimeSliceTexture();
  const pulpTex = createPassionPulpTexture();
  const fleshTex = createAchachairuFleshTexture();
  return {
    lychee: phys({ color: "#C42A4E", roughness: 0.62, clearcoat: 0.25, sheen: 0.6, sheenColor: new THREE.Color("#FF8FA8") }),
    peeled: phys({
      color: "#F6EFE8",
      roughness: 0.12,
      clearcoat: 1,
      // transmission forces an extra scene pass: skip it on phones
      ...(sceneState.isMobile ? { sheen: 1, sheenColor: new THREE.Color("#ffffff") } : { transmission: 0.35, thickness: 0.4, ior: 1.36 }),
    }),
    raspberry: phys({ color: "#D21E4C", roughness: 0.32, clearcoat: 0.6, sheen: 1, sheenColor: new THREE.Color("#FF7A9C") }),
    blackberry: phys({ color: "#24102C", roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.05 }),
    blueberry: phys({ color: "#3E4C92", roughness: 0.72, sheen: 1, sheenColor: new THREE.Color("#B8C2F0") }),
    blueberryCrown: phys({ color: "#1C1F3E", roughness: 0.8 }),
    mango: phys({ vertexColors: true, roughness: 0.38, clearcoat: 0.4 }),
    mangoFlesh: phys({ color: "#FFAE14", roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 }),
    passion: phys({ color: "#4A1A3E", roughness: 0.48, clearcoat: 0.2 }),
    passionInner: phys({ color: "#EFE4C6", roughness: 0.7, side: THREE.BackSide }),
    passionPulp: phys({ map: pulpTex, roughness: 0.12, clearcoat: 1 }),
    lime: phys({ color: "#5EA828", roughness: 0.34, clearcoat: 0.6 }),
    limeRind: phys({ color: "#4C9420", roughness: 0.4 }),
    limeFace: phys({ map: limeTex, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05 }),
    achachairu: phys({ color: "#F5870F", roughness: 0.24, clearcoat: 0.9 }),
    achachairuFlesh: phys({ map: fleshTex, roughness: 0.2, clearcoat: 1 }),
  };
}
export const getFruitMaterials = () => (mats ??= buildMaterials());

export function Fruit({ kind }: { kind: FruitPiece }) {
  const g = getFruitGeometry();
  const m = getFruitMaterials();
  switch (kind) {
    case "lychee":
      return <mesh geometry={g.lychee} material={m.lychee} />;
    case "lycheePeeled":
      return <mesh geometry={g.lycheePeeled} material={m.peeled} />;
    case "raspberry":
      return <mesh geometry={g.raspberry} material={m.raspberry} />;
    case "blackberry":
      return <mesh geometry={g.blackberry} material={m.blackberry} />;
    case "blueberry":
      return (
        <group>
          <mesh geometry={g.blueberry} material={m.blueberry} />
          <mesh geometry={g.blueberryCrown} material={m.blueberryCrown} position-y={0.13} rotation-x={Math.PI / 2} />
        </group>
      );
    case "mango":
      return <mesh geometry={g.mango} material={m.mango} />;
    case "mangoCube":
      return <RoundedBox args={[0.2, 0.2, 0.2]} radius={0.045} smoothness={3} material={m.mangoFlesh} />;
    case "passion":
      return <mesh geometry={g.passion} material={m.passion} />;
    case "passionHalf":
      return (
        <group>
          <mesh geometry={g.hemiOuter} material={m.passion} />
          <mesh geometry={g.hemiInner} material={m.passionInner} />
          <mesh geometry={g.cutDisc} material={m.passionPulp} scale={0.95} />
        </group>
      );
    case "lime":
      return <mesh geometry={g.lime} material={m.lime} />;
    case "limeSlice":
      return <mesh geometry={g.limeSlice} material={[m.limeRind, m.limeFace, m.limeFace]} />;
    case "achachairu":
      return <mesh geometry={g.achachairu} material={m.achachairu} />;
    case "achachairuHalf":
      return (
        <group scale={[0.88, 1, 0.88]}>
          <mesh geometry={g.hemiOuter} material={m.achachairu} scale={0.8} />
          <mesh geometry={g.cutDisc} material={m.achachairuFlesh} scale={0.78} />
        </group>
      );
  }
}

export interface FruitPlacement {
  kind: FruitPiece;
  pos: [number, number, number];
  rot?: [number, number, number];
  scale?: number;
}

/** Fruit arrangements around a bottle (bottle-local units, height ≈ 3.44) */
export const FRUIT_LAYOUTS: Record<string, FruitPlacement[]> = {
  "pink-lychee": [
    { kind: "lychee", pos: [-1.35, -1.05, 0.6], scale: 1.4 },
    { kind: "lycheePeeled", pos: [1.25, -1.35, 0.8], scale: 1.3 },
    { kind: "raspberry", pos: [1.4, 0.45, 0.1], rot: [0.4, 0, 0.3], scale: 1.25 },
    { kind: "lychee", pos: [-1.15, 1.05, -0.5], scale: 1 },
    { kind: "raspberry", pos: [-0.75, -1.85, 1.1], rot: [-0.3, 0.5, 0], scale: 0.9 },
    { kind: "lycheePeeled", pos: [0.95, 1.55, -0.9], scale: 0.8 },
  ],
  "mango-passion": [
    { kind: "passionHalf", pos: [-1.35, -1.0, 0.6], rot: [1.1, 0, 0.25], scale: 1.35 },
    { kind: "mango", pos: [1.45, -1.25, 0.2], rot: [0.2, 0.6, -0.4], scale: 1.25 },
    { kind: "mangoCube", pos: [1.25, 0.6, 0.5], rot: [0.5, 0.6, 0.2], scale: 1.2 },
    { kind: "mangoCube", pos: [-1.05, 0.95, 0.3], rot: [0.2, 0.3, 0.8], scale: 1 },
    { kind: "passion", pos: [0.95, 1.6, -0.8], scale: 0.9 },
    { kind: "mangoCube", pos: [-0.65, -1.9, 1.2], rot: [0.9, 0.2, 0.4], scale: 0.8 },
  ],
  "achachairu-citrus": [
    { kind: "achachairuHalf", pos: [-1.35, -1.1, 0.6], rot: [1.0, 0, 0.3], scale: 1.4 },
    { kind: "limeSlice", pos: [1.4, -0.95, 0.6], rot: [1.25, 0.2, -0.35], scale: 1.25 },
    { kind: "achachairu", pos: [1.35, 0.7, -0.1], rot: [0.2, 0, 0.4], scale: 1.2 },
    { kind: "lime", pos: [-1.2, 0.95, -0.3], scale: 1 },
    { kind: "limeSlice", pos: [-0.6, -1.95, 1.1], rot: [1.0, 0, 0.8], scale: 0.85 },
    { kind: "achachairu", pos: [0.85, 1.65, -0.9], rot: [0.3, 0, -0.3], scale: 0.75 },
  ],
  "berry-mood": [
    { kind: "blackberry", pos: [-1.35, -1.05, 0.6], rot: [0.3, 0, 0.4], scale: 1.4 },
    { kind: "blueberry", pos: [1.3, -1.3, 0.75], scale: 1.4 },
    { kind: "blackberry", pos: [1.35, 0.6, 0.1], rot: [-0.3, 0.4, -0.5], scale: 1.1 },
    { kind: "blueberry", pos: [-1.2, 0.95, -0.2], scale: 1.1 },
    { kind: "blueberry", pos: [-0.7, -1.9, 1.1], scale: 0.9 },
    { kind: "blackberry", pos: [0.9, 1.6, -0.9], rot: [0.5, 0, 0.2], scale: 0.8 },
  ],
};

interface ClusterProps {
  flavorId: string;
  /** 0 hidden → 1 visible, read every frame */
  presence: () => number;
  maxPieces?: number;
  animated?: boolean;
  /** horizontal spread multiplier */
  spread?: number;
}

/** Floating fruit arrangement with enter / exit choreography */
export function FruitCluster({ flavorId, presence, maxPieces = 6, animated = true, spread = 1 }: ClusterProps) {
  const layout = FRUIT_LAYOUTS[flavorId].slice(0, maxPieces);
  const refs = useRef<(THREE.Group | null)[]>([]);
  const phases = useMemo(() => layout.map((_, i) => i * 1.7 + 0.4), [layout]);
  const root = useRef<THREE.Group>(null);

  useFrame((state) => {
    const p = presence();
    if (root.current) root.current.visible = p > 0.002;
    if (p <= 0.002) return;
    const t = animated ? state.clock.elapsedTime : 0;
    layout.forEach((item, i) => {
      const g = refs.current[i];
      if (!g) return;
      // stagger each piece
      const local = THREE.MathUtils.clamp(p * 1.6 - i * 0.1, 0, 1);
      const e = 1 - Math.pow(1 - local, 3);
      const [x, y, z] = item.pos;
      const out = (1 + (1 - e) * 0.9) * spread;
      g.position.set(x * out, y + Math.sin(t * 0.9 + phases[i]) * 0.07 + (1 - e) * -0.6, z);
      const [rx, ry, rz] = item.rot ?? [0, 0, 0];
      g.rotation.set(rx + Math.sin(t * 0.5 + phases[i]) * 0.15, ry + t * 0.25 + (1 - e) * 2.5, rz);
      g.scale.setScalar((item.scale ?? 1) * e);
    });
  });

  return (
    <group ref={root}>
      {layout.map((item, i) => (
        <group key={i} ref={(el) => {
            refs.current[i] = el;
          }}>
          <Fruit kind={item.kind} />
        </group>
      ))}
    </group>
  );
}
