/**
 * Mutable, non-React state shared between DOM and the WebGL scene.
 * Read inside useFrame so we never trigger React renders per frame.
 */
export const sceneState = {
  pointer: { x: 0, y: 0 },
  scrollVelocity: 0,
  /** 0 → 1 entrance animation progress */
  intro: 0,
  reducedMotion: false,
  isMobile: false,
};

export type AnchorId = "hero" | "drink" | "flavors" | "wordmark";

export interface AnchorConfig {
  rotY?: number;
  rotX?: number;
  rotZ?: number;
  /** extra Y rotation applied across the anchor's scroll progress */
  spin?: number;
  /** horizontal drift (in bottle heights) across scroll progress */
  driftX?: number;
}

export const anchors = new Map<AnchorId, { el: HTMLElement; config: AnchorConfig }>();

/** Per-frame computed data from the director, read by scene objects */
export const frame = {
  /** world units per CSS pixel */
  k: 1,
  weights: { hero: 0, drink: 0, flavors: 0 } as Record<"hero" | "drink" | "flavors", number>,
};
