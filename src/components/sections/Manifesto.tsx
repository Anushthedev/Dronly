import { InlineThumb } from '@/components/ui/InlineThumb';
import { Marquee } from '@/components/ui/Marquee';
import { Reveal, RevealLines } from '@/components/ui/Reveal';
import { Band, Container, CreamCurve, Section } from '@/components/ui/Section';
import { SITE } from '@/lib/site';

const TICKER = [
  'Event coverage',
  'Real estate',
  'FAA Part 107',
  'Same-week delivery',
  '6K capture',
];

/**
 * The hand-off from the full-bleed sky band into the cream canvas: a curved
 * mask, then one oversized centred statement carrying the inline thumbnail
 * token.
 */
export function Manifesto() {
  return (
    <>
      <CreamCurve />
      <Section id="manifesto" label="About Dronly">
        <Band className="pt-4 pb-15 sm:pb-30">
          <Container>
            <h2 className="type-heading mx-auto max-w-[16ch] text-center">
              <RevealLines lines={['We fly the shot']} />
              <span
                aria-hidden="true"
                className="block overflow-hidden pb-[0.06em]"
              >
                <span className="block">
                  everyone
                  <InlineThumb
                    alt="Aerial frame from a coastal ceremony"
                    seed="manifesto"
                  />
                  else
                </span>
              </span>
              <span className="sr-only">{'everyone else '}</span>
              <RevealLines lines={['describes']} delay={0.12} />
            </h2>

            <div className="mt-15 grid gap-10 md:grid-cols-12">
              <Reveal className="md:col-span-5 md:col-start-2">
                <p className="text-body-lg max-w-[46ch]">{SITE.description}</p>
              </Reveal>
              <Reveal className="md:col-span-4 md:col-start-8" delay={0.12}>
                <p className="text-body max-w-[42ch]">
                  Two pilots, one editor, and a flight case that clears security. We
                  hold {SITE.license.toLowerCase()}, file our own airspace
                  authorisations, and show up with a plan for the light.
                </p>
              </Reveal>
            </div>
          </Container>

          <div className="border-stone-border mt-15 border-y py-5 sm:mt-30">
            <Marquee items={TICKER} speed={46} />
          </div>
        </Band>
      </Section>
    </>
  );
}
