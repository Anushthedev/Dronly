'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

import { shingleRoof, stoneWall, woodSiding } from './textures';

/**
 * A wilderness lodge, built from primitives and procedural textures.
 *
 * The studio has no footage yet, so the site demonstrates the shot rather
 * than claiming past work. That makes the building a stand-in by design —
 * but it has to survive a camera that orbits it at twenty metres and then
 * pushes in on the glass, so the detail that reads at each of those
 * distances is modelled rather than painted: coursed stone and shingle
 * courses for the wide frames, window mullions, rafter tails and deck
 * balusters for the close ones.
 *
 * Origin sits at ground level, centre of the footprint; the building faces
 * +Z, which is where the shot approaches from.
 */

// A steep alpine pitch sheds snow and, more usefully here, reads clearly
// from directly overhead — where the drone spends most of the orbit.
const ROOF_PITCH = 0.62;
const HALF = 4;
const RISE = Math.tan(ROOF_PITCH) * HALF;
const SLOPE = Math.hypot(HALF, RISE);
const EAVE = 4;

function useLodgeMaterials() {
  const materials = useMemo(() => {
    const siding = woodSiding([2.2, 1.4]);
    const stone = stoneWall([2, 1.6]);
    const shingles = shingleRoof([3, 5]);

    const timber = new THREE.MeshStandardMaterial({
      map: siding,
      bumpMap: siding,
      bumpScale: 0.02,
      color: '#b39472',
      roughness: 0.82,
      metalness: 0,
    });
    const trim = new THREE.MeshStandardMaterial({
      color: '#4a3826',
      roughness: 0.78,
      metalness: 0,
    });
    const beam = new THREE.MeshStandardMaterial({
      map: siding,
      color: '#8a6d4c',
      roughness: 0.85,
      metalness: 0,
    });
    const masonry = new THREE.MeshStandardMaterial({
      map: stone,
      bumpMap: stone,
      bumpScale: 0.05,
      color: '#b9b4ab',
      roughness: 0.95,
      metalness: 0,
    });
    const roof = new THREE.MeshStandardMaterial({
      map: shingles,
      bumpMap: shingles,
      bumpScale: 0.04,
      color: '#9c9894',
      roughness: 0.88,
      metalness: 0,
    });
    // No environment map in this scene, so metal has nothing to reflect.
    // Daylight glass is better served by a dark, slightly glossy dielectric.
    const glass = new THREE.MeshStandardMaterial({
      color: '#2b3d4e',
      emissive: new THREE.Color('#ffe6bd'),
      emissiveIntensity: 0.06,
      roughness: 0.16,
      metalness: 0.08,
    });
    return {
      timber,
      trim,
      beam,
      masonry,
      roof,
      glass,
      maps: [siding, stone, shingles],
    };
  }, []);

  useEffect(
    () => () => {
      materials.maps.forEach((m) => m.dispose());
      Object.values(materials).forEach((m) => {
        if (m instanceof THREE.Material) m.dispose();
      });
    },
    [materials],
  );

  return materials;
}

/** Gable end — a triangle, extruded to the wall thickness. */
function Gable({ z, material }: { z: number; material: THREE.Material }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-HALF, 0);
    shape.lineTo(HALF, 0);
    shape.lineTo(0, RISE);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.3,
      bevelEnabled: false,
    });
    geo.translate(0, 0, -0.15);
    return geo;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[0, EAVE, z]}
      castShadow
      receiveShadow
    />
  );
}

