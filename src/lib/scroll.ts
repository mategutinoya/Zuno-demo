"use client";
import type Lenis from "lenis";

let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => (lenis = l);
export const getLenis = () => lenis;

export function scrollToTarget(target: string) {
  const el = target === "#top" ? 0 : (document.querySelector(target) as HTMLElement | null);
  if (el === null) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (lenis) {
    lenis.scrollTo(el, { offset: 0, duration: reduce ? 0 : 1.6, immediate: reduce });
  } else if (el === 0) {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  } else {
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }
}
