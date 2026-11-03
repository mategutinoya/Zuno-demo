"use client";
import { ArrowUpRight } from "lucide-react";
import { scrollToTarget } from "@/lib/scroll";

type Variant = "solid" | "ghost" | "light" | "dark";

interface Props {
  children: React.ReactNode;
  href: string;
  variant?: Variant;
  className?: string;
  icon?: boolean;
  onClick?: () => void;
}

const styles: Record<Variant, string> = {
  solid: "bg-cream text-ink hover:bg-white",
  ghost: "border border-current/35 text-current hover:border-current backdrop-blur-sm",
  light: "bg-ink text-cream hover:bg-black",
  dark: "bg-hot text-cream hover:bg-[#ff69ac]",
};

/** Pill CTA. Hash links scroll smoothly; others behave as normal anchors. */
export function Button({ children, href, variant = "solid", className = "", icon = true, onClick }: Props) {
  const isHash = href.startsWith("#");
  const external = /^https?:|^mailto:/.test(href);
  return (
    <a
      href={href}
      onClick={(e) => {
        if (isHash) {
          e.preventDefault();
          scrollToTarget(href);
        }
        onClick?.();
      }}
      {...(external && href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`group relative inline-flex h-12 items-center gap-3 overflow-hidden rounded-full pl-6 pr-2 text-[0.78rem] font-semibold tracking-[0.18em] uppercase transition-[background-color,border-color,transform] duration-500 ease-(--ease-premium) active:scale-[0.97] ${styles[variant]} ${className}`}
    >
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-500 ease-(--ease-premium) group-hover:-translate-y-full">
          {children}
        </span>
        <span className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-(--ease-premium) group-hover:translate-y-0">
          {children}
        </span>
      </span>
      {icon ? (
        <span className="grid size-8 place-items-center rounded-full bg-current/10 transition-transform duration-500 ease-(--ease-premium) group-hover:rotate-45">
          <ArrowUpRight className="size-4" strokeWidth={2.2} />
        </span>
      ) : (
        <span className="w-3" />
      )}
    </a>
  );
}
