"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GlassWater, Snowflake, Citrus } from "lucide-react";
import { SceneAnchor } from "@/components/three/SceneAnchor";
import { Crown } from "@/components/brand/ZunoLogo";
import { useReveal } from "@/components/ui/useReveal";
import { DRINK_BG } from "@/lib/flavors";

gsap.registerPlugin(ScrollTrigger);

const SPECS = [
  { value: 300, decimals: 0, unit: "ml", label: "Botella de vidrio", note: "El formato justo: se sirve frío y se disfruta de principio a fin." },
  { value: 4.5, decimals: 1, unit: "%", label: "Alc. Vol.*", note: "Graduación objetivo, ligera y equilibrada." },
  { value: 0, decimals: 0, unit: "g", label: "Azúcar", note: "Zero azúcar: todo el sabor de la fruta, sin azúcar añadida." },
  { value: 4, decimals: 0, unit: "", label: "Sabores", note: "Cuatro universos frutales, una misma actitud." },
];

const FEATURES = [
  { icon: Snowflake, title: "Ultra refrescante", text: "Burbuja fina y final limpio. Mejor bien fría." },
  { icon: Citrus, title: "Fruta protagonista", text: "Perfiles frutales intensos, sin exceso de dulzor." },
  { icon: GlassWater, title: "Lista para disfrutar", text: "Abre, sirve y comparte. Sin mezclas ni complicaciones." },
];

function Counter({ value, decimals }: { value: number; decimals: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { v: 0 };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    el.textContent = (0).toFixed(decimals);
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () =>
        gsap.to(obj, {
          v: value,
          duration: 1.8,
          ease: "expo.out",
          onUpdate: () => (el.textContent = obj.v.toFixed(decimals)),
        }),
    });
    return () => st.kill();
  }, [value, decimals]);
  return <span ref={ref}>{value.toFixed(decimals)}</span>;
}

export function OurDrink() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section
      ref={root}
      id="our-drink"
      data-nav="light"
      data-fallback-bg
      style={{ ["--fallback-bg" as string]: `linear-gradient(180deg, ${DRINK_BG[1]}, ${DRINK_BG[0]})` }}
      aria-labelledby="drink-title"
      className="relative z-10 py-24 text-ink md:py-36"
    >
      <div className="container-x">
        <div className="flex items-center gap-4">
          <span className="eyebrow text-hot">02</span>
          <span data-reveal="line" className="h-px w-16 bg-ink/30" />
          <span className="eyebrow">Our drink</span>
        </div>

        <div className="mt-10 grid grid-cols-1 items-center gap-12 md:mt-14 md:grid-cols-12 md:gap-6">
          {/* concept */}
          <div className="md:col-span-4">
            <h2 id="drink-title" className="display text-[17vw] md:text-[7.2vw] xl:text-[7rem]">
              <span className="block overflow-hidden">
                <span data-reveal="mask" className="block">
                  Hecha
                </span>
              </span>
              <span className="block overflow-hidden">
                <span data-reveal="mask" data-delay="0.08" className="block">
                  para ser
                </span>
              </span>
              <span className="block overflow-hidden">
                <span data-reveal="mask" data-delay="0.16" className="block text-hot">
                  distinta.
                </span>
              </span>
            </h2>
            <p data-reveal className="mt-8 max-w-sm text-lg leading-relaxed text-ink/75">
              ZUNO es un hard seltzer frutal y zero azúcar: agua con gas, un toque de alcohol y fruta con carácter, en una botella de
              vidrio de 300 ml pensada para compartir buenos momentos.
            </p>
            <div data-reveal className="mt-10 flex max-w-sm items-start gap-4 border-t border-ink/15 pt-6">
              <Crown className="mt-1 h-5 w-auto shrink-0 text-hot" />
              <p className="text-sm leading-relaxed text-ink/70">
                <strong className="font-semibold text-ink">La corona.</strong> Nuestro sello: un guiño a quienes se
                atreven a hacerlo diferente. Está en la tapa, en la etiqueta y en la actitud.
              </p>
            </div>
          </div>

          {/* product — the 3D bottle lands here */}
          <div className="relative flex justify-center md:col-span-4">
            <div aria-hidden className="absolute inset-x-0 top-1/2 -z-10 mx-auto aspect-square w-[80%] -translate-y-1/2 rounded-full bg-hot/10 blur-3xl" />
            <SceneAnchor id="drink" rotY={0.55} spin={-1.6} rotZ={-0.06} rotX={0.04} className="aspect-[1/3.44] h-[64svh] md:h-[82vh]" />
            <span className="font-hand absolute top-[8%] right-[2%] rotate-6 text-xl text-hot md:right-[-4%] md:text-2xl">
              Drink different!
            </span>
          </div>

          {/* specs */}
          <dl className="grid grid-cols-1 gap-0 md:col-span-4">
            {SPECS.map((s, i) => (
              <div key={s.label} data-reveal data-delay={i * 0.08} className="group border-t border-ink/15 py-6 last:border-b">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="display text-6xl md:text-7xl">
                      <Counter value={s.value} decimals={s.decimals} />
                      <span className="text-[0.5em]">{s.unit}</span>
                    </span>
                    <span className="eyebrow text-ink/60">{s.label}</span>
                  </div>
                  <p className="mt-2 text-sm text-ink/60">{s.note}</p>
                </dd>
              </div>
            ))}
            <div data-reveal className="pt-6">
              <div className="flex flex-wrap gap-2">
                <span className="display inline-block rounded-full bg-ink px-4 py-2 text-lg text-cream">Hard Seltzer</span>
                <span className="display inline-block rounded-full bg-hot px-4 py-2 text-lg text-cream">Zero azúcar</span>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-ink/50">
                *4.5% Alc. Vol. es la graduación objetivo de formulación, sujeta a validación final.
              </p>
            </div>
          </dl>
        </div>

        <ul className="mt-20 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-ink/10 bg-ink/10 md:mt-28 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <li key={title} data-reveal data-delay={i * 0.08} className="group bg-cream/80 p-8 backdrop-blur md:p-10">
              <Icon className="size-7 text-hot transition-transform duration-700 ease-(--ease-premium) group-hover:-rotate-12 group-hover:scale-110" strokeWidth={1.6} />
              <h3 className="display mt-8 text-3xl">{title}</h3>
              <p className="mt-3 text-ink/65">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
