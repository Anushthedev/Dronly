import type { ReactNode, Ref } from 'react';

import { cn } from '@/lib/utils';

/**
 * A section is a landmark and a scroll anchor — it never paints a
 * background of its own.
 *
 * That matters: the 3D stage is fixed behind the whole document, so any
 * opaque ancestor would hide it. Backgrounds belong to <Band>, which lets a
 * single section alternate between cream editorial blocks and transparent
 * windows onto the flight.
 */
export function Section({
  id,
  className,
  children,
  label,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
  /** Accessible name for the landmark. */
  label?: string;
}) {
  return (
    <section id={id} aria-label={label} className={cn('relative', className)}>
      {children}
    </section>
  );
}

export type BandTone =
  /** The warm canvas. Opaque — covers the 3D stage. */
  | 'cream'
  /** A window onto the fixed 3D stage. Transparent, cream type. */
  | 'sky'
  /** Solid ink. Used for the footer and full-bleed dividers. */
  | 'ink';

const TONES: Record<BandTone, string> = {
  cream: 'bg-meadow-cream text-hillside-ink',
  sky: 'text-meadow-cream',
  ink: 'bg-hillside-ink text-meadow-cream',
};

export function Band({
  tone = 'cream',
  className,
  children,
  ref,
}: {
  tone?: BandTone;
  className?: string;
  /** Optional: a `sky` band with no children is a window onto the scene. */
  children?: ReactNode;
  /** React 19 passes refs as a plain prop — no forwardRef needed. */
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      // The nav reads these zones to decide whether to render itself in
      // cream or ink as it crosses them.
      {...(tone === 'cream' ? null : { 'data-ink-zone': '' })}
      className={cn('relative', TONES[tone], className)}
    >
      {children}
    </div>
  );
}

/** The one horizontal rhythm used site-wide. */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto w-full max-w-[1600px] px-5 sm:px-8', className)}>
      {children}
    </div>
  );
}

/**
 * The curved hand-off from a full-bleed sky band into the cream canvas —
 * the reference system's signature section transition.
 */
export function CreamCurve({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-meadow-cream pointer-events-none relative z-10 -mb-px h-[6vw] min-h-[36px] w-full',
        className,
      )}
      style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }}
    />
  );
}

/**
 * The mirror image: the cream canvas curving away to hand back to a
 * full-bleed sky band.
 */
export function SkyCurve({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-meadow-cream pointer-events-none relative z-10 -mt-px h-[6vw] min-h-[36px] w-full',
        className,
      )}
      style={{ borderRadius: '0 0 50% 50% / 0 0 100% 100%' }}
    />
  );
}

/** Small eyebrow label with the hairline rule the system uses above sections. */
export function SectionLabel({
  children,
  className,
  tone = 'ink',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'ink' | 'cream';
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 border-t pt-4',
        tone === 'ink' ? 'border-hillside-ink' : 'border-meadow-cream/40',
        className,
      )}
    >
      <span className="type-label">{children}</span>
    </div>
  );
}
