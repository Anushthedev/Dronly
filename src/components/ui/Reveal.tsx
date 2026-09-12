'use client';

import { motion, type Variants } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

const EASE = [0.16, 1, 0.3, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Seconds of head start before this element animates. */
  delay?: number;
  /** Travel distance in px. */
  distance?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
};

/**
 * The workhorse entrance: a short, heavily eased rise with a fade.
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
}: RevealProps) {
  const reduced = useReducedMotion();
  const Component = motion.create(as as ElementType<Record<string, unknown>>);

  const offset = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  }[direction];

  if (reduced) {
    const Static = as as ElementType<Record<string, unknown>>;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
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
  hidden: { opacity: 0, y: 26 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
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
 * Display headlines reveal a line at a time from behind a mask, which is what
 * gives oversized type its "stamped" entrance. Each line must be a separate
 * string so the mask can clip it independently.
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
          <span key={line} className="block overflow-hidden pb-[0.06em]">
            <motion.span
              className={cn('block', lineClassName)}
              variants={{
                hidden: { y: '105%' },
                shown: { y: '0%', transition: { duration: 1, ease: EASE } },
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
