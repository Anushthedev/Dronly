import { Contact } from '@/components/sections/Contact';
import { Events } from '@/components/sections/Events';
import { Hero } from '@/components/sections/Hero';
import { Manifesto } from '@/components/sections/Manifesto';
import { RealEstate } from '@/components/sections/RealEstate';
import { Work } from '@/components/sections/Work';
import { SkyCurve } from '@/components/ui/Section';

/**
 * Section order is the flight plan. `src/lib/flight.ts` choreographs the
 * drone against these six ids in this order — reorder them here and the
 * keyframes in that file need the same treatment.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Manifesto />
      <Events />
      <RealEstate />
      <SkyCurve />
      <Work />
      <Contact />
    </>
  );
}
