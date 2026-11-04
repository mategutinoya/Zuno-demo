"use client";
import * as THREE from "three";
import { forwardRef, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { getBottleGeometry } from "./bottleGeometry";
import { BOTTLE, LABEL } from "./dimensions";
import { createCapTopTexture, createCondensationMaps, rng } from "./textures";

export type Quality = "high" | "low";

let condensation: ReturnType<typeof createCondensationMaps> | null = null;
let capTop: THREE.Texture | null = null;
const getCondensation = () => (condensation ??= createCondensationMaps());

/* ---------------------------------------------------------- shader patches */

const FRESNEL = /* glsl */ `
  float zFr = clamp(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 0.0, 1.0);
`;

/** Liquid reads as a lit, translucent volume: glowing core, dense rim, lighter toward the top. */
function patchLiquid(m: THREE.MeshPhysicalMaterial, seeThrough = false) {
  // world-space height of the liquid surface, updated every frame (gravity)
  const surface = { value: 1e4 };
  m.userData.surface = surface;
  m.side = THREE.DoubleSide;
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uSurface = surface;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vLiqY;\nvarying float vWorldY;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLiqY = position.y;")
      .replace("#include <project_vertex>", "#include <project_vertex>\nvWorldY = (modelMatrix * vec4(transformed, 1.0)).y;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vLiqY;\nvarying float vWorldY;\nuniform float uSurface;")
      // everything above the horizontal surface is air
      .replace("#include <clipping_planes_fragment>", "if (vWorldY > uSurface) discard;\n#include <clipping_planes_fragment>")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        ${FRESNEL}
        float zDepth = smoothstep(-1.74, 0.6, vLiqY);
        totalEmissiveRadiance *= mix(2.1, 0.06, pow(zFr, 1.3)) * mix(0.55, 1.15, zDepth);
        diffuseColor.rgb *= mix(1.0, 0.42, pow(zFr, 1.7)) * mix(0.72, 1.06, zDepth);
        // seen through the cut, the far inner walls read as the flat, lit surface
        if (!gl_FrontFacing) {
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), 0.18);
          totalEmissiveRadiance = diffuseColor.rgb * 0.6;
        }`,
      );
    if (seeThrough) {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        `#include <opaque_fragment>
        gl_FragColor.a = mix(0.78, 0.97, pow(zFr, 1.2));`,
      );
    }
  };
  m.customProgramCacheKey = () => (seeThrough ? "zuno-liquid-a" : "zuno-liquid");
}

/** Without transmission: nearly invisible face-on, reflective and denser at the edges. */
function patchFresnelGlass(m: THREE.MeshPhysicalMaterial, min: number, max: number, key: string) {
  m.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <opaque_fragment>",
      `#include <opaque_fragment>
      ${FRESNEL}
      gl_FragColor.a = mix(${min.toFixed(3)}, ${max.toFixed(3)}, pow(zFr, 2.3));
      gl_FragColor.rgb *= mix(vec3(1.0), vec3(0.74, 0.84, 0.79), pow(zFr, 2.0));`,
    );
  };
  m.customProgramCacheKey = () => key;
}

export interface BottleMaterials {
  /** back faces of the glass, to show wall thickness above the liquid */
  innerWall: THREE.MeshPhysicalMaterial;
  glass: THREE.MeshPhysicalMaterial;
  liquid: THREE.MeshPhysicalMaterial;
  label: THREE.MeshPhysicalMaterial;
  cap: THREE.MeshPhysicalMaterial;
  capTop: THREE.MeshPhysicalMaterial;
  capUnder: THREE.MeshStandardMaterial;
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
  const mats: BottleMaterials = {
    // The glass is a reflective Fresnel shell; on desktop the refraction lives in
    // the liquid (real transmission). Phones skip transmission entirely: it would
    // render the whole scene a second time per frame.
    glass: new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      transparent: true,
      roughness: 0.04,
      roughnessMap: glassRough,
      normalMap: glassNormal,
      normalScale: new THREE.Vector2(0.32, 0.32),
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      specularIntensity: 1,
      envMapIntensity: 2.2,
      depthWrite: false,
    }),
    liquid: low
      ? new THREE.MeshPhysicalMaterial({
          color: liquid.clone(),
          emissive: liquid.clone().multiplyScalar(0.32),
          roughness: 0.08,
          clearcoat: 1,
          clearcoatRoughness: 0.04,
          envMapIntensity: 0.7,
          transparent: true,
        })
      : new THREE.MeshPhysicalMaterial({
          // a real refracting volume, tinted by absorption: deeper where thicker
          color: liquid.clone().lerp(new THREE.Color("#ffffff"), 0.2),
          transmission: 1,
          thickness: 1.1,
          ior: 1.34,
          roughness: 0.04,
          attenuationColor: liquid.clone(),
          attenuationDistance: 0.9,
          emissive: liquid.clone().multiplyScalar(0.16),
          clearcoat: 1,
          clearcoatRoughness: 0.04,
          envMapIntensity: 0.8,
        }),
    innerWall: new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      transparent: true,
      side: THREE.BackSide,
      roughness: 0.03,
      envMapIntensity: 1.4,
      depthWrite: false,
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
    // black lacquered steel crown: glossy clear coat over metal, crisp studio reflections
    cap: new THREE.MeshPhysicalMaterial({
      color: "#26222b",
      metalness: 1,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      specularIntensity: 1,
      envMapIntensity: 2.6,
    }),
    capUnder: new THREE.MeshStandardMaterial({ color: "#0d0b0f", roughness: 0.7, envMapIntensity: 0.2 }),
    capTop: new THREE.MeshPhysicalMaterial({
      map: capTop,
      metalness: 0.85,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 2.4,
    }),
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
  patchLiquid(mats.liquid, low);
  patchFresnelGlass(mats.glass, low ? 0.04 : 0.03, low ? 0.8 : 0.72, low ? "zuno-glass-low" : "zuno-glass");
  patchFresnelGlass(mats.innerWall, 0.0, 0.32, "zuno-glass-inner");
  return mats;
}

const dropGeo = new THREE.SphereGeometry(1, 10, 8);
const bubbleGeo = new THREE.SphereGeometry(1, 8, 6);
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
  /** liquid amount, 1 = full bottle (upright fill line) */
  level?: { current: number };
}

/** k-th smallest value (in place, Hoare quickselect) */
function quickselect(a: Float32Array, k: number) {
  let lo = 0;
  let hi = a.length - 1;
  while (lo < hi) {
    const pivot = a[(lo + hi) >> 1];
    let i = lo;
    let j = hi;
    while (i <= j) {
      while (a[i] < pivot) i++;
      while (a[j] > pivot) j--;
      if (i <= j) {
        const t = a[i];
        a[i] = a[j];
        a[j] = t;
        i++;
        j--;
      }
    }
    if (k <= j) hi = j;
    else if (k >= i) lo = i;
    else break;
  }
  return a[k];
}

/** Pure bottle model, centred at origin, height ≈ BOTTLE.height */
export const BottleModel = forwardRef<THREE.Group, Props>(function BottleModel(
  { materials, quality = "high", animated = true, seed = 3, level },
  ref,
) {
  const geo = getBottleGeometry();
  const fallbackLevel = useRef({ current: 1 });
  const levelRef = level ?? fallbackLevel.current;
  const ys = useMemo(() => new Float32Array(geo.volumeSamples.length / 3), [geo]);
  const lastFrame = useRef(-1);
  const liquidRef = useRef<THREE.Mesh>(null);

  /** Solve the horizontal surface height that holds the current volume at any tilt. */
  const solveSurface = (mesh: THREE.Object3D, renderer: THREE.WebGLRenderer) => {
    const frame = renderer.info.render.frame;
    if (frame === lastFrame.current) return;
    lastFrame.current = frame;
    const e = mesh.matrixWorld.elements;
    const v = geo.volumeSamples;
    const n = ys.length;
    for (let i = 0; i < n; i++) {
      ys[i] = e[1] * v[i * 3] + e[5] * v[i * 3 + 1] + e[9] * v[i * 3 + 2] + e[13];
    }
    const frac = THREE.MathUtils.clamp(levelRef.current, 0, 1) * geo.fullFraction;
    const k = Math.floor(frac * (n - 1));
    const surface = materials.liquid.userData.surface as { value: number };
    surface.value = k <= 0 ? -1e4 : quickselect(ys, k);
  };

  // runs right before the liquid is drawn, with this frame's final transforms
  useEffect(() => {
    const mesh = liquidRef.current;
    if (!mesh) return;
    mesh.onBeforeRender = (renderer) => solveSurface(mesh, renderer);
    return () => {
      mesh.onBeforeRender = () => {};
    };
  });
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
      size: 0.004 + r() * 0.008,
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
        <mesh
          name="liquid"
          geometry={geo.liquid}
          material={materials.liquid}
          renderOrder={0}
          ref={liquidRef}
        />
        <instancedMesh name="bubbles" ref={bubblesRef} args={[bubbleGeo, materials.bubble, bubbleCount]} frustumCulled={false} />
        <mesh geometry={geo.glass} material={materials.innerWall} scale={[0.93, 0.996, 0.93]} renderOrder={1} />
        <mesh geometry={geo.glass} material={materials.glass} renderOrder={2} />
        <mesh geometry={labelGeo} material={materials.label} position-y={LABEL.centerY} />
        <instancedMesh ref={dropsRef} args={[dropGeo, materials.drop, dropCount]} frustumCulled={false} />
        <mesh name="cap" geometry={geo.cap} position-y={1.53} material={[materials.cap, materials.capTop, materials.capUnder]} />
      </group>
    </group>
  );
});
