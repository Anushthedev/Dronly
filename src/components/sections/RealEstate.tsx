import { Arrow, Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Parallax } from '@/components/ui/Parallax';
import {
  Reveal,
  RevealGroup,
  RevealItem,
  RevealLines,
} from '@/components/ui/Reveal';
import {
  Band,
  Container,
  CreamCurve,
  Section,
  SectionLabel,
  SkyCurve,
} from '@/components/ui/Section';
import { LiveCaption } from '@/components/ui/LiveCaption';
import { REAL_ESTATE_SERVICES, REAL_ESTATE_STEPS } from '@/lib/site';

/**
 * Real estate: the survey beat. The camera climbs and pitches nose-down
 * over the lodge through this section, so the sky band in the middle is
 * looking almost straight down at the property.
 */
export function RealEstate() {
  return (
    <Section id="real-estate" label="Real estate aerial shooting">
      <Band className="pt-15 sm:pt-30">
        <Container className="pb-12 sm:pb-15">
          <SectionLabel>02 — Real estate</SectionLabel>

          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
            <h2 className="type-heading-lg lg:col-span-8">
              <RevealLines lines={['Listings', 'that sell', 'from the air']} />
            </h2>
            <Reveal className="lg:col-span-3 lg:col-start-10" delay={0.1}>
              <p className="text-body">
                Aerial-led listings hold a buyer&apos;s attention roughly twice as
                long as a ground-only gallery. We shoot the roof, the lot, the
                street and the light — and deliver before your open house.
              </p>
            </Reveal>
          </div>
        </Container>
        <SkyCurve />
      </Band>

      {/* The survey pass — the camera is directly over the property here. */}
      <Band
        tone="sky"
        className="flex min-h-[82svh] flex-col justify-end pb-8 sm:pb-12"
      >
        <Container>
          <Reveal distance={40}>
            <figure>
              <LiveCaption>The property, overhead</LiveCaption>
            </figure>
          </Reveal>
        </Container>
      </Band>

      <CreamCurve />

      <Band className="py-15 sm:py-30">
        <Container>
          <Parallax distance={50} tilt={7} axis="y" className="mb-5">
            <Card
              tone="violet"
              className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
            >
              <div>
                <h3 className="text-subheading font-semibold">
                  The 48-hour listing package
                </h3>
                <p className="text-body text-meadow-cream/85 mt-4 max-w-[52ch]">
                  One shoot, three deliverables: a 90-second film, a vertical cut
                  for social, and twenty-five graded stills. Priced flat, no
                  per-frame licensing.
                </p>
              </div>
              <p className="type-label shrink-0">From $690 per property</p>
            </Card>
          </Parallax>

          <RevealGroup className="grid gap-5 md:grid-cols-3" as="ul">
            {REAL_ESTATE_SERVICES.map((service) => (
              <RevealItem as="li" key={service.title}>
                <Card className="flex h-full flex-col justify-between gap-10">
                  <div>
                    <h3 className="text-subheading font-semibold">
                      {service.title}
                    </h3>
                    <p className="text-body mt-4">{service.body}</p>
                  </div>
                  <span className="type-label">{service.meta}</span>
                </Card>
              </RevealItem>
            ))}
          </RevealGroup>

          {/* Process — numbered, hairline-ruled, no cards. */}
          <div className="border-hillside-ink mt-15 border-t pt-8">
            <RevealGroup className="grid gap-8 md:grid-cols-3" as="ol">
              {REAL_ESTATE_STEPS.map((step) => (
                <RevealItem as="li" key={step.step}>
                  <span className="type-heading-sm text-stone-border block">
                    {step.step}
                  </span>
                  <h3 className="text-subheading mt-4 font-semibold">
                    {step.title}
                  </h3>
                  <p className="text-body mt-3 max-w-[34ch]">{step.body}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          <Reveal className="mt-12">
            <Button as="a" href="#contact" variant="filled">
              Book a listing shoot
              <Arrow />
            </Button>
          </Reveal>
        </Container>
      </Band>
    </Section>
  );
}
