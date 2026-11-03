import Link from "next/link";
import { Instagram, Mail, Truck, ArrowUpRight } from "lucide-react";
import { ZunoLogo } from "@/components/brand/ZunoLogo";
import { TikTokIcon } from "@/components/ui/SocialIcons";
import { SITE } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer data-nav="dark" className="relative z-10 overflow-hidden bg-ink pt-24 text-cream">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(50% 40% at 85% 0%, #8054A833, transparent 70%), radial-gradient(40% 40% at 0% 100%, #F05A9D22, transparent 70%)" }}
      />
      <div className="container-x relative">
        {/* distribution CTA */}
        <div className="grid grid-cols-1 gap-10 border-b border-cream/10 pb-16 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="eyebrow text-hot">Distribución</p>
            <h2 className="display mt-4 text-5xl md:text-7xl">Lleva ZUNO a tu negocio.</h2>
          </div>
          <div className="flex flex-col justify-end gap-4 md:col-span-5">
            <p className="text-cream/65">
              Bares, restaurantes, tiendas y eventos. Escríbenos y nuestro equipo comercial te contactará con condiciones
              y disponibilidad en tu ciudad.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:${SITE.distributionEmail}?subject=${encodeURIComponent("Quiero distribuir ZUNO")}`}
                className="group inline-flex h-12 items-center gap-3 rounded-full bg-hot px-6 text-xs font-semibold tracking-[0.2em] uppercase transition hover:bg-[#ff69ac]"
              >
                <Truck className="size-4" /> Ser distribuidor
                <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
              </a>
              <a
                href={`mailto:${SITE.salesEmail}?subject=${encodeURIComponent("Consulta comercial ZUNO")}`}
                className="inline-flex h-12 items-center gap-3 rounded-full border border-cream/25 px-6 text-xs font-semibold tracking-[0.2em] uppercase transition hover:border-cream"
              >
                <Mail className="size-4" /> Contacto comercial
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 py-16 md:grid-cols-12">
          <div className="col-span-2 md:col-span-4">
            <ZunoLogo className="w-44 text-cream" />
            <p className="font-hand mt-6 text-2xl text-blush">{SITE.tagline}</p>
          </div>

          <nav aria-label="Redes sociales" className="md:col-span-2 md:col-start-6">
            <p className="eyebrow text-cream/45">Síguenos</p>
            <ul className="mt-5 space-y-3">
              <li>
                <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 hover:text-hot">
                  <Instagram className="size-4" /> Instagram
                </a>
              </li>
              <li>
                <a href={SITE.tiktok} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 hover:text-hot">
                  <TikTokIcon className="size-4" /> TikTok
                </a>
              </li>
            </ul>
          </nav>

          <div className="md:col-span-2">
            <p className="eyebrow text-cream/45">Contacto</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a href={`mailto:${SITE.salesEmail}`} className="break-all hover:text-hot">
                  {SITE.salesEmail}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.distributionEmail}`} className="break-all hover:text-hot">
                  {SITE.distributionEmail}
                </a>
              </li>
            </ul>
          </div>

          <nav aria-label="Legal" className="md:col-span-2">
            <p className="eyebrow text-cream/45">Legal</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/legal/terminos" className="hover:text-hot">
                  Términos de uso
                </Link>
              </li>
              <li>
                <Link href="/legal/privacidad" className="hover:text-hot">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="/consumo-responsable" className="hover:text-hot">
                  Consumo responsable
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* responsible drinking band */}
        <div className="flex flex-col gap-6 rounded-3xl border border-cream/10 bg-cream/[0.03] p-6 md:flex-row md:items-center md:p-8">
          <span className="display grid size-16 shrink-0 place-items-center rounded-full border-2 border-cream text-2xl">
            18+
          </span>
          <p className="text-sm leading-relaxed text-cream/70">
            <strong className="text-cream">Disfruta con responsabilidad.</strong> Prohibida la venta de bebidas
            alcohólicas a menores de 18 años. El consumo excesivo de alcohol es dañino para la salud. Si bebes, no
            manejes. No recomendado durante el embarazo.
          </p>
        </div>

        <div className="flex flex-col gap-3 py-10 text-xs text-cream/40 md:flex-row md:justify-between">
          <p>© {year} ZUNO. Todos los derechos reservados.</p>
          <p>*4.5% Alc. Vol.: graduación objetivo de formulación, sujeta a validación.</p>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none select-none opacity-[0.06]">
        <ZunoLogo className="mx-auto -mb-[4vw] w-[96vw] text-cream" crown={false} />
      </div>
    </footer>
  );
}
