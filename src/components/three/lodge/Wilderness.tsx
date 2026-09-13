'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { cloudField, groundCover } from './textures';

/** Deterministic PRNG — the valley must be identical on every load. */
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

/* ------------------------------------------------------------------ *
 * Terrain
 *
 * Value noise summed over five octaves rather than three stacked sines.
 * Sines give a regular, obviously-repeating swell; fractal noise gives
 * ridges and hollows at several scales at once, which is most of what
 * separates a landscape from a wobbly plane.
 * ------------------------------------------------------------------ */

const hash2 = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const smooth = (t: number) => t * t * (3 - 2 * t);

function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return (
    a * (1 - xf) * (1 - yf) + b * xf * (1 - yf) + c * (1 - xf) * yf + d * xf * yf
  );
}

function fbm(x: number, y: number): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let norm = 0;
  for (let o = 0; o < 5; o += 1) {
    value += valueNoise(x * frequency, y * frequency) * amplitude;
    norm += amplitude;
    amplitude *= 0.5;
    frequency *= 2.07;
  }
  return value / norm;
}

/** The lodge sits on a level shelf, faded out beyond this radius. */
const SHELF = 26;

/** Lake centre and the basin carved for it. */
const LAKE = { x: 58, z: -40, radius: 30 };
export const LAKE_LEVEL = -1.4;

export function terrainHeight(x: number, z: number): number {
  const base = (fbm(x * 0.0085, z * 0.0085) - 0.5) * 62;
  const detail = (fbm(x * 0.05, z * 0.05) - 0.5) * 3.2;

  let h: number;
  const d = Math.hypot(x, z);
  if (d < SHELF) {
    h = 0;
  } else {
    const t = Math.min(1, (d - SHELF) / 40);
    h = (base + detail) * t * t;
  }

  // Carve the lake a basin. Water sitting on top of unmodified ground is
  // the tell that makes a lake read as a disc of plastic laid on grass —
  // it needs a bank to sit inside and a shoreline where the two meet.
  const ld = Math.hypot(x - LAKE.x, z - LAKE.z);
  const bank = LAKE.radius + 12;
  if (ld < bank) {
    const k = smooth(1 - Math.min(1, ld / bank));
    const floor = LAKE_LEVEL - 2.6 - (1 - Math.min(1, ld / LAKE.radius)) * 2.2;
    h = h * (1 - k) + floor * k;
  }
  return h;
}

export function Terrain() {
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(420, 420, 200, 200);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i += 1) {
      pos.setY(i, terrainHeight(pos.getX(i), pos.getZ(i)));
    }
    geo.computeVertexNormals();

    // Vertex colour by height and slope: meadow in the hollows, drier
    // grass on the shoulders, rock where the ground gets steep. A single
    // flat green is the other half of why untextured terrain reads fake.
    const colors = new Float32Array(pos.count * 3);
    const normal = geo.attributes.normal as THREE.BufferAttribute;
    const meadow = new THREE.Color('#66794f');
    const dry = new THREE.Color('#8b8a63');
    const rock = new THREE.Color('#847d72');
    const shore = new THREE.Color('#9d9481');
    const scratch = new THREE.Color();

    for (let i = 0; i < pos.count; i += 1) {
      const h = pos.getY(i);
      const slope = 1 - Math.abs(normal.getY(i));
      scratch.copy(meadow).lerp(dry, THREE.MathUtils.clamp(h / 22, 0, 1));
      scratch.lerp(rock, THREE.MathUtils.clamp((slope - 0.12) * 3.4, 0, 1));
      // Wet sand and shingle where the ground approaches the waterline.
      scratch.lerp(
        shore,
        THREE.MathUtils.clamp((LAKE_LEVEL + 2.2 - h) / 3.2, 0, 1),
      );
      colors[i * 3] = scratch.r;
      colors[i * 3 + 1] = scratch.g;
      colors[i * 3 + 2] = scratch.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const cover = groundCover([60, 60]);
    const mat = new THREE.MeshStandardMaterial({
      map: cover,
      vertexColors: true,
      roughness: 1,
      metalness: 0,
    });
    return { geometry: geo, material: mat };
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.map?.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return <mesh geometry={geometry} material={material} receiveShadow />;
}

