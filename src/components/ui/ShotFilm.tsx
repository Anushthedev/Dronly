'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

import { cn } from '@/lib/utils';

/**
 * The hero clip, scrubbed by scroll.
 *
 * The file is encoded with a five-frame GOP. Browsers seek by jumping to
 * the preceding keyframe and decoding forward, so seeks land on the exact
 * frame either way — what a short GOP buys is latency (measured at 14-21ms,
 * under one frame) without the quality cost of encoding every frame as a
 * keyframe. The source arrived with one keyframe in ten seconds, which made
 * every seek decode from the top and the picture stick, then jump.
 *
 * Seeks are issued from a rAF loop rather than from the scroll handler:
 * assigning `currentTime` several times inside one frame just queues work
 * the decoder throws away, and the last value is the only one that matters.
 */
export function ShotFilm({
  progress,
  src,
  poster,
  /** `scrub` follows the playhead; `loop` just plays, for phones. */
  mode,
  className,
}: {
  progress: RefObject<number>;
  src: string;
  poster: string;
  mode: 'scrub' | 'loop';
  className?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = video.current;
    if (!node || mode !== 'scrub') return;

    let raf = 0;
    let applied = -1;

    const tick = () => {
      const duration = node.duration;
      if (duration && Number.isFinite(duration)) {
        // Hold off the very last frame: seeking exactly to the duration can
        // park the element in an ended state on some browsers.
        const t = Math.min(
          Math.max(progress.current ?? 0, 0) * duration,
          duration - 0.02,
        );
        // A frame is ~42ms at 24fps; anything finer is a seek nobody sees.
        if (Math.abs(t - applied) > 0.02) {
          applied = t;
          node.currentTime = t;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, progress]);

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* The poster carries the first paint and stays behind the video, so
          a slow connection shows the frame rather than a black rectangle. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover"
      />
      <video
        ref={video}
        className={cn(
          'absolute inset-0 size-full object-cover transition-opacity duration-500',
          ready ? 'opacity-100' : 'opacity-0',
        )}
        src={src}
        poster={poster}
        preload="auto"
        muted
        playsInline
        // Decorative: the page reads identically without it.
        aria-hidden="true"
        autoPlay={mode === 'loop'}
        loop={mode === 'loop'}
        onLoadedData={() => setReady(true)}
      />
    </div>
  );
}
