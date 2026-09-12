import { smoothstep } from './utils';

/**
 * The site is one continuous flight over one place: a wilderness lodge in a
 * forested valley. There is no abstract backdrop and no stock footage —
 * every visual on the page is a window onto this single scene.
 *
 * Two paths drive it:
 *
 *   CAMERA_PATH  where the aircraft is in the world, keyed to the section
 *                axis ("stage": 0 is the top of section 0, 2.5 is halfway
 *                through section 2). Because it is derived from measured
 *                section offsets, sections can change height without the
 *                choreography drifting.
 *
 *   DRONE_PATH   where the drone model sits *relative to the camera*. It is
 *                parented to the camera, so it reads as a foreground object
 *                the viewer is flying alongside rather than something that
 *                has to be chased around the valley.
 *
 * Stages 4→5 are the scrubbable lodge sequence; there the camera comes from
 * lib/shot.ts instead, and these keys only cover the hand-off.
 */

export type CameraKey = {
  at: number;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
};

export const CAMERA_PATH: CameraKey[] = [
  // Hero — high over the valley, the lodge a distant point of light.
  { at: 0, position: [46, 30, 76], target: [0, 8, 0], fov: 40 },
  { at: 0.6, position: [38, 26, 66], target: [0, 7, 0], fov: 40 },
  // Studio — descending toward the treeline.
  { at: 1, position: [26, 20, 52], target: [0, 6, 0], fov: 42 },
  { at: 1.6, position: [8, 16, 46], target: [0, 6, 0], fov: 42 },
  // Events — a fast low sweep across the front of the valley.
  { at: 2, position: [-26, 11, 38], target: [0, 6, 0], fov: 46 },
  { at: 2.5, position: [-40, 14, 8], target: [0, 6, 0], fov: 46 },
  // Real estate — the survey pass, high and looking down.
  { at: 3, position: [-24, 30, 26], target: [0, 3, 0], fov: 44 },
  { at: 3.5, position: [10, 32, 30], target: [0, 3, 0], fov: 44 },
  // Hand-off: stage 4 meets the first frame of the scrubbable shot exactly,
  // so taking or releasing control is never a jump cut.
  { at: 4, position: [1.5, 1.4, 30], target: [0, 3, 0], fov: 42 },
  { at: 5, position: [-3.5, 4.2, 17], target: [-0.5, 3.2, 2], fov: 34 },
  // Contact — pulling back off the deck as the page ends.
  { at: 5.6, position: [-12, 7, 30], target: [0, 3.5, 0], fov: 38 },
];

/** Drone pose in camera-local space: -Z is in front of the lens. */
export type DroneKey = {
  at: number;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  rotor: number;
  /** Faded out entirely once the viewer *is* the aircraft. */
  opacity: number;
};

export const DRONE_PATH: DroneKey[] = [
  {
    at: 0,
    position: [1.5, -0.7, -7.2],
    rotation: [0.1, -0.3, 0],
    scale: 1,
    rotor: 1,
    opacity: 1,
  },
  {
    at: 0.6,
    position: [2.2, 0.4, -7.8],
    rotation: [0.18, -0.6, -0.12],
    scale: 0.95,
    rotor: 1.3,
    opacity: 1,
  },
  {
    at: 1,
    position: [3.6, 1.3, -9.6],
    rotation: [0.12, -0.95, 0.06],
    scale: 0.85,
    rotor: 1.1,
    opacity: 1,
  },
  {
    at: 1.6,
    position: [1.1, 1.0, -8.6],
    rotation: [0.16, -0.2, -0.18],
    scale: 0.9,
    rotor: 1.2,
    opacity: 1,
  },
  {
    at: 2,
    position: [-3.4, -0.9, -6.6],
    rotation: [0.3, 0.8, 0.4],
    scale: 1.05,
    rotor: 1.9,
    opacity: 1,
  },
  {
    at: 2.5,
    position: [-2.2, 0.4, -6.2],
    rotation: [0.16, 0.3, -0.24],
    scale: 1.1,
    rotor: 1.7,
    opacity: 1,
  },
  {
    at: 3,
    position: [2.7, 1.7, -8.4],
    rotation: [0.85, -0.3, -0.06],
    scale: 0.95,
    rotor: 1.3,
    opacity: 1,
  },
  {
    at: 3.5,
    position: [2.0, 1.2, -7.4],
    rotation: [0.65, 0.2, 0.14],
    scale: 1,
    rotor: 1.35,
    opacity: 1,
  },
  // The scrubbable sequence is the drone's own point of view, so the model
  // itself gets out of the way.
  {
    at: 3.85,
    position: [0.9, -0.4, -6.4],
    rotation: [0.2, 0.4, -0.2],
    scale: 1,
    rotor: 1.6,
    opacity: 0,
  },
  {
    at: 5,
    position: [0.9, -0.4, -6.4],
    rotation: [0.2, 0.4, -0.2],
    scale: 1,
    rotor: 1.6,
    opacity: 0,
  },
  {
    at: 5.3,
    position: [1.2, -0.6, -6.8],
    rotation: [0.06, -0.2, 0],
    scale: 1,
    rotor: 0.9,
    opacity: 1,
  },
  {
    at: 5.6,
    position: [1.2, -0.6, -6.8],
    rotation: [0.06, -0.2, 0],
    scale: 1,
    rotor: 0.9,
    opacity: 1,
  },
];

function segment<T extends { at: number }>(keys: T[], at: number): [T, T, number] {
  if (at <= keys[0].at) return [keys[0], keys[0], 0];
  const last = keys[keys.length - 1];
  if (at >= last.at) return [last, last, 0];

  for (let i = 0; i < keys.length - 1; i += 1) {
    if (at >= keys[i].at && at <= keys[i + 1].at) {
      const span = keys[i + 1].at - keys[i].at;
      return [
        keys[i],
        keys[i + 1],
        span === 0 ? 0 : smoothstep((at - keys[i].at) / span),
      ];
    }
  }
  return [last, last, 0];
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export type CameraPose = {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
};
export type DronePose = Omit<DroneKey, 'at'>;

export const createCameraPose = (): CameraPose => ({
  position: [...CAMERA_PATH[0].position],
  target: [...CAMERA_PATH[0].target],
  fov: CAMERA_PATH[0].fov,
});

export const createDronePose = (): DronePose => ({
  position: [...DRONE_PATH[0].position],
  rotation: [...DRONE_PATH[0].rotation],
  scale: DRONE_PATH[0].scale,
  rotor: DRONE_PATH[0].rotor,
  opacity: DRONE_PATH[0].opacity,
});

/** Sample the camera path. Writes into `out` so the loop never allocates. */
export function sampleCamera(stage: number, out: CameraPose): CameraPose {
  const [a, b, t] = segment(CAMERA_PATH, stage);
  for (let i = 0; i < 3; i += 1) {
    out.position[i] = mix(a.position[i], b.position[i], t);
    out.target[i] = mix(a.target[i], b.target[i], t);
  }
  out.fov = mix(a.fov, b.fov, t);
  return out;
}

/** Sample the drone's camera-local pose. */
export function sampleDrone(stage: number, out: DronePose): DronePose {
  const [a, b, t] = segment(DRONE_PATH, stage);
  for (let i = 0; i < 3; i += 1) {
    out.position[i] = mix(a.position[i], b.position[i], t);
    out.rotation[i] = mix(a.rotation[i], b.rotation[i], t);
  }
  out.scale = mix(a.scale, b.scale, t);
  out.rotor = mix(a.rotor, b.rotor, t);
  out.opacity = mix(a.opacity, b.opacity, t);
  return out;
}
