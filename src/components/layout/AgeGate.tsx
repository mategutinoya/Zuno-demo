"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ZunoLogo } from "@/components/brand/ZunoLogo";
import { gateStore, useStore } from "@/lib/store";
import { SITE } from "@/lib/site";

const KEY = "zuno-age-verified";
const ease = [0.22, 1, 0.36, 1] as const;

/** 18+ verification before any commercial content is accessible. */
export function AgeGate() {
  const state = useStore(gateStore, "unknown");
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    let ok = false;
    try {
      ok = localStorage.getItem(KEY) === "1" || sessionStorage.getItem(KEY) === "1";
    } catch {
      /* storage blocked */
    }
    gateStore.set(ok ? "verified" : "pending");
  }, []);

  useEffect(() => {
    const site = document.getElementById("site");
    const locked = state !== "verified";
    site?.toggleAttribute("inert", locked);
    document.documentElement.style.overflow = locked ? "hidden" : "";
  }, [state]);

  const accept = () => {
    try {
      (remember ? localStorage : sessionStorage).setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    gateStore.set("verified");
  };

  return (
    <AnimatePresence>
      {state !== "verified" && (
        <motion.div
          key="gate"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gate-title"
          className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-ink px-5 py-10 text-cream"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease, delay: 0.15 } }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background:
                "radial-gradient(55% 45% at 20% 20%, #8054A855, transparent 70%), radial-gradient(45% 40% at 85% 85%, #F05A9D44, transparent 70%)",
            }}
          />
          {state === "unknown" ? (
            <ZunoLogo className="relative w-40 animate-pulse text-cream/80" />
          ) : (
            <motion.div
              className="relative w-full max-w-xl text-center"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 1, ease } }}
              exit={{ opacity: 0, y: -24, scale: 0.98, transition: { duration: 0.6, ease } }}
            >
              <ZunoLogo className="mx-auto w-44 text-cream md:w-56" />
              <p className="eyebrow mt-6 text-cream/60">Drink different</p>

              {state === "pending" ? (
                <>
                  <h1 id="gate-title" className="display mt-10 text-5xl md:text-7xl">
                    ¿Eres mayor de {SITE.legalAge}?
                  </h1>
                  <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-cream/70">
                    ZUNO es una bebida alcohólica. Para ingresar debes tener la edad legal para consumir alcohol en tu
                    país.
                  </p>
                  <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <button
                      onClick={accept}
                      className="h-14 w-full rounded-full bg-cream px-8 text-sm font-semibold tracking-[0.2em] text-ink uppercase transition hover:bg-blush sm:w-auto"
                    >
                      Sí, tengo {SITE.legalAge}+
                    </button>
                    <button
                      onClick={() => gateStore.set("denied")}
                      className="h-14 w-full rounded-full border border-cream/30 px-8 text-sm font-semibold tracking-[0.2em] uppercase transition hover:border-cream sm:w-auto"
                    >
                      No, soy menor
                    </button>
                  </div>
                  <label className="mt-6 inline-flex cursor-pointer items-center gap-3 text-sm text-cream/60">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="size-4 accent-hot"
                    />
                    Recordar mi respuesta en este dispositivo
                  </label>
                  <p className="mx-auto mt-10 max-w-md text-xs leading-relaxed text-cream/45">
                    Al ingresar aceptas los{" "}
                    <a href="/legal/terminos" className="underline underline-offset-2 hover:text-cream">
                      Términos de uso
                    </a>{" "}
                    y la{" "}
                    <a href="/legal/privacidad" className="underline underline-offset-2 hover:text-cream">
                      Política de privacidad
                    </a>
                    . Disfruta con responsabilidad.
                  </p>
                </>
              ) : (
                <>
                  <h1 id="gate-title" className="display mt-10 text-5xl md:text-6xl">
                    Nos vemos pronto.
                  </h1>
                  <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-cream/70">
                    El contenido de ZUNO está reservado para mayores de {SITE.legalAge} años. Gracias por tu
                    honestidad.
                  </p>
                  <div className="mt-10 flex flex-col items-center gap-4">
                    <a
                      href="/consumo-responsable"
                      className="text-sm font-semibold tracking-[0.2em] uppercase underline underline-offset-4"
                    >
                      Consumo responsable
                    </a>
                    <button
                      onClick={() => gateStore.set("pending")}
                      className="text-xs text-cream/50 hover:text-cream"
                    >
                      Me equivoqué de respuesta
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
