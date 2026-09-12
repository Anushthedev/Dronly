'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  useScrollApi,
  useScrollEffect,
} from '@/components/providers/ScrollProvider';
import { Arrow, Button } from '@/components/ui/Button';
import { NAV_LINKS, SITE } from '@/lib/site';
import { cn } from '@/lib/utils';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Minimal top bar: hamburger left, centred wordmark, ghost CTA right.
 * No background fill — it floats over the hero footage and over the cream
 * canvas alike, flipping its own colour when it crosses an ink section.
 */
export function Nav() {
  const { scrollTo } = useScrollApi();
  const bar = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // Tone and hide/show are written straight to the DOM: re-rendering a
  // fixed header on every scroll frame is exactly the cost we are avoiding.
  const lastY = useRef(0);
  const inkZones = useRef<Array<[number, number]>>([]);

  // Ink sections are measured once per layout change rather than hit-tested
  // every frame — the bar only needs to know which band it is sitting over.
  useEffect(() => {
    const measure = () => {
      inkZones.current = Array.from(
        document.querySelectorAll<HTMLElement>('[data-ink-zone]'),
      ).map((el) => {
        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        return [top, top + rect.height] as [number, number];
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useScrollEffect(
    ({ y }) => {
      const node = bar.current;
      if (!node) return;

      // 36px down from the viewport top: roughly the wordmark's baseline.
      const probe = y + 36;
      const overInk = inkZones.current.some(
        ([top, bottom]) => probe >= top && probe < bottom,
      );
      node.dataset.tone = overInk ? 'ink' : 'cream';

      const goingDown = y > lastY.current && y > 240;
      node.dataset.hidden = goingDown && !open ? 'true' : 'false';
      lastY.current = y;
    },
    [open],
  );

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      // Let the overlay start closing before the scroll takes over.
      requestAnimationFrame(() => scrollTo(href));
    },
    [scrollTo],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <a
        href="#manifesto"
        className="focus:rounded-card focus:bg-hillside-ink focus:text-meadow-cream sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-5 focus:py-3"
      >
        Skip to content
      </a>

      <motion.div
        ref={bar}
        data-tone="ink"
        data-hidden="false"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
        className={cn(
          'group/nav fixed inset-x-0 top-0 z-50 transition-[transform,color] duration-500',
          'data-[tone=ink]:text-meadow-cream data-[tone=cream]:text-hillside-ink',
          'data-[hidden=true]:-translate-y-full',
        )}
      >
        {/*
          The reference system floats the bar with no fill. That works until a
          line of body copy scrolls under it on a narrow screen, so each tone
          gets a short scrim that fades out well before it reads as a header.
        */}
        <span
          aria-hidden="true"
          className="from-meadow-cream via-meadow-cream/70 pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b to-transparent opacity-0 transition-opacity duration-500 group-data-[tone=cream]/nav:opacity-100"
        />
        <span
          aria-hidden="true"
          className="from-hillside-ink via-hillside-ink/60 pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b to-transparent opacity-0 transition-opacity duration-500 group-data-[tone=ink]/nav:opacity-100"
        />

        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-5 sm:px-8"
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="site-menu"
            className="group rounded-card flex items-center gap-3 px-1 py-1"
          >
            <span className="flex flex-col gap-[5px]" aria-hidden="true">
              <span className="block h-[2px] w-6 bg-current transition-transform duration-300 group-hover:translate-x-1" />
              <span className="block h-[2px] w-6 bg-current" />
            </span>
            <span className="sr-only">Open menu</span>
            <span className="type-label hidden sm:inline">Menu</span>
          </button>

          <a
            href="#hero"
            onClick={(event) => {
              event.preventDefault();
              go('#hero');
            }}
            className="text-subheading font-semibold tracking-[-0.22px]"
          >
            {SITE.name}
          </a>

          <Button
            as="a"
            href="#contact"
            variant="inherit"
            onClick={(event: React.MouseEvent) => {
              event.preventDefault();
              go('#contact');
            }}
          >
            Book a flight
            <Arrow />
          </Button>
        </nav>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            data-tone="ink"
            className="bg-hillside-ink text-meadow-cream fixed inset-0 z-[55]"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="mx-auto flex h-full max-w-[1600px] flex-col px-5 py-5 sm:px-8">
              <div className="flex items-center justify-between">
                <span className="type-label">{SITE.location}</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  autoFocus
                  className="type-label rounded-card border-meadow-cream hover:bg-meadow-cream hover:text-hillside-ink border px-4 py-2 transition-colors"
                >
                  Close
                </button>
              </div>

              <ul className="flex flex-1 flex-col justify-center gap-2">
                {NAV_LINKS.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.7,
                      delay: 0.14 + index * 0.07,
                      ease: EASE,
                    }}
                  >
                    <a
                      href={link.href}
                      onClick={(event) => {
                        event.preventDefault();
                        go(link.href);
                      }}
                      className="type-heading block w-fit transition-opacity duration-300 hover:opacity-50"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>

              <div className="border-meadow-cream/25 flex flex-wrap items-end justify-between gap-4 border-t pt-6">
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-body-lg underline underline-offset-4"
                >
                  {SITE.email}
                </a>
                <span className="type-label">{SITE.license}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
