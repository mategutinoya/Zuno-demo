"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLenis } from "@/lib/scroll";
import { sceneState } from "@/lib/sceneState";
import { gateStore } from "@/lib/store";

gsap.registerPlugin(ScrollTrigger);

/** Lenis smooth scrolling synced with GSAP's ticker + ScrollTrigger. */
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    sceneState.reducedMotion = reduce.matches;

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      sceneState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let lenis: Lenis | null = null;
    let tick: ((t: number) => void) | null = null;
    let unsub: (() => void) | null = null;

    const start = () => {
      if (reduce.matches) return;
      lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, touchMultiplier: 1.2 });
      setLenis(lenis);
      lenis.on("scroll", (l: Lenis) => {
        sceneState.scrollVelocity = l.velocity;
        ScrollTrigger.update();
      });
      tick = (t: number) => lenis?.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      const sync = () => (gateStore.get() === "verified" ? lenis?.start() : lenis?.stop());
      sync();
      unsub = gateStore.subscribe(sync);
    };
    start();

    // Native scroll velocity when Lenis is disabled
    let lastY = window.scrollY;
    const onScroll = () => {
      if (lenis) return;
      sceneState.scrollVelocity = window.scrollY - lastY;
      lastY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // layout changes once the gate unlocks / fonts settle
    const refresh = () => requestAnimationFrame(() => ScrollTrigger.refresh());
    const unsubGate = gateStore.subscribe(() => gateStore.get() === "verified" && refresh());
    document.fonts?.ready.then(refresh);

    const onMotion = () => {
      sceneState.reducedMotion = reduce.matches;
    };
    reduce.addEventListener("change", onMotion);

    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      reduce.removeEventListener("change", onMotion);
      unsub?.();
      unsubGate();
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
