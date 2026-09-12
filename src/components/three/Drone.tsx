'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * Procedural stand-in for the real aircraft.
 *
 * Swapping in a GLTF later is a one-line change at the call site: render
 * `<primitive object={scene} />` (or a `useGLTF` result) inside <DroneRig>
 * in place of <Drone />. The rig owns all transforms, so the model itself
 * only needs to be built around the origin, nose pointing down -Z.
 */

const ARM_ANGLES = [
  Math.PI / 4,
  (3 * Math.PI) / 4,
  (5 * Math.PI) / 4,
  (7 * Math.PI) / 4,
];
const ARM_LENGTH = 0.52;

export type DroneProps = {
  /** Rotor speed multiplier, driven by the flight path. */
  rotorRef: React.RefObject<number>;
  /** Lower tiers drop the rotor discs and a little geometry detail. */
  quality?: 'full' | 'lite';
};

export function Drone({ rotorRef, quality = 'full' }: DroneProps) {
  const rotors = useRef<THREE.Group[]>([]);
  const beacon = useRef<THREE.Mesh>(null);

  // Materials are created once and shared across every mesh that uses them —
  // four identical arms should not mean four identical material uploads.
  const materials = useMemo(() => {
    const shell = new THREE.MeshStandardMaterial({
      color: '#101013',
      roughness: 0.38,
      metalness: 0.72,
    });
    const trim = new THREE.MeshStandardMaterial({
      color: '#f7f4e8',
      roughness: 0.55,
      metalness: 0.1,
    });
    const accent = new THREE.MeshStandardMaterial({
      color: '#643aed',
      roughness: 0.3,
      metalness: 0.2,
      emissive: new THREE.Color('#643aed'),
      emissiveIntensity: 1.4,
    });
    const glass = new THREE.MeshStandardMaterial({
      color: '#05050a',
      roughness: 0.08,
      metalness: 1,
    });
    const blade = new THREE.MeshStandardMaterial({
      color: '#f7f4e8',
      roughness: 0.6,
      metalness: 0,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
    });
    // Stand-in for motion blur: a near-invisible disc the blades sweep through.
    const disc = new THREE.MeshBasicMaterial({
      color: '#f7f4e8',
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    return { shell, trim, accent, glass, blade, disc };
  }, []);

  useFrame((_, delta) => {
    const speed = rotorRef.current ?? 1;
    for (const rotor of rotors.current) {
      if (rotor) rotor.rotation.y += delta * 34 * speed;
    }
    if (beacon.current) {
      // Slow strobe on the tail beacon — the only thing on the model that
      // animates independently of scroll.
      const material = beacon.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 1.2 + Math.sin(performance.now() * 0.006) * 1.1;
    }
  });

  return (
    <group>
      {/* Fuselage */}
      <mesh material={materials.shell} castShadow>
        <boxGeometry args={[0.52, 0.15, 0.78]} />
      </mesh>
      <mesh material={materials.shell} position={[0, 0.08, -0.06]}>
        <boxGeometry args={[0.4, 0.12, 0.5]} />
      </mesh>

      {/* Cream trim stripe — the brand mark on the airframe */}
      <mesh material={materials.trim} position={[0, 0.152, -0.06]}>
        <boxGeometry args={[0.16, 0.012, 0.46]} />
      </mesh>

      {/* Gimbal + lens */}
      <group position={[0, -0.12, 0.3]}>
        <mesh material={materials.shell}>
          <sphereGeometry args={[0.11, 24, 20]} />
        </mesh>
        <mesh
          material={materials.glass}
          position={[0, 0, 0.08]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.07, 0.075, 0.06, 24]} />
        </mesh>
        <mesh
          material={materials.accent}
          position={[0, 0, 0.115]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.068, 0.008, 10, 28]} />
        </mesh>
      </group>

      {/* Tail beacon */}
      <mesh ref={beacon} material={materials.accent} position={[0, 0.07, -0.42]}>
        <sphereGeometry args={[0.035, 12, 10]} />
      </mesh>

      {/* Arms, motors, rotors */}
      {ARM_ANGLES.map((angle, index) => {
        const x = Math.cos(angle) * ARM_LENGTH;
        const z = Math.sin(angle) * ARM_LENGTH;
        return (
          <group key={angle}>
            <mesh
              material={materials.shell}
              position={[x / 2, 0.02, z / 2]}
              rotation={[0, -angle, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.028, 0.034, ARM_LENGTH, 12]} />
            </mesh>

            <mesh material={materials.shell} position={[x, 0.05, z]}>
              <cylinderGeometry args={[0.07, 0.08, 0.1, 16]} />
            </mesh>

            {/* Motor hub ring picks up the violet accent */}
            <mesh material={materials.accent} position={[x, 0.101, z]}>
              <cylinderGeometry args={[0.045, 0.045, 0.012, 16]} />
            </mesh>

            <group
              ref={(node) => {
                if (node) rotors.current[index] = node;
              }}
              position={[x, 0.12, z]}
              // Counter-rotating pairs, like a real quad.
              rotation={[0, index * 0.8, 0]}
              scale={[1, 1, index % 2 === 0 ? 1 : -1]}
            >
              {[0, Math.PI / 2].map((bladeAngle) => (
                <mesh
                  key={bladeAngle}
                  material={materials.blade}
                  rotation={[0, bladeAngle, 0.08]}
                >
                  <boxGeometry args={[0.46, 0.005, 0.07]} />
                </mesh>
              ))}
              {quality === 'full' && (
                <mesh material={materials.disc} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[0.23, 24]} />
                </mesh>
              )}
            </group>

            {/* Landing skid */}
            <mesh material={materials.shell} position={[x * 0.75, -0.14, z * 0.75]}>
              <cylinderGeometry args={[0.012, 0.012, 0.22, 8]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
