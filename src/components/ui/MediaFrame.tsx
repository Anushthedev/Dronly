'use client';

import { useId } from 'react';

import { cn } from '@/lib/utils';

/**
 * Stand-in for drone footage. Drop a real file in via `src` and the
 * placeholder composition disappears — everything else about the frame
 * (ratio, radius, chrome, reveal behaviour) stays identical.
 */
export type MediaFrameProps = {
  label: string;
  caption?: string;
  /** Path to a real still (.jpg/.png/.webp) or clip (.mp4/.webm) in /public. */
  src?: string;
  ratio?: '4/5' | '16/9' | '1/1' | '3/4' | '21/9';
  className?: string;
  /** Deterministic seed for the placeholder plate. Defaults to the label. */
  seed?: string;
  /** Hide the timecode/REC chrome for quieter grid tiles. */
  chrome?: boolean;
  rounded?: boolean;
  priority?: boolean;
};

const RATIOS: Record<NonNullable<MediaFrameProps['ratio']>, string> = {
  '4/5': 'aspect-[4/5]',
  '16/9': 'aspect-[16/9]',
  '1/1': 'aspect-square',
  '3/4': 'aspect-[3/4]',
  '21/9': 'aspect-[21/9]',
};

/** Cheap stable hash so each plate gets its own light and horizon. */
function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src);

export function MediaFrame({
  label,
  caption,
  src,
  ratio = '16/9',
  className,
  seed,
  chrome = true,
  rounded = true,
  priority = false,
}: MediaFrameProps) {
  const gradientId = useId();
  const h = hash(seed ?? label);

  // Angle, horizon height and haze vary per plate so a grid of them reads
  // like six different flights rather than one repeated tile.
  const angle = 150 + (h % 60);
  const horizon = 42 + (h % 26);
  const haze = 0.1 + ((h >> 4) % 18) / 100;
  const timecode = `00:${String((h % 40) + 10).padStart(2, '0')}:${String(
    (h >> 3) % 60,
  ).padStart(2, '0')}:${String((h >> 5) % 24).padStart(2, '0')}`;
  const altitude = 180 + (h % 420);

  return (
    <figure
      className={cn(
        'bg-hillside-ink relative isolate overflow-hidden',
        rounded && 'rounded-card',
        RATIOS[ratio],
        className,
      )}
    >
      {src ? (
        isVideo(src) ? (
          <video
            className="absolute inset-0 size-full object-cover"
            src={src}
            autoPlay
            muted
            loop
            playsInline
            preload={priority ? 'auto' : 'metadata'}
            aria-label={label}
          />
        ) : (
          // Plain <img>: these are decorative, full-bleed, and unknown at
          // build time, so next/image's sizing machinery buys us nothing.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="absolute inset-0 size-full object-cover"
            src={src}
            alt={label}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        )
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: `linear-gradient(${angle}deg,
              color-mix(in oklab, #643aed ${Math.round(haze * 100)}%, #0b0b0d) 0%,
              #101014 ${horizon - 18}%,
              #17171c ${horizon}%,
              #08080a 100%)`,
          }}
        >
          {/* Horizon glow — the one moment of violet in an ink frame. */}
          <div
            className="absolute inset-x-0"
            style={{
              top: `${horizon - 12}%`,
              height: '24%',
              background:
                'radial-gradient(60% 100% at 50% 100%, rgba(100,58,237,0.35), transparent 70%)',
            }}
          />
          {/* Terrain suggestion. */}
          <svg
            className="absolute inset-x-0 bottom-0 h-[55%] w-full"
            viewBox="0 0 400 200"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f7f4e8" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#f7f4e8" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path
              d={`M0 ${120 + (h % 40)} L${60 + (h % 50)} ${70 + (h % 30)} L${
                150 + (h % 40)
              } ${130 - (h % 25)} L${260 + (h % 30)} ${60 + (h % 45)} L400 ${
                110 + (h % 30)
              } L400 200 L0 200 Z`}
              fill={`url(#${gradientId})`}
            />
          </svg>
          {/* Grain. */}
          <div
            className="absolute inset-0 opacity-[0.16] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
            }}
          />
        </div>
      )}

      {chrome && (
        <div
          aria-hidden="true"
          className="text-meadow-cream/70 pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-5"
        >
          <div className="flex items-start justify-between">
            <span className="type-label flex items-center gap-2">
              <span className="bg-drone-violet size-1.5 rounded-full" />
              REC
            </span>
            <span className="type-label tabular-nums">{timecode}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="type-label">ALT {altitude}FT</span>
            <span className="type-label">4K · 60P</span>
          </div>
        </div>
      )}

      {caption && (
        <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <span className="text-body-lg text-meadow-cream font-medium">
            {caption}
          </span>
        </figcaption>
      )}

      {/* Keeps text legible over bright footage once real media lands. */}
      <div
        aria-hidden="true"
        className="from-hillside-ink/55 to-hillside-ink/20 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent"
      />
    </figure>
  );
}
