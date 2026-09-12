'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useScrollApi } from '@/components/providers/ScrollProvider';
import { Reveal, RevealLines } from '@/components/ui/Reveal';
import { Scrubber } from '@/components/ui/Scrubber';
import { Band, Container, Section, SectionLabel } from '@/components/ui/Section';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSceneTier } from '@/hooks/useSceneTier';
import { SHOT_BEATS } from '@/lib/site';
import { claimForeground } from '@/lib/stageSignal';
import { clamp } from '@/lib/utils';

const LodgeCanvas = dynamic(() => import('@/components/three/lodge/LodgeCanvas'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-content-center bg-[#05060b]">
      <span className="type-label text-meadow-cream/60">Loading the flight</span>
    </div>
  ),
});

/** How much scroll the shot is given. 3.2 viewports is long enough to read
 *  each beat without the page feeling stuck. */
const TRACK_VH = 320;

/**
 * The demonstration flight.
 *
 * This studio has no footage yet, so rather than borrow clips or invent
 * client work, the site renders the shot it sells — live, and labelled as
 * a render. The section is a tall track with a sticky viewport; scroll
 * position inside that track is the shot's timeline, and the scrubber
 * seeks by moving the page, so there is only ever one source of truth.
 */
export function Shot() {
  const { scrollTo, subscribe, state } = useScrollApi();
  const tier = useSceneTier();
  const reduced = useReducedMotion();

  const trackRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const scrubbing = useRef(false);
  const [active, setActive] = useState(false);

  // Scroll → progress. Written to a ref; the canvas and the scrubber both
  // read it in their own frame loops, so this never re-renders the page.
  useEffect(() => {
    const measure = () => {
      const node = trackRef.current;
      if (!node) return null;
      const top = node.getBoundingClientRect().top + window.scrollY;
      // The sticky viewport is one screen tall; the shot runs across the
      // remaining scrollable length of the track.
      return { top, range: Math.max(1, node.offsetHeight - window.innerHeight) };
    };

    let bounds = measure();
    const remeasure = () => {
      bounds = measure();
    };

    const unsubscribe = subscribe(({ y }) => {
      if (!bounds) {
        bounds = measure();
        if (!bounds) return;
      }
      progress.current = clamp((y - bounds.top) / bounds.range);
    });

    const observer = new ResizeObserver(remeasure);
    observer.observe(document.body);
    window.addEventListener('resize', remeasure);
    progress.current = clamp(
      bounds ? (state.current.y - bounds.top) / bounds.range : 0,
    );

    return () => {
      unsubscribe();
      observer.disconnect();
      window.removeEventListener('resize', remeasure);
    };
  }, [state, subscribe]);

  // Only render the scene while the track is anywhere near the viewport.
  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    let release: (() => void) | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting);
        if (entry.isIntersecting) {
          release ??= claimForeground();
        } else {
          release?.();
          release = undefined;
        }
      },
      { rootMargin: '20% 0px 20% 0px' },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      release?.();
    };
  }, []);

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

  const showCanvas = tier === 'full' && !reduced;

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
                rather render the shot than borrow someone else&apos;s.{' '}
                {showCanvas
                  ? 'Everything below is live 3D, not footage. Drag the scrubber to fly it yourself.'
                  : 'Here is the flight we fly over a property, shot by shot.'}
              </p>
            </Reveal>
          </div>
        </Container>
      </Band>

      {/* The track: tall, with a sticky one-screen viewport inside it. */}
      <div
        ref={trackRef}
        data-ink-zone=""
        className="relative mt-12 sm:mt-15"
        style={{ height: showCanvas ? `${TRACK_VH}vh` : undefined }}
      >
        <div
          className={
            showCanvas
              ? 'sticky top-0 h-[100svh] w-full overflow-hidden'
              : 'relative w-full'
          }
        >
          {showCanvas ? (
            <LodgeCanvas
              progress={progress}
              immediate={scrubbing}
              active={active}
            />
          ) : (
            // Phones, low-power devices and reduced motion get the shot list
            // as a static storyboard instead of a second WebGL context.
            <StaticStoryboard />
          )}

          {showCanvas && (
            <Container className="pointer-events-none absolute inset-x-0 bottom-0 pb-8 sm:pb-12">
              {/* The shot runs under these controls and some frames are very
                  bright — the scrim keeps the transport legible throughout. */}
              <span
                aria-hidden="true"
                className="from-hillside-ink/90 pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64 bg-gradient-to-t via-[#0b1020]/60 to-transparent"
              />
              <div className="pointer-events-auto ml-auto max-w-[640px]">
                <Scrubber
                  progress={progress}
                  onSeek={onSeek}
                  onScrubStart={() => {
                    scrubbing.current = true;
                  }}
                  onScrubEnd={() => {
                    scrubbing.current = false;
                  }}
                />
                <p className="type-label text-meadow-cream/40 mt-4">
                  Real-time 3D previsualisation — not footage
                </p>
              </div>
            </Container>
          )}
        </div>
      </div>
    </Section>
  );
}

/** Text storyboard: the same shot list, no WebGL. */
function StaticStoryboard() {
  return (
    <Container className="py-15 sm:py-30">
      <ol className="grid gap-px sm:grid-cols-2 lg:grid-cols-5">
        {SHOT_BEATS.map((beat, index) => (
          <li
            key={beat.label}
            className="border-meadow-cream/20 flex flex-col gap-3 border-t py-5"
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
        The flight, shot by shot — rendered in 3D on larger screens
      </p>
    </Container>
  );
}
