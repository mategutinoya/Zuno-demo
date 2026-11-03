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

  // Liquid: inset profile up to the fill level
  const fill = BOTTLE.fillLevel;
  const liquidPts: THREE.Vector2[] = [v(0.001, -1.74)];
  for (const p of profile) {
    if (p.y <= -1.74 || p.y >= fill) continue;
    if (p.x < 0.05) continue;
    liquidPts.push(v(p.x * 0.945, Math.max(p.y, -1.74)));
  }
  const rf = radiusAt(fill) * 0.945;
  liquidPts.push(v(rf, fill), v(rf * 0.6, fill + 0.006), v(0.001, fill + 0.008));
  const liquid = new THREE.LatheGeometry(liquidPts, 64);

  // Crown cap with crimped flutes
  const cap = new THREE.CylinderGeometry(0.218, 0.226, 0.22, 126, 6, false);
  const pos = cap.attributes.position as THREE.BufferAttribute;
  const tmp = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    tmp.fromBufferAttribute(pos, i);
    const r = Math.hypot(tmp.x, tmp.z);
    if (r < 0.15) continue;
    const theta = Math.atan2(tmp.x, tmp.z);
    const skirt = THREE.MathUtils.smoothstep(-tmp.y, -0.08, 0.11);
    const flute = 1 + 0.045 * Math.pow(Math.abs(Math.cos(theta * 10.5)), 0.6) * (0.35 + skirt);
    const flare = 1 + 0.03 * skirt;
    const s = flute * flare;
    pos.setXYZ(i, tmp.x * s, tmp.y, tmp.z * s);
  }
  cap.computeVertexNormals();

  return { profile, radiusAt, glass, liquid, cap };
}

export function getBottleGeometry() {
  if (!cache) cache = build();
  return cache;
}
