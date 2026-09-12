import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type ButtonVariant =
  'filled' | 'ghost' | 'ghost-cream' | 'filled-cream' | 'inherit';

const VARIANTS: Record<ButtonVariant, string> = {
  // Pill Action Button — ink fill, cream text, flush 1px border.
  filled:
    'bg-hillside-ink text-meadow-cream border-hillside-ink hover:bg-transparent hover:text-hillside-ink',
  // Ghost Outline Button on the cream canvas.
  ghost:
    'bg-transparent text-hillside-ink border-hillside-ink hover:bg-hillside-ink hover:text-meadow-cream',
  // Same two, inverted for ink surfaces.
  'ghost-cream':
    'bg-transparent text-meadow-cream border-meadow-cream hover:bg-meadow-cream hover:text-hillside-ink',
  'filled-cream':
    'bg-meadow-cream text-hillside-ink border-meadow-cream hover:bg-transparent hover:text-meadow-cream',
  // Takes its colour from whatever it sits on. Used by the nav, which flips
  // between ink and cream as it crosses bands — a fixed variant would need
  // to win a specificity fight against itself.
  inherit: 'bg-transparent text-current border-current hover:opacity-60',
};

type ButtonOwnProps<T extends ElementType> = {
  as?: T;
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
};

type ButtonProps<T extends ElementType> = ButtonOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof ButtonOwnProps<T>>;

/**
 * One pill, four surfaces. 20px radius, 14px/24px padding and a 1px border
 * on every variant — including the filled one, so the two sit on the same
 * optical baseline when they appear side by side.
 */
export function Button<T extends ElementType = 'button'>({
  as,
  variant = 'filled',
  className,
  children,
  ...rest
}: ButtonProps<T>) {
  // The polymorphic `as` widens children to `never` under exactOptionalTypes
  // unless the element type is explicitly loosened here.
  const Component = (as ?? 'button') as ElementType<Record<string, unknown>>;

  return (
    <Component
      className={cn(
        'rounded-card inline-flex items-center justify-center gap-2 border',
        'text-body px-6 py-3.5 font-medium whitespace-nowrap',
        'transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

/** The ↗ that the reference system pins to outbound / booking CTAs. */
export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className={cn('size-3', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9 9 3M4 3h5v5" />
    </svg>
  );
}
