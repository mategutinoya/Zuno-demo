"use client";
import * as THREE from "three";
import { forwardRef, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { getBottleGeometry } from "./bottleGeometry";
import { BOTTLE, LABEL } from "./dimensions";
import { createCapTopTexture, createCondensationMaps, rng } from "./textures";

export type Quality = "high" | "low";

let condensation: ReturnType<typeof createCondensationMaps> | null = null;
let capTop: THREE.Texture | null = null;
const getCondensation = () => (condensation ??= createCondensationMaps());

export interface BottleMaterials {
  glass: THREE.MeshPhysicalMaterial;
  liquid: THREE.MeshPhysicalMaterial;
  label: THREE.MeshPhysicalMaterial;
  cap: THREE.MeshStandardMaterial;
  capTop: THREE.MeshStandardMaterial;
  drop: THREE.MeshPhysicalMaterial;
  bubble: THREE.MeshStandardMaterial;
}

export function createBottleMaterials(
  liquidColor: string,
  label: THREE.Texture | null,
  quality: Quality = "high",
): BottleMaterials {
  const cond = getCondensation();
  const glassNormal = cond.normalMap.clone();
  glassNormal.repeat.set(3, 2.4);
  const glassRough = cond.roughnessMap.clone();
  glassRough.repeat.set(3, 2.4);
  const labelNormal = cond.normalMap.clone();
  labelNormal.repeat.set(2.2, 1.6);
  [glassNormal, glassRough, labelNormal].forEach((t) => (t.needsUpdate = true));

  const liquid = new THREE.Color(liquidColor);
  capTop ??= createCapTopTexture();

  const low = quality === "low";
  return {
    // Phones: transparent glass with studio reflections instead of real
    // transmission, which would render the whole scene a second time per frame.
    glass: low
      ? (new THREE.MeshPhysicalMaterial({
          color: "#ffffff",
          transparent: true,
          opacity: 0.2,
          roughness: 0.06,
          normalMap: glassNormal,
          normalScale: new THREE.Vector2(0.35, 0.35),
          clearcoat: 1,
          clearcoatRoughness: 0.05,
          envMapIntensity: 1.8,
          depthWrite: false,
        }) as THREE.MeshPhysicalMaterial)
      : new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      transmission: 1,
      thickness: 0.55,
      ior: 1.5,
      roughness: 0.55,
      roughnessMap: glassRough,
      normalMap: glassNormal,
      normalScale: new THREE.Vector2(0.45, 0.45),
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      specularIntensity: 1,
      envMapIntensity: 1.35,
      attenuationColor: new THREE.Color("#fff6fb"),
      attenuationDistance: 4,
        }),
    liquid: new THREE.MeshPhysicalMaterial({
      color: liquid.clone(),
      emissive: liquid.clone().multiplyScalar(0.32),
      roughness: 0.18,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      sheen: 1,
      sheenRoughness: 0.35,
      sheenColor: liquid.clone().lerp(new THREE.Color("#ffffff"), 0.55),
      envMapIntensity: 0.9,
    }),
    label: new THREE.MeshPhysicalMaterial({
      map: label,
      roughness: 0.42,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
      clearcoatNormalMap: labelNormal,
      clearcoatNormalScale: new THREE.Vector2(0.9, 0.9),
      envMapIntensity: 0.6,
    }),
    cap: new THREE.MeshStandardMaterial({ color: "#121015", metalness: 0.9, roughness: 0.28, envMapIntensity: 1.4 }),
    capTop: new THREE.MeshStandardMaterial({ map: capTop, metalness: 0.75, roughness: 0.32 }),
    drop: new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      ...(low ? { transparent: true, opacity: 0.55, depthWrite: false } : { transmission: 1 }),
      roughness: 0.02,
      thickness: 0.06,
      ior: 1.33,
      clearcoat: 1,
      envMapIntensity: 2,
    }),
    bubble: new THREE.MeshStandardMaterial({
      color: liquid.clone().lerp(new THREE.Color("#ffffff"), 0.6),
      emissive: liquid.clone().lerp(new THREE.Color("#ffffff"), 0.5).multiplyScalar(0.25),
      roughness: 0.1,
    }),
  };
}

