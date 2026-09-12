'use client';

import { ContactShadows } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';

import { Lodge } from '@/components/three/lodge/Lodge';
import {
  Forest,
  Lake,
  LodgeLights,
  Sky,
  Terrain,
} from '@/components/three/lodge/Wilderness';
import { createShotFrame, sampleShot } from '@/lib/shot';
import { damp } from '@/lib/utils';

/**
 * Flies the shot. Progress arrives through a ref — the scrubber and the
 * scroll position both write to it — so dragging the handle never
 * re-renders React, it just changes a number the render loop is already
 * reading.
 */
function ShotCamera({
  progress,
  immediate,
}: {
  progress: RefObject<number>;
  /** True while the user is dragging: follow the handle without easing. */
  immediate: RefObject<boolean>;
}) {
  const { camera } = useThree();
  const frame = useRef(createShotFrame());
  const current = useRef(createShotFrame());

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const cam = camera as THREE.PerspectiveCamera;

    sampleShot(progress.current ?? 0, frame.current);
    const c = current.current;
    const f = frame.current;

    if (immediate.current) {
      // Scrubbing should feel like a video scrubber: the frame under the
      // handle, not a frame easing toward it.
      c.position.copy(f.position);
      c.target.copy(f.target);
      c.fov = f.fov;
    } else {
      c.position.set(
        damp(c.position.x, f.position.x, 0.0008, dt),
        damp(c.position.y, f.position.y, 0.0008, dt),
        damp(c.position.z, f.position.z, 0.0008, dt),
      );
      c.target.set(
        damp(c.target.x, f.target.x, 0.002, dt),
        damp(c.target.y, f.target.y, 0.002, dt),
        damp(c.target.z, f.target.z, 0.002, dt),
      );
      c.fov = damp(c.fov, f.fov, 0.004, dt);
    }

    cam.position.copy(c.position);
    cam.lookAt(c.target);
    if (Math.abs(cam.fov - c.fov) > 0.01) {
      cam.fov = c.fov;
      cam.updateProjectionMatrix();
    }
  });

  return null;
}

function Scene({
  progress,
  immediate,
}: {
  progress: RefObject<number>;
  immediate: RefObject<boolean>;
}) {
  const { scene } = useThree();

  useEffect(() => {
    // Aerial haze. Without it the instanced treeline ends at a hard edge
    // and the wide beat looks like a model on a table.
    scene.fog = new THREE.Fog('#2a3050', 90, 320);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  return (
    <>
      <ShotCamera progress={progress} immediate={immediate} />
      <Sky />
      <LodgeLights />
      <Terrain />
      <Forest />
      <Lake />
      <Lodge />
      {/* The lodge never moves, so one render of its contact shadow is
          enough — `frames={1}` keeps it off the per-frame budget. */}
      <ContactShadows
        position={[0, 0.02, 0]}
        scale={38}
        resolution={512}
        blur={2.6}
        opacity={0.75}
        far={12}
        frames={1}
        color="#000000"
      />
    </>
  );
}

export default function LodgeCanvas({
  progress,
  immediate,
  active,
}: {
  progress: RefObject<number>;
  immediate: RefObject<boolean>;
  /** False when the section is off screen — stops rendering entirely. */
  active: boolean;
}) {
  return (
    <Canvas
      aria-hidden="true"
      className="!absolute inset-0"
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.6]}
      camera={{ position: [1.5, 1.4, 30], fov: 42, near: 0.5, far: 400 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.setClearColor('#0b1020', 1)}
    >
      <Suspense fallback={null}>
        <Scene progress={progress} immediate={immediate} />
      </Suspense>
    </Canvas>
  );
}
