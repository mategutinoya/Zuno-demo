import * as THREE from "three";
import { anchors, type AnchorId } from "@/lib/sceneState";
import { FLAVORS, HERO_BG, DRINK_BG } from "@/lib/flavors";
import { flavorStore } from "@/lib/store";

export interface AnchorFrame {
  x: number;
  y: number;
  w: number;
  h: number;
  progress: number;
  weight: number;
  visible: boolean;
}

const empty = (): AnchorFrame => ({ x: 0, y: 0, w: 0, h: 0, progress: 0, weight: 0, visible: false });

export const director = {
  k: 0.01,
  worldH: 1,
  worldW: 1,
  anchors: {
    hero: empty(),
    drink: empty(),
    flavors: empty(),
    wordmark: empty(),
  } as Record<AnchorId, AnchorFrame>,
  bg: [new THREE.Color(HERO_BG[0]), new THREE.Color(HERO_BG[1]), new THREE.Color(HERO_BG[2])],
  flavorBg: FLAVORS.map((f) => f.bg.map((c) => new THREE.Color(c))),
  liquid: new THREE.Color(FLAVORS[0].liquid),
  flavorLiquid: new THREE.Color(FLAVORS[0].liquid),
};

const heroBg = HERO_BG.map((c) => new THREE.Color(c));
const drinkBg = DRINK_BG.map((c) => new THREE.Color(c));
const currentFlavorBg = [new THREE.Color(), new THREE.Color(), new THREE.Color()];
const target = [new THREE.Color(), new THREE.Color(), new THREE.Color()];
const tmp = new THREE.Color();
const BOTTLE_ANCHORS: AnchorId[] = ["hero", "drink", "flavors"];
let flavorInit = false;

/** Called once per frame before any scene object reads the director. */
export function updateDirector(canvas: HTMLCanvasElement, camera: THREE.PerspectiveCamera, dt: number) {
  const cr = canvas.getBoundingClientRect();
  if (cr.height === 0) return;
  const dist = camera.position.z;
  director.worldH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist;
  director.k = director.worldH / cr.height;
  director.worldW = director.k * cr.width;
  const k = director.k;

  let total = 0;
  for (const [id, frame] of Object.entries(director.anchors) as [AnchorId, AnchorFrame][]) {
    const a = anchors.get(id);
    if (!a || !a.el.isConnected) {
      frame.visible = false;
      frame.weight = 0;
      continue;
    }
    const r = a.el.getBoundingClientRect();
    const cx = r.left + r.width / 2 - cr.left - cr.width / 2;
    const cy = r.top + r.height / 2 - cr.top - cr.height / 2;
    frame.x = cx * k;
    frame.y = -cy * k;
    frame.w = r.width * k;
    frame.h = r.height * k;
    frame.visible = r.bottom > cr.top - cr.height * 0.25 && r.top < cr.bottom + cr.height * 0.25;
    frame.progress = THREE.MathUtils.clamp((cr.bottom - r.top) / (cr.height + r.height), 0, 1);
    const d = Math.abs(cy / cr.height);
    const w = 1 - THREE.MathUtils.smoothstep(d, 0.12, 0.88);
    frame.weight = r.height > 0 ? w : 0;
    if (BOTTLE_ANCHORS.includes(id)) total += frame.weight;
  }
  if (total > 0) {
    for (const id of BOTTLE_ANCHORS) director.anchors[id].weight /= total;
  }

  // flavour colours (smoothly follow the active flavour)
  const f = flavorStore.get();
  const lerpF = flavorInit ? 1 - Math.exp(-dt * 3.2) : 1;
  flavorInit = true;
  director.flavorBg[f].forEach((c, i) => currentFlavorBg[i].lerp(c, lerpF));
  director.flavorLiquid.lerp(tmp.set(FLAVORS[f].liquid), lerpF);

  // weighted background
  if (total > 0) {
    const w = director.anchors;
    for (let i = 0; i < 3; i++) {
      target[i]
        .setRGB(0, 0, 0)
        .add(tmp.copy(heroBg[i]).multiplyScalar(w.hero.weight))
        .add(tmp.copy(drinkBg[i]).multiplyScalar(w.drink.weight))
        .add(tmp.copy(currentFlavorBg[i]).multiplyScalar(w.flavors.weight));
      director.bg[i].lerp(target[i], 1 - Math.exp(-dt * 6));
    }
  }
}
