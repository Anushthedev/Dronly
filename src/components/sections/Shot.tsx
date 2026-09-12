'use client';

import { useCallback, useEffect, useRef } from 'react';

import { useScrollApi } from '@/components/providers/ScrollProvider';
import { Reveal, RevealLines } from '@/components/ui/Reveal';
import { Scrubber } from '@/components/ui/Scrubber';
import { Band, Container, Section, SectionLabel } from '@/components/ui/Section';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSceneTier } from '@/hooks/useSceneTier';
import { SHOT_BEATS } from '@/lib/site';
import { shotState } from '@/lib/shotState';
import { clamp } from '@/lib/utils';

/** How much scroll the shot is given. 3.2 viewports is long enough to read
 *  each beat without the page feeling stuck. */
const TRACK_VH = 320;

/**
 * The scrubbable lodge sequence.
 *
 * This section owns no canvas of its own. The whole site already flies one
 * camera over one valley; here the page simply takes that camera over and
 * hands the controls to the viewer. A second WebGL context for the same
 * scenery would double the cost to show the same place twice.
 *
 * The section is a tall track with a sticky viewport, so scroll position
 * inside the track is the shot's timeline — and the scrubber seeks by
 * moving the page rather than holding a second copy of the playhead, so
 * dragging and scrolling can never disagree.
 */
export function Shot() {
  const { scrollTo, subscribe, state } = useScrollApi();
  const tier = useSceneTier();
  const reduced = useReducedMotion();

  const trackRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);

  const interactive = tier !== null && tier !== 'still' && !reduced;

  // Scroll → playhead. Written to a shared object the render loop reads;
  // this never re-renders the page.
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
      // The camera is ours only while the track is actually on screen.
      shotState.active =
        y > bounds.top - window.innerHeight * 0.5 &&
        y < bounds.top + bounds.range + window.innerHeight * 0.5;
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
    <Section id="shot" label="The shot we fly">
      <Band tone="sky" className="pt-15 sm:pt-30">
        <Container>
          <SectionLabel tone="cream">03 — The shot</SectionLabel>

          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
            <h2 className="type-heading-lg lg:col-span-7">
              <RevealLines lines={['The flight', 'we fly', 'over a lodge']} />
            </h2>
            <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.1}>
              <p className="text-body-lg text-meadow-cream/80">
                Dronly is new, so there is no reel to show you yet — and we would
                rather render the shot than borrow someone else&apos;s.
                {interactive
                  ? ' Everything you can see is live 3D, not footage. Take the controls below.'
                  : ' Here is the flight we fly over a property, shot by shot.'}
              </p>
            </Reveal>
          </div>
        </Container>
      </Band>

      {interactive ? (
        // A tall track with a sticky viewport. Nothing is painted here — the
        // scene behind the page shows straight through, and this section
        // only decides which frame of it you are looking at.
        <div
          ref={trackRef}
          data-ink-zone=""
          className="relative mt-12 sm:mt-15"
          style={{ height: `${TRACK_VH}vh` }}
        >
          <div className="sticky top-0 flex h-[100svh] w-full flex-col justify-end">
            <Container className="pointer-events-none relative pb-8 sm:pb-12">
              {/* Some frames of the shot are very bright — the scrim keeps
                  the transport legible throughout. */}
              <span
                aria-hidden="true"
                className="from-hillside-ink/90 pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64 bg-gradient-to-t via-[#0b1020]/60 to-transparent"
              />
              <div className="pointer-events-auto ml-auto max-w-[640px]">
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
                <p className="type-label text-meadow-cream/40 mt-4">
                  Real-time 3D previsualisation — not footage
                </p>
              </div>
            </Container>
          </div>
        </div>
      ) : (
        <Band tone="sky">
          <StaticStoryboard />
        </Band>
      )}
    </Section>
  );
}

/** Text storyboard: the same shot list, for reduced motion or no WebGL. */
function StaticStoryboard() {
  return (
    <Container className="py-15 sm:py-30">
      <ol className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
        {SHOT_BEATS.map((beat, index) => (
          <li
            key={beat.label}
            className="border-meadow-cream/20 flex flex-col gap-3 border-t pt-5"
          >
            <span className="type-label text-meadow-cream/45">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="type-heading-sm text-meadow-cream">{beat.label}</h3>
            <p className="text-body text-meadow-cream/70">{beat.note}</p>
          </li>
        ))}
      </ol>
      <p className="type-label text-meadow-cream/40 mt-8">
        The flight, shot by shot
      </p>
    </Container>
  );
}
