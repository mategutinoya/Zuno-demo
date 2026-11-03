"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/Button";
import { useReveal } from "@/components/ui/useReveal";

gsap.registerPlugin(ScrollTrigger);

export const SHOTS = [
  {
    src: "/experience/photo-pink-lychee.jpg",
    title: "Fresh Cut",
    kicker: "Pink Lychee",
    text: "Lychee, frambuesa y una burbuja fina. Cada sabor empieza en la fruta.",
    alt: "Botella ZUNO Pink Lychee entre lychees y frambuesas, con salpicaduras rosas",
  },
  {
    src: "/experience/photo-mango-passion.jpg",
    title: "Golden Hour",
    kicker: "Mango Passion",
    text: "Mango maduro y maracuyá. El atardecer tropical, servido bien frío.",
    alt: "Botella ZUNO Mango Passion con mango en cubos, maracuyá y salpicaduras doradas",
  },
  {
    src: "/experience/photo-achachairu-citrus.jpg",
    title: "Bright Side",
    kicker: "Achachairú Citrus",
    text: "Achachairú y lima: ácido, luminoso y con condensación en cada gota.",
    alt: "Botella ZUNO Achachairú Citrus con achachairús, lima y salpicaduras verdes",
  },
  {
    src: "/experience/photo-berry-mood.jpg",
    title: "Night Mood",
    kicker: "Berry Mood",
    text: "Mora y arándano para las noches que piden algo más intenso.",
    alt: "Botella ZUNO Berry Mood rodeada de moras y arándanos con salpicaduras violetas",
  },
] as const;

export function Experience() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useReveal(root);

  // Desktop: pinned horizontal travel. Mobile: native snap carousel.
  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const distance = () => tr.scrollWidth - window.innerWidth;
      const tween = gsap.to(tr, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el.querySelector("[data-pin]"),
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
      // inner parallax on each image
      tr.querySelectorAll<HTMLElement>("[data-parallax]").forEach((img) => {
        gsap.fromTo(
          img,
          { xPercent: -4 },
          {
            xPercent: 4,
            ease: "none",
            scrollTrigger: {
              trigger: img.parentElement,
              containerAnimation: tween,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          },
        );
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="experience" data-nav="dark" aria-labelledby="exp-title" className="relative z-10 bg-ink text-cream">
      <div data-pin className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-24 md:py-0">
        <div
          ref={track}
          className="flex snap-x snap-mandatory items-stretch scroll-px-5 gap-5 overflow-x-auto px-5 [scrollbar-width:none] md:w-max md:snap-none md:gap-8 md:overflow-visible md:px-[clamp(1.25rem,4vw,3.5rem)] [&::-webkit-scrollbar]:hidden"
        >
          {/* intro panel */}
          <div className="flex w-[85vw] shrink-0 snap-start flex-col justify-center md:w-[34vw] md:pr-8">
            <div className="flex items-center gap-4">
              <span className="eyebrow text-hot">04</span>
              <span data-reveal="line" className="h-px w-16 bg-cream/30" />
              <span className="eyebrow">Experience</span>
            </div>
            <h2 id="exp-title" className="display mt-6 text-6xl md:text-[5.5vw]">
              <span className="block overflow-hidden">
                <span data-reveal="mask" className="block">
                  Momentos
                </span>
              </span>
              <span className="block overflow-hidden">
                <span data-reveal="mask" data-delay="0.08" className="block">
                  que saben
                </span>
              </span>
              <span className="block overflow-hidden">
                <span data-reveal="mask" data-delay="0.16" className="block text-hot">
                  distinto.
                </span>
              </span>
            </h2>
            <p data-reveal className="mt-6 max-w-sm leading-relaxed text-cream/65">
              Fruta fresca, agua, vidrio frío y luz de atardecer. El mundo ZUNO se vive con calma y en buena compañía.
            </p>
            <p data-reveal className="font-hand mt-8 text-2xl text-blush">Desliza →</p>
          </div>

          {SHOTS.map((s, i) => (
            <figure
              key={s.src}
              className="group relative w-[min(72vw,calc(70svh*0.435))] shrink-0 snap-start md:w-[calc(66vh*0.435)]"
            >
              <div className="relative aspect-[330/758] max-h-[70svh] overflow-hidden rounded-[1.75rem] bg-[#241a2c] md:h-[66vh] md:max-h-none">
                <div data-parallax className="absolute inset-y-0 -inset-x-[5%]">
                  <Image
                    src={s.src}
                    alt={s.alt}
                    fill
                    sizes="(max-width: 768px) 72vw, 30vw"
                    className="object-cover transition-transform duration-[1.6s] ease-(--ease-premium) group-hover:scale-[1.04]"
                  />
                </div>
                <span className="eyebrow absolute top-5 left-5 rounded-full bg-black/35 px-3 py-1.5 backdrop-blur-md">
                  0{i + 1}
                </span>
              </div>
              <figcaption className="pt-5">
                <p className="eyebrow text-cream/55">{s.kicker}</p>
                <h3 className="display mt-2 text-4xl md:text-5xl">{s.title}</h3>
                <p className="mt-2 max-w-[22rem] text-sm leading-relaxed text-cream/70">{s.text}</p>
              </figcaption>
            </figure>
          ))}

          {/* outro panel */}
          <div className="flex w-[85vw] shrink-0 snap-start flex-col items-start justify-center md:w-[30vw] md:pl-8">
            <p className="font-hand text-3xl text-tangerine md:text-4xl">¿Cuál es tu vuelta?</p>
            <p className="display mt-4 text-5xl md:text-6xl">Encuentra tu sabor.</p>
            <div className="mt-8">
              <Button href="#flavors" variant="dark">
                Explore flavors
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
