'use client';

import { Environment, Grid, Lightformer, Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { forwardRef, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { useScrollApi } from '@/components/providers/ScrollProvider';
import { FLIGHT_PATH } from '@/lib/flight';
import { damp } from '@/lib/utils';

/**
 * Lighting rig.
 *
 * `<Environment>` is built from Lightformers rather than a preset HDR: the
 * presets are fetched from a CDN at runtime, and a marketing hero should not
 * depend on a third-party request to finish looking right.
 */
export const SceneLights = forwardRef<THREE.DirectionalLight>(
  function SceneLights(_, keyLight) {
    return (
      <>
        <ambientLight intensity={0.35} color="#c6c3ba" />
        <directionalLight
          ref={keyLight}
          position={[4, 6, 4]}
          intensity={2.6}
          color="#f7f4e8"
        />
        {/* Violet rim from below-left: the single chromatic note. */}
        <pointLight
          position={[-4, -1.5, 2]}
          intensity={16}
          color="#643aed"
          distance={14}
        />
        {/* Cool fill keeps the shadow side from going flat black. */}
        <pointLight
          position={[3, -2, -3]}
          intensity={6}
          color="#8ea0c4"
          distance={16}
        />

        <Environment resolution={96} frames={1}>
          <Lightformer
            form="rect"
            intensity={1.6}
            color="#f7f4e8"
            position={[0, 4, -6]}
            scale={[12, 6, 1]}
          />
          <Lightformer
            form="circle"
            intensity={2.4}
            color="#643aed"
            position={[-5, -2, 3]}
            scale={[6, 6, 1]}
          />
          <Lightformer
            form="rect"
            intensity={0.9}
            color="#c6c3ba"
            position={[6, 2, 4]}
            scale={[8, 8, 1]}
          />
        </Environment>
      </>
    );
  },
);

/**
 * Ground plane. It slides along Z with scroll, which reads as forward
 * travel without moving the camera or re-rendering anything.
 */
export function Terrain() {
  const { state } = useScrollApi();
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;
    const dt = Math.min(delta, 0.1);
    // One grid cell per stage keeps the motion readable but never looping
    // fast enough to strobe.
    node.position.z = damp(
      node.position.z,
      (state.current.stage % 1) * 2,
      0.01,
      dt,
    );
  });

  return (
    <group ref={group} position={[0, -1.75, 0]}>
      <Grid
        args={[40, 40]}
        cellSize={0.6}
        cellThickness={0.6}
        cellColor="#1e1e26"
        sectionSize={3}
        sectionThickness={1}
        sectionColor="#2f2352"
        fadeDistance={22}
        fadeStrength={2}
        followCamera={false}
        infiniteGrid
      />
    </group>
  );
}

/** Dust and haze particles for depth cueing. */
export function Atmosphere({ count = 320 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 3;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.012;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.022}
        color="#f7f4e8"
        transparent
        opacity={0.45}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/**
 * The authored flight path, drawn as a faint plan line. It makes the scroll
 * choreography legible: you can see where the aircraft has been and where
 * it is going next.
 */
export function FlightPlan() {
  const points = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      FLIGHT_PATH.map((k) => new THREE.Vector3(...k.position)),
    );
    return curve.getPoints(160);
  }, []);

  return (
    <Line
      points={points}
      color="#643aed"
      lineWidth={1}
      dashed
      dashSize={0.1}
      gapSize={0.22}
      transparent
      opacity={0.14}
      depthWrite={false}
    />
  );
}
