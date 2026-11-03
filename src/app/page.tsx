import { AgeGate } from "@/components/layout/AgeGate";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Marquee } from "@/components/layout/Marquee";
import { StageCanvas } from "@/components/three/StageCanvas";
import { Hero } from "@/components/sections/Hero";
import { OurDrink } from "@/components/sections/OurDrink";
import { Flavors } from "@/components/sections/Flavors";
import { Experience } from "@/components/sections/Experience";
import { Story } from "@/components/sections/Story";

export default function Home() {
  return (
    <>
      <AgeGate />
      <SmoothScroll />
      <div id="site">
        <Navbar />
        <main>
          {/* One sticky WebGL stage travels with the bottle across these sections */}
          <div id="stage" className="relative">
            <StageCanvas />
            <Hero />
            <Marquee className="border-y border-cream/15 text-cream" />
            <OurDrink />
            <Flavors />
          </div>
          <Experience />
          <Story />
        </main>
        <Footer />
      </div>
    </>
  );
}
