/**
 * A one-bit shared signal: is a foreground 3D scene currently on screen?
 *
 * The lodge shot mounts its own WebGL context. Leaving the main aerial
 * stage rendering behind it means two contexts drawing every frame while
 * only one is visible, which on a laptop GPU is the difference between a
 * smooth orbit and a stuttering one. The lodge section raises this flag
 * while it is in view and the main canvas parks its render loop.
 *
 * Deliberately module-level rather than context: the two canvases sit in
 * different branches of the tree, and routing a boolean between them
 * through React would re-render both on every change.
 */
let foregroundScenes = 0;
const listeners = new Set<(busy: boolean) => void>();

const notify = () => {
  const busy = foregroundScenes > 0;
  listeners.forEach((fn) => fn(busy));
};

/** Call on mount/visible; the returned function releases the claim. */
export function claimForeground(): () => void {
  foregroundScenes += 1;
  notify();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    foregroundScenes = Math.max(0, foregroundScenes - 1);
    notify();
  };
}

export function subscribeForeground(fn: (busy: boolean) => void): () => void {
  listeners.add(fn);
  fn(foregroundScenes > 0);
  return () => {
    listeners.delete(fn);
  };
}
