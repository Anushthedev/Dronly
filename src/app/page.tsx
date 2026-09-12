import { Contact } from '@/components/sections/Contact';
import { Events } from '@/components/sections/Events';
import { Hero } from '@/components/sections/Hero';
import { Manifesto } from '@/components/sections/Manifesto';
import { RealEstate } from '@/components/sections/RealEstate';
import { SkyCurve } from '@/components/ui/Section';

/**
 * Section order is the flight plan. `src/lib/flight.ts` choreographs the
 * camera against these ids in this order — reorder them here and the
 * keyframes in that file need the same treatment.
 *
 * The hero owns the scrubbable shot, so it is both the first section and
 * the only one that takes the camera away from the narrative path.
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
