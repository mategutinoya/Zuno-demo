"use client";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, MeshReflectorMaterial } from "@react-three/drei";
import { BottleModel, createBottleMaterials } from "../BottleModel";
import { Fruit, type FruitPiece } from "../Fruits";
import { StudioEnvironment } from "../Lighting";
import { loadLabels } from "../useLabels";
import { Backdrop, type BackdropProps } from "./Backdrop";
import { createMarbleTexture, createPalmTexture } from "./props";
import { FLAVORS } from "@/lib/flavors";

type V3 = [number, number, number];

interface BottleSpec {
  flavor: number;
  pos: V3;
  rot?: V3;
  scale?: number;
}
interface FruitSpec {
  kind: FruitPiece;
  pos: V3;
  rot?: V3;
  scale?: number;
}
interface Shot {
  size: [number, number];
  camera: { pos: V3; look: V3; fov: number };
  backdrop: BackdropProps;
  bottles: BottleSpec[];
  fruits: FruitSpec[];
  floor?: "reflector" | "marble" | "gloss";
  floorColor?: string;
  floorY?: number;
  palms?: boolean;
  lights: "warm" | "pink" | "night" | "studio";
}

const FLOOR = -1.72;

const P: [number, number] = [700, 1608];

export const SHOTS: Record<string, Shot> = {
  "moment-fresh-cut": {
    size: P,
    camera: { pos: [0, -0.05, 9.6], look: [0, -0.2, 0], fov: 30 },
    backdrop: { top: "#FBD9E6", mid: "#F49CC2", bottom: "#E2558F", glow: "#FFE6F0" },
    bottles: [{ flavor: 0, pos: [0, 0, 0], rot: [0, -0.3, 0] }],
    fruits: [
      { kind: "lychee", pos: [-0.62, FLOOR + 0.26, 0.95], scale: 1 },
      { kind: "lycheePeeled", pos: [0.42, FLOOR + 0.24, 1.35], scale: 0.95 },
      { kind: "raspberry", pos: [0.82, FLOOR + 0.21, 0.55], rot: [0.3, 0, 0.4], scale: 0.95 },
      { kind: "raspberry", pos: [-0.2, FLOOR + 0.2, 1.75], rot: [-0.4, 0.3, 0.2], scale: 0.8 },
      { kind: "leaf", pos: [-0.95, FLOOR + 0.03, 1.4], rot: [-1.45, 0, 0.7], scale: 1.2 },
      { kind: "raspberry", pos: [0.72, 1.05, -0.4], rot: [0.6, 0.2, 0], scale: 0.75 },
      { kind: "lychee", pos: [-0.72, 0.55, -0.5], scale: 0.75 },
    ],
    floor: "gloss",
    floorColor: "#F0A6C6",
    lights: "pink",
  },
  "moment-golden-hour": {
    size: P,
    camera: { pos: [0.15, 0.15, 9.8], look: [0.05, -0.15, 0], fov: 30 },
    backdrop: { top: "#3B1F5C", mid: "#E85A8E", bottom: "#FFA24C", glow: "#FFC58A", sun: { x: 0.72, y: 0.6, r: 0.11, color: "#FFE7B0" } },
    bottles: [{ flavor: 1, pos: [0, 0, 0], rot: [0, -0.35, 0] }],
    fruits: [
      { kind: "passionHalf", pos: [0.62, FLOOR + 0.28, 1.05], rot: [0.95, 0, 0.2], scale: 0.95 },
      { kind: "mango", pos: [-0.72, FLOOR + 0.24, 0.55], rot: [0, 0.5, 0], scale: 0.95 },
      { kind: "mangoCube", pos: [-0.25, FLOOR + 0.1, 1.55], rot: [0, 0.6, 0], scale: 1 },
      { kind: "ice", pos: [0.15, FLOOR + 0.2, 1.9], rot: [0, 0.4, 0.05], scale: 0.8 },
      { kind: "leaf", pos: [-0.95, FLOOR + 0.03, 1.35], rot: [-1.45, 0, 0.5], scale: 1.1 },
    ],
    floor: "reflector",
    floorColor: "#4a2232",
    palms: true,
    lights: "warm",
  },
  "moment-bright-side": {
    size: P,
    camera: { pos: [0, -0.05, 9.6], look: [0, -0.2, 0], fov: 30 },
    backdrop: { top: "#FFF8DA", mid: "#EEF4A2", bottom: "#BCD552", glow: "#FFFFFF" },
    bottles: [{ flavor: 2, pos: [0, 0, 0], rot: [0, -0.3, 0] }],
    fruits: [
      { kind: "achachairuHalf", pos: [-0.62, FLOOR + 0.24, 1.0], rot: [0.95, 0, -0.25], scale: 1 },
      { kind: "limeSlice", pos: [0.62, FLOOR + 0.18, 1.1], rot: [1.15, 0.2, -0.25], scale: 0.9 },
      { kind: "achachairu", pos: [0.85, FLOOR + 0.25, 0.3], rot: [0.2, 0, 0.3], scale: 0.95 },
      { kind: "ice", pos: [-0.05, FLOOR + 0.2, 1.75], rot: [0, -0.3, 0.04], scale: 0.85 },
      { kind: "lime", pos: [-0.85, FLOOR + 0.25, 0.1], scale: 0.85 },
      { kind: "leaf", pos: [0.95, FLOOR + 0.03, 1.55], rot: [-1.45, 0, -0.8], scale: 1.1 },
    ],
    floor: "gloss",
    floorColor: "#D7E47E",
    lights: "studio",
  },
  "moment-night-mood": {
    size: P,
    camera: { pos: [0.1, 0.1, 9.2], look: [0, -0.1, 0], fov: 30 },
    backdrop: { top: "#120A1A", mid: "#2D1840", bottom: "#4A2466", glow: "#8054A8" },
    bottles: [{ flavor: 3, pos: [0, 0, 0], rot: [0, -0.25, 0] }],
    fruits: [
      { kind: "blackberry", pos: [-0.62, FLOOR + 0.25, 0.95], rot: [0.3, 0, 0.4], scale: 0.95 },
      { kind: "blueberry", pos: [0.55, FLOOR + 0.14, 1.2], scale: 0.95 },
      { kind: "blueberry", pos: [0.85, FLOOR + 0.14, 0.7], scale: 0.85 },
      { kind: "ice", pos: [-0.1, FLOOR + 0.2, 1.75], rot: [0, 0.5, 0.05], scale: 0.85 },
      { kind: "blackberry", pos: [0.7, 0.85, -0.4], rot: [0.5, 0, 0.2], scale: 0.75 },
      { kind: "blueberry", pos: [-0.75, 0.4, -0.3], scale: 0.7 },
    ],
    floor: "reflector",
    floorColor: "#1a0f24",
    lights: "night",
  },
  "golden-hour": {
    size: [1800, 1500],
    camera: { pos: [0.6, 0.35, 9.6], look: [0.2, -0.15, 0], fov: 30 },
    backdrop: { top: "#3B1F5C", mid: "#E85A8E", bottom: "#FFA24C", glow: "#FFC58A", sun: { x: 0.7, y: 0.5, r: 0.07, color: "#FFE7B0" } },
    bottles: [{ flavor: 1, pos: [0, 0, 0], rot: [0, -0.35, 0.0] }],
    fruits: [
      { kind: "passionHalf", pos: [1.25, FLOOR + 0.28, 1.0], rot: [0.9, 0, 0.2], scale: 1.25 },
      { kind: "mango", pos: [-1.55, FLOOR + 0.24, 0.2], rot: [0, 0.4, 0], scale: 1.2 },
      { kind: "mangoCube", pos: [-0.8, FLOOR + 0.12, 1.25], rot: [0, 0.5, 0], scale: 1.1 },
      { kind: "mangoCube", pos: [-1.15, FLOOR + 0.12, 1.75], rot: [0, 1.1, 0], scale: 1 },
      { kind: "passion", pos: [2.1, FLOOR + 0.3, -0.4], scale: 1.1 },
    ],
    floor: "reflector",
    floorColor: "#4a2232",
    palms: true,
    lights: "warm",
  },
  "fresh-cut": {
    size: [1800, 1500],
    camera: { pos: [0, -0.25, 9.2], look: [0, -0.2, 0], fov: 30 },
    backdrop: { top: "#F9D3E3", mid: "#F48DB8", bottom: "#E8478E", glow: "#FFE1EC" },
    bottles: [{ flavor: 0, pos: [0, 0, 0], rot: [0, -0.25, 0] }],
    fruits: [
      { kind: "lychee", pos: [-1.2, FLOOR + 0.26, 0.9], scale: 1.1 },
      { kind: "lycheePeeled", pos: [-0.65, FLOOR + 0.24, 1.6], scale: 1.1 },
      { kind: "raspberry", pos: [1.0, FLOOR + 0.22, 1.2], rot: [0.3, 0, 0.4], scale: 1 },
      { kind: "lychee", pos: [1.55, FLOOR + 0.26, 0.3], scale: 1.1 },
      { kind: "raspberry", pos: [0.55, FLOOR + 0.2, 1.9], rot: [-0.4, 0, 0.2], scale: 0.9 },
      { kind: "lycheePeeled", pos: [1.8, 0.9, -1.0], scale: 0.9 },
      { kind: "raspberry", pos: [-1.6, 1.1, -0.6], rot: [0.6, 0.2, 0], scale: 0.9 },
      { kind: "lychee", pos: [-2.2, FLOOR + 0.26, -0.6], scale: 1 },
    ],
    floor: "gloss",
    floorColor: "#F2A2C4",
    lights: "pink",
  },
  "ice-cold": {
    size: [1800, 1500],
    camera: { pos: [0.3, 0.15, 5.6], look: [0, -0.05, 0], fov: 30 },
    backdrop: { top: "#140C1C", mid: "#2D1840", bottom: "#4A2466", glow: "#8054A8" },
    bottles: [{ flavor: 3, pos: [0, 0, 0], rot: [0.05, -0.15, -0.08] }],
    fruits: [
      { kind: "blackberry", pos: [-0.95, 0.9, 0.4], rot: [0.3, 0, 0.5], scale: 0.9 },
      { kind: "blueberry", pos: [0.9, 1.25, 0.2], scale: 0.9 },
      { kind: "blueberry", pos: [0.8, -0.2, 0.9], scale: 0.7 },
      { kind: "blackberry", pos: [-0.8, -0.35, 0.8], rot: [-0.4, 0.2, -0.2], scale: 0.75 },
    ],
    lights: "night",
  },
  lineup: {
    size: [1800, 1500],
    camera: { pos: [0, 1.05, 12.6], look: [0, -0.3, 0], fov: 30 },
    backdrop: { top: "#5B3484", mid: "#C2569B", bottom: "#F7A6CB", glow: "#FFC0DA" },
    bottles: [
      { flavor: 0, pos: [-1.8, 0, 0], rot: [0, 0.18, 0] },
      { flavor: 1, pos: [-0.6, 0, -0.15], rot: [0, 0.06, 0] },
      { flavor: 2, pos: [0.6, 0, -0.15], rot: [0, -0.06, 0] },
      { flavor: 3, pos: [1.8, 0, 0], rot: [0, -0.18, 0] },
    ],
    fruits: [
      { kind: "lychee", pos: [-2.45, FLOOR + 0.26, 1.2], scale: 1 },
      { kind: "lycheePeeled", pos: [-1.95, FLOOR + 0.24, 1.75], scale: 0.95 },
      { kind: "mangoCube", pos: [-1.0, FLOOR + 0.12, 1.5], rot: [0, 0.6, 0], scale: 1 },
      { kind: "passionHalf", pos: [-0.35, FLOOR + 0.28, 1.85], rot: [0.95, 0, 0], scale: 1 },
      { kind: "limeSlice", pos: [0.55, FLOOR + 0.2, 1.6], rot: [1.1, 0, 0.3], scale: 1 },
      { kind: "achachairu", pos: [1.15, FLOOR + 0.25, 1.4], scale: 1 },
      { kind: "blackberry", pos: [1.95, FLOOR + 0.25, 1.7], rot: [0.2, 0, 0.3], scale: 0.9 },
      { kind: "blueberry", pos: [2.45, FLOOR + 0.14, 1.25], scale: 0.9 },
    ],
    floor: "marble",
    palms: true,
    lights: "studio",
  },
  story: {
    size: [1200, 1500],
    camera: { pos: [0, 0.1, 8.6], look: [0, 0, 0], fov: 30 },
    backdrop: { top: "#F48DB8", mid: "#F8C5DA", bottom: "#FFF0F5", glow: "#FFFFFF" },
    bottles: [{ flavor: 0, pos: [0, 0.15, 0], rot: [0.05, -0.4, 0.14] }],
    fruits: [
      { kind: "lycheePeeled", pos: [-1.05, -1.25, 0.8], scale: 1.2 },
      { kind: "lychee", pos: [1.0, -1.45, 0.6], scale: 1.2 },
      { kind: "raspberry", pos: [1.1, 1.05, 0.2], rot: [0.4, 0, 0.3], scale: 1 },
      { kind: "lychee", pos: [-1.15, 1.35, -0.4], scale: 0.85 },
    ],
    lights: "pink",
  },
};

