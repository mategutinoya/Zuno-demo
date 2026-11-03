"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReveal } from "@/components/ui/useReveal";
import { ZunoLogo } from "@/components/brand/ZunoLogo";

gsap.registerPlugin(ScrollTrigger);

const TITLE = ["NOT", "JUST", "ANOTHER", "DRINK."];

const PILLARS = [
  { n: "01", title: "Diseño", text: "Cada detalle, de la tapa a la etiqueta, está pensado para destacar." },
  { n: "02", title: "Personalidad", text: "Juvenil, atrevida y con identidad propia. Sin pedir permiso." },
  { n: "03", title: "Sabor", text: "Fruta intensa, burbuja fina y un final limpio que invita a la siguiente." },
];

export function Story() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        el.querySelectorAll("[data-word]"),
        { opacity: 0.12, yPercent: 20 },
        {
          opacity: 1,
          yPercent: 0,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: { trigger: el.querySelector("[data-title]"), start: "top 80%", end: "bottom 45%", scrub: 0.6 },
        },
      );
      gsap.fromTo(
        el.querySelector("[data-story-img]"),
        { yPercent: -10 },
        { yPercent: 10, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={root}
      id="story"
      data-nav="light"
      aria-labelledby="story-title"
      className="relative z-10 overflow-hidden bg-cream py-28 text-ink md:py-40"
    >
      <div className="container-x">
        <div className="flex items-center gap-4">
          <span className="eyebrow text-hot">05</span>
          <span data-reveal="line" className="h-px w-16 bg-ink/30" />
          <span className="eyebrow">Our story</span>
        </div>

        <h2
          id="story-title"
          data-title
          aria-label="Not just another drink."
          className="display mt-10 flex flex-wrap gap-x-[0.2em] text-[18vw] leading-[0.82] md:text-[11.5vw]"
        >
          {TITLE.map((w, i) => (
            <span key={w} data-word aria-hidden className={i === 3 ? "text-hot" : undefined}>
              {w}
            </span>
          ))}
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-12 md:mt-24 md:grid-cols-12 md:gap-8">
          <div className="relative md:col-span-5">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-blush">
              <div data-story-img className="absolute inset-[-12%]">
                <Image
                  src="/experience/photo-story.jpg"
                  alt="Botellas ZUNO Mango Passion y Achachairú Citrus con fruta fresca y salpicaduras"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </div>
            <p className="font-hand absolute -right-2 -bottom-6 rotate-[-6deg] rounded-full bg-ink px-5 py-3 text-xl text-cream md:-right-8 md:text-2xl">
              Drink different.
            </p>
          </div>

          <div className="flex flex-col justify-center md:col-span-6 md:col-start-7">
            <p data-reveal className="font-editorial text-[2rem] leading-[1.18] tracking-[-0.01em] md:text-[2.75rem] md:leading-[1.14]">
              {/* the brand mark itself opens the sentence, crown sitting on the Z */}
              <ZunoLogo
                className="inline-block h-[1.3em] w-auto align-[-0.27em]"
                crownColor="#F05A9D"
                title="ZUNO"
              />{" "}
              nace de una idea sencilla: <em className="text-hot">hacer las cosas diferentes.</em> Una nueva
              interpretación de las bebidas frutales, donde el diseño, la personalidad y el sabor construyen una
              experiencia propia.
            </p>
            <ul className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {PILLARS.map((p, i) => (
                <li key={p.n} data-reveal data-delay={i * 0.08} className="border-t border-ink/15 pt-5">
                  <span className="eyebrow text-hot">{p.n}</span>
                  <h3 className="display mt-3 text-3xl">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">{p.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
