/**
 * All marketing copy lives here so sections stay presentational and the
 * content is editable in one place.
 */

export const SITE = {
  name: 'Dronly',
  tagline: 'Aerial coverage for events and real estate.',
  description:
    'Dronly is a licensed aerial production studio. We fly cinema-grade drones over weddings, festivals, launches and listings — and land you footage that sells the moment.',
  email: 'fly@dronly.studio',
  phone: '+1 (415) 555-0192',
  location: 'San Francisco · Los Angeles · Remote worldwide',
  license: 'FAA Part 107 certified · $2M liability insured',
} as const;

export type NavLink = { label: string; href: string };

export const NAV_LINKS: NavLink[] = [
  { label: 'Events', href: '#events' },
  { label: 'Real estate', href: '#real-estate' },
  { label: 'Work', href: '#work' },
  { label: 'Booking', href: '#contact' },
];

/** Section ids in scroll order — the 3D rig reads the same list. */
export const SECTION_IDS = [
  'hero',
  'manifesto',
  'events',
  'real-estate',
  'work',
  'contact',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export const STATS = [
  { value: '480+', label: 'Flights logged' },
  { value: '12k', label: 'Feet of ceiling' },
  { value: '6K', label: 'Capture resolution' },
  { value: '48h', label: 'Standard delivery' },
] as const;

export const EVENT_SERVICES = [
  {
    title: 'Weddings & private events',
    body: 'A single silent pass over the ceremony, an orbit at golden hour, and a reveal that starts on two hands and ends a thousand feet up.',
    meta: 'Half day · from $1,400',
  },
  {
    title: 'Festivals & live production',
    body: 'Crowd scale is impossible to fake from the ground. We fly the perimeter, the pit and the skyline, and hand the edit to your socials team the next morning.',
    meta: 'Multi-day · from $3,900',
  },
  {
    title: 'Sport & motorsport',
    body: 'FPV chase pilots rated for tracking at speed, with spotters and a flight plan filed against your venue.',
    meta: 'Per event · from $2,200',
  },
] as const;

export const EVENT_CAPABILITIES = [
  'Dual-operator crew: pilot plus dedicated camera op',
  'Silent-mode props for ceremonies and speeches',
  'Ground and aerial coverage cut into one timeline',
  'Same-day vertical cutdowns for social',
] as const;

export const REAL_ESTATE_SERVICES = [
  {
    title: 'Listing films',
    body: 'A ninety-second film that opens on the roofline and lands at the front door. Built for the MLS hero slot and the agent reel alike.',
    meta: '4–6 hr shoot · 48 hr delivery',
  },
  {
    title: 'Development & land',
    body: 'Orthomosaic maps, elevation sweeps and progress sets flown on a fixed monthly cadence so the deck is never out of date.',
    meta: 'Monthly retainer',
  },
  {
    title: 'Architectural stills',
    body: 'Twilight exteriors, roof condition sets and context frames that put the property in its neighbourhood.',
    meta: '25 edited frames',
  },
] as const;

export const REAL_ESTATE_STEPS = [
  {
    step: '01',
    title: 'Scout',
    body: 'Airspace check, sun path and a shot list agreed before anyone drives out.',
  },
  {
    step: '02',
    title: 'Fly',
    body: 'Two batteries of coverage per elevation, plus the interior walk-through if you want it.',
  },
  {
    step: '03',
    title: 'Deliver',
    body: 'Graded film, vertical cut and a stills set in your drive within two days.',
  },
] as const;

export type ShowcaseItem = {
  id: string;
  title: string;
  category: string;
  location: string;
  year: string;
  /** Aspect ratio for the placeholder frame. */
  ratio: '4/5' | '16/9' | '1/1' | '3/4';
  /** Drop a real still or video in here later. */
  media?: string;
  featured?: boolean;
};

export const SHOWCASE: ShowcaseItem[] = [
  {
    id: 'ridgeline',
    title: 'Ridgeline House',
    category: 'Real estate',
    location: 'Mill Valley, CA',
    year: '2026',
    ratio: '4/5',
    featured: true,
  },
  {
    id: 'harbor-lights',
    title: 'Harbor Lights Festival',
    category: 'Event',
    location: 'Long Beach, CA',
    year: '2026',
    ratio: '16/9',
  },
  {
    id: 'the-vow',
    title: 'The Vow — Coastal Ceremony',
    category: 'Wedding',
    location: 'Big Sur, CA',
    year: '2025',
    ratio: '3/4',
  },
  {
    id: 'quarry-district',
    title: 'Quarry District',
    category: 'Development',
    location: 'Oakland, CA',
    year: '2025',
    ratio: '1/1',
  },
  {
    id: 'night-circuit',
    title: 'Night Circuit',
    category: 'Motorsport',
    location: 'Sonoma, CA',
    year: '2025',
    ratio: '16/9',
  },
  {
    id: 'glasshouse',
    title: 'Glasshouse No. 4',
    category: 'Architecture',
    location: 'Palo Alto, CA',
    year: '2024',
    ratio: '4/5',
  },
];

export const SERVICE_OPTIONS = [
  'Event coverage',
  'Wedding film',
  'Real estate listing',
  'Development survey',
  'Something else',
] as const;
