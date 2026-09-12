'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { StillStage } from '@/components/three/StillStage';
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
 * Decides what flies behind the page.
 *
 * The scene is the site's only imagery, so every device that can run WebGL
 * gets it — `lite` differs from `full` in forest density and pixel ratio,
 * not in whether there is anything to look at. Only a stated motion
 * preference or a missing context falls back to the static composition.
 *
 * Either way it mounts after the browser is idle, so it can never compete
 * with LCP or hydration, and everything it renders is `aria-hidden` and
 * `pointer-events-none`: the page is fully usable, and fully readable, if
 * none of it ever appears.
 */
export function AerialStage() {
  const tier = useSceneTier();
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (tier === null || tier === 'still') return;

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

  return idle ? <SceneCanvas quality={tier} /> : <SceneLoader />;
}
