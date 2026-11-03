"use client";
import dynamic from "next/dynamic";

const StudioScene = dynamic(() => import("@/components/three/studio/StudioScene"), { ssr: false });

export function StudioClient({ shot }: { shot: string }) {
  return <StudioScene shotId={shot} />;
}
