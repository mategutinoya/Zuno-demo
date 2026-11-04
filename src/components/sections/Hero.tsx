"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SceneAnchor } from "@/components/three/SceneAnchor";
import { ZunoLogo } from "@/components/brand/ZunoLogo";
import { SWOOSH } from "@/components/brand/logoPaths";
import { Button } from "@/components/ui/Button";
import { sceneReadyStore, useStore } from "@/lib/store";
import { SITE } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger);

const SLOGAN = ["DRINK", "DIFFERENT."];

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const ready = useStore(sceneReadyStore, false);

  // Entrance — fires once the 3D bottle starts its own intro
  useEffect(() => {
    const el = root.current;
    if (!el || !ready) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.set("[data-hero-hidden]", { visibility: "visible" });
      if (reduce) {
        gsap.from("[data-hero-hidden]", { opacity: 0, duration: 0.8, stagger: 0.05 });
        return;
      }
      const tl = gsap.timeline({ delay: 0.9, defaults: { ease: "expo.out" } });
      tl.from("[data-hero-char]", { yPercent: 115, rotate: 6, duration: 1.3, stagger: 0.035 })
        .from("[data-hero-swoosh]", { strokeDashoffset: 1, duration: 1.2, ease: "power3.inOut" }, "-=0.9")
        .from("[data-hero-fade]", { y: 24, opacity: 0, duration: 1.1, stagger: 0.08 }, "-=1.0")
        .from("[data-hero-cue]", { opacity: 0, duration: 1 }, "-=0.6");
    }, el);
    return () => ctx.revert();
  }, [ready]);

  // Exit on scroll
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.to("[data-hero-copy]", {
        yPercent: -30,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "70% top", scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="top"
      data-nav="dark"
      aria-labelledby="hero-title"
      className="relative z-10 h-[100svh] min-h-[620px] w-full overflow-hidden text-cream"
    >
      <h1 id="hero-title" className="sr-only">
        ZUNO. Drink Different. {SITE.tagline}
      </h1>

      {/* 3D anchors: the giant wordmark sits behind the bottle and is refracted by the glass */}
      <SceneAnchor
        id="wordmark"
        className="absolute top-[27%] left-1/2 aspect-[334/128] w-[94vw] -translate-x-1/2 -translate-y-1/2 md:top-[46%] md:w-[80vw] md:max-w-[1500px]"
        fallback={<ZunoLogo className="h-full w-full text-cream" />}
      />
      <SceneAnchor
        id="hero"
        rotY={-0.35}
        rotZ={0.07}
        className="absolute top-[41%] left-1/2 aspect-[1/3.44] h-[46svh] -translate-x-1/2 -translate-y-1/2 md:top-1/2 md:h-[76svh]"
      />

      <div data-hero-copy className="container-x relative flex h-full flex-col justify-end pb-8 md:pb-12">
        {/* meta line */}
        <div
          data-hero-hidden
          className="invisible absolute top-24 left-0 hidden w-full md:top-28 md:block"
        >
          <div className="container-x flex items-center justify-between">
            <p data-hero-fade className="eyebrow text-cream/80">
              Hard Seltzer <span className="mx-3 text-cream/40">/</span> 300 ml
              <span className="mx-3 text-cream/40">/</span> 4.5% Alc. Vol.*
              <span className="mx-3 text-cream/40">/</span> Zero azúcar
            </p>
            <p data-hero-fade className="eyebrow text-cream/80">
              4 sabores · Edición 2026
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div data-hero-hidden className="invisible">
            <p aria-hidden className="display flex flex-col text-[15vw] leading-[0.84] md:text-[min(6.6vw,7.5rem)]">
              {SLOGAN.map((w) => (
                <span key={w} className="flex overflow-hidden pb-[0.04em]">
                  {w.split("").map((c, i) => (
                    <span key={i} data-hero-char className="inline-block">
                      {c}
                    </span>
                  ))}
                </span>
              ))}
            </p>
            <div className="relative mt-3 inline-block md:mt-4">
              <p data-hero-fade className="font-hand text-2xl text-cream md:text-4xl">
                {SITE.tagline}
              </p>
              <svg viewBox="0 0 240 20" preserveAspectRatio="none" className="absolute -bottom-4 left-0 h-3.5 w-full text-hot" aria-hidden fill="none">
                <path
                  data-hero-swoosh
                  d={SWOOSH}
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset="0"
                />
              </svg>
            </div>
          </div>

          <div data-hero-hidden className="invisible flex flex-wrap gap-3 md:justify-end">
            <span data-hero-fade>
              <Button href="#our-drink" variant="solid">
                Discover ZUNO
              </Button>
            </span>
            <span data-hero-fade>
              <Button href="#flavors" variant="ghost">
                Explore flavors
              </Button>
            </span>
          </div>
        </div>
      </div>

      <div
        data-hero-hidden
        className="invisible absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
        aria-hidden
      >
        <span data-hero-cue className="eyebrow text-[0.6rem] text-cream/70">
          Scroll
        </span>
        <span data-hero-cue className="relative h-10 w-px overflow-hidden bg-cream/20">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-cream [animation:scroll-cue_1.8s_var(--ease-swift)_infinite]" />
        </span>
      </div>
    </section>
  );
}
