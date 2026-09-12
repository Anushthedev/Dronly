import { Arrow, Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MediaFrame } from '@/components/ui/MediaFrame';
import { Parallax } from '@/components/ui/Parallax';
import {
  Reveal,
  RevealGroup,
  RevealItem,
  RevealLines,
} from '@/components/ui/Reveal';
import { Band, Container, Section, SectionLabel } from '@/components/ui/Section';
import { REAL_ESTATE_SERVICES, REAL_ESTATE_STEPS } from '@/lib/site';

/**
 * Real estate: the survey beat. The drone climbs and pitches nose-down
 * behind this block, so the layout goes to a tighter, more technical grid.
 */
export function RealEstate() {
  return (
    <Section id="real-estate" label="Real estate aerial shooting">
      <Band className="py-15 sm:py-30">
        <Container>
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

          <div className="mt-12 grid gap-5 sm:mt-15 md:grid-cols-12">
            <Parallax className="md:col-span-7" distance={70} scale>
              <MediaFrame
                label="Hillside property, twilight exterior"
                ratio="4/5"
                seed="listing-primary"
                className="h-full"
              />
            </Parallax>

            <div className="flex flex-col gap-5 md:col-span-5">
              <Card
                tone="violet"
                className="flex flex-1 flex-col justify-between gap-10"
              >
                <h3 className="text-subheading font-semibold">
                  The 48-hour listing package
                </h3>
                <div>
                  <p className="text-body text-meadow-cream/85">
                    One shoot, three deliverables: a 90-second film, a vertical cut
                    for social, and twenty-five graded stills. Priced flat, no
                    per-frame licensing.
                  </p>
                  <p className="type-label mt-6">From $690 per property</p>
                </div>
              </Card>
              <Parallax distance={40}>
                <MediaFrame
                  label="Orthomosaic survey pass"
                  ratio="16/9"
                  seed="listing-survey"
                  chrome={false}
                />
              </Parallax>
            </div>
          </div>

          <RevealGroup className="mt-15 grid gap-5 md:grid-cols-3" as="ul">
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
