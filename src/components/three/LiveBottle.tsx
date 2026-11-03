"use client";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { BottleModel, createBottleMaterials, type Quality } from "./BottleModel";
import { BOTTLE } from "./dimensions";
import { director } from "./director";
import { anchors, sceneState } from "@/lib/sceneState";
import { flavorStore } from "@/lib/store";
import { FLAVORS } from "@/lib/flavors";
import { pour } from "./PourStream";

const damp = THREE.MathUtils.damp;
const white = new THREE.Color("#ffffff");
const ss = THREE.MathUtils.smoothstep;
const mouthLocal = new THREE.Vector3();
const neckLocal = new THREE.Vector3();

/**
 * Opening sequence, scrubbed by the first screen of scroll (0 = top, 1 = one viewport down):
 * cap pops → bottle tips over → liquid pours down → bottle rights itself, cap returns, full again.
 */
function pourPhases(s: number) {
  const back = 1 - ss(s, 0.6, 0.78);
  return {
    cap: ss(s, 0.02, 0.16) * back,
    tilt: ss(s, 0.06, 0.32) * (1 - ss(s, 0.5, 0.72)),
    head: ss(s, 0.2, 0.36),
    tail: ss(s, 0.45, 0.56),
    drain: ss(s, 0.22, 0.5) * back,
  };
}

/**
 * The hero bottle. Its pose is a scroll-weighted blend of DOM anchors
 * (hero / our drink / flavors) plus floating, cursor and intro motion.
 */
