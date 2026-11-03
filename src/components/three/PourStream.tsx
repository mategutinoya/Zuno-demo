"use client";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { director } from "./director";
import { rng } from "./textures";

/** Written by LiveBottle every frame, read by the stream right after. */
export const pour = {
  /** 0 → 1: front of the stream travelling down */
  head: 0,
  /** 0 → 1: top of the stream detaching from the bottle */
  tail: 0,
  mouth: new THREE.Vector3(),
  dir: new THREE.Vector3(0, -1, 0),
  /** bottle scale (world units per bottle unit) */
  scale: 1,
};

const RINGS = 64;
const SIDES = 14;
const DROPS = 42;

/** Liquid pouring out of the bottle, following a real ballistic arc. */
export function PourStream() {
  const mesh = useRef<THREE.Mesh>(null);
  const drops = useRef<THREE.InstancedMesh>(null);

  const { geometry, material, dropMaterial, dropGeo } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(RINGS * SIDES * 3), 3));
    g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(RINGS * SIDES * 3), 3));
    const idx: number[] = [];
    for (let r = 0; r < RINGS - 1; r++) {
      for (let s = 0; s < SIDES; s++) {
        const a = r * SIDES + s;
        const b = r * SIDES + ((s + 1) % SIDES);
        const c = a + SIDES;
        const d = b + SIDES;
        idx.push(a, c, b, b, c, d);
      }
    }
    g.setIndex(idx);
    const material = new THREE.MeshPhysicalMaterial({
      color: "#F25C9E",
      emissive: "#F25C9E",
      emissiveIntensity: 0.35,
      roughness: 0.06,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      sheen: 1,
      sheenColor: new THREE.Color("#ffffff"),
      envMapIntensity: 1.4,
    });
    const dropMaterial = material.clone();
    return { geometry: g, material, dropMaterial, dropGeo: new THREE.SphereGeometry(1, 10, 8) };
  }, []);

  const seeds = useMemo(() => {
    const r = rng(77);
    return Array.from({ length: DROPS }, () => ({
      a: r(),
      speed: 0.25 + r() * 0.5,
      ang: r() * Math.PI * 2,
      dist: 1.6 + r() * 3.2,
      size: 0.25 + r() * 0.55,
    }));
  }, []);

  const tmp = useMemo(
    () => ({
      p: new THREE.Vector3(),
      t: new THREE.Vector3(),
      n: new THREE.Vector3(),
      b: new THREE.Vector3(),
      z: new THREE.Vector3(0, 0, 1),
      dummy: new THREE.Object3D(),
      white: new THREE.Color("#ffffff"),
    }),
    [],
  );

  useFrame((state) => {
    const m = mesh.current;
    const dm = drops.current;
    if (!m || !dm) return;
    const visible = pour.head - pour.tail > 0.002;
    m.visible = visible;
    dm.visible = visible;
    if (!visible) return;

    const time = state.clock.elapsedTime;
    const S = pour.scale;
    // ballistic arc: p(τ) = mouth + v·τ + ½·g·τ²
    const speed = 2.4 * S;
    const g = 16 * S;
    const vx = pour.dir.x * speed;
    const vy = pour.dir.y * speed;
    const vz = pour.dir.z * speed;
    const bottom = -director.worldH * 0.65;
    const dy = pour.mouth.y - bottom;
    const tMax = (vy + Math.sqrt(Math.max(0, vy * vy + 2 * g * dy))) / g;

    const at = (a: number, out: THREE.Vector3) => {
      const tau = a * tMax;
      return out.set(pour.mouth.x + vx * tau, pour.mouth.y + vy * tau - 0.5 * g * tau * tau, pour.mouth.z + vz * tau);
    };
    const tangent = (a: number, out: THREE.Vector3) => {
      const tau = a * tMax;
      return out.set(vx, vy - g * tau, vz).normalize();
    };

    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const nor = geometry.attributes.normal as THREE.BufferAttribute;
    const r0 = 0.085 * S;
    for (let i = 0; i < RINGS; i++) {
      const f = i / (RINGS - 1);
      const a = pour.tail + (pour.head - pour.tail) * f;
      at(a, tmp.p);
      tangent(a, tmp.t);
      tmp.n.crossVectors(tmp.t, tmp.z).normalize();
      tmp.b.crossVectors(tmp.n, tmp.t).normalize();
      // gentle wobble travelling down the stream
      const wob = Math.sin(a * 38 - time * 14) * 0.012 * S * (0.3 + a);
      tmp.p.addScaledVector(tmp.n, wob);
      // thins as it accelerates, rounded at both ends
      const ends = Math.min(1, f * 6, (1 - f) * 10 + 0.15);
      const radius = r0 * (1 - 0.45 * a) * (0.92 + 0.08 * Math.sin(a * 70 - time * 20)) * Math.sqrt(Math.max(ends, 0.05));
      for (let s = 0; s < SIDES; s++) {
        const th = (s / SIDES) * Math.PI * 2;
        const c = Math.cos(th);
        const sn = Math.sin(th);
        const nx = tmp.n.x * c + tmp.b.x * sn;
        const ny = tmp.n.y * c + tmp.b.y * sn;
        const nz = tmp.n.z * c + tmp.b.z * sn;
        const k = i * SIDES + s;
        pos.setXYZ(k, tmp.p.x + nx * radius, tmp.p.y + ny * radius, tmp.p.z + nz * radius);
        nor.setXYZ(k, nx, ny, nz);
      }
    }
    pos.needsUpdate = true;
    nor.needsUpdate = true;
    geometry.computeBoundingSphere();

    // colour follows the active flavour
    material.color.copy(director.flavorLiquid);
    material.emissive.copy(director.flavorLiquid);
    dropMaterial.color.copy(director.flavorLiquid).lerp(tmp.white, 0.15);
    dropMaterial.emissive.copy(director.flavorLiquid);

    // droplets breaking away from the stream
    seeds.forEach((d, i) => {
      const a = pour.tail + (pour.head - pour.tail) * ((d.a + time * d.speed * 0.25) % 1);
      at(a, tmp.p);
      tangent(a, tmp.t);
      tmp.n.crossVectors(tmp.t, tmp.z).normalize();
      tmp.b.crossVectors(tmp.n, tmp.t).normalize();
      const spread = r0 * d.dist * (0.4 + a);
      tmp.p
        .addScaledVector(tmp.n, Math.cos(d.ang + time) * spread)
        .addScaledVector(tmp.b, Math.sin(d.ang + time) * spread);
      tmp.dummy.position.copy(tmp.p);
      tmp.dummy.scale.setScalar(r0 * d.size * (a > 0.05 ? 1 : 0));
      tmp.dummy.updateMatrix();
      dm.setMatrixAt(i, tmp.dummy.matrix);
    });
    dm.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <mesh ref={mesh} geometry={geometry} material={material} frustumCulled={false} />
      <instancedMesh ref={drops} args={[dropGeo, dropMaterial, DROPS]} frustumCulled={false} />
    </>
  );
}
