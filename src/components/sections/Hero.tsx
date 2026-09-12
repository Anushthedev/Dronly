'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

import { useScrollApi } from '@/components/providers/ScrollProvider';
import { Arrow, Button } from '@/components/ui/Button';
import { Band, Container, Section } from '@/components/ui/Section';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { loadGsap } from '@/lib/gsap';
import { SITE, STATS } from '@/lib/site';

const EASE = [0.16, 1, 0.3, 1] as const;

const HEADLINE = ['Eyes', 'above', 'everything'];

/**
 * Full-viewport sky band. The 3D stage shows straight through it, so the
 * only thing this section paints is type.
 */
export function Hero() {
  const { scrollTo } = useScrollApi();
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // The headline drifts up and fades as the hero leaves — scrubbed, so the
  // position is always a pure function of scroll.
  useEffect(() => {
    if (reduced) return;
    const node = root.current;
    if (!node) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        gsap.to('[data-hero-copy]', {
          y: -90,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: node,
            start: 'top top',
            end: 'bottom 30%',
            scrub: true,
          },
        });
      }, node);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced]);

  return (
    <Section id="hero" label="Introduction">
      <Band
        tone="sky"
        ref={root}
        className="flex min-h-[100svh] flex-col justify-between pt-24 pb-8 sm:pt-28 sm:pb-12"
      >
        <Container className="flex flex-1 flex-col justify-end">
          <div data-hero-copy className="max-w-[min(100%,1100px)]">
            <motion.p
              className="type-label text-meadow-cream/70 mb-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
            >
              {SITE.name} — aerial studio
            </motion.p>

            <h1
              className="type-display text-meadow-cream"
              // Height-aware: three lines at 0.85 must clear the stats row on
              // a 900px laptop as surely as on a tall monitor.
              style={{ fontSize: 'clamp(48px, min(11vw, 15svh), 150px)' }}
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

            <motion.div
              className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
            >
              <p className="text-body-lg text-meadow-cream/80 max-w-[46ch]">
                Event coverage and real estate films, flown by a licensed crew and
                cut for the screen they are going to live on.
              </p>
            </motion.div>

            <motion.div
              className="mt-8 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.82, ease: EASE }}
            >
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
                href="#work"
                variant="ghost-cream"
                onClick={(event: React.MouseEvent) => {
                  event.preventDefault();
                  scrollTo('#work');
                }}
              >
                See the reel
              </Button>
            </motion.div>
          </div>
        </Container>

        <Container className="mt-8">
          <motion.dl
            className="border-meadow-cream/25 grid grid-cols-2 gap-x-6 gap-y-6 border-t pt-6 sm:grid-cols-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1, ease: EASE }}
          >
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="type-label text-meadow-cream/60">{stat.label}</dt>
                <dd className="type-heading-sm text-meadow-cream mt-2">
                  {stat.value}
                </dd>
              </div>
            ))}
          </motion.dl>

          <motion.p
            aria-hidden="true"
            className="type-label text-meadow-cream/45 mt-6 flex items-center gap-2"
            animate={reduced ? undefined : { opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            Scroll to fly
            <span aria-hidden="true">↓</span>
          </motion.p>
        </Container>
      </Band>
    </Section>
  );
}
