import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Serif, Permanent_Marker } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "wdth"],
  display: "swap",
});

const editorial = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif-face",
  display: "swap",
});

const marker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marker",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "ZUNO — Drink Different. Hard Seltzer frutal",
    template: "%s · ZUNO",
  },
  description:
    "ZUNO es un hard seltzer frutal en botella de vidrio de 300 ml. Pink Lychee, Mango Passion, Achachairú Citrus y Berry Mood. Una vuelta más de sabor. Solo para mayores de 18 años.",
  openGraph: {
    title: "ZUNO — Drink Different.",
    description: "Hard Seltzer frutal. Una vuelta más de sabor.",
    images: ["/experience/zuno-poster.jpg"],
    type: "website",
    locale: "es_BO",
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#17131B",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${marker.variable} ${editorial.variable}`}>
      <body>{children}</body>
    </html>
  );
}