/* ------------------------------------------------------------------ *
 * Forest
 * ------------------------------------------------------------------ */

/**
 * Conifers as three instanced meshes — trunk, lower skirt, upper crown.
 * A single cone reads as a party hat; two stacked cones of different
 * radius give the stepped silhouette a spruce actually has. Instanced,
 * the whole forest is three draw calls instead of several hundred.
 */
export function Forest({ count = 320 }: { count?: number }) {
  const trunks = useRef<THREE.InstancedMesh>(null);
  const skirts = useRef<THREE.InstancedMesh>(null);
  const crowns = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const t = trunks.current;
    const s = skirts.current;
    const c = crowns.current;
    if (!t || !s || !c) return;

    const random = mulberry32(20260913);
    const dummy = new THREE.Object3D();
    let placed = 0;
    let guard = 0;

    while (placed < count && guard < count * 40) {
      guard += 1;
      const angle = random() * Math.PI * 2;
      // Denser further out so the treeline reads as a wall from low angles.
      const radius = 34 + Math.pow(random(), 0.6) * 150;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Keep the clearing, the deck approach and the lake margin free.
      if (Math.abs(x) < 16 && Math.abs(z) < 22) continue;
      if (Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.radius + 10) continue;

      const scale = 0.7 + random() * 1.7;
      const y = terrainHeight(x, z);
      const lean = (random() - 0.5) * 0.07;
      const spin = random() * Math.PI;

      dummy.position.set(x, y + 0.85 * scale, z);
      dummy.rotation.set(0, spin, lean);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      t.setMatrixAt(placed, dummy.matrix);

      dummy.position.set(x, y + 2.7 * scale, z);
      dummy.scale.set(scale, scale * (0.85 + random() * 0.4), scale);
      dummy.updateMatrix();
      s.setMatrixAt(placed, dummy.matrix);

      dummy.position.set(x, y + 5.1 * scale, z);
      dummy.scale.set(scale * 0.72, scale * (0.9 + random() * 0.5), scale * 0.72);
      dummy.updateMatrix();
      c.setMatrixAt(placed, dummy.matrix);

      placed += 1;
    }

    [t, s, c].forEach((mesh) => {
      mesh.count = placed;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
  }, [count]);

  return (
    <group>
      <instancedMesh ref={trunks} args={[undefined, undefined, count]} castShadow>
        <cylinderGeometry args={[0.16, 0.26, 1.9, 6]} />
        <meshStandardMaterial color="#4a3826" roughness={1} metalness={0} />
      </instancedMesh>
      {/* Two greens rather than one: the upper crown catches more sky, so
          giving it its own slightly cooler tone reads as depth in the
          canopy instead of a field of identical cones. */}
      <instancedMesh ref={skirts} args={[undefined, undefined, count]} castShadow>
        <coneGeometry args={[1.75, 4.2, 8]} />
        <meshStandardMaterial color="#2a4526" roughness={0.96} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[undefined, undefined, count]} castShadow>
        <coneGeometry args={[1.2, 4.4, 8]} />
        <meshStandardMaterial color="#335430" roughness={0.96} metalness={0} />
      </instancedMesh>
    </group>
  );
}

