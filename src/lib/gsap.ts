import type { gsap as GsapType } from 'gsap';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';

type GsapBundle = {
  gsap: typeof GsapType;
  ScrollTrigger: typeof ScrollTriggerType;
};

let pending: Promise<GsapBundle> | null = null;
let scrollSync: (() => void) | null = null;

/**
 * Once ScrollTrigger exists it must be ticked from the same scroll source
 * that Lenis drives, otherwise scrubbed tweens lag a frame behind the page.
 * ScrollProvider calls this on every publish; it is a no-op until the first
 * scroll-linked component has actually loaded GSAP.
 */
export const syncScrollTrigger = (): void => scrollSync?.();

/**
 * GSAP + ScrollTrigger are only needed once a scroll-linked section is on
 * screen, so they are pulled in on demand rather than shipped in the first
 * load JS. The promise is cached — every caller shares one copy.
 */
export function loadGsap(): Promise<GsapBundle> {
  if (!pending) {
    pending = Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([core, plugin]) => {
        const gsap = core.gsap;
        const { ScrollTrigger } = plugin;
        gsap.registerPlugin(ScrollTrigger);
        // Lenis already runs its own rAF loop; GSAP's lag smoothing would
        // fight it and cause the pinned sections to judder.
        gsap.ticker.lagSmoothing(0);
        scrollSync = () => ScrollTrigger.update();
        return { gsap, ScrollTrigger };
      },
    );
  }
  return pending;
}
