import type { ElementType, ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Layout wrappers, no motion.
 *
 * These used to run staggered 3D entrance animations off an intersection
 * observer. The page now has exactly one scroll-driven animation — the
 * flight in the hero — and everything below it holds still. The wrappers
 * remain because `RevealLines` still does real work (breaking display type
 * onto authored lines, and exposing the whole sentence to assistive tech,
 * which line boxes alone would run together), and because restoring motion
 * later is then one file rather than ~60 call sites.
 */

type Tag = ElementType<Record<string, unknown>>;

export function Reveal({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Accepted and ignored — retained so call sites need no edit. */
  delay?: number;
  distance?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  depth?: number;
}) {
  const Component = as as Tag;
  return <Component className={className}>{children}</Component>;
}

export function RevealGroup({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  const Component = as as Tag;
  return <Component className={className}>{children}</Component>;
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
  const Component = as as Tag;
  return <Component className={className}>{children}</Component>;
}

/**
 * Display headlines broken onto authored lines.
 *
 * The sentence is exposed once for assistive tech and the visual lines are
 * hidden from the accessibility tree: separate line boxes would otherwise
 * be read as one run-on word ("Eyesaboveeverything").
 */
export function RevealLines({
  lines,
  className,
  lineClassName,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  /** Accepted and ignored — retained so call sites need no edit. */
  delay?: number;
}) {
  return (
    <span className={cn('block', className)}>
      <span className="sr-only">{`${lines.join(' ')} `}</span>
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
