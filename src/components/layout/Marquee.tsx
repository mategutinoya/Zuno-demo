import { Crown } from "@/components/brand/ZunoLogo";

const ITEMS = ["DRINK DIFFERENT", "Una vuelta más de sabor", "HARD SELTZER", "300 ML", "4.5% ALC. VOL.*"];

export function Marquee({ className = "" }: { className?: string }) {
  const row = (
    <div className="flex shrink-0 items-center">
      {ITEMS.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className={i % 2 ? "font-hand px-8 text-[0.9em] normal-case" : "display px-8"}>{t}</span>
          <Crown className="h-4 w-auto text-tangerine" color="currentColor" />
        </span>
      ))}
    </div>
  );
  return (
    <div className={`relative z-10 overflow-hidden py-5 text-3xl md:py-6 md:text-5xl ${className}`} aria-hidden>
      <div className="animate-marquee flex w-max">
        {row}
        {row}
      </div>
    </div>
  );
}
