"use client";
import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SceneAnchor } from "@/components/three/SceneAnchor";
import { useReveal } from "@/components/ui/useReveal";
import { FLAVORS } from "@/lib/flavors";
import { flavorStore, useStore } from "@/lib/store";

const ease = [0.22, 1, 0.36, 1] as const;

export function Flavors() {
  const root = useRef<HTMLElement>(null);
  const index = useStore(flavorStore, 0);
  const flavor = FLAVORS[index];
  const dark = flavor.ink === "dark";
  const lastChange = useRef(0);
  useReveal(root);

  const select = useCallback((i: number) => {
    const n = (i + FLAVORS.length) % FLAVORS.length;
    if (n === flavorStore.get()) return;
    // throttle so the spin choreography can breathe
    const now = performance.now();
    if (now - lastChange.current < 450) return;
    lastChange.current = now;
    flavorStore.set(n);
  }, []);

  // swipe on touch devices
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let x0 = 0;
    let y0 = 0;
    const down = (e: TouchEvent) => {
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
    };
    const up = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) select(flavorStore.get() + (dx < 0 ? 1 : -1));
    };
    el.addEventListener("touchstart", down, { passive: true });
    el.addEventListener("touchend", up, { passive: true });
    return () => {
      el.removeEventListener("touchstart", down);
      el.removeEventListener("touchend", up);
    };
  }, [select]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      select(index + 1);
      (e.currentTarget.querySelectorAll<HTMLButtonElement>("[role=tab]")[(index + 1) % FLAVORS.length])?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = (index - 1 + FLAVORS.length) % FLAVORS.length;
      select(n);
      (e.currentTarget.querySelectorAll<HTMLButtonElement>("[role=tab]")[n])?.focus();
    }
  };

  const muted = dark ? "text-ink/65" : "text-cream/70";
  const line = dark ? "border-ink/15" : "border-cream/15";

  return (
    <section
      ref={root}
      id="flavors"
      data-nav={dark ? "light" : "dark"}
      data-fallback-bg
      style={{
        ["--fallback-bg" as string]: `linear-gradient(180deg, ${flavor.bg[1]}, ${flavor.bg[0]})`,
      }}
      aria-labelledby="flavors-title"
      className={`relative z-10 flex items-center overflow-hidden py-24 transition-colors duration-1000 ease-(--ease-premium) md:min-h-[100svh] md:pt-28 md:pb-12 ${
        dark ? "text-ink" : "text-cream"
      }`}
    >
      {/* giant outlined flavour name */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden opacity-[0.14]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={flavor.id}
            className="display text-outline text-center text-[34vw] whitespace-nowrap md:text-[19vw]"
            initial={{ x: "12%", opacity: 0 }}
            animate={{ x: "0%", opacity: 1, transition: { duration: 1.4, ease } }}
            exit={{ x: "-12%", opacity: 0, transition: { duration: 0.8, ease } }}
          >
            {flavor.name.split(" ")[0]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="container-x relative grid grid-cols-1 gap-8 md:grid-cols-12 md:grid-rows-[auto_1fr] md:gap-x-6 md:gap-y-10">
        {/* heading */}
        <div className="md:col-span-4 md:col-start-1 md:row-start-1">
            <div className="flex items-center gap-4">
              <span className="eyebrow" style={{ color: dark ? "#17131B" : flavor.accent }}>
                03
              </span>
              <span data-reveal="line" className={`h-px w-16 ${dark ? "bg-ink/30" : "bg-cream/30"}`} />
              <span className="eyebrow">Flavors</span>
            </div>
            <h2 id="flavors-title" className="display mt-6 text-5xl md:text-[3.6vw] xl:text-6xl">
              <span className="block overflow-hidden">
                <span data-reveal="mask" className="block">
                  Cuatro sabores.
                </span>
              </span>
              <span className="block overflow-hidden">
                <span data-reveal="mask" data-delay="0.08" className="block opacity-60">
                  Cuatro universos.
                </span>
              </span>
            </h2>
        </div>
        <p className={`max-w-xs self-end text-sm leading-relaxed md:col-span-4 md:col-start-9 md:row-start-1 md:pl-8 ${muted}`}>
          Elige un sabor y deja que la botella cambie de mundo. Usa las flechas o desliza en móvil.
        </p>

          {/* details */}
          <div
            id="flavor-panel"
            role="tabpanel"
            aria-labelledby={`tab-${flavor.id}`}
            aria-live="polite"
            className="order-last md:order-none md:col-span-4 md:col-start-1 md:row-start-2 md:self-center"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={flavor.id} initial="in" animate="show" exit="out">
                <motion.p
                  className="eyebrow"
                  variants={{ in: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } }, out: { opacity: 0, transition: { duration: 0.25 } } }}
                >
                  0{index + 1} / 0{FLAVORS.length} — {flavor.mood}
                </motion.p>
                <h3 className="display mt-5 text-[15vw] md:text-[5.6vw] xl:text-[5.4rem]" aria-label={flavor.name}>
                  {flavor.name.split(" ").map((word, wi) => (
                    <span key={wi} className="block overflow-hidden pb-[0.05em]">
                      <motion.span
                        className="block"
                        variants={{
                          in: { y: "110%", rotate: 3 },
                          show: { y: "0%", rotate: 0, transition: { duration: 0.9, ease, delay: 0.1 + wi * 0.08 } },
                          out: { y: "-110%", transition: { duration: 0.4, ease } },
                        }}
                      >
                        {word}
                      </motion.span>
                    </span>
                  ))}
                </h3>
                <motion.div
                  variants={{ in: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease, delay: 0.3 } }, out: { opacity: 0, y: -10, transition: { duration: 0.3 } } }}
                >
                  <p className={`mt-6 max-w-sm text-lg leading-relaxed ${muted}`}>{flavor.description}</p>
                  <ul className="mt-6 flex flex-wrap gap-2" aria-label="Notas de sabor">
                    {flavor.notes.map((n) => (
                      <li
                        key={n}
                        className={`rounded-full border px-4 py-1.5 text-xs font-semibold tracking-[0.14em] uppercase ${line}`}
                      >
                        {n}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-xs tracking-[0.16em] uppercase opacity-60">Hard Seltzer · Zero azúcar · 300 ml · 4.5% Alc. Vol.*</p>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* bottle stage */}
          <div className="relative flex justify-center md:col-span-4 md:col-start-5 md:row-span-2 md:row-start-1 md:items-center">
            <SceneAnchor id="flavors" rotY={0} rotZ={0} className="aspect-[1/3.44] h-[50svh] md:h-[min(76vh,860px)]" />
          </div>

          {/* selector */}
          <div className="md:col-span-4 md:col-start-9 md:row-start-2 md:self-center md:pl-8">
            <div role="tablist" aria-label="Sabores ZUNO" aria-orientation="vertical" onKeyDown={onKey} className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:gap-0 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
              {FLAVORS.map((f, i) => {
                const on = i === index;
                return (
                  <button
                    key={f.id}
                    id={`tab-${f.id}`}
                    role="tab"
                    aria-selected={on}
                    aria-controls="flavor-panel"
                    tabIndex={on ? 0 : -1}
                    onClick={() => select(i)}
                    className={`group relative flex shrink-0 items-center gap-4 rounded-full border px-4 py-2.5 text-left transition-all duration-500 ease-(--ease-premium) md:rounded-none md:border-0 md:border-t md:px-0 md:py-5 ${line} ${
                      on ? "opacity-100" : "opacity-55 hover:opacity-100"
                    }`}
                  >
                    <span
                      className="size-3.5 shrink-0 rounded-full ring-2 ring-current/20 transition-transform duration-500 group-hover:scale-125 md:size-4"
                      style={{ background: f.liquid }}
                    />
                    <span className="hidden text-xs font-semibold tracking-[0.2em] opacity-60 md:inline">0{i + 1}</span>
                    <span className="display text-lg whitespace-nowrap md:text-3xl">{f.name}</span>
                    <span
                      className={`absolute bottom-[-1px] left-0 hidden h-[2px] bg-current transition-[width] duration-700 ease-(--ease-premium) md:block ${
                        on ? "w-full" : "w-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <div className="mt-6 hidden items-center gap-3 md:flex">
              <button
                onClick={() => select(index - 1)}
                aria-label="Sabor anterior"
                className={`grid size-12 place-items-center rounded-full border transition hover:scale-105 ${line}`}
              >
                <ArrowLeft className="size-5" />
              </button>
              <button
                onClick={() => select(index + 1)}
                aria-label="Siguiente sabor"
                className={`grid size-12 place-items-center rounded-full border transition hover:scale-105 ${line}`}
              >
                <ArrowRight className="size-5" />
              </button>
              <span className="ml-3 text-xs tracking-[0.2em] uppercase opacity-60">
                Usa ← → para cambiar
              </span>
            </div>
          </div>
      </div>
    </section>
  );
}
