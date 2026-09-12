'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { useScrollApi } from '@/components/providers/ScrollProvider';
import { DroneRig } from '@/components/three/DroneRig';
import {
  Atmosphere,
  FlightPlan,
  SceneLights,
  Terrain,
} from '@/components/three/SceneEnvironment';
import { damp, mapRange } from '@/lib/utils';

/**
 * Camera work. The drone does most of the moving, but the camera answers it
 * with a slow dolly and a widening lens as the narrative opens out, then
 * closes back in for the landing at the contact section.
 */
function CameraRig() {
  const { state } = useScrollApi();
  const { camera } = useThree();

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const { stage } = state.current;

    // Pull back through the middle of the story, come back in to land.
    const z = 5.4 + mapRange(stage, 0, 3, 0, 1.6) - mapRange(stage, 4, 5, 0, 1.1);
    const y =
      0.35 + mapRange(stage, 1, 4, 0, 0.55) - mapRange(stage, 4.4, 5, 0, 0.5);

    camera.position.z = damp(camera.position.z, z, 0.02, dt);
    camera.position.y = damp(camera.position.y, y, 0.02, dt);
    camera.lookAt(0, 0.1, 0);
  });

  return null;
}

export function DroneScene() {
  const keyLight = useRef<THREE.DirectionalLight>(null);
  const { scene } = useThree();

  useEffect(() => {
    // Fog does the heavy lifting for depth — the grid and particles dissolve
    // into the ink background instead of ending at a hard edge.
    scene.fog = new THREE.FogExp2('#08080a', 0.085);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  return (
    <>
      <CameraRig />
      <SceneLights ref={keyLight} />
      <Terrain />
      <Atmosphere />
      <FlightPlan />
      <DroneRig keyLight={keyLight} />
    </>
  );
}
