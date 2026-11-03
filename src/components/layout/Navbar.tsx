"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ZunoLogo } from "@/components/brand/ZunoLogo";
import { NAV_LINKS, SITE } from "@/lib/site";
import { getLenis, scrollToTarget } from "@/lib/scroll";
import { TikTokIcon } from "@/components/ui/SocialIcons";
import { Instagram } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [active, setActive] = useState("#top");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 24);
      const probe = 44;
      const sections = document.querySelectorAll<HTMLElement>("[data-nav]");
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) {
          setTheme(s.dataset.nav === "light" ? "light" : "dark");
          break;
        }
      }
      const mid = window.innerHeight * 0.45;
      for (const l of NAV_LINKS) {
        const el = l.href === "#top" ? document.getElementById("top") : document.querySelector(l.href);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) setActive(l.href);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // flavour switches change the section theme without scrolling
    const mo = new MutationObserver(onScroll);
    document.querySelectorAll("[data-nav]").forEach((n) => mo.observe(n, { attributes: true, attributeFilter: ["data-nav"] }));
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const l = getLenis();
    if (open) l?.stop();
    else l?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    // let the menu close before scrolling
    setTimeout(() => scrollToTarget(href), open ? 350 : 0);
  };

  const light = theme === "light" && !open;
  const ink = light ? "text-ink" : "text-cream";

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5 md:pt-4">
      <nav
        aria-label="Principal"
        className={`relative mx-auto flex h-14 max-w-[1480px] items-center justify-between rounded-full pr-2 pl-5 transition-[background-color,box-shadow,color,border-color] duration-700 ease-(--ease-premium) md:h-16 md:pl-7 ${ink} ${
          scrolled && !open
            ? light
              ? "border border-ink/10 bg-cream/70 shadow-[0_10px_40px_-20px_rgba(23,19,27,0.35)] backdrop-blur-xl"
              : "border border-cream/10 bg-ink/45 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl"
            : "border border-transparent"
        }`}
      >
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            go("#top");
          }}
          aria-label="ZUNO — inicio"
          className="relative z-10"
        >
          <ZunoLogo className="h-8 w-auto md:h-9" crownColor={light ? "#F05A9D" : "#FF9B42"} />
        </a>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={(e) => {
                  e.preventDefault();
                  go(l.href);
                }}
                aria-current={active === l.href ? "location" : undefined}
                className="group relative px-4 py-2 text-[0.72rem] font-semibold tracking-[0.24em]"
              >
                {l.label}
                <span
                  className={`absolute inset-x-4 -bottom-0.5 h-px origin-left bg-current transition-transform duration-500 ease-(--ease-premium) ${
                    active === l.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="relative z-10 flex items-center gap-2">
          <a
            href="#our-drink"
            onClick={(e) => {
              e.preventDefault();
              go("#our-drink");
            }}
            className={`hidden h-10 items-center rounded-full px-5 text-[0.72rem] font-semibold tracking-[0.22em] transition-colors duration-500 sm:inline-flex md:h-11 ${
              light ? "bg-ink text-cream hover:bg-hot" : "bg-cream text-ink hover:bg-blush"
            }`}
          >
            DISCOVER
          </a>
          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
            className="grid size-10 place-items-center rounded-full border border-current/25 lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 -z-10 flex flex-col bg-ink px-6 pt-28 pb-10 text-cream lg:hidden"
            initial={{ clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 44px) 44px)", transition: { duration: 0.8, ease } }}
            exit={{ clipPath: "circle(0% at calc(100% - 44px) 44px)", transition: { duration: 0.55, ease } }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(70% 50% at 80% 10%, #F05A9D40, transparent 70%), radial-gradient(60% 50% at 10% 90%, #8054A850, transparent 70%)" }}
            />
            <ul className="relative flex flex-col gap-2">
              {NAV_LINKS.map((l, i) => (
                <li key={l.href} className="overflow-hidden">
                  <motion.a
                    href={l.href}
                    onClick={(e) => {
                      e.preventDefault();
                      go(l.href);
                    }}
                    initial={{ y: "110%" }}
                    animate={{ y: 0, transition: { delay: 0.18 + i * 0.07, duration: 0.7, ease } }}
                    exit={{ y: "110%", transition: { duration: 0.3 } }}
                    className="display flex items-baseline gap-4 py-1 text-[15vw] sm:text-7xl"
                  >
                    <span className="font-brand text-xs font-semibold tracking-[0.2em] text-hot">0{i + 1}</span>
                    {l.label}
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.div
              className="relative mt-auto flex items-end justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
            >
              <p className="font-hand text-2xl text-blush">{SITE.tagline}</p>
              <div className="flex gap-3">
                <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid size-11 place-items-center rounded-full border border-cream/20">
                  <Instagram className="size-5" />
                </a>
                <a href={SITE.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="grid size-11 place-items-center rounded-full border border-cream/20">
                  <TikTokIcon className="size-5" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
