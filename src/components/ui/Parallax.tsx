import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Layout wrapper, no motion.
 *
 * This used to scrub a 3D parallax off scroll position. The page now has
 * exactly one scroll-driven animation — the flight in the hero — and
 * everything below it holds still, so the transform is gone and only the
 * wrapper's layout role remains. Kept as a component rather than unpicked
 * from ~60 call sites, so restoring motion later is one file.
 */
export function Parallax({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  /** Accepted and ignored — retained so call sites need no edit. */
  distance?: number;
  scale?: boolean;
  tilt?: number;
  axis?: 'x' | 'y';
  depth?: number;
}) {
  return <div className={cn(className)}>{children}</div>;
}
