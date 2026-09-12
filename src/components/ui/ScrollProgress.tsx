'use client';

import { useRef } from 'react';

import { useScrollEffect } from '@/components/providers/ScrollProvider';
import { SECTION_IDS } from '@/lib/site';

const LABELS: Record<string, string> = {
  hero: 'Intro',
  manifesto: 'Studio',
  events: 'Events',
  'real-estate': 'Real estate',
  work: 'Work',
  contact: 'Booking',
};

/**
 * Flight-log readout pinned to the right edge: shows which beat of the
 * narrative the drone is flying. Updated by direct DOM writes so it adds
 * nothing to React's render work.
 */
export function ScrollProgress() {
  const bar = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useScrollEffect(({ progress, stage }) => {
    if (bar.current) {
      bar.current.style.transform = `scaleY(${Math.max(0.02, progress)})`;
    }
    const id = SECTION_IDS[Math.min(SECTION_IDS.length - 1, Math.floor(stage))];
    const next = LABELS[id] ?? '';
    if (label.current && label.current.textContent !== next) {
      label.current.textContent = next;
    }
  });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-1/2 right-5 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 mix-blend-difference lg:flex"
    >
      <span className="type-label text-meadow-cream [writing-mode:vertical-rl]">
        <span ref={label}>Intro</span>
      </span>
      <span className="bg-meadow-cream/30 relative block h-28 w-px">
        <span
          ref={bar}
          className="bg-meadow-cream absolute inset-0 block origin-top"
          style={{ transform: 'scaleY(0.02)' }}
        />
      </span>
    </div>
  );
}
