"use client";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { director } from "./director";
import { sceneState } from "@/lib/sceneState";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uC;
  uniform float uTime;
  uniform float uAspect;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec2 uv = vUv;
    vec2 p = vec2((uv.x - 0.5) * uAspect, uv.y - 0.5);
    float t = uTime * 0.05;

    vec3 col = mix(uA, uB, smoothstep(-0.15, 1.05, uv.y + 0.08 * sin(uv.x * 3.0 + t * 4.0)));

    // drifting soft light pools
    vec2 c1 = vec2(-0.35 * uAspect + 0.12 * sin(t * 3.1), 0.2 + 0.1 * cos(t * 2.3));
    vec2 c2 = vec2(0.38 * uAspect + 0.1 * cos(t * 2.7), -0.18 + 0.12 * sin(t * 1.9));
    col = mix(col, uC, 0.55 * smoothstep(0.75, 0.0, length(p - c1)));
    col = mix(col, uC, 0.4 * smoothstep(0.6, 0.0, length(p - c2)));

    // studio key glow behind the product
    col += 0.07 * smoothstep(0.55, 0.0, length(p * vec2(0.8, 0.6)));

    // vignette
    col *= mix(0.82, 1.0, smoothstep(1.15, 0.25, length(p)));

    // film grain
    col += (hash(uv * 900.0 + fract(uTime)) - 0.5) * 0.022;

    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const DEPTH = -7;

export function Background() {
  const mesh = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const uniforms = useMemo(
    () => ({
      uA: { value: director.bg[0] },
      uB: { value: director.bg[1] },
      uC: { value: director.bg[2] },
      uTime: { value: 0 },
      uAspect: { value: 1 },
    }),
    [],
  );

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const cam = camera as THREE.PerspectiveCamera;
    const dist = cam.position.z - DEPTH;
    const h = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * dist * 1.04;
    const w = h * (state.size.width / state.size.height);
    m.scale.set(w, h, 1);
    uniforms.uAspect.value = w / h;
    if (!sceneState.reducedMotion) uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh ref={mesh} position-z={DEPTH} renderOrder={-10}>
      <planeGeometry />
      <shaderMaterial
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
