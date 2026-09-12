'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { useScrollApi } from '@/components/providers/ScrollProvider';
import { Drone } from '@/components/three/Drone';
import { createDronePose, sampleDrone } from '@/lib/flight';
import { shotState } from '@/lib/shotState';
import { clamp, damp } from '@/lib/utils';

/**
 * The drone, parented to the camera.
 *
 * Keeping it in camera-local space means the model reads as a foreground
 * object you are flying alongside — it stays composed in frame no matter
 * where in the valley the camera is, instead of having to be chased around
 * the world by a second path that would need re-timing every time the
 * camera moved.
 *
 * Three layers stack up: the authored pose for the current stage, an idle
 * hover so it never looks parked, and a bank angle from scroll velocity —
 * the way an aircraft rolls into the direction it is accelerating. Damped,
 * not assigned, which is what gives it a sense of mass.
 */
export function DroneRig({ quality }: { quality: 'full' | 'lite' }) {
  const { state } = useScrollApi();
  const { camera, scene } = useThree();
  const group = useRef<THREE.Group>(null);
  const pose = useRef(createDronePose());
  const rotor = useRef(1);
  const bank = useRef(0);
  const opacity = useRef(1);

  // Parenting to the camera has to happen imperatively: R3F renders the
  // scene graph, and the default camera is not part of it. A child of a
  // camera that is not itself in the scene never gets drawn, so the camera
  // is added too — otherwise the drone silently disappears.
  useEffect(() => {
    const node = group.current;
    if (!node) return;
    scene.add(camera);
    camera.add(node);
    return () => {
      camera.remove(node);
      scene.remove(camera);
    };
  }, [camera, scene]);

  // Collected once so the fade can drive every material without walking the
  // tree on each frame. Each one's authored opacity is remembered and the
  // fade multiplies it — assigning the fade directly would flatten the
  // rotor discs and blades, which are deliberately near-transparent, into
  // solid white.
  const materials = useMemo(() => new Map<THREE.Material, number>(), []);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;

    // Guard against tab-switch spikes: a four-second delta would teleport it.
    const dt = Math.min(delta, 0.1);
    const scroll = state.current;
    const t = performance.now() / 1000;

    sampleDrone(scroll.stage, pose.current);
    const [px, py, pz] = pose.current.position;
    const [rx, ry, rz] = pose.current.rotation;

    // Idle hover on prime-ish frequencies so the loop never visibly repeats.
    const bobY = Math.sin(t * 1.15) * 0.04 + Math.sin(t * 0.43) * 0.02;
    const driftX = Math.sin(t * 0.67) * 0.03;

    node.position.x = damp(node.position.x, px + driftX, 0.0015, dt);
    node.position.y = damp(node.position.y, py + bobY, 0.0015, dt);
    node.position.z = damp(node.position.z, pz, 0.0025, dt);

    const targetBank = clamp(-scroll.velocity * 0.018, -0.42, 0.42);
    bank.current = damp(bank.current, targetBank, 0.0008, dt);

    node.rotation.x = damp(
      node.rotation.x,
      rx + Math.sin(t * 0.9) * 0.02,
      0.002,
      dt,
    );
    node.rotation.y = damp(
      node.rotation.y,
      ry + Math.sin(t * 0.37) * 0.05,
      0.002,
      dt,
    );
    node.rotation.z = damp(node.rotation.z, rz + bank.current, 0.002, dt);
    node.scale.setScalar(damp(node.scale.x, pose.current.scale, 0.003, dt));

    rotor.current =
      pose.current.rotor + Math.min(1.2, Math.abs(scroll.velocity) * 0.05);

    // While the scrubbable sequence has the camera, the viewer *is* the
    // aircraft, so the model fades out rather than hanging in its own shot.
    const wantOpacity = shotState.active ? 0 : pose.current.opacity;
    opacity.current = damp(opacity.current, wantOpacity, 0.002, dt);
    node.visible = opacity.current > 0.01;

    if (node.visible) {
      if (materials.size === 0) {
        node.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.material) return;
          const list = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          list.forEach((m) => {
            if (!materials.has(m)) materials.set(m, m.opacity ?? 1);
          });
        });
      }
      materials.forEach((base, m) => {
        m.transparent = true;
        m.opacity = base * opacity.current;
      });
    }
  });

  return (
    <group ref={group} dispose={null}>
      <Drone rotorRef={rotor} quality={quality} />
    </group>
  );
}
