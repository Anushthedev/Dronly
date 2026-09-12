'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

import { useScrollApi } from '@/components/providers/ScrollProvider';
import { Drone } from '@/components/three/Drone';
import { createPose, sampleFlight } from '@/lib/flight';
import { clamp, damp } from '@/lib/utils';

/**
 * Turns scroll position into flight.
 *
 * Everything here happens inside `useFrame` reading a ref — the component
 * renders exactly once for the life of the page no matter how far the user
 * scrolls. Three layers stack up:
 *
 *   1. the authored keyframe pose for the current narrative stage
 *   2. an idle hover (bob, drift, yaw wander) so it never looks parked
 *   3. scroll velocity translated into bank angle, the way a real aircraft
 *      rolls into the direction it is accelerating
 *
 * The result is damped rather than snapped, which is what gives the drone
 * its sense of mass.
 */
export function DroneRig({
  keyLight,
}: {
  keyLight?: React.RefObject<THREE.DirectionalLight | null>;
}) {
  const { state } = useScrollApi();
  const group = useRef<THREE.Group>(null);
  const pose = useRef(createPose());
  const rotor = useRef(1);
  const bank = useRef(0);

  useFrame(({ clock, pointer }, delta) => {
    const node = group.current;
    if (!node) return;

    // Guard against tab-switch spikes: a 4-second delta would teleport the
    // drone across the scene.
    const dt = Math.min(delta, 0.1);
    const scroll = state.current;
    const t = clock.elapsedTime;

    sampleFlight(scroll.stage, pose.current);
    const [px, py, pz] = pose.current.position;
    const [rx, ry, rz] = pose.current.rotation;

    // Idle hover — small, slow, and on prime-ish frequencies so the loop
    // never visibly repeats.
    const bobY = Math.sin(t * 1.15) * 0.04 + Math.sin(t * 0.43) * 0.02;
    const driftX = Math.sin(t * 0.67) * 0.03;
    const driftZ = Math.cos(t * 0.51) * 0.025;

    // Pointer parallax, heavily scaled down: presence, not a toy.
    const parallaxX = pointer.x * 0.14;
    const parallaxY = pointer.y * 0.08;

    node.position.x = damp(node.position.x, px + driftX + parallaxX, 0.0015, dt);
    node.position.y = damp(node.position.y, py + bobY + parallaxY, 0.0015, dt);
    node.position.z = damp(node.position.z, pz + driftZ, 0.0025, dt);

    // Roll into the scroll direction, then settle back to level.
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

    const scale = pose.current.scale;
    node.scale.setScalar(damp(node.scale.x, scale, 0.003, dt));

    // Rotors spin faster when the aircraft is working, and faster again
    // while the user is actively scrolling.
    rotor.current =
      pose.current.rotor + Math.min(1.2, Math.abs(scroll.velocity) * 0.05);

    if (keyLight?.current) {
      keyLight.current.intensity = damp(
        keyLight.current.intensity,
        pose.current.glow * 2.6,
        0.01,
        dt,
      );
    }
  });

  return (
    <group ref={group} dispose={null}>
      <Drone rotorRef={rotor} />
    </group>
  );
}
