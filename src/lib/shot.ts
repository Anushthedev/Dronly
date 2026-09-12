import * as THREE from 'three';

import { smoothstep } from './utils';

/**
 * The demonstration flight over the lodge.
 *
 * Authored as a real listing-film shot list rather than an abstract camera
 * move: approach low through the treeline, climb until the roof breaks
 * cover, a full orbit to place the building on its lot, a high wide for the
 * establishing frame, then a push in on the lit windows.
 *
 * `at` values line up with SHOT_BEATS in lib/site.ts — the scrubber's tick
 * marks and these keyframes are the same positions, so a labelled beat
 * always lands on the frame it names.
 */
export type ShotKey = {
  at: number;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
};

// The orbit needs enough keys to trace an arc; too few and the camera cuts
// the chord and visibly clips the corner of the building.
export const SHOT: ShotKey[] = [
  { at: 0, position: [1.5, 1.4, 30], target: [0, 3, 0], fov: 42 },
  { at: 0.12, position: [2.5, 3, 23], target: [0, 3, 0], fov: 42 },
  { at: 0.24, position: [7.5, 10.5, 22], target: [0, 4.2, 0], fov: 40 },
  { at: 0.33, position: [16, 8, 5.8], target: [0, 3.2, 0], fov: 38 },
  { at: 0.4, position: [14.7, 8, -8.5], target: [0, 3.2, 0], fov: 38 },
  { at: 0.46, position: [3, 8, -16.7], target: [0, 3.2, 0], fov: 38 },
  { at: 0.55, position: [-9.8, 9, -13.9], target: [0, 3.2, 0], fov: 38 },
  { at: 0.62, position: [-16.5, 8.5, -2], target: [0, 3.2, 0], fov: 38 },
  { at: 0.7, position: [-34, 24, 30], target: [0, 7, 0], fov: 48 },
  { at: 0.8, position: [-16, 26, 40], target: [0, 7, 0], fov: 48 },
  { at: 0.9, position: [-12, 9, 22], target: [0, 3.6, 0], fov: 38 },
  { at: 1, position: [-3.5, 4.2, 17], target: [-0.5, 3.2, 2], fov: 34 },
];

export type ShotFrame = {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
};

export const createShotFrame = (): ShotFrame => ({
  position: new THREE.Vector3(...SHOT[0].position),
  target: new THREE.Vector3(...SHOT[0].target),
  fov: SHOT[0].fov,
});

/**
 * Sample the shot at `t` (0 → 1). Writes into `out` so the render loop
 * never allocates.
 */
export function sampleShot(t: number, out: ShotFrame): ShotFrame {
  const clamped = Math.min(1, Math.max(0, t));

  let i = 0;
  for (let k = 0; k < SHOT.length - 1; k += 1) {
    if (clamped >= SHOT[k].at && clamped <= SHOT[k + 1].at) {
      i = k;
      break;
    }
    if (clamped > SHOT[SHOT.length - 1].at) i = SHOT.length - 2;
  }

  const a = SHOT[i];
  const b = SHOT[i + 1];
  const span = b.at - a.at;
  const local = span === 0 ? 0 : smoothstep((clamped - a.at) / span);

  out.position.set(
    a.position[0] + (b.position[0] - a.position[0]) * local,
    a.position[1] + (b.position[1] - a.position[1]) * local,
    a.position[2] + (b.position[2] - a.position[2]) * local,
  );
  out.target.set(
    a.target[0] + (b.target[0] - a.target[0]) * local,
    a.target[1] + (b.target[1] - a.target[1]) * local,
    a.target[2] + (b.target[2] - a.target[2]) * local,
  );
  out.fov = a.fov + (b.fov - a.fov) * local;

  return out;
}
