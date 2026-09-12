import { cn } from '@/lib/utils';

/**
 * Corner label for a full-bleed band of the live scene.
 *
 * The bands are not framed. The reference system bleeds imagery edge to
 * edge in heroes and section dividers and avoids contained rounded cards at
 * that scale — and a border here would read as a container anyway, when the
 * scene it appears to contain is in fact visible right through the whole
 * band.
 *
 * The "not footage" half is not decoration: the studio has no reel, and the
 * page should never let a rendered frame pass for one.
 */
export function LiveCaption({
  children,
  meta = 'Live · not footage',
  className,
}: {
  children: React.ReactNode;
  meta?: string | false;
  className?: string;
}) {
  return (
    <figcaption
      className={cn(
        'border-meadow-cream/25 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t pt-3',
        className,
      )}
    >
      <span className="text-body-lg text-meadow-cream font-medium">{children}</span>
      {meta && (
        <span className="type-label text-meadow-cream/55 flex items-center gap-2">
          <span className="bg-drone-violet size-1.5 rounded-full" />
          {meta}
        </span>
      )}
    </figcaption>
  );
}
