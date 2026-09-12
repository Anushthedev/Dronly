'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { loadGsap } from '@/lib/gsap';
import { cn } from '@/lib/utils';

/**
 * Scroll-linked parallax in three dimensions.
 *
 * The element travels in Y as before, but also rotates through the page
 * plane: it enters pitched away from the viewer, comes square-on as it
 * crosses the middle of the viewport, then pitches away again as it leaves.
 * The tween is scrubbed rather than played, so the angle is a pure function
 * of scroll position — the element is flat at exactly the moment it is most
 * readable.
 *
 * Three nodes, because the clip and the two transforms cannot share one:
 *
 *   layout   the grid/flow box, never transformed
 *   move     Y, Z and rotation — must NOT be clipped, or the rotation is
 *            sliced off at the frame edge and reads as a window instead of
 *            a solid that turns
 *   clip     `overflow: hidden` when zooming, so the zoom stays in frame.
 *            It rotates along with `move` because it sits inside it.
 *   zoom     scale only. Scaling the clip node would scale the clip itself,
 *            which is what previously pushed a horizontal scrollbar onto
 *            the whole document.
 *
 * GSAP is imported lazily; a page that never scrolls to a parallax block
 * never downloads it.
 */
export function Parallax({
  children,
  className,
  /** Total travel in px across the element's time on screen. */
  distance = 120,
  /** Slow zoom-out, clipped to the frame. */
  scale = false,
  /** Peak rotation in degrees. 0 keeps the motion flat. */
  tilt = 7,
  /** `x` pitches (top/bottom edge nearer), `y` yaws (left/right edge nearer). */
  axis = 'x',
  /** How far back in Z the element sits at the extremes. */
  depth = 120,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
  scale?: boolean;
  tilt?: number;
  axis?: 'x' | 'y';
  depth?: number;
}) {
  const move = useRef<HTMLDivElement>(null);
  const zoom = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    // `reduced` is false on the very first render so server and client agree,
    // and only becomes accurate once useReducedMotion's own effect has run.
    // Reading the query directly here closes that gap — otherwise this effect
    // fires once with a stale `false`, builds the ScrollTriggers, and leaves
    // the element rotated for someone who asked for no motion at all.
    if (reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    // Captured now, not read in the cleanup: by teardown the refs may
    // already point somewhere else.
    const node = move.current;
    const zoomNode = zoom.current;
    if (!node) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const rotate = axis === 'x' ? 'rotationX' : 'rotationY';

        gsap.set(node, {
          transformPerspective: 1400,
          transformOrigin: '50% 50%',
        });

        const track = {
          trigger: node,
          scrub: true,
          invalidateOnRefresh: true,
        };

        // Two chained scrubs rather than one sweep from +tilt to -tilt: this
        // way the element actually rests square-on through the middle of its
        // pass instead of crossing flat for a single frame.
        gsap.fromTo(
          node,
          { y: distance * 0.5, z: -depth, [rotate]: tilt },
          {
            y: 0,
            z: 0,
            [rotate]: 0,
            ease: 'none',
            scrollTrigger: { ...track, start: 'top bottom', end: 'center center' },
          },
        );

        gsap.fromTo(
          node,
          { y: 0, z: 0, [rotate]: 0 },
          {
            y: -distance * 0.5,
            z: -depth * 0.6,
            [rotate]: -tilt * 0.7,
            ease: 'none',
            scrollTrigger: { ...track, start: 'center center', end: 'bottom top' },
          },
        );

        if (scale && zoomNode) {
          gsap.fromTo(
            zoomNode,
            { scale: 1.14 },
            {
              scale: 1,
              ease: 'none',
              scrollTrigger: { ...track, start: 'top bottom', end: 'bottom top' },
            },
          );
        }
      }, node);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
      // revert() unwinds the tweens, but the element has been through a
      // scrubbed 3D transform — clear it outright so nothing is left pitched.
      node.removeAttribute('style');
      zoomNode?.removeAttribute('style');
    };
  }, [axis, depth, distance, reduced, scale, tilt]);

  return (
    <div className={className}>
      <div ref={move} className="will-change-transform">
        <div className={cn(scale && 'rounded-card overflow-hidden')}>
          <div ref={zoom} className={cn(scale && 'will-change-transform')}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