function Lights({ kind }: { kind: Shot["lights"] }) {
  switch (kind) {
    case "warm":
      return (
        <>
          <ambientLight intensity={0.35} color="#ffd9c2" />
          <directionalLight position={[3, 4, -6]} intensity={4.5} color="#FFB36B" />
          <directionalLight position={[-2, 3, 6]} intensity={1.8} color="#fff1e6" />
          <spotLight position={[-6, 2, -2]} angle={0.6} penumbra={1} intensity={40} color="#FF7BB0" />
        </>
      );
    case "pink":
      return (
        <>
          <ambientLight intensity={0.55} color="#ffe6ef" />
          <directionalLight position={[2, 5, 6]} intensity={2.2} color="#ffffff" />
          <directionalLight position={[-4, 2, -4]} intensity={2} color="#F8C5DA" />
        </>
      );
    case "night":
      return (
        <>
          <ambientLight intensity={0.2} />
          <directionalLight position={[1.5, 3, 5]} intensity={1.3} color="#ffffff" />
          <spotLight position={[-4, 2, -3]} angle={0.7} penumbra={1} intensity={60} color="#B07CFF" />
          <spotLight position={[4, 3, -3]} angle={0.7} penumbra={1} intensity={60} color="#F05A9D" />
        </>
      );
    default:
      return (
        <>
          <ambientLight intensity={0.45} />
          <directionalLight position={[2, 5, 7]} intensity={2.2} color="#fff4ec" />
          <directionalLight position={[-5, 3, -5]} intensity={2} color="#F8C5DA" />
        </>
      );
  }
}

