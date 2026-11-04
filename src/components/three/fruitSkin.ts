import * as THREE from "three";

/**
 * Procedural fruit skin, computed per pixel from object-space 3D noise so it
 * needs no UVs: micro relief (perturbed normals), colour variation, lenticels
 * (speckles) and roughness variation.
 */
export interface SkinOptions {
  key: string;
  /** relief pattern */
  pattern: "fbm" | "cells" | "pores";
  /** noise frequency in object units */
  scale: number;
  /** normal perturbation strength */
  bump: number;
  /** colour multiplier at low / high relief */
  low?: [number, number, number];
  high?: [number, number, number];
  /** speckles */
  speck?: { color: [number, number, number]; density: number; scale: number };
  /** roughness multiplier range */
  rough?: [number, number];
}

const NOISE = /* glsl */ `
  varying vec3 vSkinPos;
  float zHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float zNoise(vec3 x) {
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(zHash(i + vec3(0,0,0)), zHash(i + vec3(1,0,0)), f.x),
                   mix(zHash(i + vec3(0,1,0)), zHash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(zHash(i + vec3(0,0,1)), zHash(i + vec3(1,0,1)), f.x),
                   mix(zHash(i + vec3(0,1,1)), zHash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float zFbm(vec3 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * zNoise(p); p *= 2.03; a *= 0.5; } return s; }
  float zCells(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p); float d = 1.0;
    for (int x = -1; x <= 1; x++) for (int y = -1; y <= 1; y++) for (int z = -1; z <= 1; z++) {
      vec3 g = vec3(x, y, z);
      vec3 o = vec3(zHash(i + g), zHash(i + g + 17.1), zHash(i + g + 31.7));
      d = min(d, length(g + o - f));
    }
    return d;
  }
`;

function heightFn(o: SkinOptions) {
  const s = o.scale.toFixed(3);
  switch (o.pattern) {
    case "cells":
      // raised, slightly pointed polygonal knobs (lychee skin)
      return `float zH(vec3 p) { float c = zCells(p * ${s}); return pow(clamp(1.0 - c, 0.0, 1.0), 1.6) + 0.15 * zFbm(p * ${s} * 3.0); }`;
    case "pores":
      // tiny sunken pores (citrus peel)
      return `float zH(vec3 p) { float c = zCells(p * ${s}); return smoothstep(0.0, 0.35, c) * 0.8 + 0.2 * zFbm(p * ${s} * 0.25); }`;
    default:
      return `float zH(vec3 p) { return zFbm(p * ${s}); }`;
  }
}

const v3 = (c: [number, number, number]) => `vec3(${c.map((x) => x.toFixed(3)).join(",")})`;

export function applySkin(m: THREE.MeshStandardMaterial, o: SkinOptions) {
  const low = o.low ?? [0.85, 0.85, 0.85];
  const high = o.high ?? [1.08, 1.08, 1.08];
  const rough = o.rough ?? [0.85, 1.15];
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vSkinPos;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvSkinPos = position;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nuniform mat3 normalMatrix;\n${NOISE}\n${heightFn(o)}`)
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float zh = zH(vSkinPos);
        diffuseColor.rgb *= mix(${v3(low)}, ${v3(high)}, zh);
        ${
          o.speck
            ? `float zs = zNoise(vSkinPos * ${o.speck.scale.toFixed(2)});
               diffuseColor.rgb = mix(diffuseColor.rgb, ${v3(o.speck.color)}, smoothstep(${(1 - o.speck.density).toFixed(3)}, ${(1 - o.speck.density + 0.02).toFixed(3)}, zs));`
            : ""
        }`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        roughnessFactor = clamp(roughnessFactor * mix(${rough[0].toFixed(2)}, ${rough[1].toFixed(2)}, zh), 0.02, 1.0);`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
        {
          float e = ${(0.12 / o.scale).toFixed(5)};
          vec3 grad = vec3(
            zH(vSkinPos + vec3(e, 0.0, 0.0)) - zH(vSkinPos - vec3(e, 0.0, 0.0)),
            zH(vSkinPos + vec3(0.0, e, 0.0)) - zH(vSkinPos - vec3(0.0, e, 0.0)),
            zH(vSkinPos + vec3(0.0, 0.0, e)) - zH(vSkinPos - vec3(0.0, 0.0, e))
          ) / (2.0 * e);
          normal = normalize(normal - normalize(normalMatrix * grad + 1e-5) * clamp(length(grad) / ${o.scale.toFixed(3)}, 0.0, 1.0) * ${o.bump.toFixed(3)});
        }`,
      );
  };
  m.customProgramCacheKey = () => `zuno-skin-${o.key}`;
  return m;
}

/** Leaf vein texture (shared). */
let leafTex: THREE.Texture | null = null;
export function getLeafTexture() {
  if (leafTex) return leafTex;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, "#2f6b25");
  g.addColorStop(0.5, "#4f9a3a");
  g.addColorStop(1, "#2c6322");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 512);
  ctx.strokeStyle = "rgba(205,235,160,0.75)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(128, 512);
  ctx.lineTo(128, 0);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(205,235,160,0.4)";
  for (let y = 470; y > 30; y -= 34) {
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(128, y);
      ctx.quadraticCurveTo(128 + side * 60, y - 26, 128 + side * 124, y - 70);
      ctx.stroke();
    }
  }
  leafTex = new THREE.CanvasTexture(c);
  leafTex.colorSpace = THREE.SRGBColorSpace;
  return leafTex;
}

/** Pointed, gently curved leaf blade (≈0.55 long). */
export function createLeafGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.12, 0.12, 0.13, 0.36, 0, 0.56);
  shape.bezierCurveTo(-0.13, 0.36, -0.12, 0.12, 0, 0);
  const g = new THREE.ShapeGeometry(shape, 16);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // fold along the midrib and arc along the length
    pos.setZ(i, Math.abs(x) * 0.35 + Math.sin((y / 0.56) * Math.PI) * 0.05);
    uv.setXY(i, x / 0.26 + 0.5, y / 0.56);
  }
  g.computeVertexNormals();
  return g;
}
