'use client';

import { useEffect, useState } from 'react';

/**
 * How much 3D this device should be asked to do.
 *
 *   full  — desktop-class: the full R3F scroll scene
 *   lite  — phones, tablets and low-core devices: a Framer Motion / CSS
 *           stand-in that costs a few hundred bytes instead of a WebGL context
 *   still — reduced motion or no WebGL at all: a static composition
 *
 * Resolves to `null` until measured, which is the cue to render nothing heavy.
 */
export type SceneTier = 'full' | 'lite' | 'still';

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    );
  } catch {
    return false;
  }
}

export function useSceneTier(): SceneTier | null {
  const [tier, setTier] = useState<SceneTier | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wide = window.matchMedia('(min-width: 1024px)');
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

    const resolve = () => {
      // The scene IS the site's imagery — there is no photography to fall
      // back to — so anything that can run WebGL gets it. Only a stated
      // motion preference or a missing context drops to the static page.
      if (reduced.matches || !hasWebGL()) return setTier('still');

      const nav = navigator as NavigatorWithMemory;
      const cores = nav.hardwareConcurrency ?? 4;
      const memory = nav.deviceMemory ?? 4;

      // `lite` is not "no 3D" — it is the same scene with a thinner forest
      // and a lower pixel ratio, for phones and low-core machines.
      const capable = wide.matches && fine.matches && cores >= 4 && memory >= 4;
      setTier(capable ? 'full' : 'lite');
    };

    resolve();

    const targets = [reduced, wide, fine];
    targets.forEach((m) => m.addEventListener('change', resolve));
    return () => targets.forEach((m) => m.removeEventListener('change', resolve));
  }, []);

  return tier;
}
