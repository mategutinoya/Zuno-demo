"use client";
import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Viewport-entry animations for children marked with:
 *  [data-reveal]        fade + rise
 *  [data-reveal="mask"] line slides up out of an overflow-hidden parent
 *  [data-reveal="line"] horizontal rule draws in
 * Optional data-delay (seconds).
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        const kind = el.dataset.reveal;
        const delay = Number(el.dataset.delay ?? 0);
        const from =
          kind === "mask"
            ? { yPercent: 110, rotate: 2 }
            : kind === "line"
              ? { scaleX: 0, transformOrigin: "left center" }
              : { y: 40, opacity: 0 };
        if (reduce) {
          gsap.from(el, { opacity: 0, duration: 0.6, scrollTrigger: { trigger: el, start: "top 90%", once: true } });
          return;
        }
        gsap.from(el, {
          ...from,
          duration: kind === "line" ? 1.4 : 1.2,
          delay,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, [scope]);
}
