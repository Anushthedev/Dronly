import { smoothstep } from './utils';

/**
 * The flight path is authored against a "stage" axis rather than raw scroll
 * percentage: stage 0 is the top of section 0, stage 2.5 is halfway through
 * section 2, and so on. Sections can therefore change height — or be swapped
 * out entirely — without the choreography drifting out of sync.
 *
 * Narrative beats:
 *   0  hero        drone hovers head-on, close to camera
 *   1  manifesto   pulls back and away, becomes a speck in the sky
 *   2  events      dives left and banks hard through a crowd orbit
 *   3  real estate climbs and pitches nose-down into a survey pass
 *   4  work        fast diagonal passes across the gallery
 *   5  contact     levels out, settles, comes in to land
 */
export type FlightKeyframe = {
  /** Position along the stage axis. */
  at: number;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  /** Rotor RPM multiplier — high when the drone is working. */
  rotor: number;
  /** Key-light intensity, so the mood tracks the narrative. */
  glow: number;
};

export const FLIGHT_PATH: FlightKeyframe[] = [
  {
    at: 0,
    position: [0.75, -0.1, 0.2],
    rotation: [0.1, -0.12, 0],
    scale: 1,
    rotor: 1,
    glow: 1,
  },
  {
    at: 0.6,
    position: [0.9, 0.4, -0.5],
    rotation: [0.2, -0.55, -0.12],
    scale: 0.95,
    rotor: 1.35,
    glow: 1.1,
  },
  {
    at: 1,
    position: [1.95, 1.05, -2.6],
    rotation: [0.12, -0.95, 0.06],
    scale: 0.78,
    rotor: 1.1,
    glow: 0.8,
  },
  {
    at: 1.6,
    position: [0.4, 0.75, -1.6],
    rotation: [0.16, -0.2, -0.18],
    scale: 0.88,
    rotor: 1.2,
    glow: 0.9,
  },
  {
    at: 2,
    position: [-1.95, -0.3, 0.5],
    rotation: [0.3, 0.8, 0.4],
    scale: 1.02,
    rotor: 1.8,
    glow: 1.15,
  },
  {
    at: 2.5,
    position: [-1.15, 0.3, 1.25],
    rotation: [0.16, 0.28, -0.22],
    scale: 1.08,
    rotor: 1.6,
    glow: 1.05,
  },
  {
    at: 3,
    position: [1.45, 1.55, -0.9],
    rotation: [0.98, -0.28, -0.06],
    scale: 0.92,
    rotor: 1.25,
    glow: 0.95,
  },
  {
    at: 3.55,
    position: [0.95, 1.15, 0.25],
    rotation: [0.72, 0.22, 0.14],
    scale: 0.98,
    rotor: 1.3,
    glow: 1.0,
  },
  {
    at: 4,
    position: [-2.25, 0.6, 1.85],
    rotation: [0.36, 1.2, -0.52],
    scale: 1.12,
    rotor: 2.1,
    glow: 1.2,
  },
  {
    at: 4.55,
    position: [1.7, 0.25, 1.05],
    rotation: [0.3, -0.95, 0.48],
    scale: 1.05,
    rotor: 1.9,
    glow: 1.1,
  },
  {
    at: 5,
    position: [0, -0.55, 1.15],
    rotation: [0.06, 0, 0],
    scale: 1,
    rotor: 0.85,
    glow: 1.25,
  },
];

export type FlightPose = Omit<FlightKeyframe, 'at'>;

const pose = (k: FlightKeyframe): FlightPose => ({
  position: [...k.position] as [number, number, number],
  rotation: [...k.rotation] as [number, number, number],
  scale: k.scale,
  rotor: k.rotor,
  glow: k.glow,
});

/**
 * Sample the path at an arbitrary stage value. Writes into `out` so the
 * render loop never allocates.
 */
export function sampleFlight(stage: number, out: FlightPose): FlightPose {
  const first = FLIGHT_PATH[0];
  const last = FLIGHT_PATH[FLIGHT_PATH.length - 1];

  if (stage <= first.at) return Object.assign(out, pose(first));
  if (stage >= last.at) return Object.assign(out, pose(last));

  let index = 0;
  for (let i = 0; i < FLIGHT_PATH.length - 1; i += 1) {
    if (stage >= FLIGHT_PATH[i].at && stage <= FLIGHT_PATH[i + 1].at) {
      index = i;
      break;
    }
  }

  const a = FLIGHT_PATH[index];
  const b = FLIGHT_PATH[index + 1];
  const t = smoothstep((stage - a.at) / (b.at - a.at));

  for (let axis = 0; axis < 3; axis += 1) {
    out.position[axis] =
      a.position[axis] + (b.position[axis] - a.position[axis]) * t;
    out.rotation[axis] =
      a.rotation[axis] + (b.rotation[axis] - a.rotation[axis]) * t;
  }
  out.scale = a.scale + (b.scale - a.scale) * t;
  out.rotor = a.rotor + (b.rotor - a.rotor) * t;
  out.glow = a.glow + (b.glow - a.glow) * t;

  return out;
}

export const createPose = (): FlightPose => pose(FLIGHT_PATH[0]);
