/**
 * A full-bleed still from the hero clip, used as a section divider.
 *
 * The page used to paint these bands with a live 3D scene. Now that there
 * is real footage, a stylised render sitting a few sections below it would
 * only look worse by comparison — so the dividers are frames lifted from
 * the same flight. One decode, no WebGL, and the whole page reads as one
 * piece of film.
 */
export function Plate({
  src,
  position = 'center',
}: {
  src: string;
  /** Where to bias the crop, since these are wide frames in tall bands. */
  position?: 'center' | 'top' | 'bottom';
}) {
  const objectPosition = {
    center: 'center',
    top: 'center 25%',
    bottom: 'center 75%',
  }[position];

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-20 size-full object-cover"
        style={{ objectPosition }}
      />
      {/* Keeps cream type legible wherever the frame happens to be bright. */}
      <span
        aria-hidden="true"
        className="from-hillside-ink/70 pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t via-transparent to-transparent"
      />
    </>
  );
}
