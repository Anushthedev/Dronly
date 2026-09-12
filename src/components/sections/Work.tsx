'use client';

import { useState } from 'react';

import { MediaFrame } from '@/components/ui/MediaFrame';
import { Parallax } from '@/components/ui/Parallax';
import {
  Reveal,
  RevealGroup,
  RevealItem,
  RevealLines,
} from '@/components/ui/Reveal';
import { Band, Container, Section, SectionLabel } from '@/components/ui/Section';
import { SHOWCASE } from '@/lib/site';
import { cn } from '@/lib/utils';

/**
 * Showcase gallery, set on a sky band so the 3D stage reads between the
 * tiles while the drone makes its fast diagonal passes.
 */
export function Work() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <Section id="work" label="Selected work">
      <Band tone="sky" className="py-15 sm:py-30">
        <Container>
          <SectionLabel tone="cream">03 — Selected work</SectionLabel>

          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
            <h2 className="type-heading-lg lg:col-span-8">
              <RevealLines lines={['Flights', 'we are', 'proud of']} />
            </h2>
            <Reveal className="lg:col-span-3 lg:col-start-10" delay={0.1}>
              <p className="text-body text-meadow-cream/75">
                Six recent projects. Every frame graded in-house — no stock, no
                licensed plates, no AI fill.
              </p>
            </Reveal>
          </div>

          <RevealGroup
            as="ul"
            className="mt-12 grid grid-cols-1 items-start gap-5 sm:mt-15 sm:grid-cols-2 lg:grid-cols-3"
          >
            {SHOWCASE.map((item, index) => (
              <RevealItem
                as="li"
                key={item.id}
                className={cn('group', item.featured && 'sm:col-span-2')}
              >
                <a
                  href="#contact"
                  className="block focus-visible:outline-offset-8"
                  onMouseEnter={() => setActive(item.id)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(item.id)}
                  onBlur={() => setActive(null)}
                  aria-label={`${item.title} — ${item.category}, ${item.location}`}
                >
                  {/* Alternating parallax offsets keep the grid from moving as
                      one slab; the featured tile stays put as the anchor. */}
                  <Parallax
                    distance={item.featured ? 0 : index % 2 === 0 ? 54 : 28}
                    className="rounded-card overflow-hidden"
                  >
                    <div
                      className={cn(
                        'transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
                        active === item.id && 'scale-[1.03]',
                      )}
                    >
                      <MediaFrame
                        label={item.title}
                        src={item.media}
                        ratio={item.featured ? '4/5' : item.ratio}
                        seed={item.id}
                        chrome={Boolean(item.featured)}
                        className={
                          item.featured ? 'sm:aspect-[16/10] lg:aspect-[4/5]' : ''
                        }
                      />
                    </div>
                  </Parallax>

                  <div className="border-meadow-cream/25 mt-4 flex items-baseline justify-between gap-4 border-t pt-3">
                    <div>
                      <h3 className="text-body-lg text-meadow-cream font-medium">
                        {item.title}
                      </h3>
                      <p className="type-label text-meadow-cream/55 mt-1">
                        {item.category} · {item.location}
                      </p>
                    </div>
                    <span className="type-label text-meadow-cream/55">
                      {item.year}
                    </span>
                  </div>
                </a>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Band>
    </Section>
  );
}