const dropGeo = new THREE.SphereGeometry(1, 10, 8);
const bubbleGeo = new THREE.SphereGeometry(1, 8, 6);
/** liquid running through the neck while pouring (hidden otherwise) */
const neckFlowGeo = new THREE.CylinderGeometry(0.15, 0.17, 0.95, 24, 1, false).translate(0, 1.0, 0);
const labelGeo = new THREE.CylinderGeometry(
  LABEL.radius,
  LABEL.radius,
  LABEL.height,
  128,
  1,
  true,
  -LABEL.arc * Math.PI,
  LABEL.arc * Math.PI * 2,
);

interface Props {
  materials: BottleMaterials;
  quality?: Quality;
  animated?: boolean;
  seed?: number;
}

/** Pure bottle model, centred at origin, height ≈ BOTTLE.height */
export const BottleModel = forwardRef<THREE.Group, Props>(function BottleModel(
  { materials, quality = "high", animated = true, seed = 3 },
  ref,
) {
  const geo = getBottleGeometry();
  const dropsRef = useRef<THREE.InstancedMesh>(null);
  const bubblesRef = useRef<THREE.InstancedMesh>(null);
  const dropCount = quality === "high" ? 170 : 45;
  const bubbleCount = quality === "high" ? 46 : 14;

  const dropMatrices = useMemo(() => {
    const r = rng(seed);
    const dummy = new THREE.Object3D();
    const out: THREE.Matrix4[] = [];
    for (let i = 0; i < dropCount; i++) {
      const y = THREE.MathUtils.lerp(-1.66, 1.0, Math.pow(r(), 0.8));
      const onLabel = y > LABEL.centerY - LABEL.height / 2 && y < LABEL.centerY + LABEL.height / 2;
      const base = Math.max(geo.radiusAt(y), onLabel ? LABEL.radius : 0);
      const a = r() * Math.PI * 2;
      const rad = base + 0.004;
      dummy.position.set(Math.sin(a) * rad, y, Math.cos(a) * rad);
      dummy.lookAt(dummy.position.x * 2, y, dummy.position.z * 2);
      const s = 0.008 + Math.pow(r(), 3) * 0.03;
      dummy.scale.set(s, s * (1.1 + r() * 0.5), s * 0.42);
      dummy.updateMatrix();
      out.push(dummy.matrix.clone());
    }
    return out;
  }, [dropCount, geo, seed]);

  const bubbles = useMemo(() => {
    const r = rng(seed + 11);
    return Array.from({ length: bubbleCount }, () => ({
      a: r() * Math.PI * 2,
      y: r(),
      speed: 0.04 + r() * 0.08,
      size: 0.006 + r() * 0.012,
      wobble: r() * 10,
    }));
  }, [bubbleCount, seed]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const initialised = useRef(false);

  useFrame((_, dt) => {
    const drops = dropsRef.current;
    if (drops && !initialised.current) {
      dropMatrices.forEach((m, i) => drops.setMatrixAt(i, m));
      drops.instanceMatrix.needsUpdate = true;
      initialised.current = true;
    }
    const b = bubblesRef.current;
    if (!b) return;
    const step = animated ? Math.min(dt, 0.05) : 0;
    const y0 = -0.35;
    const y1 = BOTTLE.fillLevel - 0.03;
    bubbles.forEach((bb, i) => {
      bb.y = (bb.y + step * bb.speed) % 1;
      const y = THREE.MathUtils.lerp(y0, y1, bb.y);
      const rr = geo.radiusAt(y) * 0.968;
      const a = bb.a + Math.sin(bb.y * 6 + bb.wobble) * 0.05;
      dummy.position.set(Math.sin(a) * rr, y, Math.cos(a) * rr);
      dummy.scale.setScalar(bb.size * (0.6 + bb.y * 0.6));
      dummy.updateMatrix();
      b.setMatrixAt(i, dummy.matrix);
    });
    b.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={ref}>
      <group position-y={BOTTLE.centerOffset}>
        <mesh name="liquid" geometry={geo.liquid} material={materials.liquid} />
        <mesh name="neckFlow" geometry={neckFlowGeo} material={materials.liquid} visible={false} />
        <instancedMesh name="bubbles" ref={bubblesRef} args={[bubbleGeo, materials.bubble, bubbleCount]} frustumCulled={false} />
        <mesh geometry={geo.glass} material={materials.glass} />
        <mesh geometry={labelGeo} material={materials.label} position-y={LABEL.centerY} />
        <instancedMesh ref={dropsRef} args={[dropGeo, materials.drop, dropCount]} frustumCulled={false} />
        <mesh name="cap" geometry={geo.cap} position-y={1.53} material={[materials.cap, materials.capTop, materials.cap]} />
      </group>
    </group>
  );
});