/** A glazed opening: frame, mullions and recessed glass. */
function Window({
  width,
  height,
  bars = 1,
  position,
  rotation = [0, 0, 0],
  materials,
}: {
  width: number;
  height: number;
  bars?: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  materials: ReturnType<typeof useLodgeMaterials>;
}) {
  const f = 0.07; // frame thickness

  return (
    <group position={position} rotation={rotation}>
      {/* Glass, set back so the frame casts a shadow line onto it. */}
      <mesh material={materials.glass} position={[0, 0, -0.05]}>
        <planeGeometry args={[width, height]} />
      </mesh>

      {/* Frame */}
      {[
        [0, height / 2, width + f * 2, f],
        [0, -height / 2, width + f * 2, f],
      ].map(([x, y, w, h]) => (
        <mesh
          key={`h${y}`}
          material={materials.trim}
          position={[x, y, 0]}
          castShadow
        >
          <boxGeometry args={[w, h, 0.12]} />
        </mesh>
      ))}
      {[-width / 2, width / 2].map((x) => (
        <mesh
          key={`v${x}`}
          material={materials.trim}
          position={[x, 0, 0]}
          castShadow
        >
          <boxGeometry args={[f, height + f * 2, 0.12]} />
        </mesh>
      ))}

      {/* Mullions — the detail that stops the push-in reading as a decal. */}
      {Array.from({ length: bars }, (_, i) => (
        <mesh
          key={`m${i}`}
          material={materials.trim}
          position={[-width / 2 + (width * (i + 1)) / (bars + 1), 0, 0]}
        >
          <boxGeometry args={[0.045, height, 0.09]} />
        </mesh>
      ))}
      <mesh material={materials.trim}>
        <boxGeometry args={[width, 0.04, 0.08]} />
      </mesh>
    </group>
  );
}

