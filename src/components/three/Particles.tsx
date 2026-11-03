"use client";
import * as THREE from "three";
import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { rng } from "./textures";
import { sceneState } from "@/lib/sceneState";

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSpeed;
  attribute float aSize;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y = mod(p.y + uTime * aSpeed + 5.0, 10.0) - 5.0;
    p.x += sin(uTime * 0.3 + position.y * 2.0) * 0.08;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (12.0 / -mv.z);
    vAlpha = smoothstep(5.0, 3.5, abs(p.y));
  }
`;
const fragment = /* glsl */ `
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vec3(1.0, 0.96, 0.93), a * a * vAlpha * uOpacity);
  }
`;

export function Particles({ count = 140 }: { count?: number }) {
  const { geometry, uniforms } = useMemo(() => {
    const r = rng(99);
    const pos = new Float32Array(count * 3);
    const speed = new Float32Array(count);
    const size = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos.set([(r() - 0.5) * 16, (r() - 0.5) * 10, -5 + r() * 7], i * 3);
      speed[i] = 0.05 + r() * 0.12;
      size[i] = 1.5 + Math.pow(r(), 3) * 6;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    return {
      geometry: g,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uOpacity: { value: 0.55 } },
    };
  }, [count]);

  useFrame((state) => {
    if (!sceneState.reducedMotion) uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uPixelRatio.value = state.viewport.dpr;
    uniforms.uOpacity.value = 0.55 * sceneState.intro;
  });

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={5}>
      <shaderMaterial
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
