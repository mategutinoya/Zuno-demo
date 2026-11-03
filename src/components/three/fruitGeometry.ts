import * as THREE from "three";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { rng } from "./textures";

type Fn = (n: THREE.Vector3) => number;

function displacedSphere(radius: number, seg: number, fn: Fn, scale: [number, number, number] = [1, 1, 1]) {
  let g: THREE.BufferGeometry = new THREE.SphereGeometry(radius, seg, Math.round(seg * 0.75));
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  g = mergeVertices(g);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const d = fn(v);
    const p = v.clone().multiplyScalar(radius * (1 + d));
    pos.setXYZ(i, p.x * scale[0], p.y * scale[1], p.z * scale[2]);
  }
  g.computeVertexNormals();
  return g;
}

function drupeCluster(count: number, rx: number, ry: number, drupe: number, seed: number) {
  const r = rng(seed);
  const parts: THREE.BufferGeometry[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const y = 1 - t * 1.75; // leave the bottom open-ish
    if (y < -0.85) continue;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const th = golden * i;
    const s = drupe * (0.85 + r() * 0.3) * (0.75 + rad * 0.35);
    const g = new THREE.SphereGeometry(s, 10, 8);
    g.translate(Math.cos(th) * rad * rx, y * ry, Math.sin(th) * rad * rx);
    parts.push(g);
  }
  const core = new THREE.SphereGeometry(rx * 0.92, 16, 12);
  core.scale(1, ry / rx, 1);
  parts.push(core);
  return mergeGeometries(parts)!;
}

let cache: ReturnType<typeof build> | null = null;

function build() {
  const lychee = displacedSphere(
    0.24,
    64,
    (n) => 0.05 * Math.pow(Math.abs(Math.sin(n.x * 17) * Math.sin(n.y * 17) * Math.sin(n.z * 17)), 0.5),
    [1, 1.08, 1],
  );
  const lycheePeeled = displacedSphere(0.21, 40, (n) => 0.025 * Math.sin(n.y * 5 + n.x * 3), [1, 1.12, 1]);
  const raspberry = drupeCluster(80, 0.19, 0.22, 0.052, 3);
  const blackberry = drupeCluster(70, 0.18, 0.25, 0.056, 9);
  const blueberry = displacedSphere(0.16, 32, (n) => (n.y > 0.85 ? -0.12 * (n.y - 0.85) * 6 : 0), [1, 0.86, 1]);
  const blueberryCrown = new THREE.TorusGeometry(0.04, 0.014, 6, 12);

  // Mango: kidney-ish ellipsoid with vertex colour blush
  const mango = displacedSphere(0.34, 48, (n) => 0.06 * n.x * n.y, [1, 0.72, 0.68]);
  {
    const pos = mango.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    const green = new THREE.Color("#9DB82C");
    const yellow = new THREE.Color("#FFC21F");
    const red = new THREE.Color("#E8402A");
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) / 0.34;
      const y = pos.getY(i) / 0.25;
      const t = THREE.MathUtils.clamp(x * 0.5 + y * 0.6 + 0.5, 0, 1);
      if (t < 0.5) c.copy(green).lerp(yellow, t * 2);
      else c.copy(yellow).lerp(red, (t - 0.5) * 2);
      col.set([c.r, c.g, c.b], i * 3);
    }
    mango.setAttribute("color", new THREE.BufferAttribute(col, 3));
  }

  const passion = displacedSphere(0.3, 48, (n) => 0.012 * Math.sin(n.x * 30) * Math.sin(n.z * 30), [1, 0.96, 1]);
  const hemiOuter = new THREE.SphereGeometry(0.3, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const hemiInner = new THREE.SphereGeometry(0.28, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const cutDisc = new THREE.CircleGeometry(0.3, 48).rotateX(-Math.PI / 2);

  const lime = displacedSphere(
    0.27,
    56,
    (n) => 0.006 * Math.sin(n.x * 70) * Math.sin(n.y * 70) + 0.04 * Math.pow(Math.abs(n.y), 8),
    [0.92, 1, 0.92],
  );
  const limeSlice = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 48);

  const achachairu = displacedSphere(
    0.24,
    56,
    (n) => 0.008 * Math.sin(n.x * 40 + n.y * 20) * Math.sin(n.z * 40),
    [0.88, 1.06, 0.88],
  );

  return {
    lychee,
    lycheePeeled,
    raspberry,
    blackberry,
    blueberry,
    blueberryCrown,
    mango,
    passion,
    hemiOuter,
    hemiInner,
    cutDisc,
    lime,
    limeSlice,
    achachairu,
  };
}

export const getFruitGeometry = () => (cache ??= build());
