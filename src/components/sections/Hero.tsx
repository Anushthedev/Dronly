'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';

import { useScrollApi } from '@/components/providers/ScrollProvider';
import { Arrow, Button } from '@/components/ui/Button';
import { Scrubber } from '@/components/ui/Scrubber';
import { Band, Container, Section } from '@/components/ui/Section';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSceneTier } from '@/hooks/useSceneTier';
import { shotState } from '@/lib/shotState';
import { SITE, STATS } from '@/lib/site';
import { clamp } from '@/lib/utils';

const EASE = [0.16, 1, 0.3, 1] as const;

const HEADLINE = ['Eyes', 'above', 'everything'];

/** Scroll given to the hero shot. Long enough to read each beat. */
const TRACK_VH = 340;

/**
 * The hero is the shot.
 *
 * Rather than a headline over a static frame, the first thing on the page
 * is the flight itself with the controls in the viewer's hands: scrolling
 * the hero scrubs a pass over the property, and the transport sits under
 * the headline. A studio with no reel can still put you in the aircraft.
 *
 * The section is a tall track with a sticky viewport, so scroll position
 * inside the track is the shot's timeline — and the scrubber seeks by
 * moving the page rather than holding a second copy of the playhead, so
 * dragging and scrolling can never disagree.
 */
export function Hero() {
  const { scrollTo, subscribe, state } = useScrollApi();
  const tier = useSceneTier();
  const reduced = useReducedMotion();

  const trackRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);

  const interactive = tier !== null && tier !== 'still' && !reduced;

  // Scroll → playhead, written to a shared object the render loop reads.
  // This never re-renders the page.
  useEffect(() => {
    if (!interactive) return;

    const measure = () => {
      const node = trackRef.current;
      if (!node) return null;
      const top = node.getBoundingClientRect().top + window.scrollY;
      return { top, range: Math.max(1, node.offsetHeight - window.innerHeight) };
    };

    let bounds = measure();
    const remeasure = () => {
      bounds = measure();
    };

    const apply = (y: number) => {
      if (!bounds) {
        bounds = measure();
        if (!bounds) return;
      }
      const t = clamp((y - bounds.top) / bounds.range);
      progress.current = t;
      shotState.progress = t;
      // The camera is the shot's only while the track is on screen; past it
      // the narrative path takes over for the rest of the page.
      shotState.active = y < bounds.top + bounds.range + window.innerHeight * 0.4;
    };

    const unsubscribe = subscribe(({ y }) => apply(y));
    apply(state.current.y);

    const observer = new ResizeObserver(remeasure);
    observer.observe(document.body);
    window.addEventListener('resize', remeasure);

    return () => {
      unsubscribe();
      observer.disconnect();
      window.removeEventListener('resize', remeasure);
      shotState.active = false;
      shotState.immediate = false;
    };
  }, [interactive, state, subscribe]);

  /** Seeking moves the page; scroll then drives the shot as it always does. */
  const onSeek = useCallback(
    (t: number, immediate: boolean) => {
      const node = trackRef.current;
      if (!node) return;
      const top = node.getBoundingClientRect().top + window.scrollY;
      const range = Math.max(1, node.offsetHeight - window.innerHeight);
      scrollTo(top + t * range, { immediate });
    },
    [scrollTo],
  );

  return (
    <Section id="hero" label="Introduction">
      <div
        ref={trackRef}
        style={interactive ? { height: `${TRACK_VH}vh` } : undefined}
        className="relative"
      >
        <Band
          tone="sky"
          className={
            interactive
              ? 'sticky top-0 flex h-[100svh] flex-col justify-between pt-24 pb-6 sm:pt-28 sm:pb-10'
              : 'flex min-h-[100svh] flex-col justify-between pt-24 pb-6 sm:pt-28 sm:pb-10'
          }
        >
          {/* The scene is bright daylight, so everything that has to stay
              readable sits on its own scrim rather than on raw sky. */}
          <span
            aria-hidden="true"
            className="from-hillside-ink/55 pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40svh] bg-gradient-to-b via-[#16233a]/18 to-transparent"
          />
          <span
            aria-hidden="true"
            className="from-hillside-ink/72 pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[46svh] bg-gradient-to-t via-[#16233a]/26 to-transparent"
          />

          <Container>
            <motion.p
              className="type-label text-meadow-cream/75 mb-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
            >
              {SITE.name} — aerial studio
            </motion.p>

            <h1
              className="type-display text-meadow-cream max-w-[min(100%,1100px)]"
              style={{ fontSize: 'clamp(44px, min(9.5vw, 12.5svh), 132px)' }}
            >
              <span className="sr-only">{HEADLINE.join(' ')}</span>
              {HEADLINE.map((line, index) => (
                <span
                  key={line}
                  aria-hidden="true"
                  className="block overflow-hidden pb-[0.04em]"
                >
                  <motion.span
                    className="block"
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    transition={{
                      duration: 1.1,
                      delay: 0.2 + index * 0.09,
                      ease: EASE,
                    }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>
          </Container>

          <Container>
            <motion.div
              className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
            >
              <div className="max-w-[42ch]">
                <p className="text-body-lg text-meadow-cream/85">
                  Event coverage and real estate films, flown by a licensed crew and
                  cut for the screen they are going to live on.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button
                    as="a"
                    href="#contact"
                    variant="filled-cream"
                    onClick={(event: React.MouseEvent) => {
                      event.preventDefault();
                      scrollTo('#contact');
                    }}
                  >
                    Book a flight
                    <Arrow />
                  </Button>
                  <Button
                    as="a"
                    href="#events"
                    variant="ghost-cream"
                    onClick={(event: React.MouseEvent) => {
                      event.preventDefault();
                      scrollTo('#events');
                    }}
                  >
                    What we shoot
                  </Button>
                </div>
              </div>

              {interactive ? (
                <div className="w-full lg:max-w-[620px]">
                  <Scrubber
                    progress={progress}
                    onSeek={onSeek}
                    onScrubStart={() => {
                      shotState.immediate = true;
                    }}
                    onScrubEnd={() => {
                      shotState.immediate = false;
                    }}
                  />
                  <p className="type-label text-meadow-cream/45 mt-4">
                    Real-time 3D previsualisation — not footage
                  </p>
                </div>
              ) : null}
            </motion.div>

            <motion.dl
              className="border-meadow-cream/25 mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t pt-6 sm:grid-cols-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1, ease: EASE }}
            >
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="type-label text-meadow-cream/65">{stat.label}</dt>
                  <dd className="type-heading-sm text-meadow-cream mt-2">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </motion.dl>
          </Container>
        </Band>
      </div>
    </Section>
  );
}
