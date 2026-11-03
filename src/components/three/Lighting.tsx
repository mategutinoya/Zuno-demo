"use client";
import { Environment, Lightformer } from "@react-three/drei";

/** Studio reflections built from light-formers — no HDR download needed. */
export function StudioEnvironment({ resolution = 256 }: { resolution?: number }) {
  return (
    <Environment resolution={resolution} frames={1}>
      <color attach="background" args={["#1a1220"]} />
      {/* tall softboxes → classic vertical glass highlights */}
      <Lightformer form="rect" intensity={5} position={[-3.2, 0.5, 3]} rotation-y={Math.PI / 3.2} scale={[1, 8, 1]} />
      <Lightformer form="rect" intensity={3.2} position={[3.4, 0.5, 2.6]} rotation-y={-Math.PI / 3} scale={[0.7, 8, 1]} />
      {/* top bounce */}
      <Lightformer form="circle" intensity={2.2} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={4} />
      {/* brand coloured fills */}
      <Lightformer form="rect" intensity={2.4} color="#F05A9D" position={[0, -3, -5]} scale={[12, 3, 1]} />
      <Lightformer form="rect" intensity={1.6} color="#8054A8" position={[-6, 1, -3]} rotation-y={Math.PI / 2} scale={[6, 6, 1]} />
      <Lightformer form="rect" intensity={1.4} color="#FF9B42" position={[6, -1, -2]} rotation-y={-Math.PI / 2} scale={[4, 4, 1]} />
    </Environment>
  );
}

export function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[2.5, 4, 6]} intensity={2.1} color="#fff4ec" />
      <directionalLight position={[-5, 2, -4]} intensity={1.6} color="#F8C5DA" />
      <spotLight position={[0, 8, 2]} angle={0.5} penumbra={1} intensity={30} color="#ffffff" />
    </>
  );
}
