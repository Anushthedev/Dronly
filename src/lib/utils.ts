/** Tiny class-name joiner — keeps the dependency list short. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const clamp = (value: number, min = 0, max = 1): number =>
  Math.min(max, Math.max(min, value));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * Frame-rate independent smoothing. `smoothing` is the fraction of the
 * remaining distance left after one second, so the easing feels identical
 * at 60fps and 120fps.
 */
export const damp = (
  current: number,
  target: number,
  smoothing: number,
  delta: number,
): number => lerp(current, target, 1 - Math.pow(smoothing, delta));

/** Remap `value` from one range to another, clamped to [0, 1] of the output. */
export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin = 0,
  outMax = 1,
): number => {
  if (inMax === inMin) return outMin;
  const t = clamp((value - inMin) / (inMax - inMin));
  return outMin + (outMax - outMin) * t;
};

/** Smootherstep — zero first and second derivatives at both ends. */
export const smoothstep = (t: number): number => {
  const x = clamp(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
