'use client';

import { cn } from '@/lib/utils';

/**
 * Pure CSS marquee — runs on the compositor, costs no JS per frame, and
 * stops dead under prefers-reduced-motion (handled globally in globals.css).
 */
export function Marquee({
  items,
  className,
  speed = 40,
  reverse = false,
}: {
  items: string[];
  className?: string;
  /** Seconds for one full pass. */
  speed?: number;
  reverse?: boolean;
}) {
  const track = [...items, ...items];

  return (
    <div
      className={cn('relative flex overflow-hidden select-none', className)}
      aria-hidden="true"
    >
      <div
        className="flex shrink-0 items-center gap-10 pr-10 will-change-transform"
        style={{
          animation: `dronly-marquee ${speed}s linear infinite`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {track.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-10">
            <span className="type-heading-sm whitespace-nowrap">{item}</span>
            <span className="size-2 shrink-0 rounded-full bg-current" />
          </span>
        ))}
      </div>

      <style>{`
        @keyframes dronly-marquee {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
      `}</style>
    </div>
  );
}
