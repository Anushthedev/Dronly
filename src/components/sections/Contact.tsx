'use client';

import { useState, type FormEvent } from 'react';

import { Arrow, Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Card';
import { Reveal, RevealLines } from '@/components/ui/Reveal';
import { Band, Container, Section, SectionLabel } from '@/components/ui/Section';
import { SERVICE_OPTIONS, SITE } from '@/lib/site';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const FIELD =
  'w-full rounded-card border border-hillside-ink bg-transparent px-4 py-3 text-body ' +
  'placeholder:text-hillside-ink/45 focus-visible:outline-offset-1';

/**
 * Booking. The drone lands behind this section, so the layout comes back to
 * rest too: one card, one column, no parallax.
 */
export function Contact() {
  const [status, setStatus] = useState<Status>('idle');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');

    const data = Object.fromEntries(new FormData(event.currentTarget));

    try {
      // Wire this to your form handler — a route handler at
      // app/api/booking/route.ts, Formspree, Resend, whatever you use.
      // Until then the submission is logged and optimistically confirmed.
      console.info('[Dronly] booking enquiry', data);
      await new Promise((resolve) => setTimeout(resolve, 700));
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <Section id="contact" label="Booking">
      <Band tone="sky" className="py-15 sm:py-30">
        <Container>
          <SectionLabel tone="cream">04 — Booking</SectionLabel>

          <div className="mt-8 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <h2 className="type-heading-lg">
                <RevealLines lines={['Tell us', 'where to', 'take off']} />
              </h2>

              <Reveal className="mt-8" delay={0.1}>
                <p className="text-body-lg text-meadow-cream/80 max-w-[46ch]">
                  Send the date and the postcode. We check the airspace, come back
                  with a plan and a flat quote inside one business day.
                </p>
              </Reveal>

              <Reveal className="mt-10 flex flex-col gap-3" delay={0.16}>
                <a
                  href={`mailto:${SITE.email}`}
                  className="type-heading-sm text-meadow-cream w-fit underline-offset-[0.12em] hover:underline"
                >
                  {SITE.email}
                </a>
                <a
                  href={`tel:${SITE.phone.replace(/[^+\d]/g, '')}`}
                  className="text-body-lg text-meadow-cream/75 hover:text-meadow-cream w-fit"
                >
                  {SITE.phone}
                </a>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Tag tone="cream">{SITE.location}</Tag>
                  <Tag tone="cream">{SITE.license}</Tag>
                </div>
              </Reveal>
            </div>

            <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.12}>
              <div className="rounded-card bg-meadow-cream text-hillside-ink p-6">
                {status === 'sent' ? (
                  <div
                    role="status"
                    className="flex min-h-[420px] flex-col justify-between"
                  >
                    <span className="type-label">Enquiry received</span>
                    <div>
                      <p className="type-heading-sm">Cleared for takeoff</p>
                      <p className="text-body mt-4 max-w-[34ch]">
                        Thanks — we have your details. Expect a plan and a quote
                        within one business day, usually much sooner.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      className="mt-8 w-fit"
                      onClick={() => setStatus('idle')}
                    >
                      Send another
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="flex flex-col gap-5">
                    <span className="type-label">Request a quote</span>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="name" className="type-label">
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        required
                        autoComplete="name"
                        placeholder="Ada Okonjo"
                        className={FIELD}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="email" className="type-label">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@studio.com"
                        className={FIELD}
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="service" className="type-label">
                          Service
                        </label>
                        <select
                          id="service"
                          name="service"
                          defaultValue={SERVICE_OPTIONS[0]}
                          className={cn(FIELD, 'appearance-none')}
                        >
                          {SERVICE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="date" className="type-label">
                          Shoot date
                        </label>
                        <input
                          id="date"
                          name="date"
                          type="date"
                          className={FIELD}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label htmlFor="brief" className="type-label">
                        Brief
                      </label>
                      <textarea
                        id="brief"
                        name="brief"
                        rows={4}
                        placeholder="Location, rough timings, what the footage is for."
                        className={cn(FIELD, 'resize-y')}
                      />
                    </div>

                    <Button type="submit" disabled={status === 'sending'}>
                      {status === 'sending' ? 'Sending…' : 'Send enquiry'}
                      <Arrow />
                    </Button>

                    <p
                      role="status"
                      aria-live="polite"
                      className={cn(
                        'text-caption',
                        status === 'error'
                          ? 'text-drone-violet'
                          : 'text-hillside-ink/60',
                      )}
                    >
                      {status === 'error'
                        ? 'Something went wrong — email us directly and we will pick it up.'
                        : `We reply within one business day. Or just email ${SITE.email}.`}
                    </p>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </Container>
      </Band>
    </Section>
  );
}
