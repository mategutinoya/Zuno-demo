/**
 * Central brand configuration. Replace the handles / emails with the
 * official accounts before going live.
 */
export const SITE = {
  name: "ZUNO",
  slogan: "DRINK DIFFERENT.",
  tagline: "Una vuelta más de sabor.",
  url: "https://zuno.drinks",
  instagram: "https://www.instagram.com/zuno.drinks",
  tiktok: "https://www.tiktok.com/@zuno.drinks",
  salesEmail: "comercial@zuno.drinks",
  distributionEmail: "distribucion@zuno.drinks",
  legalAge: 18,
} as const;

export const NAV_LINKS = [
  { label: "HOME", href: "#top" },
  { label: "OUR DRINK", href: "#our-drink" },
  { label: "FLAVORS", href: "#flavors" },
  { label: "OUR STORY", href: "#story" },
] as const;
