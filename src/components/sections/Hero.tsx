'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useScrollApi } from '@/components/providers/ScrollProvider';
import { Arrow, Button } from '@/components/ui/Button';
import { Scrubber } from '@/components/ui/Scrubber';
import { ShotFilm } from '@/components/ui/ShotFilm';
import { Band, Container, Section } from '@/components/ui/Section';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSceneTier } from '@/hooks/useSceneTier';
import { HERO_LINES, SHOT_BEATS, SITE } from '@/lib/site';
import { clamp } from '@/lib/utils';

const EASE = [0.16, 1, 0.3, 1] as const;

/** Scroll given to the hero shot. Long enough to read each beat. */
const TRACK_VH = 340;

/** Which beat a playhead position falls in. */
function beatAt(t: number): number {
  let index = 0;
  for (let i = 0; i < SHOT_BEATS.length; i += 1) {
    if (t >= SHOT_BEATS[i].at - 0.001) index = i;
  }
  return index;
}

/**
 * The hero is the shot.
 *
 * The first thing on the page is the flight, with the controls in the
 * viewer's hands: scrolling the hero scrubs a pass over the property. The
 * headline changes with it — each beat of the flight carries its own line,
 * so the type reads as one sentence told across the pass rather than a
 * fixed slogan sitting on top of moving pictures.
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
  const [beat, setBeat] = useState(0);

  const interactive = tier !== null && tier !== 'still' && !reduced;

  // Scroll → playhead, written to a shared object the render loop reads.
  // Only the beat index reaches React state, so this re-renders five times
  // across the whole pass rather than on every frame.
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

    let lastBeat = -1;
    const apply = (y: number) => {
      if (!bounds) {
        bounds = measure();
        if (!bounds) return;
      }
      const t = clamp((y - bounds.top) / bounds.range);
      progress.current = t;

      const next = beatAt(t);
      if (next !== lastBeat) {
        lastBeat = next;
        setBeat(next);
      }
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

  const lines = HERO_LINES[Math.min(beat, HERO_LINES.length - 1)];

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
              ? 'sticky top-0 flex h-[100svh] flex-col justify-between pt-24 pb-8 sm:pt-28 sm:pb-12'
              : 'flex min-h-[100svh] flex-col justify-between pt-24 pb-8 sm:pt-28 sm:pb-12'
          }
        >
          {tier !== null && tier !== 'still' && (
            <ShotFilm
              progress={progress}
              src="/hero.mp4"
              poster="/hero-poster.jpg"
              mode={interactive ? 'scrub' : 'loop'}
              className="-z-20"
            />
          )}
          {tier === 'still' && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/hero-poster.jpg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 -z-20 size-full object-cover"
            />
          )}

          {/* The clip is bright daylight, so everything that has to stay
              readable sits on its own scrim rather than on raw sky. */}
          <span
            aria-hidden="true"
            className="from-hillside-ink/55 pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40svh] bg-gradient-to-b via-[#16233a]/18 to-transparent"
          />
          <span
            aria-hidden="true"
            className="from-hillside-ink/72 pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[44svh] bg-gradient-to-t via-[#16233a]/26 to-transparent"
          />

          <Container>
            <p className="type-label text-meadow-cream/75 mb-5">
              {SITE.name} — aerial studio
            </p>

            {/* One accessible name for the whole hero: the line swaps are a
                visual device, and a screen reader should not be handed a
                headline that silently rewrites itself mid-read. */}
            <h1
              className="type-display text-meadow-cream max-w-[min(100%,1100px)]"
              style={{ fontSize: 'clamp(44px, min(9.5vw, 13svh), 132px)' }}
            >
              <span className="sr-only">
                {SITE.name} — {SITE.tagline}
              </span>

              <span aria-hidden="true" className="block">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={beat}
                    className="block"
                    initial={reduced ? false : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? undefined : { opacity: 0, y: -14 }}
                    transition={{ duration: 0.55, ease: EASE }}
                  >
                    {lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>
          </Container>

          <Container>
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
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

              {interactive && (
                <div className="w-full lg:max-w-[620px]">
                  <Scrubber progress={progress} onSeek={onSeek} />
                </div>
              )}
            </div>
          </Container>
        </Band>
      </div>
    </Section>
  );
}