export function Lodge() {
  const m = useLodgeMaterials();

  return (
    <group>
      {/* Stone plinth — lifts the timber off the ground the way a real
          mountain build does, and reads as a shadow line from above. */}
      <mesh material={m.masonry} position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[9, 0.9, 7]} />
      </mesh>

      {/* Main volume */}
      <mesh material={m.timber} position={[0, 2.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[8, 3.2, 6]} />
      </mesh>

      {/* Corner posts: log ends, which is what breaks the "box" silhouette */}
      {[
        [-4, -3],
        [4, -3],
        [-4, 3],
        [4, 3],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} material={m.beam} position={[x, 2.45, z]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 3.3, 10]} />
        </mesh>
      ))}

      <Gable z={3.0} material={m.timber} />
      <Gable z={-3.0} material={m.timber} />

      {/* Roof: two planes meeting at the ridge. Sign matters — negated, the
          plank runs up and out from the ridge and the planes cross above
          it instead of meeting. */}
      {[1, -1].map((side) => (
        <mesh
          key={side}
          material={m.roof}
          position={[(side * HALF) / 2, EAVE + RISE / 2, 0]}
          rotation={[0, 0, side * (Math.PI / 2 - ROOF_PITCH)]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.26, SLOPE + 0.9, 7.4]} />
        </mesh>
      ))}

      {/* Ridge cap */}
      <mesh material={m.trim} position={[0, EAVE + RISE + 0.1, 0]} castShadow>
        <boxGeometry args={[0.4, 0.18, 7.5]} />
      </mesh>

      {/* Rafter tails under the eaves */}
      {[-1, 1].map((side) =>
        [-3, -1.8, -0.6, 0.6, 1.8, 3].map((z) => (
          <mesh
            key={`${side}${z}`}
            material={m.trim}
            position={[side * (HALF + 0.24), EAVE - 0.16, z]}
            rotation={[0, 0, side * 0.32]}
            castShadow
          >
            <boxGeometry args={[0.62, 0.12, 0.12]} />
          </mesh>
        )),
      )}

      {/* Chimney — the strongest vertical in a top-down frame */}
      <mesh
        material={m.masonry}
        position={[-2.6, 4.5, -1.4]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.25, 5.8, 1.25]} />
      </mesh>
      <mesh material={m.trim} position={[-2.6, 7.45, -1.4]} castShadow>
        <boxGeometry args={[1.5, 0.22, 1.5]} />
      </mesh>

      {/* Deck */}
      <mesh material={m.beam} position={[0, 0.92, 4.7]} receiveShadow castShadow>
        <boxGeometry args={[9.6, 0.22, 3.4]} />
      </mesh>
      {/* Deck boards, as shallow relief */}
      {Array.from({ length: 11 }, (_, i) => (
        <mesh
          key={`board${i}`}
          material={m.trim}
          position={[-4.4 + i * 0.88, 1.035, 4.7]}
        >
          <boxGeometry args={[0.02, 0.01, 3.4]} />
        </mesh>
      ))}

      {/* Railing: posts, rail and balusters */}
      {[-4.5, -2.25, 0, 2.25, 4.5].map((x) => (
        <mesh
          key={`post${x}`}
          material={m.beam}
          position={[x, 1.55, 6.3]}
          castShadow
        >
          <boxGeometry args={[0.16, 1.1, 0.16]} />
        </mesh>
      ))}
      {Array.from({ length: 30 }, (_, i) => (
        <mesh
          key={`bal${i}`}
          material={m.trim}
          position={[-4.5 + (i * 9) / 29, 1.5, 6.3]}
          castShadow
        >
          <boxGeometry args={[0.05, 0.95, 0.05]} />
        </mesh>
      ))}
      <mesh material={m.beam} position={[0, 2.08, 6.3]} castShadow>
        <boxGeometry args={[9.6, 0.12, 0.22]} />
      </mesh>

      {/* Steps down from the deck */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={`step${i}`}
          material={m.masonry}
          position={[3.1, 0.78 - i * 0.28, 6.6 + i * 0.34]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[1.8, 0.24, 0.38]} />
        </mesh>
      ))}

      {/* Porch roof, carried on posts */}
      <mesh
        material={m.roof}
        position={[0, 3.55, 5.2]}
        rotation={[-0.22, 0, 0]}
        castShadow
      >
        <boxGeometry args={[9.8, 0.18, 3.6]} />
      </mesh>
      {[-4.5, 4.5].map((x) => (
        <mesh key={`pp${x}`} material={m.beam} position={[x, 2.35, 6.3]} castShadow>
          <cylinderGeometry args={[0.14, 0.16, 2.7, 8]} />
        </mesh>
      ))}

      {/* Front elevation: the glazing the shot pushes in on */}
      <Window
        width={1.5}
        height={1.9}
        bars={1}
        position={[-2.5, 2.55, 3.06]}
        materials={m}
      />
      <Window
        width={2.4}
        height={2.1}
        bars={3}
        position={[0.7, 2.5, 3.06]}
        materials={m}
      />
      <Window
        width={1.5}
        height={1.9}
        bars={1}
        position={[3.0, 2.55, 3.06]}
        materials={m}
      />
      <Window
        width={1.2}
        height={1.1}
        bars={1}
        position={[0, 5.05, 3.0]}
        materials={m}
      />

      {/* Side and rear glazing, for the orbit */}
      {[-1.6, 1.6].map((z) => (
        <Window
          key={`side${z}`}
          width={1.4}
          height={1.6}
          bars={1}
          position={[4.06, 2.6, z]}
          rotation={[0, Math.PI / 2, 0]}
          materials={m}
        />
      ))}
      {[-1.8, 1.8].map((x) => (
        <Window
          key={`rear${x}`}
          width={1.3}
          height={1.7}
          bars={1}
          position={[x, 2.55, -3.06]}
          rotation={[0, Math.PI, 0]}
          materials={m}
        />
      ))}

      {/* Door, framed and recessed */}
      <group position={[-0.9, 2.0, 3.04]}>
        <mesh material={m.trim} position={[0, 0, -0.04]}>
          <planeGeometry args={[1.1, 2.3]} />
        </mesh>
        <mesh material={m.beam}>
          <boxGeometry args={[0.95, 2.2, 0.1]} />
        </mesh>
      </group>

      {/* Porch lamp: a practical, plus the glow it casts */}
      <mesh material={m.glass} position={[0.4, 3.05, 6.2]}>
        <sphereGeometry args={[0.11, 12, 10]} />
      </mesh>
      <pointLight
        position={[0.4, 3.05, 6.2]}
        intensity={2}
        distance={7}
        color="#ffc98a"
      />
      <pointLight
        position={[0, 2.6, 2.2]}
        intensity={3}
        distance={9}
        color="#ffd9a0"
      />
    </group>
  );
}
