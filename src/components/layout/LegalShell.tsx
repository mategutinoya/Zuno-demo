import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ZunoLogo } from "@/components/brand/ZunoLogo";

export function LegalShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="container-x flex h-20 items-center justify-between">
        <Link href="/" aria-label="Volver al inicio">
          <ZunoLogo className="h-9 w-auto" crownColor="#F05A9D" />
        </Link>
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase hover:text-hot">
          <ArrowLeft className="size-4" /> Volver
        </Link>
      </header>
      <main className="container-x max-w-3xl! pt-16 pb-28">
        <p className="eyebrow text-hot">{eyebrow}</p>
        <h1 className="display mt-4 text-6xl md:text-8xl">{title}</h1>
        <div className="mt-12 space-y-6 text-lg leading-relaxed text-ink/75 [&_h2]:display [&_h2]:pt-6 [&_h2]:text-3xl [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc">
          {children}
        </div>
      </main>
      <footer className="border-t border-ink/10 py-8 text-center text-xs text-ink/50">
        Disfruta con responsabilidad. Prohibida la venta a menores de 18 años.
      </footer>
    </div>
  );
}
