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

/** Drupelet cluster. `thimble` gives the raspberry's open, slightly conical shape. */
function drupeCluster(count: number, rx: number, ry: number, drupe: number, seed: number, thimble = false) {
  const r = rng(seed);
  const parts: THREE.BufferGeometry[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  const yMin = thimble ? -0.72 : -0.85;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const y = 1 - t * (1 - yMin);
    let rad = Math.sqrt(Math.max(0, 1 - y * y));
    // thimble: rounded tip, walls stay wide toward the open base
    if (thimble) rad = THREE.MathUtils.lerp(rad, 0.9, THREE.MathUtils.smoothstep(-y, -0.2, 0.7)) * (0.82 + 0.18 * (1 - y) * 0.5);
    const th = golden * i;
    const s = drupe * (0.82 + r() * 0.36) * (0.75 + rad * 0.35);
    const g = new THREE.SphereGeometry(s, 10, 8);
    g.scale(1, 1.12, 1);
    g.translate(Math.cos(th) * rad * rx, y * ry, Math.sin(th) * rad * rx);
    parts.push(g);
  }
  if (thimble) {
    // dark hollow seen from below
    const hollow = new THREE.CylinderGeometry(rx * 0.55, rx * 0.7, ry * 0.5, 16, 1, true);
    hollow.translate(0, yMin * ry + ry * 0.2, 0);
    parts.push(hollow);
    const core = new THREE.SphereGeometry(rx * 0.85, 16, 12);
    core.scale(1, ry / rx, 1);
    core.translate(0, ry * 0.12, 0);
    parts.push(core);
  } else {
    const core = new THREE.SphereGeometry(rx * 0.92, 16, 12);
    core.scale(1, ry / rx, 1);
    parts.push(core);
  }
  // merged geometries must share attributes: drop uvs everywhere
  parts.forEach((p) => p.deleteAttribute("uv"));
  return mergeGeometries(parts)!;
}

/** Short, slightly bent woody stem (base at origin, pointing +y). */
function stem(length: number, radius: number) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(radius * 0.6, length * 0.5, 0),
    new THREE.Vector3(radius * 2.2, length, radius * 0.5),
  ]);
  return new THREE.TubeGeometry(curve, 8, radius, 6, false);
}

let cache: ReturnType<typeof build> | null = null;

function build() {
  // slightly heart-shaped: broad shoulders, softly pointed base
  const lychee = displacedSphere(
    0.24,
    64,
    (n) => -0.09 * Math.pow(Math.max(0, -n.y), 3) + 0.04 * Math.max(0, n.y) * (1 - Math.abs(n.x)),
    [1, 1.1, 0.96],
  );
  const lycheePeeled = displacedSphere(
    0.21,
    48,
    (n) => 0.03 * Math.sin(n.y * 5 + n.x * 3) - 0.07 * Math.pow(Math.max(0, -n.y), 3),
    [1, 1.12, 0.97],
  );
  const raspberry = drupeCluster(90, 0.19, 0.24, 0.05, 3, true);
  const blackberry = drupeCluster(70, 0.18, 0.25, 0.056, 9);
  const blueberry = displacedSphere(0.16, 32, (n) => (n.y > 0.85 ? -0.12 * (n.y - 0.85) * 6 : 0), [1, 0.86, 1]);
  const blueberryCrown = new THREE.TorusGeometry(0.04, 0.014, 6, 12);

  // Mango: kidney-ish ellipsoid with vertex colour blush
  const mango = displacedSphere(
    0.34,
    56,
    (n) => 0.07 * n.x * n.y + 0.08 * Math.pow(Math.max(0, n.x), 4) * Math.max(0, -n.y) * 2.2 - 0.03 * Math.max(0, -n.x),
    [1, 0.74, 0.66],
  );
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
    stem: stem(0.1, 0.014),
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
