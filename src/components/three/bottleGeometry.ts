import * as THREE from "three";
import { BOTTLE } from "./dimensions";

let cache: ReturnType<typeof build> | null = null;

function build() {
  const v = (x: number, y: number) => new THREE.Vector2(x, y);
  const R = BOTTLE.bodyRadius;
  const path = new THREE.CurvePath<THREE.Vector2>();
  path.add(new THREE.LineCurve(v(0.001, -1.8), v(0.38, -1.8)));
  path.add(new THREE.QuadraticBezierCurve(v(0.38, -1.8), v(R, -1.8), v(R, -1.7)));
  path.add(new THREE.LineCurve(v(R, -1.7), v(R, -0.02)));
  path.add(new THREE.CubicBezierCurve(v(R, -0.02), v(R, 0.48), v(0.19, 0.6), v(0.19, 1.06)));
  path.add(new THREE.LineCurve(v(0.19, 1.06), v(0.183, 1.38)));
  path.add(new THREE.QuadraticBezierCurve(v(0.183, 1.38), v(0.205, 1.4), v(0.205, 1.46)));
  path.add(new THREE.LineCurve(v(0.205, 1.46), v(0.17, 1.5)));
  path.add(new THREE.LineCurve(v(0.17, 1.5), v(0.001, 1.5)));

  const outline = path.getSpacedPoints(160);
  // de-duplicate consecutive points
  const profile = outline.filter((p, i) => i === 0 || p.distanceTo(outline[i - 1]) > 1e-4);

  const radiusAt = (y: number) => {
    let best = 0;
    for (let i = 1; i < profile.length; i++) {
      const a = profile[i - 1];
      const b = profile[i];
      if ((a.y <= y && b.y >= y) || (b.y <= y && a.y >= y)) {
        const t = b.y === a.y ? 0 : (y - a.y) / (b.y - a.y);
        best = Math.max(best, THREE.MathUtils.lerp(a.x, b.x, t));
      }
    }
    return best;
  };

  const glass = new THREE.LatheGeometry(profile, 96);

  // Liquid: fills the whole interior; the visible amount is cut at runtime by a
  // horizontal (world-space) surface, so it behaves with gravity when tilted.
  const INSET = 0.945;
  const liquidBottom = -1.74;
  const liquidTop = 1.44;
  const liquidPts: THREE.Vector2[] = [v(0.001, liquidBottom)];
  for (const p of profile) {
    if (p.y <= liquidBottom || p.y >= liquidTop) continue;
    if (p.x < 0.05) continue;
    liquidPts.push(v(p.x * INSET, p.y));
  }
  const rt = radiusAt(liquidTop) * INSET;
  liquidPts.push(v(rt, liquidTop), v(0.001, liquidTop));
  const liquid = new THREE.LatheGeometry(liquidPts, 64);

  // Uniform sample points inside the liquid volume (rejection sampling), used to
  // find the surface height that keeps the volume constant at any tilt.
  const rMax = BOTTLE.bodyRadius * INSET;
  const samples: number[] = [];
  let seed = 12345;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  let below = 0;
  while (samples.length < 3600 * 3) {
    const x = (rand() * 2 - 1) * rMax;
    const z = (rand() * 2 - 1) * rMax;
    const y = liquidBottom + rand() * (liquidTop - liquidBottom);
    if (Math.hypot(x, z) > radiusAt(y) * INSET) continue;
    samples.push(x, y, z);
    if (y < BOTTLE.fillLevel) below++;
  }
  const volumeSamples = new Float32Array(samples);
  /** fraction of the interior that is liquid when the bottle is full (upright fill line) */
  const fullFraction = below / (samples.length / 3);

  // Crown cork: low and thin, slightly wider than the lip, with 21 short
  // crimped flutes on the skirt and a flat, domed top
  const CAP_H = 0.115;
  const cap = new THREE.CylinderGeometry(0.207, 0.213, CAP_H, 168, 5, false);
  const pos = cap.attributes.position as THREE.BufferAttribute;
  const tmp = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    tmp.fromBufferAttribute(pos, i);
    const r = Math.hypot(tmp.x, tmp.z);
    if (r < 0.15) {
      // gentle dome on the top disc
      if (tmp.y > 0) pos.setY(i, tmp.y + 0.008 * (1 - (r / 0.207) ** 2));
      continue;
    }
    const theta = Math.atan2(tmp.x, tmp.z);
    // 0 at the top shoulder → 1 at the bottom edge of the skirt
    const skirt = THREE.MathUtils.smoothstep(-tmp.y, -CAP_H * 0.35, CAP_H * 0.5);
    const flute = 1 + 0.06 * Math.pow(Math.abs(Math.cos(theta * 10.5)), 0.5) * skirt;
    const flare = 1 + 0.018 * skirt;
    const s = flute * flare;
    pos.setXYZ(i, tmp.x * s, tmp.y, tmp.z * s);
  }
  cap.computeVertexNormals();

  return { profile, radiusAt, glass, liquid, cap, volumeSamples, fullFraction };
}

export function getBottleGeometry() {
  if (!cache) cache = build();
  return cache;
}
