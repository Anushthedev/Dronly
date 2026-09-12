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
  // PLACEHOLDER — verify before launch. Part 107 is a real certification
  // you must hold to fly commercially; the insurance figure is a stand-in.
  // Do not publish either line until both are true.
  license: 'FAA Part 107 certified · Insured to $1M',
} as const;

export type NavLink = { label: string; href: string };

export const NAV_LINKS: NavLink[] = [
  { label: 'Events', href: '#events' },
  { label: 'Real estate', href: '#real-estate' },
  { label: 'Booking', href: '#contact' },
];

/** Section ids in scroll order — the 3D rig reads the same list. */
export const SECTION_IDS = [
  'hero',
  'manifesto',
  'events',
  'real-estate',
  'contact',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export const STATS = [
  { value: '6K', label: 'Capture resolution' },
  { value: '107', label: 'FAA certification' },
  { value: '48h', label: 'Delivery target' },
  { value: '2', label: 'Crew per shoot' },
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

/**
 * Beats of the demonstration flight rendered in the "The shot" section.
 *
 * This studio has no footage yet, so the site shows a previsualisation —
 * a real-time 3D render of the flight path we fly over a property — rather
 * than borrowed clips or invented client work. The section labels it as a
 * render, in those words. Replace it with a real edit once one exists.
 */
export type ShotBeat = {
  /** Normalised position along the shot, 0 → 1. */
  at: number;
  label: string;
  note: string;
};

export const SHOT_BEATS: ShotBeat[] = [
  { at: 0, label: 'Approach', note: 'Low and slow through the treeline' },
  { at: 0.24, label: 'Reveal', note: 'Climb until the roofline breaks cover' },
  { at: 0.46, label: 'Orbit', note: 'A full pass to place it on its lot' },
  { at: 0.7, label: 'Wide', note: 'High and back for the establishing frame' },
  { at: 1, label: 'Windows', note: 'Push in on the light in the glass' },
];

export const SERVICE_OPTIONS = [
  'Event coverage',
  'Wedding film',
  'Real estate listing',
  'Development survey',
  'Something else',
] as const;
