"use client";
import * as THREE from "three";
import { useEffect, useState } from "react";
import { FLAVORS } from "@/lib/flavors";
import { createLabelTexture, loadCanvasFonts } from "./textures";

let labels: THREE.Texture[] | null = null;
let pending: Promise<THREE.Texture[]> | null = null;

export function loadLabels() {
  if (labels) return Promise.resolve(labels);
  pending ??= loadCanvasFonts().then((fonts) => {
    labels = FLAVORS.map((f) => createLabelTexture(f, fonts));
    return labels;
  });
  return pending;
}

/** Label textures for every flavour, generated once the brand fonts are ready. */
export function useLabels() {
  const [state, setState] = useState<THREE.Texture[] | null>(labels);
  useEffect(() => {
    let alive = true;
    loadLabels().then((l) => alive && setState(l));
    return () => {
      alive = false;
    };
  }, []);
  return state;
}