function CameraRig({ shot }: { shot: Shot }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(...shot.camera.pos);
    (camera as THREE.PerspectiveCamera).fov = shot.camera.fov;
    camera.lookAt(...shot.camera.look);
    camera.updateProjectionMatrix();
  }, [camera, shot]);
  return null;
}

function Bottles({ shot, labels }: { shot: Shot; labels: THREE.Texture[] }) {
  const mats = useMemo(
    () => shot.bottles.map((b) => createBottleMaterials(FLAVORS[b.flavor].liquid, labels[b.flavor])),
    [shot, labels],
  );
  return (
    <>
      {shot.bottles.map((b, i) => (
        <group key={i} position={b.pos} rotation={b.rot ?? [0, 0, 0]} scale={b.scale ?? 1}>
          <BottleModel materials={mats[i]} animated={false} seed={i * 7 + 3} />
        </group>
      ))}
    </>
  );
}

function Floor({ shot }: { shot: Shot }) {
  const marble = useMemo(() => (shot.floor === "marble" ? createMarbleTexture() : null), [shot.floor]);
  if (!shot.floor) return null;
  if (shot.floor === "marble") {
    return (
      <mesh position-y={FLOOR - 0.6} >
        <cylinderGeometry args={[5.2, 5.2, 1.2, 96]} />
        <meshPhysicalMaterial attach="material-0" color="#E6D8DF" roughness={0.3} clearcoat={1} />
        <meshPhysicalMaterial attach="material-1" map={marble} roughness={0.18} clearcoat={1} clearcoatRoughness={0.05} />
        <meshPhysicalMaterial attach="material-2" color="#E6D8DF" />
      </mesh>
    );
  }
  if (shot.floor === "reflector") {
    return (
      <mesh rotation-x={-Math.PI / 2} position-y={FLOOR}>
        <planeGeometry args={[40, 20]} />
        <MeshReflectorMaterial
          resolution={512}
          mirror={0.55}
          blur={[400, 120]}
          mixBlur={1}
          mixStrength={2.2}
          depthScale={0.6}
          minDepthThreshold={0.6}
          color={shot.floorColor}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
    );
  }
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={FLOOR}>
      <planeGeometry args={[40, 20]} />
      <meshPhysicalMaterial color={shot.floorColor} roughness={0.32} clearcoat={0.8} clearcoatRoughness={0.2} />
    </mesh>
  );
}

