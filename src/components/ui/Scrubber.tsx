'use client';

import { useCallback, useEffect, useRef } from 'react';

import { SHOT_BEATS } from '@/lib/site';
import { clamp, cn } from '@/lib/utils';

/**
 * Transport control for the flight.
 *
 * Scroll position and the scrubber are not two sources of truth — the
 * handle writes a scroll offset, and scroll drives the shot. Dragging the
 * handle literally scrolls the page, so releasing mid-drag leaves the page
 * exactly where the frame says it is, and scrolling normally moves the
 * handle without any syncing logic.
 *
 * Nothing here renders text. The beats still mark the track and still name
 * the playhead for assistive tech, but the shot is legible from the frame
 * itself — a caption telling you that you are watching an orbit, while you
 * watch an orbit, is just something else to read.
 *
 * The fill and handle move by direct style writes rather than React state:
 * this updates every frame while the user scrolls, and the component
 * renders exactly once.
 */
export function Scrubber({
  progress,
  onSeek,
  onScrubStart,
  onScrubEnd,
  className,
}: {
  /** Live progress, 0 → 1, read imperatively. */
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

  // Paint from the live ref every frame.
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

        // The beat names are gone from the page but not from the
        // accessibility tree: a slider that announces only "47" tells a
        // screen-reader user nothing about where in the shot they are.
        let next = 0;
        for (let i = 0; i < SHOT_BEATS.length; i += 1) {
          if (t >= SHOT_BEATS[i].at - 0.001) next = i;
        }
        if (next !== lastBeat) {
          lastBeat = next;
          handle.current.setAttribute(
            'aria-valuetext',
            `${SHOT_BEATS[next].label} — ${SHOT_BEATS[next].note}`,
          );
        }
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
      // Page keys step between beats — still the useful unit, even unlabelled.
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

  return (
    <div
      ref={track}
      onPointerDown={onPointerDown}
      className={cn('relative cursor-grab py-4 active:cursor-grabbing', className)}
    >
      <span className="bg-meadow-cream/25 block h-px w-full" />
      <span
        ref={fill}
        className="bg-meadow-cream absolute top-1/2 left-0 block h-px w-0 -translate-y-1/2"
      />

      {/* Beat marks: the shot list, kept as geometry rather than copy. */}
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
        aria-label="Scrub the flight"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        aria-valuetext={`${SHOT_BEATS[0].label} — ${SHOT_BEATS[0].note}`}
        onKeyDown={onKeyDown}
        className={cn(
          'bg-meadow-cream absolute top-1/2 left-0 size-3.5 -translate-x-1/2 -translate-y-1/2',
          'rounded-full transition-[box-shadow] focus-visible:outline-none',
          'focus-visible:ring-meadow-cream/50 focus-visible:ring-4',
        )}
      />
    </div>
  );
}
