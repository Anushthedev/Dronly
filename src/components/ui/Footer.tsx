import { Marquee } from '@/components/ui/Marquee';
import { Band, Container, Section } from '@/components/ui/Section';
import { NAV_LINKS, SITE } from '@/lib/site';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <Section label="Footer">
      <Band tone="ink" className="pt-15">
        <div className="border-meadow-cream/20 border-y py-6">
          <Marquee
            items={['Dronly', 'Aerial studio', 'Events', 'Real estate']}
            speed={52}
            reverse
          />
        </div>

        <Container className="py-12">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="type-heading-sm">{SITE.name}</p>
              <p className="text-body text-meadow-cream/70 mt-4 max-w-[34ch]">
                {SITE.tagline}
              </p>
            </div>

            <nav aria-label="Footer" className="md:col-span-3">
              <h2 className="type-label text-meadow-cream/55">Sections</h2>
              <ul className="mt-4 flex flex-col gap-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-body-lg text-meadow-cream/85 transition-opacity hover:opacity-60"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="md:col-span-3 md:col-start-10">
              <h2 className="type-label text-meadow-cream/55">Contact</h2>
              <ul className="text-body-lg text-meadow-cream/85 mt-4 flex flex-col gap-2">
                <li>
                  <a href={`mailto:${SITE.email}`} className="hover:opacity-60">
                    {SITE.email}
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${SITE.phone.replace(/[^+\d]/g, '')}`}
                    className="hover:opacity-60"
                  >
                    {SITE.phone}
                  </a>
                </li>
                <li className="text-meadow-cream/55">{SITE.location}</li>
              </ul>
            </div>
          </div>

          <div className="border-meadow-cream/20 mt-12 flex flex-col gap-2 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <span className="type-label text-meadow-cream/55">
              © {year} {SITE.name} — {SITE.license}
            </span>
            <span className="type-label text-meadow-cream/55">
              Built for flight
            </span>
          </div>
        </Container>
      </Band>
    </Section>
  );
}
