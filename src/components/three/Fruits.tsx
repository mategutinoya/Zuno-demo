"use client";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { getFruitGeometry } from "./fruitGeometry";
import { applySkin, createLeafGeometry, getLeafTexture } from "./fruitSkin";
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
  | "blueberry"
  | "leaf"
  | "ice";

let mats: ReturnType<typeof buildMaterials> | null = null;
function buildMaterials() {
  const phys = (p: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(p);
  const limeTex = createLimeSliceTexture();
  const pulpTex = createPassionPulpTexture();
  const fleshTex = createAchachairuFleshTexture();
  const lychee = applySkin(phys({ color: "#C93652", roughness: 0.62, clearcoat: 0.15 }), {
    key: "lychee", pattern: "cells", scale: 11, bump: 0.9,
    low: [0.45, 0.24, 0.22], high: [1.12, 1.0, 0.98], rough: [1.15, 0.8],
  });
  const peeled = applySkin(
    phys({ color: "#F4EEE6", roughness: 0.1, clearcoat: 1, transmission: 0.35, thickness: 0.4, ior: 1.36 }),
    { key: "peeled", pattern: "fbm", scale: 4, bump: 0.18, low: [0.94, 0.94, 0.9], high: [1.04, 1.04, 1.04], rough: [0.7, 1.4] },
  );
  const raspberry = applySkin(
    phys({ color: "#C81C48", roughness: 0.34, clearcoat: 0.55, sheen: 0.8, sheenColor: new THREE.Color("#ff8fae") }),
    { key: "raspberry", pattern: "fbm", scale: 30, bump: 0.25, low: [0.7, 0.75, 0.8], high: [1.1, 1.0, 1.0] },
  );
  const blackberry = applySkin(phys({ color: "#1E0B24", roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.04 }), {
    key: "blackberry", pattern: "fbm", scale: 26, bump: 0.18, low: [0.7, 0.6, 0.8], high: [1.4, 1.1, 1.3],
  });
  const blueberry = applySkin(phys({ color: "#3C4C8E", roughness: 0.8, sheen: 1, sheenColor: new THREE.Color("#c3cbf2") }), {
    // waxy "bloom": dusty light patches over deep blue
    key: "blueberry", pattern: "fbm", scale: 7, bump: 0.08, low: [0.7, 0.72, 0.85], high: [1.35, 1.38, 1.5], rough: [1.1, 0.85],
  });
  const mango = applySkin(phys({ vertexColors: true, roughness: 0.48, clearcoat: 0.2 }), {
    key: "mango", pattern: "fbm", scale: 4, bump: 0.08, low: [0.86, 0.84, 0.8], high: [1.06, 1.04, 1.0],
    speck: { color: [0.98, 0.9, 0.62], density: 0.06, scale: 90 },
  });
  const mangoFlesh = applySkin(phys({ color: "#FFA81A", roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.06 }), {
    // fibrous, juicy flesh
    key: "mangoFlesh", pattern: "fbm", scale: 18, bump: 0.12, low: [0.9, 0.82, 0.7], high: [1.06, 1.05, 1.0],
  });
  const passion = applySkin(phys({ color: "#4A1A3E", roughness: 0.5, clearcoat: 0.25 }), {
    // wrinkled, speckled rind
    key: "passion", pattern: "fbm", scale: 6, bump: 0.55, low: [0.6, 0.55, 0.62], high: [1.15, 1.05, 1.12],
    speck: { color: [0.62, 0.42, 0.58], density: 0.05, scale: 45 },
  });
  const lime = applySkin(phys({ color: "#5BA42A", roughness: 0.38, clearcoat: 0.55 }), {
    key: "lime", pattern: "pores", scale: 42, bump: 0.35, low: [0.82, 0.85, 0.75], high: [1.05, 1.06, 1.0],
  });
  const achachairu = applySkin(phys({ color: "#F4860E", roughness: 0.22, clearcoat: 0.9 }), {
    key: "achachairu", pattern: "fbm", scale: 9, bump: 0.14, low: [0.88, 0.78, 0.7], high: [1.06, 1.04, 1.0],
    speck: { color: [0.55, 0.32, 0.1], density: 0.025, scale: 60 },
  });
  return {
    lychee,
    peeled,
    raspberry,
    blackberry,
    blueberry,
    blueberryCrown: phys({ color: "#1C1F3E", roughness: 0.8 }),
    mango,
    mangoFlesh,
    passion,
    passionInner: phys({ color: "#EFE4C6", roughness: 0.7, side: THREE.BackSide }),
    passionPulp: applySkin(phys({ map: pulpTex, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.03 }), {
      key: "pulp", pattern: "cells", scale: 26, bump: 0.6, low: [0.8, 0.8, 0.8], high: [1.08, 1.06, 1.0], rough: [1.3, 0.6],
    }),
    lime,
    limeRind: phys({ color: "#4C9420", roughness: 0.4 }),
    limeFace: applySkin(phys({ map: limeTex, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.03 }), {
      key: "limeFace", pattern: "fbm", scale: 30, bump: 0.3, low: [0.95, 0.95, 0.95], high: [1.04, 1.04, 1.02], rough: [1.4, 0.6],
    }),
    achachairu,
    achachairuFlesh: applySkin(phys({ map: fleshTex, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.04 }), {
      key: "achaFlesh", pattern: "fbm", scale: 22, bump: 0.22, low: [0.97, 0.97, 0.96], high: [1.02, 1.02, 1.02],
    }),
    leaf: phys({ map: getLeafTexture(), roughness: 0.42, clearcoat: 0.6, side: THREE.DoubleSide }),
    ice: applySkin(
      phys({ color: "#f4fbff", transmission: 1, thickness: 0.6, ior: 1.31, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08 }),
      { key: "ice", pattern: "fbm", scale: 5, bump: 0.45, low: [0.95, 0.97, 1.0], high: [1.0, 1.0, 1.0], rough: [0.4, 2.2] },
    ),
  };
}
export const getFruitMaterials = () => (mats ??= buildMaterials());

let leafGeo: THREE.BufferGeometry | null = null;
const getLeaf = () => (leafGeo ??= createLeafGeometry());

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
    case "ice":
      return <RoundedBox args={[0.42, 0.4, 0.42]} radius={0.07} smoothness={4} material={m.ice} />;
    case "leaf":
      return <mesh geometry={getLeaf()} material={m.leaf} />;
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
    { kind: "leaf", pos: [-0.5, -1.75, 0.95], rot: [-0.9, 0.4, 1.1], scale: 1.3 },
    { kind: "lychee", pos: [-1.35, -1.05, 0.6], scale: 1.4 },
    { kind: "lycheePeeled", pos: [1.25, -1.35, 0.8], scale: 1.3 },
    { kind: "raspberry", pos: [1.4, 0.45, 0.1], rot: [0.4, 0, 0.3], scale: 1.25 },
    { kind: "lychee", pos: [-1.15, 1.05, -0.5], scale: 1 },
    { kind: "raspberry", pos: [-0.75, -1.85, 1.1], rot: [-0.3, 0.5, 0], scale: 0.9 },
    { kind: "lycheePeeled", pos: [0.95, 1.55, -0.9], scale: 0.8 },
  ],
  "mango-passion": [
    { kind: "leaf", pos: [-1.55, -0.35, 0.4], rot: [-0.4, 0.3, 0.9], scale: 1.5 },
    { kind: "passionHalf", pos: [-1.35, -1.0, 0.6], rot: [1.1, 0, 0.25], scale: 1.35 },
    { kind: "mango", pos: [1.45, -1.25, 0.2], rot: [0.2, 0.6, -0.4], scale: 1.25 },
    { kind: "mangoCube", pos: [1.25, 0.6, 0.5], rot: [0.5, 0.6, 0.2], scale: 1.2 },
    { kind: "mangoCube", pos: [-1.05, 0.95, 0.3], rot: [0.2, 0.3, 0.8], scale: 1 },
    { kind: "passion", pos: [0.95, 1.6, -0.8], scale: 0.9 },
    { kind: "mangoCube", pos: [-0.65, -1.9, 1.2], rot: [0.9, 0.2, 0.4], scale: 0.8 },
  ],
  "achachairu-citrus": [
    { kind: "leaf", pos: [-1.6, -0.45, 0.4], rot: [-0.5, -0.2, 0.8], scale: 1.4 },
    { kind: "achachairuHalf", pos: [-1.35, -1.1, 0.6], rot: [1.0, 0, 0.3], scale: 1.4 },
    { kind: "limeSlice", pos: [1.4, -0.95, 0.6], rot: [1.25, 0.2, -0.35], scale: 1.25 },
    { kind: "achachairu", pos: [1.35, 0.7, -0.1], rot: [0.2, 0, 0.4], scale: 1.2 },
    { kind: "lime", pos: [-1.2, 0.95, -0.3], scale: 1 },
    { kind: "limeSlice", pos: [-0.6, -1.95, 1.1], rot: [1.0, 0, 0.8], scale: 0.85 },
    { kind: "achachairu", pos: [0.85, 1.65, -0.9], rot: [0.3, 0, -0.3], scale: 0.75 },
  ],
  "berry-mood": [
    { kind: "leaf", pos: [1.5, -0.5, 0.3], rot: [-0.3, 0.2, -0.9], scale: 1.3 },
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
