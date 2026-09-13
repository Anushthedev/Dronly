import { Contact } from '@/components/sections/Contact';
import { Events } from '@/components/sections/Events';
import { Hero } from '@/components/sections/Hero';
import { Manifesto } from '@/components/sections/Manifesto';
import { RealEstate } from '@/components/sections/RealEstate';
import { SkyCurve } from '@/components/ui/Section';

/**
 * The hero owns the only animation on the page: the flight clip, scrubbed
 * by scroll. Everything below it holds still, and the section dividers are
 * frames lifted from that same clip.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Manifesto />
      <Events />
      <RealEstate />
      <SkyCurve />
      <Contact />
    </>
  );
}
