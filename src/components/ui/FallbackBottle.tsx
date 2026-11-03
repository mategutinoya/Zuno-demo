"use client";
import { FLAVORS } from "@/lib/flavors";
import { flavorStore, useStore } from "@/lib/store";

/**
 * Lightweight SVG bottle used only when WebGL is unavailable.
 * The full experience is the 3D bottle — this is a graceful fallback.
 */
export function FallbackBottle() {
  const idx = useStore(flavorStore, 0);
  const f = FLAVORS[idx];
  return (
    <svg viewBox="0 0 100 344" className="mx-auto h-full w-auto drop-shadow-2xl" role="img" aria-label={`Botella ZUNO ${f.name}`}>
      <defs>
        <linearGradient id="fb-glass" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".25" stopColor="#fff" stopOpacity=".08" />
          <stop offset=".8" stopColor="#fff" stopOpacity=".05" />
          <stop offset="1" stopColor="#fff" stopOpacity=".4" />
        </linearGradient>
        <linearGradient id="fb-label" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={f.label.top} />
          <stop offset="1" stopColor={f.label.bottom} />
        </linearGradient>
      </defs>
      <path
        d="M41 14h18v10c0 30 2 40 18 64 6 9 9 18 9 30v210c0 6-4 10-10 10H24c-6 0-10-4-10-10V118c0-12 3-21 9-30 16-24 18-34 18-64z"
        fill={f.liquid}
        opacity=".85"
        style={{ transition: "fill .8s" }}
      />
      <rect x="14" y="196" width="72" height="128" fill="url(#fb-label)" />
      <text x="50" y="246" textAnchor="middle" fontSize="22" fontWeight="800" fill={f.label.logo} fontFamily="var(--font-display)">
        ZUNO
      </text>
      <text x="50" y="270" textAnchor="middle" fontSize="8" fill={f.label.ink} fontFamily="var(--font-marker)">
        {f.labelLines.join(" ")}
      </text>
      <text x="50" y="300" textAnchor="middle" fontSize="6" fontWeight="700" fill={f.label.ink} letterSpacing="1">
        HARD SELTZER
      </text>
      <path
        d="M41 14h18v10c0 30 2 40 18 64 6 9 9 18 9 30v210c0 6-4 10-10 10H24c-6 0-10-4-10-10V118c0-12 3-21 9-30 16-24 18-34 18-64z"
        fill="url(#fb-glass)"
      />
      <rect x="39" y="2" width="22" height="16" rx="3" fill="#121015" />
    </svg>
  );
}