function Palms() {
  const [left, right] = useMemo(() => [createPalmTexture(3), createPalmTexture(8)], []);
  return (
    <>
      <mesh position={[-5.6, 1.4, -5]} rotation-z={0.05}>
        <planeGeometry args={[5, 10]} />
        <meshBasicMaterial map={left} transparent opacity={0.8} alphaTest={0.12} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[6.2, 0.8, -5.5]} scale={[-1, 1, 1]}>
        <planeGeometry args={[5, 10]} />
        <meshBasicMaterial map={right} transparent opacity={0.65} alphaTest={0.12} depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  );
}

function ReadyFlag() {
  const n = useRef(0);
  useFrame((state) => {
    n.current++;
    if (n.current === 3) {
      // freeze the frame so the capture is cheap and deterministic
      state.setFrameloop("never");
      (window as unknown as { __studioReady: boolean }).__studioReady = true;
    }
  });
  return null;
}

export default function StudioScene({ shotId }: { shotId: string }) {
  const shot = SHOTS[shotId] ?? SHOTS["golden-hour"];
  const [labels, setLabels] = useState<THREE.Texture[] | null>(null);
  useEffect(() => {
    loadLabels().then(setLabels);
  }, []);
  return (
    <div style={{ width: shot.size[0], height: shot.size[1] }}>
      <Canvas
        dpr={1}
        gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 1.05 }}
        camera={{ position: shot.camera.pos, fov: shot.camera.fov, near: 0.1, far: 60 }}
      >
        <CameraRig shot={shot} />
        <Backdrop {...shot.backdrop} z={-9} />
        <StudioEnvironment resolution={256} />
        <Lights kind={shot.lights} />
        {shot.palms && <Palms />}
        <Floor shot={shot} />
        {labels && (
          <>
            <Bottles shot={shot} labels={labels} />
            {shot.fruits.map((f, i) => (
              <group key={i} position={f.pos} rotation={f.rot ?? [0, 0, 0]} scale={f.scale ?? 1}>
                <Fruit kind={f.kind} />
              </group>
            ))}
            {shot.floor && shot.floor !== "reflector" && (
              <ContactShadows position={[0, FLOOR + 0.005, 0]} opacity={0.45} scale={14} blur={2.6} far={3} frames={1} />
            )}
            <ReadyFlag />
          </>
        )}
      </Canvas>
    </div>
  );
}