/** Boulders and scrub around the clearing, so the shelf has a foreground. */
export function Scatter({ count = 90 }: { count?: number }) {
  const rocks = useRef<THREE.InstancedMesh>(null);
  const shrubs = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const r = rocks.current;
    const b = shrubs.current;
    if (!r || !b) return;
    const random = mulberry32(8891);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 13 + Math.pow(random(), 0.7) * 70;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = terrainHeight(x, z);

      if (Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.radius + 4) continue;
      const rs = 0.3 + random() * 1.1;
      dummy.position.set(x, y + rs * 0.32, z);
      dummy.rotation.set(random(), random() * Math.PI, random());
      dummy.scale.set(rs, rs * (0.5 + random() * 0.4), rs * (0.8 + random() * 0.5));
      dummy.updateMatrix();
      r.setMatrixAt(i, dummy.matrix);

      const bx = Math.cos(angle + 0.6) * (radius * 0.9);
      const bz = Math.sin(angle + 0.6) * (radius * 0.9);
      const bs = 0.3 + random() * 0.55;
      dummy.position.set(bx, terrainHeight(bx, bz) + bs * 0.4, bz);
      dummy.rotation.set(0, random() * Math.PI, 0);
      dummy.scale.set(bs, bs * 0.75, bs);
      dummy.updateMatrix();
      b.setMatrixAt(i, dummy.matrix);
    }
    [r, b].forEach((mesh) => {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
  }, [count]);

  return (
    <group>
      <instancedMesh
        ref={rocks}
        args={[undefined, undefined, count]}
        castShadow
        receiveShadow
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#8a8378"
          roughness={0.98}
          metalness={0}
          flatShading
        />
      </instancedMesh>
      <instancedMesh ref={shrubs} args={[undefined, undefined, count]} castShadow>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#4c6b39"
          roughness={1}
          metalness={0}
          flatShading
        />
      </instancedMesh>
    </group>
  );
}

/** Hazed ridgelines on the horizon — depth the fog alone cannot fake. */
export function DistantRidges() {
  const layers = useMemo(
    () =>
      [
        { d: 300, h: 58, color: '#8ba0b6', opacity: 0.9, seed: 3 },
        { d: 380, h: 76, color: '#9fb2c5', opacity: 0.75, seed: 11 },
        { d: 460, h: 98, color: '#b6c4d2', opacity: 0.6, seed: 29 },
      ].map(({ d, h, color, opacity, seed }) => {
        const points: THREE.Vector2[] = [];
        const span = d * 2.6;
        const steps = 90;
        for (let i = 0; i <= steps; i += 1) {
          const x = -span / 2 + (span * i) / steps;
          const n =
            fbm(i * 0.09 + seed, seed) * 0.7 + fbm(i * 0.28 + seed, seed * 2) * 0.3;
          points.push(new THREE.Vector2(x, n * h));
        }
        const shape = new THREE.Shape();
        shape.moveTo(points[0].x, -40);
        points.forEach((p) => shape.lineTo(p.x, p.y));
        shape.lineTo(points[points.length - 1].x, -40);
        shape.closePath();
        return { geometry: new THREE.ShapeGeometry(shape), d, color, opacity };
      }),
    [],
  );

  useEffect(() => () => layers.forEach((l) => l.geometry.dispose()), [layers]);

  return (
    <group>
      {layers.map((layer, i) =>
        [0, Math.PI / 2, Math.PI, -Math.PI / 2].map((rot) => (
          <mesh
            key={`${i}-${rot}`}
            geometry={layer.geometry}
            position={[Math.sin(rot) * -layer.d, -6, Math.cos(rot) * -layer.d]}
            rotation={[0, rot, 0]}
          >
            <meshBasicMaterial
              color={layer.color}
              transparent
              opacity={layer.opacity}
              depthWrite={false}
              fog={false}
            />
          </mesh>
        )),
      )}
    </group>
  );
}

