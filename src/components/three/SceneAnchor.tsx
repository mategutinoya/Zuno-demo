"use client";
import { useEffect, useRef } from "react";
import { anchors, type AnchorConfig, type AnchorId } from "@/lib/sceneState";
import { useWebGL } from "@/lib/hooks";
import { FallbackBottle } from "@/components/ui/FallbackBottle";

interface Props extends AnchorConfig {
  id: AnchorId;
  className?: string;
  /** what to render when WebGL is unavailable */
  fallback?: React.ReactNode;
}

/** An invisible DOM box the 3D scene aligns objects to. */
export function SceneAnchor({ id, className, fallback, ...config }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const webgl = useWebGL();
  const cfg = JSON.stringify(config);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    anchors.set(id, { el, config: JSON.parse(cfg) as AnchorConfig });
    return () => {
      if (anchors.get(id)?.el === el) anchors.delete(id);
    };
  }, [id, cfg]);

  return (
    <div ref={ref} data-anchor={id} className={className} aria-hidden={webgl !== false}>
      {webgl === false && (fallback ?? <FallbackBottle />)}
    </div>
  );
}
