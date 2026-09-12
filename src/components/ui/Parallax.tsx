'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { loadGsap } from '@/lib/gsap';
import { cn } from '@/lib/utils';

/**
 * Scroll-linked parallax via GSAP ScrollTrigger. The tween is scrubbed
 * rather than played, so the element's position is a pure function of scroll
 * position — no easing race between the scroller and the timeline.
 *
 * The transform is applied to an inner element, never to the wrapper: a
 * scaled wrapper scales its own `overflow: hidden` clip along with it, which
 * pushes the zoom straight out past the layout box and gives the whole
 * document a horizontal scrollbar.
 *
 * GSAP is imported lazily; a page that never scrolls to a parallax block
 * never downloads it.
 */
export function Parallax({
  children,
  className,
  /** Total travel in px across the element's time on screen. */
  distance = 120,
  /** Slow zoom-out. Implies clipping, so the zoom stays inside the frame. */
  scale = false,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
  scale?: boolean;
}) {
  const inner = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const node = inner.current;
    if (!node) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        gsap.fromTo(
          node,
          { y: distance * 0.5, ...(scale ? { scale: 1.12 } : null) },
          {
            y: -distance * 0.5,
            ...(scale ? { scale: 1 } : null),
            ease: 'none',
            scrollTrigger: {
              trigger: node,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      }, node);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [distance, reduced, scale]);

  return (
    <div className={cn(scale && 'rounded-card overflow-hidden', className)}>
      <div ref={inner} className="will-change-transform">
        {children}
      </div>
    </div>
  );
}
