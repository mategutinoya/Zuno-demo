"use client";
import Image from "next/image";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { useReveal } from "@/components/ui/useReveal";


export const SHOTS = [
  {
    src: "/experience/photo-fresh-cut.jpg",
    title: "Fresh Cut",
    kicker: "Pink Lychee",
    text: "Lychee, frambuesa y una burbuja fina. Cada sabor empieza en la fruta.",
    alt: "Botella ZUNO Pink Lychee con lychees, frambuesas y flores de cerezo sobre un fondo rosa",
  },
  {
    src: "/experience/photo-golden-hour.jpg",
    title: "Golden Hour",
    kicker: "Mango Passion",
    text: "Mango maduro y maracuyá. El atardecer tropical, servido bien frío.",
    alt: "Botella ZUNO Mango Passion frente al mar al atardecer, con mango, maracuyá y hielo",
  },
  {
    src: "/experience/photo-bright-side.jpg",
    title: "Bright Side",
    kicker: "Achachairú Citrus",
    text: "Achachairú y lima: ácido, luminoso y con condensación en cada gota.",
    alt: "Botella ZUNO Achachairú Citrus con achachairús, limas, hielo y salpicaduras bajo el sol",
  },
  {
    src: "/experience/photo-night-mood.jpg",
    title: "Night Mood",
    kicker: "Berry Mood",
    text: "Mora y arándano para las noches que piden algo más intenso.",
    alt: "Botella ZUNO Berry Mood de noche bajo la luna llena, con moras y arándanos",
  },
] as const;

/** Caption band per flavour (same order as SHOTS). */
const BANDS = [
  { bg: "linear-gradient(160deg, #F05A9D, #B8336F)", ink: "text-cream" },
  { bg: "linear-gradient(160deg, #FF9B42, #DA6A22)", ink: "text-cream" },
  { bg: "linear-gradient(160deg, #D3E26A, #9DBA3C)", ink: "text-ink" },
  { bg: "linear-gradient(160deg, #8054A8, #45285F)", ink: "text-cream" },
];

export function Experience() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section ref={root} id="experience" data-nav="dark" aria-labelledby="exp-title" className="relative z-10 bg-ink py-24 text-cream md:py-32">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-4">
              <span className="eyebrow text-hot">04</span>
              <span data-reveal="line" className="h-px w-16 bg-cream/30" />
              <span className="eyebrow">Experience</span>
            </div>
            <h2 id="exp-title" className="display mt-6 text-6xl md:text-[5.5vw] xl:text-8xl">
              <span className="block overflow-hidden">
                <span data-reveal="mask" className="block">
                  Momentos que saben
                </span>
              </span>
              <span className="block overflow-hidden">
                <span data-reveal="mask" data-delay="0.08" className="block text-hot">
                  distinto.
                </span>
              </span>
            </h2>
          </div>
          <p data-reveal className="max-w-sm leading-relaxed text-cream/65">
            Fruta fresca, agua, vidrio frío y luz de atardecer. El mundo ZUNO se vive con calma y en buena compañía.
          </p>
        </div>
      </div>

      {/* four moments: a row on desktop, a swipeable carousel on phones */}
      <div className="mt-14 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:container-x md:mt-16 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
        {SHOTS.map((s, i) => (
          <figure
            key={s.src}
            data-reveal
            data-delay={i * 0.08}
            className="group relative w-[78vw] max-w-[360px] shrink-0 snap-start overflow-hidden rounded-[1.5rem] bg-[#241a2c] md:w-auto md:max-w-none"
          >
            <div className="relative aspect-[1122/1402] overflow-hidden">
              <Image
                src={s.src}
                alt={s.alt}
                fill
                sizes="(max-width: 768px) 78vw, 25vw"
                loading="eager"
                className="object-cover transition-transform duration-[1.6s] ease-(--ease-premium) group-hover:scale-[1.05]"
              />
              <span className="eyebrow absolute top-4 left-4 rounded-full bg-black/35 px-3 py-1.5 text-cream backdrop-blur-md">
                0{i + 1}
              </span>
            </div>
            <figcaption className={`relative p-5 md:p-6 ${BANDS[i].ink}`} style={{ background: BANDS[i].bg }}>
              <p className="eyebrow opacity-75">{s.kicker}</p>
              <h3 className="display mt-2 text-4xl lg:text-5xl">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed opacity-85">{s.text}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="container-x mt-14 flex flex-wrap items-center justify-between gap-6">
        <p className="font-hand text-3xl text-tangerine md:text-4xl">¿Cuál es tu vuelta?</p>
        <Button href="#flavors" variant="dark">
          Explore flavors
        </Button>
      </div>
    </section>
  );
}
