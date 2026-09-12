import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type CardProps = {
  children: ReactNode;
  className?: string;
  /**
   * `outlined` — the default cream card; the 1px border does the elevation work.
   * `violet`   — the single chromatic surface in the system. Use sparingly.
   * `ink`      — inverted surface for dark sections.
   */
  tone?: 'outlined' | 'violet' | 'ink';
};

const TONES = {
  outlined: 'bg-meadow-cream text-hillside-ink border border-hillside-ink',
  violet: 'bg-drone-violet text-meadow-cream border border-drone-violet',
  ink: 'bg-hillside-ink text-meadow-cream border border-meadow-cream/25',
} as const;

/** Flat by default — no shadows anywhere in this system. */
export function Card({ children, className, tone = 'outlined' }: CardProps) {
  return (
    <div className={cn('rounded-card p-6', TONES[tone], className)}>{children}</div>
  );
}

export function Tag({
  children,
  tone = 'outlined',
  className,
}: {
  children: ReactNode;
  tone?: 'outlined' | 'violet' | 'cream';
  className?: string;
}) {
  const tones = {
    outlined: 'border-hillside-ink text-hillside-ink',
    violet: 'border-drone-violet bg-drone-violet text-meadow-cream',
    cream: 'border-meadow-cream text-meadow-cream',
  } as const;

  return (
    <span
      className={cn(
        'type-label rounded-card inline-flex items-center border px-3 py-1.5',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
