"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gateStore, sceneReadyStore, useStore } from "@/lib/store";
import { useWebGL } from "@/lib/hooks";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

/**
 * Sticky full-viewport WebGL stage behind Hero → Our Drink → Flavors.
 * Pauses rendering when scrolled out of view.
 */
export function StageCanvas() {
  const webgl = useWebGL();
  const gate = useStore(gateStore, "unknown");
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (webgl === false) {
      document.documentElement.dataset.webgl = "false";
      sceneReadyStore.set(true);
    }
  }, [webgl]);

  // never keep the hero copy hidden if the 3D stage is slow to boot
  useEffect(() => {
    if (gate !== "verified") return;
    const t = setTimeout(() => sceneReadyStore.set(true), 6000);
    return () => clearTimeout(t);
  }, [gate]);

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="stage-gradient pointer-events-none sticky top-0 z-0 -mb-[100lvh] h-[100lvh] w-full overflow-hidden"
      aria-hidden
    >
      {webgl && gate === "verified" && <Scene active={active} />}
    </div>
  );
}
