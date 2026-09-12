'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

/** Deterministic PRNG — the forest must be identical on every load. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Cheap layered sine "noise" — enough relief for a horizon line. */
function height(x: number, z: number): number {
  return (
    Math.sin(x * 0.055) * Math.cos(z * 0.041) * 5.5 +
    Math.sin(x * 0.13 + 1.7) * Math.cos(z * 0.11 - 0.6) * 1.9 +
    Math.sin((x + z) * 0.021) * 4.2
  );
}

/**
 * The lodge sits on a level shelf. Terrain is faded to flat within this
 * radius so the building never ends up half-buried in a hillside.
 */
const SHELF = 26;

function shelved(x: number, z: number): number {
  const d = Math.hypot(x, z);
  if (d < SHELF) return 0;
  const t = Math.min(1, (d - SHELF) / 34);
  return height(x, z) * t * t;
}

export function Terrain() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(340, 340, 110, 110);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i += 1) {
      pos.setY(i, shelved(pos.getX(i), pos.getZ(i)));
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color="#3a4a3f" roughness={1} metalness={0} />
    </mesh>
  );
}

/**
 * Pines as two instanced meshes — one for the foliage cones, one for the
 * trunks. A few hundred individual meshes would cost a draw call each and
 * tank the frame rate during the orbit; instanced, the whole forest is two.
 */
export function Forest({ count = 260 }: { count?: number }) {
  const cones = useRef<THREE.InstancedMesh>(null);
  const trunks = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const cone = cones.current;
    const trunk = trunks.current;
    if (!cone || !trunk) return;

    const random = mulberry32(20260912);
    const dummy = new THREE.Object3D();
    let placed = 0;
    let guard = 0;

    while (placed < count && guard < count * 40) {
      guard += 1;
      const angle = random() * Math.PI * 2;
      // Denser further out, so the treeline reads as a wall from low angles.
      const radius = 34 + Math.pow(random(), 0.62) * 120;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Keep the clearing, the deck approach and the lake margin free.
      if (Math.abs(x) < 16 && Math.abs(z) < 20) continue;
      if (Math.hypot(x - 58, z + 40) < 34) continue;

      const scale = 0.75 + random() * 1.5;
      const y = shelved(x, z);

      dummy.position.set(x, y + 3.1 * scale, z);
      dummy.rotation.set(0, random() * Math.PI, (random() - 0.5) * 0.06);
      dummy.scale.set(scale, scale * (0.85 + random() * 0.5), scale);
      dummy.updateMatrix();
      cone.setMatrixAt(placed, dummy.matrix);

      dummy.position.set(x, y + 0.7 * scale, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      trunk.setMatrixAt(placed, dummy.matrix);

      placed += 1;
    }

    cone.count = placed;
    trunk.count = placed;
    cone.instanceMatrix.needsUpdate = true;
    trunk.instanceMatrix.needsUpdate = true;
    cone.computeBoundingSphere();
    trunk.computeBoundingSphere();
  }, [count]);

  return (
    <group>
      <instancedMesh ref={cones} args={[undefined, undefined, count]}>
        <coneGeometry args={[1.45, 6.2, 7]} />
        <meshStandardMaterial color="#24362b" roughness={0.95} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={trunks} args={[undefined, undefined, count]}>
        <cylinderGeometry args={[0.16, 0.24, 1.6, 6]} />
        <meshStandardMaterial color="#33271f" roughness={1} metalness={0} />
      </instancedMesh>
    </group>
  );
}

/** A lake off to one side — it catches the dusk sky and gives the wide beat
 *  somewhere for the eye to land. */
export function Lake() {
  return (
    <mesh position={[58, -0.35, -40]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[30, 48]} />
      <meshStandardMaterial color="#0d1826" roughness={0.08} metalness={0.9} />
    </mesh>
  );
}

/**
 * Dusk sky. A gradient on the inside of a large sphere rather than a flat
 * background colour, so the horizon actually sits at the horizon as the
 * camera climbs through the shot.
 */
export function Sky() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          top: { value: new THREE.Color('#0b1020') },
          middle: { value: new THREE.Color('#2a2f4d') },
          horizon: { value: new THREE.Color('#7d5aa8') },
        },
        vertexShader: `
          varying vec3 vWorld;
          void main() {
            vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 top;
          uniform vec3 middle;
          uniform vec3 horizon;
          varying vec3 vWorld;
          void main() {
            float h = clamp(normalize(vWorld).y * 0.5 + 0.5, 0.0, 1.0);
            vec3 c = mix(horizon, middle, smoothstep(0.46, 0.60, h));
            c = mix(c, top, smoothstep(0.58, 0.92, h));
            gl_FragColor = vec4(c, 1.0);
          }
        `,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh material={material} scale={[1, 1, 1]}>
      <sphereGeometry args={[260, 32, 20]} />
    </mesh>
  );
}

export function LodgeLights() {
  return (
    <>
      {/* Dusk key, low and behind — rims the roofline against the sky. */}
      <directionalLight position={[-42, 26, -60]} intensity={1.5} color="#8b6ecb" />
      {/* Cool sky fill from above, warm bounce from the ground. */}
      <hemisphereLight args={['#3d4a72', '#14100d', 1.1]} />
      <ambientLight intensity={0.18} color="#6b7ba8" />
    </>
  );
}
