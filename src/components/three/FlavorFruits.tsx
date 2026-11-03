"use client";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { FruitCluster } from "./Fruits";
import { BOTTLE } from "./dimensions";
import { director } from "./director";
import { FLAVORS } from "@/lib/flavors";
import { flavorStore } from "@/lib/store";
import { sceneState } from "@/lib/sceneState";

/** Fruit universes that orbit the bottle in the Flavors section. */
export function FlavorFruits({ maxPieces, spread = 1 }: { maxPieces: number; spread?: number }) {
  const group = useRef<THREE.Group>(null);
  const presence = useRef(FLAVORS.map(() => 0));
  const changedAt = useRef(-10);
  const clock = useRef(0);

  useEffect(
    () =>
      flavorStore.subscribe(() => {
        changedAt.current = clock.current;
      }),
    [],
  );

  useFrame((state, delta) => {
    clock.current = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    const a = director.anchors.flavors;
    const g = group.current;
    if (!g) return;
    const vis = a.visible ? THREE.MathUtils.clamp(a.weight * 1.6, 0, 1) : 0;
    const active = flavorStore.get();
    const waiting = clock.current - changedAt.current < (sceneState.reducedMotion ? 0 : 0.45);
    presence.current.forEach((p, i) => {
      const target = i === active && !waiting ? vis : 0;
      presence.current[i] = THREE.MathUtils.damp(p, target, target > p ? 3.2 : 6, dt);
    });
    g.position.set(a.x, a.y, 0);
    g.scale.setScalar(Math.max(a.h / BOTTLE.height, 0.0001));
  });

  return (
    <group ref={group}>
      {FLAVORS.map((f, i) => (
        <FruitCluster
          key={f.id}
          flavorId={f.id}
          presence={() => presence.current[i]}
          maxPieces={maxPieces}
          spread={spread}
          animated={!sceneState.reducedMotion}
        />
      ))}
    </group>
  );
}
