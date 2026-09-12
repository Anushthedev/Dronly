import { cn } from '@/lib/utils';

/**
 * The reference system's signature editorial device: a small rounded
 * photograph dropped into a line of display type, where the image becomes
 * a word. Kept at `0.72em` so it always sits on the cap height of whatever
 * size the headline is currently at.
 */
export function InlineThumb({
  src,
  alt,
  className,
  seed = 'thumb',
}: {
  src?: string;
  alt: string;
  className?: string;
  seed?: string;
}) {
  const angle = 120 + (seed.charCodeAt(0) % 90);

  return (
    <span
      className={cn(
        'relative mx-[0.12em] inline-block h-[0.72em] w-[1.25em] translate-y-[0.04em]',
        'overflow-hidden rounded-[0.18em] align-baseline',
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        <span
          role="img"
          aria-label={alt}
          className="block size-full"
          style={{
            background: `linear-gradient(${angle}deg, #643aed 0%, #1b1b22 55%, #08080a 100%)`,
          }}
        />
      )}
    </span>
  );
}
