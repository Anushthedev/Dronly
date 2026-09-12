'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { useScrollApi } from '@/components/providers/ScrollProvider';
import { DroneRig } from '@/components/three/DroneRig';
import { Lodge } from '@/components/three/lodge/Lodge';
import {
  Forest,
  Lake,
  LodgeLights,
  Sky,
  Terrain,
} from '@/components/three/lodge/Wilderness';
import { createCameraPose, sampleCamera, type CameraPose } from '@/lib/flight';
import { createShotFrame, sampleShot, type ShotFrame } from '@/lib/shot';
import { shotState } from '@/lib/shotState';
import { damp } from '@/lib/utils';

/**
 * One camera for the whole site.
 *
 * For most of the page it flies the narrative path over the valley, keyed
 * to scroll position. Inside the scrubbable section it hands over to the
 * shot in lib/shot.ts, driven by the scrubber's playhead. The two paths
 * meet exactly at stage 4, so the hand-off is not a cut — and because
 * everything is damped toward a target rather than assigned, even an abrupt
 * change of source resolves as a move rather than a jump.
 */
function CameraRig({ quality }: { quality: 'full' | 'lite' }) {
  const { state } = useScrollApi();
  const { camera } = useThree();

  const narrative = useRef<CameraPose>(createCameraPose());
  const shot = useRef<ShotFrame>(createShotFrame());
  const position = useRef(new THREE.Vector3(...createCameraPose().position));
  const target = useRef(new THREE.Vector3(...createCameraPose().target));
  const fov = useRef(createCameraPose().fov);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const cam = camera as THREE.PerspectiveCamera;

    let wantPos: THREE.Vector3 | [number, number, number];
    let wantTarget: THREE.Vector3 | [number, number, number];
    let wantFov: number;

    if (shotState.active) {
      sampleShot(shotState.progress, shot.current);
      wantPos = shot.current.position;
      wantTarget = shot.current.target;
      wantFov = shot.current.fov;
    } else {
      sampleCamera(state.current.stage, narrative.current);
      wantPos = narrative.current.position;
      wantTarget = narrative.current.target;
      wantFov = narrative.current.fov;
    }

    const px = Array.isArray(wantPos) ? wantPos[0] : wantPos.x;
    const py = Array.isArray(wantPos) ? wantPos[1] : wantPos.y;
    const pz = Array.isArray(wantPos) ? wantPos[2] : wantPos.z;
    const tx = Array.isArray(wantTarget) ? wantTarget[0] : wantTarget.x;
    const ty = Array.isArray(wantTarget) ? wantTarget[1] : wantTarget.y;
    const tz = Array.isArray(wantTarget) ? wantTarget[2] : wantTarget.z;

    if (shotState.immediate) {
      // Scrubbing must feel like a video scrubber: the frame under the
      // handle, not a frame easing toward it.
      position.current.set(px, py, pz);
      target.current.set(tx, ty, tz);
      fov.current = wantFov;
    } else {
      const ease = shotState.active ? 0.0006 : 0.004;
      position.current.set(
        damp(position.current.x, px, ease, dt),
        damp(position.current.y, py, ease, dt),
        damp(position.current.z, pz, ease, dt),
      );
      target.current.set(
        damp(target.current.x, tx, 0.002, dt),
        damp(target.current.y, ty, 0.002, dt),
        damp(target.current.z, tz, 0.002, dt),
      );
      fov.current = damp(fov.current, wantFov, 0.004, dt);
    }

    cam.position.copy(position.current);
    cam.lookAt(target.current);
    if (Math.abs(cam.fov - fov.current) > 0.01) {
      cam.fov = fov.current;
      cam.updateProjectionMatrix();
    }
  });

  return <DroneRig quality={quality} />;
}

export function DroneScene({ quality }: { quality: 'full' | 'lite' }) {
  const { scene } = useThree();

  useEffect(() => {
    // Aerial haze. Without it the treeline ends at a hard edge and the wide
    // frames look like a model on a table rather than a valley.
    scene.fog = new THREE.Fog('#2a3050', 90, 340);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  return (
    <>
      <CameraRig quality={quality} />
      <Sky />
      <LodgeLights />
      <Terrain />
      <Forest count={quality === 'full' ? 260 : 120} />
      <Lake />
      <Lodge />
    </>
  );
}
