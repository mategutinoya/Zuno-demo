"use client";
import * as THREE from "three";
import { useMemo } from "react";
import { useThree } from "@react-three/fiber";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const fragment = /* glsl */ `
  uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uBottom; uniform vec3 uGlow;
  uniform vec2 uSun; uniform float uSunR; uniform vec3 uSunColor; uniform float uAspect;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec2 uv = vUv;
    vec3 col = uv.y > 0.5 ? mix(uMid, uTop, smoothstep(0.5, 1.0, uv.y)) : mix(uBottom, uMid, smoothstep(0.0, 0.5, uv.y));
    vec2 p = vec2((uv.x - 0.5) * uAspect, uv.y - 0.5);
    col = mix(col, uGlow, 0.45 * smoothstep(0.7, 0.0, length(p - vec2(0.0, -0.05))));
    if (uSunR > 0.0) {
      vec2 sp = vec2((uSun.x - 0.5) * uAspect, uSun.y - 0.5);
      float d = length(p - sp);
      col = mix(col, uSunColor, smoothstep(uSunR, uSunR * 0.92, d));
      col += uSunColor * 0.35 * smoothstep(uSunR * 4.0, uSunR, d);
    }
    col *= mix(0.78, 1.0, smoothstep(1.1, 0.25, length(p)));
    col += (hash(uv * 1200.0) - 0.5) * 0.02;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export interface BackdropProps {
  top: string;
  mid: string;
  bottom: string;
  glow: string;
  sun?: { x: number; y: number; r: number; color: string };
  z?: number;
}

/** Gradient backdrop sized exactly to the camera frustum so UVs map to the frame. */
export function Backdrop({ top, mid, bottom, glow, sun, z = -8 }: BackdropProps) {
  const { camera, size } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const d = cam.position.z - z;
  const height = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * d * 1.6;
  const width = height * (size.width / size.height);
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color(top) },
      uMid: { value: new THREE.Color(mid) },
      uBottom: { value: new THREE.Color(bottom) },
      uGlow: { value: new THREE.Color(glow) },
      uSun: { value: new THREE.Vector2(sun?.x ?? 0.5, sun?.y ?? 0.5) },
      uSunR: { value: sun?.r ?? 0 },
      uSunColor: { value: new THREE.Color(sun?.color ?? "#fff") },
      uAspect: { value: width / height },
    }),
    [top, mid, bottom, glow, sun, width, height],
  );
  return (
    <mesh position={[cam.position.x, cam.position.y, z]} scale={[width, height, 1]}>
      <planeGeometry />
      <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
