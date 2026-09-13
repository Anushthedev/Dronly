'use client';

import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Suspense, useEffect, useState } from 'react';

import { DroneScene } from '@/components/three/DroneScene';

/**
 * The WebGL layer. Fixed behind the whole document — every section scrolls
 * over it, which is what makes one continuous flight possible.
 *
 * This module is only ever reached through a dynamic import (see
 * AerialStage), so three.js and drei stay out of the first-load bundle.
 */
export default function SceneCanvas({
  onReady,
  quality = 'full',
}: {
  onReady?: () => void;
  quality?: 'full' | 'lite';
}) {
  const [paused, setPaused] = useState(false);

  // A hidden tab should not be burning a GPU on an animation nobody is
  // watching — and coming back to a stale frame is fine, the rig damps in.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return (
    <Canvas
      // Decorative: all information in the scene is also present in the DOM.
      aria-hidden="true"
      className="!fixed inset-0 -z-10"
      frameloop={paused ? 'never' : 'always'}
      // Capping DPR at 1.75 is the single biggest win on retina displays;
      // above that the difference is invisible and the fill rate triples.
      dpr={quality === 'full' ? [1, 1.75] : [1, 1.25]}
      camera={{ position: [46, 30, 76], fov: 40, near: 0.5, far: 420 }}
      // Soft shadows are the single biggest realism win here: without them
      // the lodge floats and the treeline has no weight on the ground.
      shadows={{ type: THREE.PCFSoftShadowMap }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor('#7fb1e0', 1);
        onReady?.();
      }}
    >
      <Suspense fallback={null}>
        <DroneScene quality={quality} />
      </Suspense>
    </Canvas>
  );
}
