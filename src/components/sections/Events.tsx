import { Arrow, Button } from '@/components/ui/Button';
import { Card, Tag } from '@/components/ui/Card';
import {
  Reveal,
  RevealGroup,
  RevealItem,
  RevealLines,
} from '@/components/ui/Reveal';
import { Plate } from '@/components/ui/Plate';
import {
  Band,
  Container,
  CreamCurve,
  Section,
  SectionLabel,
  SkyCurve,
} from '@/components/ui/Section';
import { EVENT_CAPABILITIES, EVENT_SERVICES } from '@/lib/site';

/**
 * Events.
 *
 * Cream editorial blocks alternate with full-bleed sky bands. The sky bands
 * are genuinely empty — the live scene behind the document shows through
 * them — which is why the visuals cannot sit inside a cream block: an
 * opaque background would be all a transparent window revealed.
 */
export function Events() {
  return (
    <Section id="events" label="Event drone coverage">
      <Band className="pt-15 sm:pt-30">
        <Container className="pb-12 sm:pb-15">
          <SectionLabel>01 — Events</SectionLabel>

          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
            <h2 className="type-heading-lg lg:col-span-7">
              <RevealLines lines={['The day', 'from', 'above']} />
            </h2>
            <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.1}>
              <p className="text-body-lg">
                Weddings, festivals, launches and finish lines. One aircraft
                overhead changes what the day looks like when it is over — scale you
                cannot stage, and a reveal you cannot shoot from the ground.
              </p>
            </Reveal>
          </div>
        </Container>
        <SkyCurve />
      </Band>

      {/* Establishing band — full bleed, no frame: the scene is the image. */}
      <Band tone="sky" className="min-h-[78svh]">
        <Plate src="/plate-meadow.jpg" position="center" />
      </Band>

      <CreamCurve />

      <Band className="py-15 sm:py-30">
        <Container>
          <RevealGroup className="grid gap-5 md:grid-cols-3" as="ul">
            {EVENT_SERVICES.map((service, index) => (
              <RevealItem as="li" key={service.title}>
                {/* One violet card per group — the single chromatic surface. */}
                <Card
                  tone={index === 1 ? 'violet' : 'outlined'}
                  className="flex h-full flex-col justify-between gap-10"
                >
                  <div>
                    <h3 className="text-subheading font-semibold">
                      {service.title}
                    </h3>
                    <p
                      className={
                        index === 1
                          ? 'text-body text-meadow-cream/85 mt-4'
                          : 'text-body mt-4'
                      }
                    >
                      {service.body}
                    </p>
                  </div>
                  <span className="type-label">{service.meta}</span>
                </Card>
              </RevealItem>
            ))}
          </RevealGroup>

          <div className="border-stone-border mt-12 grid gap-8 border-t pt-8 md:grid-cols-12">
            <Reveal className="md:col-span-4">
              <h3 className="type-heading-sm">What you get</h3>
            </Reveal>
            <RevealGroup className="md:col-span-7 md:col-start-6" as="ul">
              {EVENT_CAPABILITIES.map((item) => (
                <RevealItem
                  as="li"
                  key={item}
                  className="border-stone-border text-body-lg flex items-baseline gap-4 border-b py-4 last:border-b-0"
                >
                  <span className="bg-drone-violet size-1.5 shrink-0 -translate-y-[3px] rounded-full" />
                  {item}
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          <Reveal className="mt-12 flex flex-wrap items-center gap-3">
            <Button as="a" href="#contact" variant="filled">
              Check a date
              <Arrow />
            </Button>
            <Tag>Typical turnaround · 5 days</Tag>
          </Reveal>
        </Container>
        <SkyCurve />
      </Band>

      {/* Sky band — the drone banks past the lodge behind the pull quote. */}
      <Band tone="sky" className="flex min-h-[70svh] items-center py-30">
        <Plate src="/plate-lodge.jpg" position="top" />
        <Container>
          <Reveal>
            <blockquote>
              <p className="type-heading">
                <RevealLines
                  lines={['Nobody', 'remembers', 'the wide shot', 'from the floor']}
                />
              </p>
              <footer className="type-label text-meadow-cream/60 mt-8">
                Why we fly events
              </footer>
            </blockquote>
          </Reveal>
        </Container>
      </Band>

      <CreamCurve />
    </Section>
  );
}
