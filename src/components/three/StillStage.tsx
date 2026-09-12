'use client';

import { DroneGlyph } from '@/components/three/DroneGlyph';

/**
 * Reduced-motion / no-WebGL fallback: the same composition, holding still.
 */
export function StillStage() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#08080a]"
    >
      <div className="absolute inset-x-0 bottom-0 h-[70%]">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_100%,rgba(100,58,237,0.26),transparent_70%)]" />
      </div>
      <div className="text-meadow-cream absolute top-[64%] left-1/2 w-[44vw] max-w-[260px] -translate-x-1/2 -translate-y-1/2 opacity-40">
        <DroneGlyph className="w-full" />
      </div>
    </div>
  );
}
