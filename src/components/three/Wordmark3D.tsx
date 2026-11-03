"use client";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { createWordmarkCanvas } from "./textures";
import { director } from "./director";
import { sceneState } from "@/lib/sceneState";

const Z = -1.6;

/** Giant ZUNO wordmark living *behind* the bottle, so the glass refracts it. */
export function Wordmark3D() {
  const mesh = useRef<THREE.Mesh>(null);
  const last = useRef(-1);
  const { wm, texture, material } = useMemo(() => {
    const wm = createWordmarkCanvas();
    const texture = new THREE.CanvasTexture(wm.canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      alphaTest: 0.5,
      alphaToCoverage: true,
      toneMapped: false,
    });
    return { wm, texture, material };
  }, []);

  useEffect(() => () => {
    texture.dispose();
    material.dispose();
  }, [texture, material]);

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const a = director.anchors.wordmark;
    m.visible = a.visible && a.w > 0;
    if (!m.visible) return;
    const cam = state.camera as THREE.PerspectiveCamera;
    const f = (cam.position.z - Z) / cam.position.z;
    const px = sceneState.reducedMotion ? 0 : -sceneState.pointer.x * 0.12;
    const py = sceneState.reducedMotion ? 0 : sceneState.pointer.y * 0.06;
    m.position.set(a.x * f + px, a.y * f + py, Z);
    const w = a.w * f;
    m.scale.set(w, w / wm.aspect, 1);

    const p = THREE.MathUtils.clamp((sceneState.intro - 0.08) / 0.62, 0, 1);
    const q = Math.round(p * 120) / 120;
    if (q !== last.current) {
      last.current = q;
      wm.draw(q);
      texture.needsUpdate = true;
    }
  });

  return (
    <mesh ref={mesh} material={material}>
      <planeGeometry />
    </mesh>
  );
}
