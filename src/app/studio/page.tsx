import type { Metadata } from "next";
import { StudioClient } from "./StudioClient";

/**
 * Internal product-render studio. Generates the lifestyle imagery in
 * /public/experience from the same 3D bottle used on the site:
 *   npm run render:shots
 */
export const metadata: Metadata = { title: "Studio", robots: { index: false, follow: false } };

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ shot?: string }> }) {
  const { shot } = await searchParams;
  return (
    <main style={{ margin: 0, background: "#000" }}>
      <StudioClient shot={shot ?? "golden-hour"} />
    </main>
  );
}
