'use client';

import { motion, type Variants } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Depth is applied with `transformPerspective` rather than a `perspective`
 * wrapper. A wrapper would mean an extra div around every reveal — which
 * breaks the grid placement these components are used inside of (they are
 * frequently the direct grid child carrying `col-span-*`). Per-element
 * perspective costs one vanishing point per element instead of one shared
 * across a row, which at these tilt angles is not perceptible.
 */
const PERSPECTIVE = 1100;

type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * Each direction hinges around the edge it enters from, the way a panel
 * swings into place rather than sliding on a flat plane.
 */
function entrance(direction: Direction, distance: number, depth: number) {
  switch (direction) {
    case 'down':
      return {
        from: { y: -distance, rotateX: -depth, transformOrigin: '50% 0%' },
        to: { y: 0, rotateX: 0 },
      };
    case 'left':
      return {
        from: { x: distance, rotateY: -depth, transformOrigin: '100% 50%' },
        to: { x: 0, rotateY: 0 },
      };
    case 'right':
      return {
        from: { x: -distance, rotateY: depth, transformOrigin: '0% 50%' },
        to: { x: 0, rotateY: 0 },
      };
    case 'up':
    default:
      return {
        from: { y: distance, rotateX: depth, transformOrigin: '50% 100%' },
        to: { y: 0, rotateX: 0 },
      };
  }
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Seconds of head start before this element animates. */
  delay?: number;
  /** Travel distance in px. */
  distance?: number;
  direction?: Direction;
  /** Hinge angle in degrees. 0 falls back to a flat slide. */
  depth?: number;
};

/**
 * The workhorse entrance: the element hinges up out of the page plane and
 * settles flat, pushed back in Z so it arrives from behind the surface.
 *
 * Framer Motion's `whileInView` fires once, so nothing re-animates on the
 * way back up — scrubbing reveals in both directions reads as jitter.
 */
export function Reveal({
  children,
  className,
  as = 'div',
  delay = 0,
  distance = 28,
  direction = 'up',
  depth = 12,
}: RevealProps) {
  const reduced = useReducedMotion();
  const Component = motion.create(as as ElementType<Record<string, unknown>>);

  if (reduced) {
    const Static = as as ElementType<Record<string, unknown>>;
    return <Static className={className}>{children}</Static>;
  }

  const { from, to } = entrance(direction, distance, depth);

  return (
    <Component
      className={className}
      initial={{ opacity: 0, z: -90, transformPerspective: PERSPECTIVE, ...from }}
      whileInView={{ opacity: 1, z: 0, ...to }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 1, delay, ease: EASE }}
    >
      {children}
    </Component>
  );
}

const GROUP: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const ITEM: Variants = {
  hidden: {
    opacity: 0,
    y: 34,
    z: -110,
    rotateX: 14,
    transformPerspective: PERSPECTIVE,
    transformOrigin: '50% 100%',
  },
  shown: {
    opacity: 1,
    y: 0,
    z: 0,
    rotateX: 0,
    transition: { duration: 0.95, ease: EASE },
  },
};

/** Wrap a list to stagger its `<RevealItem>` children. */
export function RevealGroup({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  const reduced = useReducedMotion();
  const Component = motion.create(as as ElementType<Record<string, unknown>>);

  if (reduced) {
    const Static = as as ElementType<Record<string, unknown>>;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Component
      className={className}
      variants={GROUP}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
    >
      {children}
    </Component>
  );
}

export function RevealItem({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  const reduced = useReducedMotion();
  const Component = motion.create(as as ElementType<Record<string, unknown>>);

  if (reduced) {
    const Static = as as ElementType<Record<string, unknown>>;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Component className={className} variants={ITEM}>
      {children}
    </Component>
  );
}

/**
 * Display headlines reveal a line at a time, each one hinging up from its
 * own baseline inside a mask — the type rotates into the page plane rather
 * than sliding flat, which is what reads as "stamped" at this scale.
 *
 * Each line must be a separate string so the mask can clip it independently.
 * Perspective sits on the clipping span and the rotation on its direct
 * child: `overflow: hidden` flattens a `preserve-3d` chain, so the transform
 * has to be one level deep, not nested further.
 */
export function RevealLines({
  lines,
  className,
  lineClassName,
  delay = 0,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  // Splitting a sentence across line boxes leaves assistive tech reading
  // "Eyesaboveeverything" — one run-on word. The readable string is exposed
  // once, and the visual lines are hidden from the accessibility tree.
  const label = <span className="sr-only">{`${lines.join(' ')} `}</span>;

  if (reduced) {
    return (
      <span className={cn('block', className)}>
        {label}
        <span aria-hidden="true">
          {lines.map((line) => (
            <span key={line} className={cn('block', lineClassName)}>
              {line}
            </span>
          ))}
        </span>
      </span>
    );
  }

  return (
    <span className={cn('block', className)}>
      {label}
      <motion.span
        aria-hidden="true"
        className="block"
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, margin: '0px 0px -15% 0px' }}
        variants={{
          hidden: {},
          shown: { transition: { staggerChildren: 0.08, delayChildren: delay } },
        }}
      >
        {lines.map((line) => (
          // The clipping wrapper needs its own line box; `overflow-hidden` on
          // the animated element itself would clip nothing.
          <span
            key={line}
            className="block overflow-hidden pb-[0.06em]"
            style={{ perspective: '900px' }}
          >
            <motion.span
              className={cn('block origin-bottom', lineClassName)}
              variants={{
                hidden: { y: '92%', rotateX: -62, opacity: 0 },
                shown: {
                  y: '0%',
                  rotateX: 0,
                  opacity: 1,
                  transition: { duration: 1.1, ease: EASE },
                },
              }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </span>
  );
}
