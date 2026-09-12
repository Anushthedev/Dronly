'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { SHOT_BEATS } from '@/lib/site';
import { clamp, cn } from '@/lib/utils';

/**
 * Transport control for the demonstration flight.
 *
 * Scroll position and the scrubber are not two sources of truth — the
 * handle writes a scroll offset, and scroll drives the shot. Dragging the
 * handle literally scrolls the page, so releasing mid-drag leaves the page
 * exactly where the frame says it is, and scrolling normally moves the
 * handle without any syncing logic.
 *
 * The visible fill and handle are moved by direct style writes rather than
 * React state, for the same reason the 3D scene reads a ref: this updates
 * every frame while the user scrolls.
 */
export function Scrubber({
  progress,
  onSeek,
  onScrubStart,
  onScrubEnd,
  className,
}: {
  /** Live progress, 0 → 1. Read imperatively via `subscribe`-style updates. */
  progress: React.RefObject<number>;
  /** Move the page so the shot sits at `t`. */
  onSeek: (t: number, immediate: boolean) => void;
  onScrubStart?: () => void;
  onScrubEnd?: () => void;
  className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const handle = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const [beat, setBeat] = useState(0);

  // Paint from the live ref on every frame the section is visible.
  useEffect(() => {
    let raf = 0;
    let lastBeat = -1;

    const paint = () => {
      const t = clamp(progress.current ?? 0);
      const pct = `${t * 100}%`;
      if (fill.current) fill.current.style.width = pct;
      if (handle.current) {
        handle.current.style.left = pct;
        handle.current.setAttribute('aria-valuenow', String(Math.round(t * 100)));
      }
      if (readout.current) {
        // Frame counter at 24fps across a nominal 12-second shot — the
        // vernacular of the thing being demonstrated.
        const frames = Math.round(t * 24 * 12);
        readout.current.textContent = `${String(Math.floor(frames / 24)).padStart(2, '0')}:${String(frames % 24).padStart(2, '0')}`;
      }

      let next = 0;
      for (let i = 0; i < SHOT_BEATS.length; i += 1) {
        if (t >= SHOT_BEATS[i].at - 0.001) next = i;
      }
      if (next !== lastBeat) {
        lastBeat = next;
        setBeat(next);
      }

      raf = requestAnimationFrame(paint);
    };

    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  const seekFromPointer = useCallback(
    (clientX: number) => {
      const node = track.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      onSeek(clamp((clientX - rect.left) / rect.width), true);
    },
    [onSeek],
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      handle.current?.focus();
      onScrubStart?.();
      seekFromPointer(event.clientX);

      const move = (e: PointerEvent) => seekFromPointer(e.clientX);
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        onScrubEnd?.();
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    },
    [onScrubEnd, onScrubStart, seekFromPointer],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const t = clamp(progress.current ?? 0);
      const step = event.shiftKey ? 0.1 : 0.02;
      let next: number | null = null;

      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = t + step;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = t - step;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = 1;
      // Tab through the named beats — the useful unit for a shot list.
      if (event.key === 'PageDown') {
        next = SHOT_BEATS.find((b) => b.at > t + 0.001)?.at ?? 1;
      }
      if (event.key === 'PageUp') {
        next = [...SHOT_BEATS].reverse().find((b) => b.at < t - 0.001)?.at ?? 0;
      }

      if (next === null) return;
      event.preventDefault();
      onSeek(clamp(next), true);
    },
    [onSeek, progress],
  );

  const current = SHOT_BEATS[beat];

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <span className="type-label text-meadow-cream">
          {current.label}
          <span className="text-meadow-cream/50"> — {current.note}</span>
        </span>
        <span
          ref={readout}
          className="type-label text-meadow-cream/60 tabular-nums"
        >
          00:00
        </span>
      </div>

      <div
        ref={track}
        onPointerDown={onPointerDown}
        className="relative cursor-grab py-3 active:cursor-grabbing"
      >
        <span className="bg-meadow-cream/20 block h-px w-full" />
        <span
          ref={fill}
          className="bg-meadow-cream absolute top-1/2 left-0 block h-px w-0 -translate-y-1/2"
        />

        {/* Beat ticks — the shot list, marked on the track */}
        {SHOT_BEATS.map((b) => (
          <span
            key={b.label}
            aria-hidden="true"
            className="bg-meadow-cream/40 absolute top-1/2 h-2 w-px -translate-y-1/2"
            style={{ left: `${b.at * 100}%` }}
          />
        ))}

        <div
          ref={handle}
          role="slider"
          tabIndex={0}
          aria-label="Scrub the demonstration flight"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
          aria-valuetext={`${current.label} — ${current.note}`}
          onKeyDown={onKeyDown}
          className={cn(
            'bg-meadow-cream absolute top-1/2 left-0 size-3.5 -translate-x-1/2 -translate-y-1/2',
            'rounded-full transition-[box-shadow] focus-visible:outline-none',
            'focus-visible:ring-meadow-cream/50 focus-visible:ring-4',
          )}
        />
      </div>

      <ol className="mt-2 flex justify-between">
        {SHOT_BEATS.map((b, i) => (
          <li
            key={b.label}
            className={cn(
              'type-label transition-colors duration-300',
              i === beat ? 'text-meadow-cream' : 'text-meadow-cream/35',
            )}
          >
            {b.label}
          </li>
        ))}
      </ol>
    </div>
  );
}
