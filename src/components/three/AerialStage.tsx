'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { LiteStage, StillStage } from '@/components/three/LiteStage';
import { SceneLoader } from '@/components/three/SceneLoader';
import { useSceneTier } from '@/hooks/useSceneTier';

/**
 * The 3D chunk is code-split and never server-rendered: three.js has no
 * business in the HTML payload, and WebGL has no server-side equivalent to
 * hydrate against.
 */
const SceneCanvas = dynamic(() => import('@/components/three/SceneCanvas'), {
  ssr: false,
  loading: () => <SceneLoader />,
});

/**
 * Decides what flies behind the page:
 *
 *   full  → the R3F scroll scene, mounted only after the browser is idle so
 *           it can never compete with LCP or hydration
 *   lite  → a Framer Motion glyph for phones and low-core devices
 *   still → a static composition for reduced-motion or no-WebGL
 *
 * Everything it renders is `aria-hidden` and `pointer-events-none`; the page
 * is fully usable — and fully readable — if none of it ever appears.
 */
export function AerialStage() {
  const tier = useSceneTier();
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (tier !== 'full') return;

    // requestIdleCallback is still missing in Safari; the timeout fallback
    // lands well after first paint either way.
    const schedule =
      window.requestIdleCallback ??
      ((cb: IdleRequestCallback) =>
        window.setTimeout(
          () => cb({ didTimeout: true, timeRemaining: () => 0 }),
          400,
        ));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;

    const handle = schedule(() => setIdle(true), { timeout: 2200 });
    return () => cancel(handle as number);
  }, [tier]);

  if (tier === null) return <SceneLoader />;
  if (tier === 'still') return <StillStage />;
  if (tier === 'lite') return <LiteStage />;

  return idle ? <SceneCanvas /> : <SceneLoader />;
}