/** A lake, catching the sky. */
export function Lake() {
  const geometry = useMemo(() => {
    // A perfect circle is the tell. Real shorelines are irregular, so the
    // radius is perturbed by the same noise that shapes the terrain — and
    // the basin carved in terrainHeight uses the same centre, so the bank
    // meets the water instead of the water sitting on the grass.
    const shape = new THREE.Shape();
    const steps = 96;
    for (let i = 0; i <= steps; i += 1) {
      const a = (i / steps) * Math.PI * 2;
      const wobble =
        fbm(Math.cos(a) * 2.4 + 7, Math.sin(a) * 2.4 + 7) * 0.28 + 0.86;
      const r = LAKE.radius * wobble;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r * 0.82;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return new THREE.ShapeGeometry(shape, 24);
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh
      geometry={geometry}
      position={[LAKE.x, LAKE_LEVEL, LAKE.z]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      {/* Low metalness on purpose: there is no environment map in this
          scene, so a metal surface has nothing to reflect and renders as a
          black hole. Depth comes from a dark body colour instead. */}
      <meshStandardMaterial color="#2b4a61" roughness={0.34} metalness={0.05} />
    </mesh>
  );
}

/**
 * Daylight sky: a graded dome with a sun and a band of cumulus. The
 * gradient is on the inside of a sphere rather than a flat background
 * colour, so the horizon sits at the horizon as the camera climbs.
 */
export function Sky() {
  const { material, clouds } = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        top: { value: new THREE.Color('#2f6ec2') },
        middle: { value: new THREE.Color('#8fbfe8') },
        horizon: { value: new THREE.Color('#dbe7ef') },
        sunDir: { value: new THREE.Vector3(64, 86, 44).normalize() },
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
        uniform vec3 sunDir;
        varying vec3 vWorld;
        void main() {
          vec3 dir = normalize(vWorld);
          float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
          vec3 c = mix(horizon, middle, smoothstep(0.48, 0.62, h));
          c = mix(c, top, smoothstep(0.60, 0.95, h));
          // Sun disc plus the bloom around it.
          float d = max(dot(dir, normalize(sunDir)), 0.0);
          c += vec3(1.0, 0.94, 0.82) * pow(d, 820.0) * 1.4;
          c += vec3(1.0, 0.92, 0.78) * pow(d, 12.0) * 0.16;
          gl_FragColor = vec4(c, 1.0);
        }
      `,
    });

    const map = cloudField();
    const cloudMat = new THREE.MeshBasicMaterial({
      map,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      side: THREE.BackSide,
      fog: false,
    });
    return { material: mat, clouds: cloudMat };
  }, []);

  useEffect(
    () => () => {
      material.dispose();
      clouds.map?.dispose();
      clouds.dispose();
    },
    [material, clouds],
  );

  return (
    <group>
      <mesh material={material} renderOrder={-2}>
        <sphereGeometry args={[600, 32, 20]} />
      </mesh>
      <mesh material={clouds} renderOrder={-1} scale={[1, 0.55, 1]}>
        <sphereGeometry args={[560, 32, 16]} />
      </mesh>
    </group>
  );
}

export function LodgeLights({ quality }: { quality: 'full' | 'lite' }) {
  const sun = useRef<THREE.DirectionalLight>(null);

  useEffect(() => {
    const light = sun.current;
    if (!light) return;
    // A tight ortho frustum around the clearing: the shadow map only has
    // to cover what the camera ever looks at, and a loose one wastes its
    // entire resolution on empty valley.
    const cam = light.shadow.camera;
    cam.left = -70;
    cam.right = 70;
    cam.top = 70;
    cam.bottom = -70;
    cam.near = 20;
    cam.far = 320;
    cam.updateProjectionMatrix();
    light.shadow.bias = -0.0006;
    light.shadow.normalBias = 0.03;
  }, []);

  return (
    <>
      {/* Sun: high and slightly behind camera-left, the way a midday aerial
          is usually flown — cross-lit so the roof planes separate. */}
      <directionalLight
        ref={sun}
        position={[64, 86, 44]}
        intensity={4.1}
        color="#fff4e2"
        castShadow
        shadow-mapSize-width={quality === 'full' ? 2048 : 1024}
        shadow-mapSize-height={quality === 'full' ? 2048 : 1024}
      />
      {/* Sky above, warm ground bounce below — most of the shadow fill on
          a clear day. */}
      <hemisphereLight args={['#9ec2ea', '#59603a', 1.05]} />
      <ambientLight intensity={0.16} color="#cfe0f2" />
    </>
  );
}
