'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * A wilderness lodge, built from primitives.
 *
 * The studio has no footage yet, so the site demonstrates the shot rather
 * than claiming past work. That makes the building a stand-in by design —
 * it needs to read as a property from the air (roofline, chimney, deck,
 * lit glass) without pretending to be a specific real one.
 *
 * Origin sits at ground level, centre of the footprint; the building faces
 * +Z, which is where the shot approaches from.
 */

const ROOF_PITCH = 0.62; // radians — a steep alpine pitch sheds snow and
// reads clearly from directly overhead, which is where the drone spends
// most of the orbit.

function useLodgeMaterials() {
  return useMemo(() => {
    const timber = new THREE.MeshStandardMaterial({
      color: '#6d5940',
      roughness: 0.86,
      metalness: 0,
    });
    const darkTimber = new THREE.MeshStandardMaterial({
      color: '#42342a',
      roughness: 0.9,
      metalness: 0,
    });
    const stone = new THREE.MeshStandardMaterial({
      color: '#8d8b86',
      roughness: 0.95,
      metalness: 0.02,
    });
    const roof = new THREE.MeshStandardMaterial({
      color: '#43434e',
      roughness: 0.72,
      metalness: 0.08,
    });
    // Interior light, seen through glass. Emissive rather than lit so it
    // survives the dusk exposure without blowing out the facade.
    // Daylight glass reads as a dark, sky-reflecting plane — not a lamp.
    // The faint emissive only stops it reading as a hole in the wall.
    const glass = new THREE.MeshStandardMaterial({
      color: '#2c3f52',
      emissive: new THREE.Color('#ffe6bd'),
      emissiveIntensity: 0.07,
      roughness: 0.22,
      metalness: 0.1,
    });
    return { timber, darkTimber, stone, roof, glass };
  }, []);
}

/** Gable end — a triangle, extruded to the wall thickness. */
function Gable({ z, material }: { z: number; material: THREE.Material }) {
  const geometry = useMemo(() => {
    const half = 4;
    const rise = Math.tan(ROOF_PITCH) * half;
    const shape = new THREE.Shape();
    shape.moveTo(-half, 0);
    shape.lineTo(half, 0);
    shape.lineTo(0, rise);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.3,
      bevelEnabled: false,
    });
    geo.translate(0, 0, -0.15);
    return geo;
  }, []);

  return <mesh geometry={geometry} material={material} position={[0, 4, z]} />;
}

export function Lodge() {
  const m = useLodgeMaterials();

  const half = 4;
  const rise = Math.tan(ROOF_PITCH) * half;
  const slope = Math.hypot(half, rise);

  return (
    <group>
      {/* Stone plinth — lifts the timber off the ground the way a real
          mountain build does, and reads as a shadow line from above. */}
      <mesh material={m.stone} position={[0, 0.4, 0]}>
        <boxGeometry args={[9, 0.8, 7]} />
      </mesh>

      {/* Main volume */}
      <mesh material={m.timber} position={[0, 2.4, 0]}>
        <boxGeometry args={[8, 3.2, 6]} />
      </mesh>

      {/* Gable ends close the triangle under each roof plane */}
      <Gable z={2.85} material={m.timber} />
      <Gable z={-2.85} material={m.timber} />

      {/* Roof: two planes meeting at the ridge */}
      {[1, -1].map((side) => (
        <mesh
          key={side}
          material={m.roof}
          position={[(side * half) / 2, 4 + rise / 2, 0]}
          // Sign matters: negated, the plank runs up-and-out from the ridge
          // and the two planes cross above it instead of meeting at it.
          rotation={[0, 0, side * (Math.PI / 2 - ROOF_PITCH)]}
        >
          <boxGeometry args={[0.22, slope + 0.5, 6.8]} />
        </mesh>
      ))}

      {/* Ridge cap */}
      <mesh material={m.darkTimber} position={[0, 4 + rise + 0.08, 0]}>
        <boxGeometry args={[0.35, 0.16, 6.9]} />
      </mesh>

      {/* Chimney — the strongest vertical in a top-down frame */}
      <mesh material={m.stone} position={[-2.6, 4.4, -1.4]}>
        <boxGeometry args={[1.2, 5.6, 1.2]} />
      </mesh>
      <mesh material={m.darkTimber} position={[-2.6, 7.3, -1.4]}>
        <boxGeometry args={[1.45, 0.25, 1.45]} />
      </mesh>

      {/* Deck and its posts */}
      <mesh material={m.darkTimber} position={[0, 0.85, 4.6]}>
        <boxGeometry args={[9.6, 0.2, 3.2]} />
      </mesh>
      {[-4.4, -2.2, 0, 2.2, 4.4].map((x) => (
        <mesh key={x} material={m.darkTimber} position={[x, 1.45, 6.1]}>
          <boxGeometry args={[0.14, 1.1, 0.14]} />
        </mesh>
      ))}
      <mesh material={m.darkTimber} position={[0, 1.95, 6.1]}>
        <boxGeometry args={[9.6, 0.12, 0.16]} />
      </mesh>

      {/* Porch roof */}
      <mesh material={m.roof} position={[0, 3.5, 5.1]} rotation={[-0.22, 0, 0]}>
        <boxGeometry args={[9.6, 0.16, 3.4]} />
      </mesh>
      {[-4.4, 4.4].map((x) => (
        <mesh key={x} material={m.darkTimber} position={[x, 2.3, 6.3]}>
          <boxGeometry args={[0.2, 2.6, 0.2]} />
        </mesh>
      ))}

      {/* Ground-floor glazing — the reason the last beat of the shot works */}
      {[-2.4, 0.6, 2.9].map((x, i) => (
        <mesh
          key={x}
          material={m.glass}
          position={[x, 2.5, 3.02]}
          scale={i === 1 ? [1.6, 1.25, 1] : [1, 1, 1]}
        >
          <planeGeometry args={[1.5, 1.9]} />
        </mesh>
      ))}

      {/* Gable window, upstairs */}
      <mesh material={m.glass} position={[0, 5, 2.95]}>
        <planeGeometry args={[1.2, 1.1]} />
      </mesh>

      {/* Door */}
      <mesh material={m.darkTimber} position={[-0.9, 1.95, 3.03]}>
        <planeGeometry args={[1, 2.2]} />
      </mesh>

      {/* Side glazing, so the orbit has something to catch */}
      {[-1.6, 1.6].map((z) => (
        <mesh
          key={z}
          material={m.glass}
          position={[4.02, 2.6, z]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <planeGeometry args={[1.4, 1.6]} />
        </mesh>
      ))}

      {/* Rear glazing — the orbit spends a third of its length back here */}
      {[-1.8, 1.8].map((x) => (
        <mesh
          key={`rear-${x}`}
          material={m.glass}
          position={[x, 2.5, -3.02]}
          rotation={[0, Math.PI, 0]}
        >
          <planeGeometry args={[1.3, 1.7]} />
        </mesh>
      ))}
      <pointLight
        position={[0, 2.6, -2.2]}
        intensity={2}
        distance={8}
        color="#ffd9a0"
      />

      {/* Porch lamp: a practical light, plus the glow it casts */}
      <mesh material={m.glass} position={[0.4, 3.05, 6.2]}>
        <sphereGeometry args={[0.12, 12, 10]} />
      </mesh>
      <pointLight
        position={[0.4, 3.05, 6.2]}
        intensity={2}
        distance={7}
        color="#ffc98a"
      />
      {/* Interior spill through the front glass */}
      <pointLight
        position={[0, 2.6, 2.2]}
        intensity={3}
        distance={9}
        color="#ffd9a0"
      />
    </group>
  );
}