export function LiveBottle({ labels, quality }: { labels: THREE.Texture[]; quality: Quality }) {
  const group = useRef<THREE.Group>(null);
  const materials = useMemo(
    () => createBottleMaterials(FLAVORS[flavorStore.get()].liquid, labels[flavorStore.get()], quality),
    [labels, quality],
  );
  const spin = useRef({ value: 0 });
  const shownFlavor = useRef(flavorStore.get());
  const pose = useRef({ x: 0, y: 0, s: 0.0001, rx: 0, ry: 0, rz: 0, init: false });
  const pointer = useRef({ x: 0, y: 0 });
  const parts = useRef<{ cap: THREE.Object3D; liquid: THREE.Object3D; bubbles: THREE.Object3D; neck: THREE.Object3D } | null>(null);

  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials]);

  // Flavour change → cinematic spin, label swaps when the back faces camera
  useEffect(() => {
    return flavorStore.subscribe(() => {
      const next = flavorStore.get();
      if (sceneState.reducedMotion) {
        shownFlavor.current = next;
        materials.label.map = labels[next];
        materials.label.needsUpdate = true;
        return;
      }
      const s = spin.current;
      const start = Math.round(s.value / (Math.PI * 2)) * Math.PI * 2;
      let swapped = false;
      gsap.killTweensOf(s);
      gsap.fromTo(
        s,
        { value: start },
        {
          value: start + Math.PI * 2,
          duration: 1.25,
          ease: "power3.inOut",
          onUpdate: () => {
            if (!swapped && s.value - start > Math.PI * 0.92) {
              swapped = true;
              const f = flavorStore.get();
              shownFlavor.current = f;
              materials.label.map = labels[f];
              materials.label.needsUpdate = true;
            }
          },
        },
      );
    });
  }, [labels, materials]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const reduce = sceneState.reducedMotion;
    const A = director.anchors;

    // ---- target pose: weighted blend of anchors
    let wsum = 0;
    let tx = 0, ty = 0, ts = 0, trx = 0, try_ = 0, trz = 0;
    (["hero", "drink", "flavors"] as const).forEach((id) => {
      const a = A[id];
      if (a.weight <= 0) return;
      const cfg = anchors.get(id)?.config ?? {};
      const scale = a.h / BOTTLE.height;
      const p = a.progress - 0.5;
      tx += (a.x + (cfg.driftX ?? 0) * p * a.h) * a.weight;
      ty += a.y * a.weight;
      ts += scale * a.weight;
      trx += (cfg.rotX ?? 0) * a.weight;
      try_ += ((cfg.rotY ?? 0) + (cfg.spin ?? 0) * p) * a.weight;
      trz += (cfg.rotZ ?? 0) * a.weight;
      wsum += a.weight;
    });

    const P = pose.current;
    if (wsum > 0) {
      if (!P.init) {
        Object.assign(P, { x: tx, y: ty, s: ts, rx: trx, ry: try_, rz: trz, init: true });
      }
      const l = 7;
      P.x = damp(P.x, tx, l, dt);
      P.y = damp(P.y, ty, l, dt);
      P.s = damp(P.s, ts, l, dt);
      P.rx = damp(P.rx, trx, 4, dt);
      P.ry = damp(P.ry, try_, 4, dt);
      P.rz = damp(P.rz, trz, 4, dt);
    }

    // ---- cursor + scroll velocity
    const follow = reduce ? 0 : 1;
    pointer.current.x = damp(pointer.current.x, sceneState.pointer.x * follow, 3, dt);
    pointer.current.y = damp(pointer.current.y, sceneState.pointer.y * follow, 3, dt);
    const vel = THREE.MathUtils.clamp(sceneState.scrollVelocity * 0.004, -0.25, 0.25) * follow;

    // ---- intro choreography
    const e = sceneState.intro;
    const introY = (1 - e) * -director.worldH * 0.9;
    const introSpin = (1 - e) * -Math.PI * 2.4;
    const introScale = 0.55 + 0.45 * e;

    const float = reduce ? 0 : Math.sin(t * 1.1) * 0.045 * P.s * BOTTLE.height * 0.3;

    // ---- opening pour (only at the very top of the page)
    const scrollS = window.scrollY / Math.max(1, window.innerHeight);
    const ph = reduce || e < 0.98 ? pourPhases(0) : pourPhases(scrollS);

    // while pouring, hold the bottle in frame instead of letting it scroll away;
    // on narrow screens tip it a little less and shift it left so the neck stays visible
    const narrow = director.worldW / director.worldH < 0.8;
    const hold = ph.tilt * scrollS * director.worldH * 0.85;
    const shiftX = narrow ? -ph.tilt * director.worldW * 0.06 : 0;
    const pourScale = narrow ? 1 - 0.28 * ph.tilt : 1;
    const tiltAngle = narrow ? 1.8 : 2.05;

    g.position.set(P.x + pointer.current.x * 0.08 + shiftX, P.y + float + introY - hold, 0);
    g.scale.setScalar(Math.max(P.s * introScale * pourScale, 0.0001));
    g.rotation.set(
      P.rx - pointer.current.y * 0.14 + vel * 0.6 + (reduce ? 0 : Math.sin(t * 0.7) * 0.02),
      P.ry + pointer.current.x * 0.45 + spin.current.value + introSpin,
      P.rz - pointer.current.x * 0.05 + vel * 0.25 + (reduce ? 0 : Math.sin(t * 0.9) * 0.025) - ph.tilt * tiltAngle,
    );

    if (!parts.current) {
      const cap = g.getObjectByName("cap");
      const liquid = g.getObjectByName("liquid");
      const bubbles = g.getObjectByName("bubbles");
      const neck = g.getObjectByName("neckFlow");
      if (cap && liquid && bubbles && neck) parts.current = { cap, liquid, bubbles, neck };
    }
    const pp = parts.current;
    if (pp) {
      // cap pops up, spins and flies off to the side
      const o = 1 - Math.pow(1 - ph.cap, 3);
      pp.cap.position.set(o * 1.1, 1.53 + o * 1.6 + Math.sin(o * Math.PI) * 0.5, o * 0.6);
      pp.cap.rotation.set(o * 1.2, o * 5, -o * 2.4);
      pp.cap.scale.setScalar(1 - ss(o, 0.75, 1));
      pp.cap.visible = o < 0.999;
      // level drops while it pours; once tipped over, gravity pulls the
      // liquid toward the neck, so the empty space opens at the base
      const k = 1 - 0.34 * ph.drain;
      const pivot = THREE.MathUtils.lerp(-1.74, 0.608, ss(ph.tilt, 0.25, 0.7));
      pp.liquid.scale.y = k;
      pp.liquid.position.y = pivot * (1 - k);
      pp.bubbles.visible = k > 0.97 && ph.tilt < 0.05;
      const flowing = pour.head - pour.tail > 0.002 && ph.tilt > 0.5;
      pp.neck.visible = flowing;
    }

    // hand the mouth position + pour direction to the stream
    pour.head = ph.head;
    pour.tail = Math.min(ph.tail, ph.head);
    if (pour.head - pour.tail > 0.002) {
      g.updateMatrixWorld();
      const top = 1.5 + BOTTLE.centerOffset;
      g.localToWorld(mouthLocal.set(0, top, 0));
      g.localToWorld(neckLocal.set(0, top + 0.4, 0));
      pour.mouth.copy(mouthLocal);
      pour.dir.copy(neckLocal).sub(mouthLocal).normalize();
      pour.scale = g.scale.x;
    }

    // ---- liquid follows flavour colour
    const liq = director.flavorLiquid;
    if (materials.liquid.transmission > 0) {
      materials.liquid.color.copy(liq).lerp(white, 0.2);
      materials.liquid.attenuationColor.copy(liq);
      materials.liquid.emissive.copy(liq).multiplyScalar(0.16);
    } else {
      materials.liquid.color.copy(liq);
      materials.liquid.emissive.copy(liq).multiplyScalar(0.32);
    }
    materials.liquid.sheenColor.copy(liq).lerp(white, 0.55);
    materials.bubble.color.copy(liq).lerp(white, 0.4);
    materials.bubble.emissive.copy(liq).lerp(white, 0.5).multiplyScalar(0.25);
  });

  return <BottleModel ref={group} materials={materials} quality={quality} animated={!sceneState.reducedMotion} />;
}
