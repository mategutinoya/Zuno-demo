"use client";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import gsap from "gsap";
import { Background } from "./Background";
import { Particles } from "./Particles";
import { Wordmark3D } from "./Wordmark3D";
import { LiveBottle } from "./LiveBottle";
import { FlavorFruits } from "./FlavorFruits";
import { StudioEnvironment, StudioLights } from "./Lighting";
import { updateDirector } from "./director";
import { useLabels } from "./useLabels";
import { sceneState } from "@/lib/sceneState";
import { sceneReadyStore } from "@/lib/store";

function Director() {
  const { gl, camera } = useThree();
  useFrame((_, dt) => updateDirector(gl.domElement, camera as THREE.PerspectiveCamera, Math.min(dt, 0.05)), -1);
  return null;
}

/** Signals readiness after the first frames are compiled, then runs the intro. */
function ReadySignal() {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    frames.current++;
    if (frames.current > 2) {
      done.current = true;
      sceneReadyStore.set(true);
      gsap.to(sceneState, {
        intro: 1,
        duration: sceneState.reducedMotion ? 0.8 : 2.8,
        ease: sceneState.reducedMotion ? "power1.out" : "expo.out",
        delay: 0.1,
      });
    }
  });
  return null;
}

function Content({ mobile }: { mobile: boolean }) {
  const labels = useLabels();
  const { gl } = useThree();
  useEffect(() => {
    // Lighter transmission pass on phones
    const r = gl as THREE.WebGLRenderer & { transmissionResolutionScale?: number };
    if ("transmissionResolutionScale" in r) r.transmissionResolutionScale = mobile ? 0.6 : 1;
  }, [gl, mobile]);

  return (
    <>
      <Director />
      <Background />
      <StudioEnvironment resolution={mobile ? 128 : 256} />
      <StudioLights />
      <Wordmark3D />
      {labels && (
        <>
          <LiveBottle labels={labels} quality={mobile ? "low" : "high"} />
          <FlavorFruits maxPieces={mobile ? 4 : 6} spread={mobile ? 1 : 0.72} />
          <ReadySignal />
        </>
      )}
      <Particles count={mobile ? 50 : 140} />
    </>
  );
}

export default function Scene({ active }: { active: boolean }) {
  const [mobile] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  const [dpr, setDpr] = useState<number>(() => Math.min(window.devicePixelRatio, mobile ? 1.5 : 2));

  useEffect(() => {
    sceneState.isMobile = mobile;
  }, [mobile]);

  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 10], fov: 30, near: 0.1, far: 40 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.NeutralToneMapping,
        toneMappingExposure: 1.05,
      }}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(1, d - 0.5))}
        onIncline={() => setDpr((d) => Math.min(d + 0.25, mobile ? 1.5 : 2))}
        flipflops={3}
      />
      <Content mobile={mobile} />
    </Canvas>
  );
}
