/**
 * The scrubbable shot's playhead, shared between the section that owns the
 * scrubber and the scene that flies the camera.
 *
 * A plain mutable object rather than context or state: this is read inside
 * `useFrame` on every frame and written on every scroll tick, and the two
 * components sit in different branches of the tree. Routing it through
 * React would re-render both sixty times a second to move a number.
 */
export const shotState = {
  /** 0 → 1 across the lodge sequence. */
  progress: 0,
  /** True while the shot section owns the camera. */
  active: false,
  /** True while the user is dragging the scrubber: follow without easing. */
  immediate: false,
};
